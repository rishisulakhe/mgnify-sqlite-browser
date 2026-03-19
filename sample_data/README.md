# Sample Data

## Download a real MGnify GFF file

1. Go to: https://www.ebi.ac.uk/metagenomics/genomes/MGYG000535630
2. Click the "Downloads" tab
3. Download the GFF file (genome annotation)

Or use wget:

```bash
# This URL may need to be updated — check the Downloads tab for the current link
wget -O sample.gff "https://www.ebi.ac.uk/metagenomics/api/v1/genomes/MGYG000535630/downloads/MGYG000535630.gff"
```

Then convert:

```bash
cd python
pip install -r requirements.txt
python gff_to_sqlite.py --input ../sample_data/sample.gff --output ../frontend/public/features.db
```

## Using the included GFF file

There is also a GFF file in `gff-files/MGYG000296202.gff` that can be used directly:

```bash
cd python
pip install -r requirements.txt
python gff_to_sqlite.py --input ../gff-files/MGYG000296202.gff --output ../frontend/public/features.db
```
