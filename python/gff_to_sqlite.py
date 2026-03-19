#!/usr/bin/env python3
"""Convert a GFF3 genomic annotation file into an optimized SQLite database.

This script parses GFF3 files using gffutils and produces a compact, indexed
SQLite database suitable for loading in the browser via sql.js (WebAssembly).
"""

import argparse
import os
import sqlite3
import sys
from datetime import datetime, timezone

import gffutils


def parse_args(argv=None):
    parser = argparse.ArgumentParser(
        description="Convert a GFF3 annotation file to an optimized SQLite database."
    )
    parser.add_argument(
        "--input", "-i",
        required=True,
        help="Path to the input GFF3 file",
    )
    parser.add_argument(
        "--output", "-o",
        required=True,
        help="Path for the output SQLite database file",
    )
    return parser.parse_args(argv)


SCHEMA_SQL = """
CREATE TABLE features (
    id TEXT PRIMARY KEY,
    seqid TEXT NOT NULL,
    source TEXT,
    featuretype TEXT NOT NULL,
    start INTEGER NOT NULL,
    end INTEGER NOT NULL,
    score REAL,
    strand TEXT,
    frame TEXT
);

CREATE TABLE attributes (
    feature_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    FOREIGN KEY (feature_id) REFERENCES features(id)
);

CREATE TABLE metadata (
    key TEXT PRIMARY KEY,
    value TEXT
);
"""

INDEX_SQL = """
CREATE INDEX idx_feat_seqid ON features(seqid);
CREATE INDEX idx_feat_type ON features(featuretype);
CREATE INDEX idx_feat_region ON features(seqid, start, end);
CREATE INDEX idx_feat_strand ON features(strand);
CREATE INDEX idx_attr_key_val ON attributes(key, value);
CREATE INDEX idx_attr_fid ON attributes(feature_id);
"""


def convert(input_path: str, output_path: str) -> dict:
    """Convert a GFF3 file to an SQLite database.

    Returns a dict with summary statistics.
    """
    if not os.path.isfile(input_path):
        print(f"Error: input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    # Remove existing output file if present
    if os.path.exists(output_path):
        os.remove(output_path)

    conn = sqlite3.connect(output_path)
    cur = conn.cursor()

    # Set page size before creating tables (important for HTTP Range requests)
    cur.execute("PRAGMA page_size=4096")
    cur.execute("PRAGMA journal_mode=WAL")

    conn.executescript(SCHEMA_SQL)

    # Parse GFF3 with gffutils
    db = gffutils.create_db(
        input_path,
        ":memory:",
        force=True,
        keep_order=True,
        merge_strategy="merge",
        sort_attribute_values=False,
    )

    feature_count = 0
    attr_count = 0

    for feature in db.all_features():
        feature_id = feature.id if feature.id else f"{feature.seqid}_{feature.featuretype}_{feature.start}_{feature.end}"

        score = None
        if feature.score != ".":
            try:
                score = float(feature.score)
            except (ValueError, TypeError):
                score = None

        frame = feature.frame if feature.frame != "." else None

        cur.execute(
            "INSERT OR IGNORE INTO features (id, seqid, source, featuretype, start, end, score, strand, frame) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                feature_id,
                feature.seqid,
                feature.source,
                feature.featuretype,
                feature.start,
                feature.end,
                score,
                feature.strand,
                frame,
            ),
        )
        feature_count += 1

        # Extract all attributes
        for key, values in feature.attributes.items():
            for value in values:
                cur.execute(
                    "INSERT INTO attributes (feature_id, key, value) VALUES (?, ?, ?)",
                    (feature_id, key, str(value)),
                )
                attr_count += 1

    # Create indexes
    conn.executescript(INDEX_SQL)

    # Store metadata
    cur.execute(
        "INSERT INTO metadata (key, value) VALUES (?, ?)",
        ("source_file", os.path.basename(input_path)),
    )
    cur.execute(
        "INSERT INTO metadata (key, value) VALUES (?, ?)",
        ("feature_count", str(feature_count)),
    )
    cur.execute(
        "INSERT INTO metadata (key, value) VALUES (?, ?)",
        ("creation_date", datetime.now(timezone.utc).isoformat()),
    )

    conn.commit()

    # Optimize
    cur.execute("ANALYZE")
    cur.execute("VACUUM")

    conn.close()

    db_size_mb = os.path.getsize(output_path) / (1024 * 1024)

    return {
        "features": feature_count,
        "attributes": attr_count,
        "size_mb": db_size_mb,
    }


def main(argv=None):
    args = parse_args(argv)
    stats = convert(args.input, args.output)
    print(
        f"Converted {stats['features']} features with {stats['attributes']} attributes "
        f"into {stats['size_mb']:.2f} MB database"
    )


if __name__ == "__main__":
    main()
