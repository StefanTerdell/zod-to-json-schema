import { ZodTypeDef } from "zod";

export class References {
  visited: Visited;
  currentPath: string[];
  $refStrategy: $refStrategy;

  constructor(
    path: string[] = ["#"],
    visited: Visited = [],
    $refStrategy: $refStrategy = "root"
  ) {
    this.currentPath = path;
    this.visited = visited;
    this.$refStrategy = $refStrategy;
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
