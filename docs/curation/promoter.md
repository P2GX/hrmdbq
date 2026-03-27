# Promoter variants

todo definition, citations

![The 5' UTR Structure](../img/F9-promoter-5utr.png "Figure 1: Promoter and 5' Untranslated Region of the F9 gene")

The green "M1" is the start codon in this view. The thin blue bar of the top cartoon is the 5'UTR. The sequence that is upstream of that is the promoter (note that the promoter can also overlap with the 5'UTR; the 5'UTR is longer in most genes, usually on the order of 50-250 bp).

Older articles often show schematics of the UTR/promoter sequence that allow us to localize variants by comparison to UCSC. For instance, the following is taken from [PMID: 3416069](https://pubmed.ncbi.nlm.nih.gov/3416069/)

![The 5' UTR Structure](../img/F9-seq.png "Figure 1: Promoter and 5' Untranslated Region of the F9 gene")

In this publication, the variant is indicated with an asterisk (it is a T to A change), and three putative start sites are indicated with arrow. By comparison with UCSC, we can see that the
annotated transcription start site is located between the first two arrows: CACTTTCACA... We can compare the sequences and locate the position of the affected nucleotide (139,530,716). In this case, there is also a link to
an OMIM Allelic Variant ([300756.0001](https://www.omim.org/entry/300746#0001)), and we can follow the link to ClinVar: [RCV](https://www.ncbi.nlm.nih.gov/clinvar/RCV000011304/) from the OMIM page to find the correct variant nomenclature for HRMDBQ: NC_000023.11:g.139530716T>A. Here, we use the accession number for chromosome X for hg38, followed by "g." position REF > ALT.

To enter this variant in HRMDBQ, we enter

- Gene: `F9` 
- Variant: `NC_000023.11:g.139530716T>A` (using the IG/intergenic option)
- Variant category: `Promoter` 
-
- Citation: PMID:3416069