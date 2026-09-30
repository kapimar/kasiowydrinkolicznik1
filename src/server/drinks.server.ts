import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { drinks } from "../../db/schema.js";

export const CATEGORIES = ["wine", "cocktail", "beer", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

function getPhotoStore() {
  return getStore("drink-photos");
}

export async function listDrinks() {
  return db.select().from(drinks).orderBy(desc(drinks.createdAt));
}

export async function createDrink(category: string, file: File) {
  if (!isCategory(category)) {
    throw new Error(`Invalid category: ${category}`);
  }
  if (!file || file.size === 0) {
    throw new Error("A photo is required");
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const photoKey = `${randomUUID()}.${extension}`;

  const buffer = await file.arrayBuffer();
  const store = getPhotoStore();
  await store.set(photoKey, buffer, {
    metadata: { contentType: file.type || "application/octet-stream" },
  });

  const [inserted] = await db
    .insert(drinks)
    .values({ category, photoKey })
    .returning();

  return inserted;
}

export async function deleteDrink(id: number) {
  const [existing] = await db.select().from(drinks).where(eq(drinks.id, id));
  if (!existing) return;

  const store = getPhotoStore();
  await store.delete(existing.photoKey);
  await db.delete(drinks).where(eq(drinks.id, id));
}

export async function getPhoto(key: string) {
  const store = getPhotoStore();
  const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
  if (!result) return null;

  return {
    data: result.data as ArrayBuffer,
    contentType: result.metadata?.contentType ?? "application/octet-stream",
  };
}
