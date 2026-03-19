# MGnify Genome Feature Browser — Proof of Concept

> **GSoC 2026 | EMBL-EBI | SQLite WASM**

Query metagenome annotations entirely in the browser using SQLite + WebAssembly.

## Why

MGnify's genome catalogue provides rich functional annotations (InterPro, KEGG, Pfam, COG, eggNOG, etc.) for hundreds of thousands of genomes. Currently, exploring these annotations requires server-side queries — there is no offline access, limited client-side filtering, and every interaction hits the API.

This proof-of-concept demonstrates that **genomic feature data can be queried entirely in the browser** by compiling SQLite to WebAssembly, eliminating server round-trips and enabling instant, offline-capable exploration.

## How It Works

```
GFF3 file → Python/gffutils → SQLite database → sql.js (WASM) → React UI
```

1. **Python converter** parses a GFF3 annotation file using `gffutils` and writes an optimized, indexed SQLite database
2. **React frontend** loads the `.db` file via `fetch()`, initializes sql.js (SQLite compiled to WebAssembly), and runs all queries client-side
3. **Users search/filter** by contig, feature type, genomic region, strand, and annotation — with sub-millisecond query times and zero server calls

## Tech Stack

- **Python** + **gffutils** — GFF3 parsing and SQLite conversion
- **SQLite** — compact, indexed relational database
- **sql.js** — SQLite compiled to WebAssembly for browser execution
- **React** + **TypeScript** — frontend UI
- **Vite** — build tooling

## Quick Start

### 1. Generate the SQLite database

```bash
cd python
pip install -r requirements.txt
python gff_to_sqlite.py --input ../gff-files/MGYG000296202.gff --output ../frontend/public/features.db
```

### 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
mgnify-sqlite-browser-poc/
├── README.md
├── python/
│   ├── gff_to_sqlite.py        # GFF3 → SQLite converter (CLI)
│   ├── requirements.txt
│   └── tests/
│       └── test_converter.py    # pytest tests
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/                  # .db file goes here after generation
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── types.ts
│       ├── hooks/
│       │   └── useSqliteDb.ts   # sql.js WASM loader hook
│       ├── components/
│       │   ├── FilterPanel.tsx  # Search filters
│       │   ├── ResultsTable.tsx # Results display
│       │   └── StatsBar.tsx     # Database statistics
│       └── lib/
│           └── queryBuilder.ts  # Parameterized SQL builder
├── gff-files/                   # Sample GFF files
├── sample_data/
│   └── README.md                # Instructions to download MGnify data
└── .gitignore
```

## Screenshots

*Screenshots coming soon*

## Related

- [GSoC 2026 — EMBL-EBI Projects](https://www.ebi.ac.uk/about/careers/gsoc/)
- [MGnify Genomes](https://www.ebi.ac.uk/metagenomics/genomes)
- [sql.js — SQLite compiled to WebAssembly](https://github.com/sql-js/sql.js)
- [sqlite-wasm-http — HTTP Range request loading](https://github.com/niccoloraspa/sqlite-wasm-http)
- [JBrowse 2 — Genome browser](https://jbrowse.org/jb2/)

## Author

Built as a proof-of-concept for GSoC 2026 application to EMBL-EBI (Project 14: *A Genomic Feature Database in the Browser*).
