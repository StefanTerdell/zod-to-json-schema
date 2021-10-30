import { ZodTypeDef } from "zod";

export class References {
  items: Item[];
  currentPath: string[];
  $refStrategy: $refStrategy;
  effectStrategy: EffectStrategy;

  constructor(
    path: string[] = ["#"],
    items: Item[] = [],
    $refStrategy: $refStrategy = "root",
    effectStrategy: EffectStrategy = "input"
  ) {
    this.currentPath = path;
    this.items = items;
    this.$refStrategy = $refStrategy;
    this.effectStrategy = effectStrategy;
  }

  addToPath(...path: string[]) {
    return new References(
      [...this.currentPath, ...path],
      this.items,
      this.$refStrategy
    );
  }
}
export type Item = { def: ZodTypeDef; path: string[] };
export type $refStrategy = "root" | "relative" | "none";
export type EffectStrategy = "input" | "any";
