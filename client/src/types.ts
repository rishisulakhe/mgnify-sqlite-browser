export interface SearchFilters {
  seqid: string;
  featureType: string;
  annotationKey: string;
  annotationValue: string;
  regionStart: number | null;
  regionEnd: number | null;
  strand: string;
}

export interface Feature {
  id: string;
  seqid: string;
  source: string;
  featuretype: string;
  start: number;
  end: number;
  score: number | null;
  strand: string;
  frame: string;
}

export interface QueryResult {
  features: Feature[];
  queryTimeMs: number;
  totalCount: number;
}

export interface DbStats {
  featureCount: number;
  contigCount: number;
  dbSizeBytes: number;
}
