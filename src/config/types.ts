export type SubcategoryConfig = { id: string; label: string; helpText?: string };
export type DimensionConfig = { id: string; label: string; helpText?: string; subcategories: SubcategoryConfig[] };
export type HealthConfig = { configVersion: string; dimensions: DimensionConfig[] };
