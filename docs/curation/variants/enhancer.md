# Enhancer




# Example



[Bhatia S, et al. (2013)](https://pubmed.ncbi.nlm.nih.gov/24290376/) discovered a mutation in a remote, ultraconserved PAX6 enhancer that causes aniridia. 
They discovered a de novo point mutation in an ultraconserved cis-element located 150 kb downstream from PAX6 in an affected individual with intact coding region and chromosomal locus. The element SIMO acts as a strong enhancer in developing ocular structures. The mutation disrupts an autoregulatory PAX6 binding site, causing loss of enhancer activity, resulting in defective maintenance of PAX6 expression.

They write:
`We identified one individual with a single de novo nucleotide variant (chr11: 31,685,945G>T [UCSC Genome Browser human reference sequence hg19]) in an ultraconserved sequence, SIMO (uc.325), located 150 kb downstream of PAX6`.

We need to identify the HG38 coordinates to curate this publication. To do so, we can enter the following
```text
chr11:31,685,945-31,685,945
````
in the [liftover](liftover.md) tool. We obtain `chr11:31821757-31821757`. We enter this in the HG38 UCSC browser and then zoom out 3x and 10x to see the surrounding sequence.  We can compare this with the sequence reported in the publication (see Suppleemtnal FIgure S5) AGCGTAT**C/A**ACTTCAG


This variant happens to be located in an intron of another gene, ELP4. Therefore, we can represent the variant as `NM_019040.5:c.1143+14176C>A`in HGVS (See [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/RCV000106409)). We can use VariantValidator 
to identifify the chromosomal location `NC_000011.10:g.31664397C>A`.
However, in HRMDBQ, we use the gene symbol of the gene with the presumed etiological role (PAX6). Therefore, we enter the following


- Gene: `PAX6` 
- Variant: `NC_000011.10:g.31664397C>A` (using the IG option)
- Variant category: `Enhancer` 
- TODO-how to code the above stuff
- Citation: PMID:24290376


The authors showed:
- first performed a detailed characterization of the 800 bp SIMO cis-element in mouse and zebrafish reporter transgenics. In  zebrafish transgenic they show the variant abolishes activity ( LacZ expression on the lens)
- DNA affinity-capture assay via biotinylated double-stranded oligonucleotides as probe also efficiently pulled down Pax6 protein from a nuclear extract of E14.5 eyes when the wild-type SIMO-G PAX6 binding sequence was used, but the efficiency of the Pax6 pulldown was strongly reduced with the SIMO-T mutant version of the probe 
- confirmed by an EMSA competition experiment where the G>T change strongly reduced the ability to compete for binding of purified PAX6 paired domain 
- modified BAC constructs

These results show that SIMO is an active enhancer in E14.5 eyes and that Pax6 efficiently binds to a wild-type SIMO-G but not a mutant SIMO-T fragment, albeit with lower affinity than the optimal PAX6 consensus site.1