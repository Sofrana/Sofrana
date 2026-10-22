CREATE TYPE "public"."ingredient_kind" AS ENUM('core', 'optional');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'soup', 'main', 'side', 'dessert');--> statement-breakpoint
CREATE TABLE "consensus_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consensus_id" uuid NOT NULL,
	"ingredient_id" uuid NOT NULL,
	"kind" "ingredient_kind" NOT NULL,
	"usage_percent" real NOT NULL,
	"median_grams" real,
	CONSTRAINT "consensus_ingredients_unique" UNIQUE("consensus_id","ingredient_id")
);
--> statement-breakpoint
CREATE TABLE "consensus_recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dish_id" uuid NOT NULL,
	"servings" integer DEFAULT 4 NOT NULL,
	"version_count" integer NOT NULL,
	"steps_tr" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"steps_en" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tested" boolean DEFAULT false NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consensus_recipes_dish_id_unique" UNIQUE("dish_id")
);
--> statement-breakpoint
CREATE TABLE "cook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"dish_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dishes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_tr" text NOT NULL,
	"name_en" text NOT NULL,
	"meal" "meal_type" NOT NULL,
	"region_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dishes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" uuid NOT NULL,
	"dish_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_dish_id_pk" PRIMARY KEY("user_id","dish_id")
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_tr" text NOT NULL,
	"name_en" text NOT NULL,
	"grams_per_ml" real,
	"grams_per_piece" real,
	CONSTRAINT "ingredients_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "recipe_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dish_id" uuid NOT NULL,
	"source_url" text NOT NULL,
	"rating" real,
	"vote_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_tr" text NOT NULL,
	"name_en" text NOT NULL,
	CONSTRAINT "regions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"dish_id" uuid PRIMARY KEY NOT NULL,
	"score" real NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "version_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_id" uuid NOT NULL,
	"ingredient_id" uuid,
	"raw_text" text NOT NULL,
	"quantity" real,
	"unit" text,
	"grams" real
);
--> statement-breakpoint
ALTER TABLE "consensus_ingredients" ADD CONSTRAINT "consensus_ingredients_consensus_id_consensus_recipes_id_fk" FOREIGN KEY ("consensus_id") REFERENCES "public"."consensus_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consensus_ingredients" ADD CONSTRAINT "consensus_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consensus_recipes" ADD CONSTRAINT "consensus_recipes_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cook_events" ADD CONSTRAINT "cook_events_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_versions" ADD CONSTRAINT "recipe_versions_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "version_ingredients" ADD CONSTRAINT "version_ingredients_version_id_recipe_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."recipe_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "version_ingredients" ADD CONSTRAINT "version_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cook_events_user_idx" ON "cook_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recipe_versions_dish_idx" ON "recipe_versions" USING btree ("dish_id");--> statement-breakpoint
CREATE INDEX "version_ingredients_version_idx" ON "version_ingredients" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "version_ingredients_ingredient_idx" ON "version_ingredients" USING btree ("ingredient_id");