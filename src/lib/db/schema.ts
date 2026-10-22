import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const mealType = pgEnum("meal_type", [
  "breakfast",
  "soup",
  "main",
  "side",
  "dessert",
]);

export const ingredientKind = pgEnum("ingredient_kind", ["core", "optional"]);

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// Raw data: entered by hand, never edited by the pipeline

export const regions = pgTable("regions", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameTr: text("name_tr").notNull(),
  nameEn: text("name_en").notNull(),
});

export const dishes = pgTable("dishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameTr: text("name_tr").notNull(),
  nameEn: text("name_en").notNull(),
  meal: mealType("meal").notNull(),
  regionId: uuid("region_id").references(() => regions.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
});

export const ingredients = pgTable("ingredients", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameTr: text("name_tr").notNull(),
  nameEn: text("name_en").notNull(),
  // Used by the normalization script to turn cups, spoons and pieces into grams
  gramsPerMl: real("grams_per_ml"),
  gramsPerPiece: real("grams_per_piece"),
});

export const recipeVersions = pgTable(
  "recipe_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    dishId: uuid("dish_id")
      .notNull()
      .references(() => dishes.id, { onDelete: "cascade" }),
    // Only ingredient lists are stored, always with their source
    sourceUrl: text("source_url").notNull(),
    rating: real("rating"),
    voteCount: integer("vote_count"),
    createdAt: createdAt(),
  },
  (t) => [index("recipe_versions_dish_idx").on(t.dishId)],
);

export const versionIngredients = pgTable(
  "version_ingredients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    versionId: uuid("version_id")
      .notNull()
      .references(() => recipeVersions.id, { onDelete: "cascade" }),
    // Null until the normalization script matches the line to an ingredient
    ingredientId: uuid("ingredient_id").references(() => ingredients.id),
    rawText: text("raw_text").notNull(),
    quantity: real("quantity"),
    unit: text("unit"),
    grams: real("grams"),
  },
  (t) => [
    index("version_ingredients_version_idx").on(t.versionId),
    index("version_ingredients_ingredient_idx").on(t.ingredientId),
  ],
);

// Pipeline output: rebuilt from the raw data on every run

export const consensusRecipes = pgTable("consensus_recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  dishId: uuid("dish_id")
    .notNull()
    .unique()
    .references(() => dishes.id, { onDelete: "cascade" }),
  servings: integer("servings").notNull().default(4),
  versionCount: integer("version_count").notNull(),
  stepsTr: jsonb("steps_tr").$type<string[]>().notNull().default([]),
  stepsEn: jsonb("steps_en").$type<string[]>().notNull().default([]),
  tested: boolean("tested").notNull().default(false),
  generatedAt: timestamp("generated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const consensusIngredients = pgTable(
  "consensus_ingredients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    consensusId: uuid("consensus_id")
      .notNull()
      .references(() => consensusRecipes.id, { onDelete: "cascade" }),
    ingredientId: uuid("ingredient_id")
      .notNull()
      .references(() => ingredients.id),
    kind: ingredientKind("kind").notNull(),
    // Share of versions that use this ingredient, 0-100
    usagePercent: real("usage_percent").notNull(),
    medianGrams: real("median_grams"),
  },
  (t) => [
    unique("consensus_ingredients_unique").on(t.consensusId, t.ingredientId),
  ],
);

export const scores = pgTable("scores", {
  dishId: uuid("dish_id")
    .primaryKey()
    .references(() => dishes.id, { onDelete: "cascade" }),
  score: real("score").notNull(),
  computedAt: timestamp("computed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// User data: user_id is the Supabase Auth user id (auth.users), kept without a foreign key

export const cookEvents = pgTable(
  "cook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    dishId: uuid("dish_id")
      .notNull()
      .references(() => dishes.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [index("cook_events_user_idx").on(t.userId)],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id").notNull(),
    dishId: uuid("dish_id")
      .notNull()
      .references(() => dishes.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.dishId] })],
);
