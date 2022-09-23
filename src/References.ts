import { ZodTypeDef } from "zod";
import { JsonSchema7Type } from "./parseDef";

export class References {
  items: Item[];
  currentPath: string[];
  $refStrategy: $refStrategy;
  effectStrategy: EffectStrategy;
  target: Target;
  propertyPath: string[]
  strictUnions: boolean

  constructor(
    path: string[] = ["#"],
    items: Item[] = [],
    $refStrategy: $refStrategy = "root",
    effectStrategy: EffectStrategy = "input",
    target: Target = "jsonSchema7",
    propertyPath: string[] = [],
    strictUnions = false
  ) {
    this.currentPath = path;
    this.items = items;
    this.$refStrategy = $refStrategy;
    this.effectStrategy = effectStrategy;
    this.target = target;
    this.propertyPath = propertyPath;
    this.strictUnions = strictUnions
  }

  addToPath(...path: string[]) {
    return new References(
      [...this.currentPath, ...path],
      this.items,
      this.$refStrategy,
      this.effectStrategy,
      this.target,
      this.propertyPath
    );
  }

  addToPathAsProperty(...path: string[]) {
    return new References(
      [...this.currentPath, ...path],
      this.items,
      this.$refStrategy,
      this.effectStrategy,
      this.target,
      [...this.currentPath, ...path]
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
export type Target = "jsonSchema7" | "openApi3";
