import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import {
  sanitizeParsedLines,
  type IngredientLine,
} from "@/lib/core/ingredient-lines";

const MODEL = "claude-haiku-5-5";

const TOOL_NAME = "record_ingredients";

const SYSTEM = [
  "You split pasted recipe ingredient lines into structured fields.",
  "Return exactly one entry per input line, in the same order.",
  "rawText: the line as given. quantity: a number, or null when the line has no amount (e.g. 'tuz'). unit: the unit as written in the line (e.g. 'su bardağı', 'yemek kaşığı', 'g', 'adet'), or null.",
  "Turn fractions into decimals (1/2 → 0.5). Do not translate, correct or invent anything.",
].join(" ");

/** Splits ingredient lines into rawText, quantity and unit with Claude Haiku. Server only. */
export async function parseIngredientLines(
  lines: string[],
): Promise<IngredientLine[]> {
  const client = new Anthropic();

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM,
    tools: [
      {
        name: TOOL_NAME,
        description: "Record the structured ingredient lines.",
        input_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  rawText: { type: "string" },
                  quantity: { type: ["number", "null"] },
                  unit: { type: ["string", "null"] },
                },
                required: ["rawText", "quantity", "unit"],
              },
            },
          },
          required: ["items"],
        },
      },
    ],
    tool_choice: { type: "tool", name: TOOL_NAME },
    messages: [{ role: "user", content: lines.join("\n") }],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  const items =
    toolUse && typeof toolUse.input === "object" && toolUse.input !== null
      ? (toolUse.input as { items?: unknown }).items
      : undefined;

  return sanitizeParsedLines(items, lines);
}
