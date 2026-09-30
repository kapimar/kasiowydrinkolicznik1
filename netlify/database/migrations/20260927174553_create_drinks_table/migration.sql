CREATE TABLE "drinks" (
	"id" serial PRIMARY KEY,
	"category" text NOT NULL,
	"photo_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
