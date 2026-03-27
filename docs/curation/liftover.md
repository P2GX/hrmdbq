# Liftover

We are curating using the hg38 genome assembly. 

Older publications generally use the previous (hg19=hg37) assembly.

Several tools are available to convert ("lift over") coordinates from one assembly to another.  

## UCSC

The [UCSC Liftover tool](https://genome.ucsc.edu/cgi-bin/hgLiftOver) requires data to be entered as e BED (e.g. "chr4 100000 100001", 0-based) and position box ("chr4:100,001-100,001", 1-based). 

For instance, these coordinates (hg19)
```text
chrX:138612906-138612906
```
are converted to (hg38)
```text
chrX:136923343-136923343
```

It us useful to compare the result with data from the original publication. Often, a "snippet" with surrounding code is available. For this example,
the original variant is noted to be chrX:138612906A>G on hg19 ([PMID: 24138812](https://pubmed.ncbi.nlm.nih.gov/24138812/){target="_blank"}).


 we have ACTTTCAC[A/G]ATC