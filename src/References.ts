import { ZodTypeDef } from "zod";
import { JsonSchema7Type } from "./parseDef";

export class References {
  items: Item[];
  currentPath: string[];
  $refStrategy: $refStrategy;
  effectStrategy: EffectStrategy;
  target: Target;

  // constructor() {

  // }

  constructor(
    path: string[] = ["#"],
    items: Item[] = [],
    $refStrategy: $refStrategy = "root",
    effectStrategy: EffectStrategy = "input",
    target: Target = "jsonSchema"
  ) {
    this.currentPath = path;
    this.items = items;
    this.$refStrategy = $refStrategy;
    this.effectStrategy = effectStrategy;
    this.target = target;
  }

  addToPath(...path: string[]) {
    return new References(
      [...this.currentPath, ...path],
      this.items,
      this.$refStrategy,
      this.effectStrategy,
      this.target
    );
  }
}
export type Item = {
  def: ZodTypeDef;
  path: string[];
  jsonSchema: JsonSchema7Type | undefined;
};
export type $refStrategy = "root" | "relative" | "none";
export type EffectStrategy = "input" | "any";
export type Target = "jsonSchema" | "openApi";
