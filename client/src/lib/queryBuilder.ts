import type { SearchFilters } from '../types';

interface BuiltQuery {
  sql: string;
  params: (string | number)[];
  countSql: string;
  countParams: (string | number)[];
}

export function buildQuery(filters: SearchFilters): BuiltQuery {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let needsAttrJoin = false;

  if (filters.seqid) {
    conditions.push('f.seqid = ?');
    params.push(filters.seqid);
  }

  if (filters.featureType) {
    conditions.push('f.featuretype = ?');
    params.push(filters.featureType);
  }

  if (filters.strand && filters.strand !== 'all') {
    conditions.push('f.strand = ?');
    params.push(filters.strand);
  }

  if (filters.regionStart !== null) {
    conditions.push('f.start >= ?');
    params.push(filters.regionStart);
  }

  if (filters.regionEnd !== null) {
    conditions.push('f.end <= ?');
    params.push(filters.regionEnd);
  }

  if (filters.annotationKey || filters.annotationValue) {
    needsAttrJoin = true;
    if (filters.annotationKey) {
      conditions.push('a.key = ?');
      params.push(filters.annotationKey);
    }
    if (filters.annotationValue) {
      conditions.push('a.value LIKE ?');
      params.push(`%${filters.annotationValue}%`);
    }
  }

  const fromClause = needsAttrJoin
    ? 'FROM features f JOIN attributes a ON a.feature_id = f.id'
    : 'FROM features f';

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const sql = `SELECT DISTINCT f.id, f.seqid, f.source, f.featuretype, f.start, f.end, f.score, f.strand, f.frame ${fromClause} ${whereClause} ORDER BY f.seqid, f.start LIMIT 200`;

  const countSql = `SELECT COUNT(DISTINCT f.id) as count ${fromClause} ${whereClause}`;

  return { sql, params, countSql, countParams: [...params] };
}
