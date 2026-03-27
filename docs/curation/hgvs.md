# Human Genome Variation Society (HGVS) Nomenclature    

The HGVS Nomenclature is an internationally-recognized standard for the description of DNA, RNA, and protein sequence variants.
In brief, HGVS defines a way of representing variants as compared to a reference sequence. For instance, `c.435A>GA` represents
a substitution at position 435 of the sDNA (Adenine changed to Guanine). See the [HGVS website](https://hgvs-nomenclature.org/stable/) for details.

This page provides advice about how to correct and check possibly incorrect variant nomenclature found in the literature.

## Transcript

It is essential to indicate the sequence (usually a transcript) of reference. For mRNAs, the [MANE Select](https://www.ncbi.nlm.nih.gov/refseq/MANE/) sequence should be used if possible. 
We tend to obtain this sequence from the [HGNC](https://www.genenames.org/) page for a gene.

## Variant Validator

The [VariantValidator](https://variantvalidator.org/) API is used by HRMDBQ. While a difficult variant is being investigated, we highly recommend using the website (under Tools/Validator).



## Arrows

Variants such as `c.-113A → C` are now written as `c.-113A>C`.

## Odd characters

Many publications put (nearly) invisible whitespace between the numerical part and the nucleotide symbols. All white space should be removed.

