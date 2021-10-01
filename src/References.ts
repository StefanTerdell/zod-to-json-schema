import { ZodTypeDef } from "zod";

export class References {
  visited: Visited;
  currentPath: string[];
  $refStrategy: $refStrategy;
  effectStrategy: EffectStrategy;

  constructor(
    path: string[] = ["#"],
    visited: Visited = [],
    $refStrategy: $refStrategy = "root",
    effectStrategy: EffectStrategy = "input"
  ) {
    this.currentPath = path;
    this.visited = visited;
    this.$refStrategy = $refStrategy;
    this.effectStrategy = effectStrategy;
  }

  addToPath(...path: string[]) {
    return new References(
      [...this.currentPath, ...path],
      this.visited,
      this.$refStrategy
    );
  }
}
type Visited = { def: ZodTypeDef; path: string[] }[];
export type $refStrategy = "root" | "relative" | "none";
export type EffectStrategy = "input" | "any";
