"""Tests for the GFF3 to SQLite converter."""

import sqlite3

import pytest

from gff_to_sqlite import convert

SAMPLE_GFF = """\
##gff-version 3
contig_1\tProdigal\tCDS\t100\t500\t.\t+\t0\tID=CDS_001;product=ABC transporter;inference=InterPro:IPR003439
contig_1\tProdigal\tCDS\t600\t900\t.\t-\t0\tID=CDS_002;product=Hypothetical protein
contig_1\tProdigal\tCDS\t1000\t1500\t.\t+\t0\tID=CDS_003;product=DNA gyrase;inference=KEGG:K02469
contig_2\tProdigal\tCDS\t200\t800\t.\t+\t0\tID=CDS_004;product=Ribosomal protein;inference=Pfam:PF00410
"""


@pytest.fixture
def sample_db(tmp_path):
    """Create a sample database from the test GFF data."""
    gff_path = tmp_path / "test.gff"
    gff_path.write_text(SAMPLE_GFF)
    db_path = tmp_path / "test.db"
    convert(str(gff_path), str(db_path))
    return db_path


def test_feature_count(sample_db):
    conn = sqlite3.connect(str(sample_db))
    count = conn.execute("SELECT COUNT(*) FROM features").fetchone()[0]
    conn.close()
    assert count == 4


def test_attributes_exist(sample_db):
    conn = sqlite3.connect(str(sample_db))
    count = conn.execute("SELECT COUNT(*) FROM attributes").fetchone()[0]
    conn.close()
    # 4 products + 3 inference = 7, plus 4 IDs = 11
    assert count >= 7


def test_specific_feature(sample_db):
    conn = sqlite3.connect(str(sample_db))
    row = conn.execute(
        "SELECT seqid, featuretype, start, end, strand FROM features WHERE id = ?",
        ("CDS_001",),
    ).fetchone()
    conn.close()
    assert row == ("contig_1", "CDS", 100, 500, "+")


def test_region_query(sample_db):
    conn = sqlite3.connect(str(sample_db))
    rows = conn.execute(
        "SELECT id FROM features WHERE seqid = ? AND start >= ? AND end <= ?",
        ("contig_1", 50, 1000),
    ).fetchall()
    conn.close()
    ids = [r[0] for r in rows]
    assert "CDS_001" in ids
    assert "CDS_002" in ids
    assert "CDS_003" not in ids


def test_annotation_query(sample_db):
    conn = sqlite3.connect(str(sample_db))
    rows = conn.execute(
        "SELECT feature_id FROM attributes WHERE key = ? AND value LIKE ?",
        ("product", "%transporter%"),
    ).fetchall()
    conn.close()
    assert len(rows) == 1
    assert rows[0][0] == "CDS_001"


def test_indexes_exist(sample_db):
    conn = sqlite3.connect(str(sample_db))
    indexes = conn.execute(
        "SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%'"
    ).fetchall()
    conn.close()
    index_names = {r[0] for r in indexes}
    expected = {
        "idx_feat_seqid",
        "idx_feat_type",
        "idx_feat_region",
        "idx_feat_strand",
        "idx_attr_key_val",
        "idx_attr_fid",
    }
    assert expected.issubset(index_names)


def test_metadata(sample_db):
    conn = sqlite3.connect(str(sample_db))
    row = conn.execute(
        "SELECT value FROM metadata WHERE key = ?", ("feature_count",)
    ).fetchone()
    conn.close()
    assert row[0] == "4"


def test_contigs(sample_db):
    conn = sqlite3.connect(str(sample_db))
    rows = conn.execute("SELECT DISTINCT seqid FROM features ORDER BY seqid").fetchall()
    conn.close()
    contigs = [r[0] for r in rows]
    assert contigs == ["contig_1", "contig_2"]
