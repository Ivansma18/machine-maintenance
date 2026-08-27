export type ProductionLine = { id: string; name: string; areaId: string };
export type Area = { id: string; name: string; siteId: string; lines: ProductionLine[] };
export type Site = { id: string; name: string; description: string | null; areas: Area[] };
