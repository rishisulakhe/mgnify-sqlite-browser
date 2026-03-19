import { useState, useEffect, useCallback } from 'react';
import { useSqliteDb } from './hooks/useSqliteDb';
import { buildQuery } from './lib/queryBuilder';
import { FilterPanel } from './components/FilterPanel';
import { ResultsTable } from './components/ResultsTable';
import { StatsBar } from './components/StatsBar';
import type { SearchFilters, Feature, QueryResult, DbStats } from './types';

function App() {
  const { db, loading, error, dbSizeBytes, query } = useSqliteDb('/features.db');

  const [stats, setStats] = useState<DbStats | null>(null);
  const [contigs, setContigs] = useState<string[]>([]);
  const [featureTypes, setFeatureTypes] = useState<string[]>([]);
  const [attributeKeys, setAttributeKeys] = useState<string[]>([]);
  const [result, setResult] = useState<QueryResult | null>(null);

  useEffect(() => {
    if (!db) return;

    const featureCount = (query('SELECT COUNT(*) as c FROM features')[0]?.c as number) ?? 0;
    const contigCount = (query('SELECT COUNT(DISTINCT seqid) as c FROM features')[0]?.c as number) ?? 0;

    setStats({ featureCount, contigCount, dbSizeBytes });

    setContigs(query('SELECT DISTINCT seqid FROM features ORDER BY seqid').map((r) => r.seqid as string));
    setFeatureTypes(query('SELECT DISTINCT featuretype FROM features ORDER BY featuretype').map((r) => r.featuretype as string));
    setAttributeKeys(query('SELECT DISTINCT key FROM attributes ORDER BY key').map((r) => r.key as string));
  }, [db, dbSizeBytes, query]);

  const handleSearch = useCallback(
    (filters: SearchFilters) => {
      if (!db) return;

      const { sql, params, countSql, countParams } = buildQuery(filters);

      const t0 = performance.now();
      const rows = query(sql, params);
      const queryTimeMs = performance.now() - t0;

      const countResult = query(countSql, countParams);
      const totalCount = (countResult[0]?.count as number) ?? 0;

      const features: Feature[] = rows.map((r) => ({
        id: r.id as string,
        seqid: r.seqid as string,
        source: r.source as string,
        featuretype: r.featuretype as string,
        start: r.start as number,
        end: r.end as number,
        score: r.score as number | null,
        strand: r.strand as string,
        frame: r.frame as string,
      }));

      setResult({ features, queryTimeMs, totalCount });
    },
    [db, query],
  );

  if (error) {
    return (
      <div style={styles.center}>
        <div style={styles.errorBox}>
          <h2>Failed to load database</h2>
          <p>{error}</p>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Make sure <code>features.db</code> exists in <code>frontend/public/</code>. See README for instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.h1}>MGnify Genome Feature Browser (POC)</h1>
          <p style={styles.subtitle}>Client-side SQLite via WebAssembly &mdash; Zero server calls</p>
        </div>
        <span style={styles.badge}>sql.js + WebAssembly</span>
      </header>

      <StatsBar stats={stats} loaded={!loading && !!db} />

      {loading ? (
        <div style={styles.center}>
          <div style={styles.spinner} />
          <p style={{ color: '#64748b', marginTop: '16px' }}>Loading database...</p>
        </div>
      ) : (
        <div style={styles.body}>
          <FilterPanel
            contigs={contigs}
            featureTypes={featureTypes}
            attributeKeys={attributeKeys}
            onSearch={handleSearch}
          />
          <ResultsTable result={result} />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1e293b',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #e2e8f0',
  },
  h1: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  badge: {
    padding: '4px 12px',
    background: '#f0fdf4',
    color: '#15803d',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    border: '1px solid #bbf7d0',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    textAlign: 'center' as const,
    padding: '32px',
    maxWidth: '500px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

// Inject keyframes for spinner
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    * { box-sizing: border-box; }
    body { margin: 0; }
  `;
  document.head.appendChild(styleEl);
}

export default App;
