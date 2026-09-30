import { createServerFn } from "@tanstack/react-start";
import { createDrink, deleteDrink, listDrinks } from "./drinks.server.js";

export const getDrinks = createServerFn({ method: "GET" }).handler(async () => {
  return listDrinks();
});

export const addDrink = createServerFn({ method: "POST" })
  .inputValidator((formData: FormData) => formData)
  .handler(async ({ data: formData }) => {
    const category = formData.get("category") as string;
    const file = formData.get("photo") as File;
    return createDrink(category, file);
  });

export const removeDrink = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await deleteDrink(data.id);
    return { ok: true };
  });
