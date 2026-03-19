import { useEffect, useState, useCallback, useRef } from 'react';
import initSqlJs, { Database } from 'sql.js';

// Import the WASM file as a URL so Vite handles it correctly
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

interface UseSqliteDbResult {
  db: Database | null;
  loading: boolean;
  error: string | null;
  dbSizeBytes: number;
  query: (sql: string, params?: (string | number)[]) => Record<string, unknown>[];
}

export function useSqliteDb(dbUrl: string): UseSqliteDbResult {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbSizeBytes, setDbSizeBytes] = useState(0);
  const dbRef = useRef<Database | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDb() {
      try {
        const SQL = await initSqlJs({
          locateFile: () => sqlWasmUrl,
        });

        const response = await fetch(dbUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch database: ${response.status} ${response.statusText}`);
        }

        const buf = await response.arrayBuffer();
        if (cancelled) return;

        setDbSizeBytes(buf.byteLength);
        const database = new SQL.Database(new Uint8Array(buf));
        dbRef.current = database;
        setDb(database);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load database');
          setLoading(false);
        }
      }
    }

    loadDb();

    return () => {
      cancelled = true;
      if (dbRef.current) {
        dbRef.current.close();
        dbRef.current = null;
      }
    };
  }, [dbUrl]);

  const query = useCallback(
    (sql: string, params?: (string | number)[]): Record<string, unknown>[] => {
      if (!dbRef.current) return [];

      const results = dbRef.current.exec(sql, params);
      if (results.length === 0) return [];

      const { columns, values } = results[0];
      return values.map((row: unknown[]) => {
        const obj: Record<string, unknown> = {};
        columns.forEach((col: string, i: number) => {
          obj[col] = row[i];
        });
        return obj;
      });
    },
    [],
  );

  return { db, loading, error, dbSizeBytes, query };
}
