import "server-only";

const supportedKeys = new Set([
  "$id",
  "$defs",
  "$ref",
  "$anchor",
  "type",
  "title",
  "description",
  "enum",
  "items",
  "prefixItems",
  "minItems",
  "maxItems",
  "minimum",
  "maximum",
  "anyOf",
  "oneOf",
  "properties",
  "additionalProperties",
  "required",
  "propertyOrdering",
]);

export function toGeminiJsonSchema(schema) {
  if (Array.isArray(schema)) {
    return schema.map(toGeminiJsonSchema);
  }
  if (!schema || typeof schema !== "object") return schema;

  const result = {};
  for (const [key, value] of Object.entries(schema)) {
    if (!supportedKeys.has(key)) continue;
    if (key === "properties" || key === "$defs") {
      result[key] = Object.fromEntries(
        Object.entries(value).map(([name, child]) => [
          name,
          toGeminiJsonSchema(child),
        ]),
      );
    } else if (key === "additionalProperties" && typeof value === "boolean") {
      result[key] = value;
    } else {
      result[key] = toGeminiJsonSchema(value);
    }
  }
  return result;
}
