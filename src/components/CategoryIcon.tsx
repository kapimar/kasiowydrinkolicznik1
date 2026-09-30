import { Beer, CupSoda, Martini, Wine } from "lucide-react";
import type { Category } from "../server/drinks.server.js";

export const CATEGORY_META: Record<
  Category,
  { label: string; icon: typeof Wine; color: string; bg: string; ring: string }
> = {
  wine: {
    label: "Wino",
    icon: Wine,
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-50",
    ring: "ring-fuchsia-400",
  },
  cocktail: {
    label: "Drink",
    icon: Martini,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    ring: "ring-cyan-400",
  },
  beer: {
    label: "Piwo",
    icon: Beer,
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-400",
  },
  other: {
    label: "Inne",
    icon: CupSoda,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-400",
  },
};

export function CategoryIcon({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return <Icon className={className ?? `w-5 h-5 ${meta.color}`} />;
}
