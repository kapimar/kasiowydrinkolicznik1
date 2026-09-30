import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const drinks = pgTable("drinks", {
  id: serial().primaryKey(),
  category: text().notNull(),
  photoKey: text("photo_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
