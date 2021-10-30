import { ZodTypeDef } from "zod";

export class References {
  visited: Visited;
  currentPath: string[];
  $refStrategy: $refStrategy;
  effectStrategy: EffectStrategy;
  target: Target;

  // constructor() {

  // }

  constructor(
    path: string[] = ["#"],
    visited: Visited = [],
    $refStrategy: $refStrategy = "root",
    effectStrategy: EffectStrategy = "input",
    target: Target = "jsonSchema"
  ) {
    this.currentPath = path;
    this.visited = visited;
    this.$refStrategy = $refStrategy;
    this.effectStrategy = effectStrategy;
    this.target = target;
  }

  addToPath(...path: string[]) {
    return new References(
      [...this.currentPath, ...path],
      this.visited,
      this.$refStrategy,
      this.effectStrategy,
      this.target
    );
  }
}
type Visited = { def: ZodTypeDef; path: string[] }[];
export type $refStrategy = "root" | "relative" | "none";
export type EffectStrategy = "input" | "any";
export type Target = "jsonSchema" | "openApi";
