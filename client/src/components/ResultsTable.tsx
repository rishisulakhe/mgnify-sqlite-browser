import type { QueryResult } from '../types';

interface ResultsTableProps {
  result: QueryResult | null;
}

export function ResultsTable({ result }: ResultsTableProps) {
  if (!result) {
    return (
      <div style={styles.empty}>
        <p style={{ color: '#94a3b8' }}>Run a search to see results</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.meta}>
        <span>
          <strong>{result.totalCount.toLocaleString()}</strong> results
          {result.totalCount > 200 && ' (showing first 200)'}
        </span>
        <span style={styles.time}>
          Query: {result.queryTimeMs.toFixed(1)} ms
        </span>
      </div>

      {result.features.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ color: '#94a3b8' }}>No matching features found</p>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Contig</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Start..End</th>
                <th style={styles.th}>Strand</th>
                <th style={styles.th}>Source</th>
              </tr>
            </thead>
            <tbody>
              {result.features.map((f, i) => (
                <tr key={f.id} style={i % 2 === 1 ? styles.zebraRow : undefined}>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '13px' }}>{f.id}</td>
                  <td style={styles.td}>{f.seqid}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{f.featuretype}</span>
                  </td>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '13px' }}>
                    {f.start.toLocaleString()}..{f.end.toLocaleString()}
                  </td>
                  <td style={{ ...styles.td, fontFamily: 'monospace', textAlign: 'center' }}>{f.strand}</td>
                  <td style={styles.td}>{f.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#475569',
    borderBottom: '1px solid #e2e8f0',
  },
  time: {
    color: '#94a3b8',
    fontSize: '13px',
  },
  tableWrap: {
    flex: 1,
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    borderBottom: '2px solid #e2e8f0',
    color: '#64748b',
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    position: 'sticky' as const,
    top: 0,
    background: '#fff',
  },
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
  },
  zebraRow: {
    backgroundColor: '#f8fafc',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    background: '#ede9fe',
    color: '#7c3aed',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
};
