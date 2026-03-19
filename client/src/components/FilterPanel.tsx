import { useState } from 'react';
import type { SearchFilters } from '../types';

interface FilterPanelProps {
  contigs: string[];
  featureTypes: string[];
  attributeKeys: string[];
  onSearch: (filters: SearchFilters) => void;
}

const emptyFilters: SearchFilters = {
  seqid: '',
  featureType: '',
  annotationKey: '',
  annotationValue: '',
  regionStart: null,
  regionEnd: null,
  strand: 'all',
};

export function FilterPanel({ contigs, featureTypes, attributeKeys, onSearch }: FilterPanelProps) {
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);

  const update = (partial: Partial<SearchFilters>) =>
    setFilters((prev) => ({ ...prev, ...partial }));

  const handleSearch = () => onSearch(filters);

  const handleReset = () => {
    setFilters(emptyFilters);
    onSearch(emptyFilters);
  };

  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>Filters</h3>

      <label style={styles.label}>Contig / Sequence</label>
      <select
        style={styles.input}
        value={filters.seqid}
        onChange={(e) => update({ seqid: e.target.value })}
      >
        <option value="">All</option>
        {contigs.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <label style={styles.label}>Feature Type</label>
      <select
        style={styles.input}
        value={filters.featureType}
        onChange={(e) => update({ featureType: e.target.value })}
      >
        <option value="">All</option>
        {featureTypes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <label style={styles.label}>Region</label>
      <div style={styles.row}>
        <input
          type="number"
          placeholder="Start"
          style={{ ...styles.input, flex: 1 }}
          value={filters.regionStart ?? ''}
          onChange={(e) =>
            update({ regionStart: e.target.value ? Number(e.target.value) : null })
          }
        />
        <input
          type="number"
          placeholder="End"
          style={{ ...styles.input, flex: 1 }}
          value={filters.regionEnd ?? ''}
          onChange={(e) =>
            update({ regionEnd: e.target.value ? Number(e.target.value) : null })
          }
        />
      </div>

      <label style={styles.label}>Annotation Type</label>
      <select
        style={styles.input}
        value={filters.annotationKey}
        onChange={(e) => update({ annotationKey: e.target.value })}
      >
        <option value="">Any</option>
        {attributeKeys.map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>

      <label style={styles.label}>Annotation Value</label>
      <input
        type="text"
        placeholder="Search annotations..."
        style={styles.input}
        value={filters.annotationValue}
        onChange={(e) => update({ annotationValue: e.target.value })}
      />

      <label style={styles.label}>Strand</label>
      <div style={styles.buttonGroup}>
        {['all', '+', '-'].map((s) => (
          <button
            key={s}
            style={{
              ...styles.strandBtn,
              ...(filters.strand === s ? styles.strandBtnActive : {}),
            }}
            onClick={() => update({ strand: s })}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <div style={{ ...styles.row, marginTop: '16px' }}>
        <button style={styles.searchBtn} onClick={handleSearch}>
          Search
        </button>
        <button style={styles.resetBtn} onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: '280px',
    minWidth: '280px',
    padding: '16px',
    borderRight: '1px solid #e2e8f0',
    overflowY: 'auto',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#64748b',
    marginBottom: '4px',
    marginTop: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  },
  row: {
    display: 'flex',
    gap: '8px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0',
  },
  strandBtn: {
    flex: 1,
    padding: '6px 12px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'monospace',
  },
  strandBtnActive: {
    background: '#3b82f6',
    color: '#fff',
    borderColor: '#3b82f6',
  },
  searchBtn: {
    flex: 1,
    padding: '10px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  resetBtn: {
    padding: '10px 16px',
    background: '#fff',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
};
