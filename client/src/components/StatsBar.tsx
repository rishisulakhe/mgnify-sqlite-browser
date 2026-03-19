import type { DbStats } from '../types';

interface StatsBarProps {
  stats: DbStats | null;
  loaded: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function StatsBar({ stats, loaded }: StatsBarProps) {
  return (
    <div style={styles.bar}>
      <div style={styles.stat}>
        <span style={{
          ...styles.indicator,
          backgroundColor: loaded ? '#22c55e' : '#eab308',
        }} />
        {loaded ? 'DB Loaded' : 'Loading...'}
      </div>
      {stats && (
        <>
          <div style={styles.stat}>
            <strong>{stats.featureCount.toLocaleString()}</strong>&nbsp;features
          </div>
          <div style={styles.stat}>
            <strong>{stats.contigCount}</strong>&nbsp;contigs
          </div>
          <div style={styles.stat}>
            <strong>{formatBytes(stats.dbSizeBytes)}</strong>&nbsp;database
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    gap: '24px',
    padding: '10px 20px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#475569',
    alignItems: 'center',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  indicator: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
};
