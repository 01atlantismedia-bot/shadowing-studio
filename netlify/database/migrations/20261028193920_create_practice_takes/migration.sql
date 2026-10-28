CREATE TABLE "takes" (
	"id" uuid PRIMARY KEY,
	"owner" text NOT NULL,
	"video" text NOT NULL,
	"phrase" text NOT NULL,
	"mime" text NOT NULL,
	"rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
