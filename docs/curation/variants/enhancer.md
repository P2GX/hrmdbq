# Enhancer

Classical definitions of activating regulatory elements are focused on two classes: promoters and enhancers, where the first category defines where transcription is initiated, and the other, elements that amplify such transcription initiation.

Classically, **promoters** are: 
- proximal regulatory elements. 
- located immediately upstream (in front) of the gene they regulate, typically within 100 to 1,000 base pairs of the transcription start site. 
- Each promoter usually only controls one specific gene.

Classically **enhancers** are:
- distal regulatory elements.
- located thousands (or even millions) of base pairs away from the gene.
- Upstream or downstream of the gene or even inside an intron of the same or a different different gene.
- Multiple enhancers may influence one gene, and a given enhancer may influence multiple genes.

See [Andersson R, Sandelin A. Determinants of enhancer and promoter activities of regulatory elements. Nat Rev Genet. 2020](https://pubmed.ncbi.nlm.nih.gov/31605096/)


### Example 1: *PAX6*



[Bhatia S, et al. (2013)](https://pubmed.ncbi.nlm.nih.gov/24290376/) discovered a mutation in a remote, ultraconserved PAX6 enhancer that causes aniridia. 
They discovered a de novo point mutation in an ultraconserved cis-element located 150 kb downstream from PAX6 in an affected individual with intact coding region and chromosomal locus. The element SIMO acts as a strong enhancer in developing ocular structures. The mutation disrupts an autoregulatory PAX6 binding site, causing loss of enhancer activity, resulting in defective maintenance of PAX6 expression.

They write:
`We identified one individual with a single de novo nucleotide variant (chr11: 31,685,945G>T [UCSC Genome Browser human reference sequence hg19]) in an ultraconserved sequence, SIMO (uc.325), located 150 kb downstream of PAX6`.

We need to identify the HG38 coordinates to curate this publication. To do so, we can enter the following
```text
chr11:31,685,945-31,685,945
```
in the [liftover](liftover.md) tool. We obtain `chr11:31821757-31821757`. We enter this in the HG38 UCSC browser and then zoom out 3x and 10x to see the surrounding sequence.  We can compare this with the sequence reported in the publication (see Supplemental Figure S5) AGCGTAT[**C/A**]ACTTCAG


This variant happens to be located in an intron of another gene, ELP4. Therefore, we can represent the variant as `NM_019040.5:c.1143+14176C>A`in HGVS (See [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/variation/120328/)). We can use VariantValidator 
to identifify the chromosomal location `NC_000011.10:g.31664397C>A`.
However, in HRMDBQ, we use the gene symbol of the gene with the presumed etiological role (PAX6). Therefore, we enter the following


- Gene: `PAX6` 
- Variant: `NC_000011.10:g.31664397C>A` (using the IG option)
- ClinVar - Variation ID: 120328
- Alias -3063C>A (from manuscript)
- Comment: homozygous mutation (-3063C>A), affecting a highly conserved nucleotide within the Hepatic Nuclear Factor 1 (HNF-1) binding site
- Variant category: `Enhancer` 
- Individual ID 1230P was diagnosed with bilateral iris hypoplasia at the age of two. Aniridia was confirmed at age 17. The individual has a de novo heterozygous variant (chr11: 31,685,945G>T [UCSC Genome Browser human reference sequence hg19]) in an ultraconserved sequence, SIMO (uc.325), located 150 kb downstream of PAX6. 
- The variant was shown to reduce enhancer activity, we tested two mutant versions of SIMO in mouse and zebrafish transgenic assays (Figure 2): **Reduced transcription**
- The efficiency of the Pax6 pulldown was strongly reduced with the SIMO-T mutant version of the probe (Figure 3 and also EMSA competition experiment where the G>T change strongly reduced the ability to compete for binding of purified PAX6 paired domain): **TFBS disruption**
- We also have cosegregation (parents unaffected, Figure 1), computational evidence (e.g., sequence conservation), and phenotypic evidence (the individual has aniridia and other manifestations)
- PMID: 24290376



