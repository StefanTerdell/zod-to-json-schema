import { ZodTypeDef } from "zod";

export class References {
  visited: Visited;
  currentPath: string[];
  $refStrategy: $refStrategy;
  effectStrategy: EffectStrategy;
  mode: Mode;

  // constructor() {

  // }

  constructor(
    path: string[] = ["#"],
    visited: Visited = [],
    $refStrategy: $refStrategy = "root",
    effectStrategy: EffectStrategy = "input",
    mode: Mode = "jsonSchema"
  ) {
    this.currentPath = path;
    this.visited = visited;
    this.$refStrategy = $refStrategy;
    this.effectStrategy = effectStrategy;
    this.mode = mode;
  }

  addToPath(...path: string[]) {
    return new References(
      [...this.currentPath, ...path],
      this.visited,
      this.$refStrategy,
      this.effectStrategy,
      this.mode
    );
  }
}
type Visited = { def: ZodTypeDef; path: string[] }[];
export type $refStrategy = "root" | "relative" | "none";
export type EffectStrategy = "input" | "any";
export type Mode = "jsonSchema" | "openApi";
