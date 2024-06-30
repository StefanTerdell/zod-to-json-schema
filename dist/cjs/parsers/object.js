"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseObjectDef = exports.parseObjectDefX = void 0;
const parseDef_js_1 = require("../parseDef.js");
function decideAdditionalProperties(def, refs) {
    if (refs.removeAdditionalStrategy === "strict") {
        return def.catchall._def.typeName === "ZodNever"
            ? def.unknownKeys !== "strict"
            : (0, parseDef_js_1.parseDef)(def.catchall._def, {
                ...refs,
                currentPath: [...refs.currentPath, "additionalProperties"],
            }) ?? true;
    }
    else {
        return def.catchall._def.typeName === "ZodNever"
            ? def.unknownKeys === "passthrough"
            : (0, parseDef_js_1.parseDef)(def.catchall._def, {
                ...refs,
                currentPath: [...refs.currentPath, "additionalProperties"],
            }) ?? true;
    }
}
;
function parseObjectDefX(def, refs) {
    Object.keys(def.shape()).reduce((schema, key) => {
        let prop = def.shape()[key];
        const isOptional = prop.isOptional();
        if (!isOptional) {
            prop = { ...prop._def.innerSchema };
        }
        const propSchema = (0, parseDef_js_1.parseDef)(prop._def, {
            ...refs,
            currentPath: [...refs.currentPath, "properties", key],
            propertyPath: [...refs.currentPath, "properties", key],
        });
        if (propSchema !== undefined) {
            schema.properties[key] = propSchema;
            if (!isOptional) {
                if (!schema.required) {
                    schema.required = [];
                }
                schema.required.push(key);
            }
        }
        return schema;
    }, {
        type: "object",
        properties: {},
        additionalProperties: decideAdditionalProperties(def, refs),
    });
    const result = {
        type: "object",
        ...Object.entries(def.shape()).reduce((acc, [propName, propDef]) => {
            if (propDef === undefined || propDef._def === undefined)
                return acc;
            const parsedDef = (0, parseDef_js_1.parseDef)(propDef._def, {
                ...refs,
                currentPath: [...refs.currentPath, "properties", propName],
                propertyPath: [...refs.currentPath, "properties", propName],
            });
            if (parsedDef === undefined)
                return acc;
            return {
                properties: { ...acc.properties, [propName]: parsedDef },
                required: propDef.isOptional()
                    ? acc.required
                    : [...acc.required, propName],
            };
        }, { properties: {}, required: [] }),
        additionalProperties: decideAdditionalProperties(def, refs),
    };
    if (!result.required.length)
        delete result.required;
    return result;
}
exports.parseObjectDefX = parseObjectDefX;
function parseObjectDef(def, refs) {
    const result = {
        type: "object",
        ...Object.entries(def.shape()).reduce((acc, [propName, propDef]) => {
            if (propDef === undefined || propDef._def === undefined)
                return acc;
            const parsedDef = (0, parseDef_js_1.parseDef)(propDef._def, {
                ...refs,
                currentPath: [...refs.currentPath, "properties", propName],
                propertyPath: [...refs.currentPath, "properties", propName],
            });
            if (parsedDef === undefined)
                return acc;
            return {
                properties: { ...acc.properties, [propName]: parsedDef },
                required: propDef.isOptional()
                    ? acc.required
                    : [...acc.required, propName],
            };
        }, { properties: {}, required: [] }),
        additionalProperties: decideAdditionalProperties(def, refs),
    };
    if (!result.required.length)
        delete result.required;
    return result;
}
exports.parseObjectDef = parseObjectDef;
