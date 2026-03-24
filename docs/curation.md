# Curation


## Example

for now, here is an example of how to use the tool


## Prerequisites

- Load or create a curation file on the `setup` tab
- Enter your ORCID id on the `setup` tab

## Curation (Example)
Let's curate the following article:

Cazzola M, Bergamaschi G, Tonon L, Arbustini E, Grasso M, Vercesi E, Barosi G, Bianchi PE, Cairo G, Arosio P. Hereditary hyperferritinemia-cataract syndrome: relationship between phenotypes and specific mutations in the iron-responsive element of ferritin light-chain mRNA. Blood. 1997 Jul 15;90(2):814-21. PMID: 9226182.

- Go to the `Curation` tab

The curation items are shown successively.

### Gene

We enter the gene symbol and retrieve HGNC identifier and MANE transcript using the HGNC API

- For our example, enter the gene symbol as *FTL*.

### Variant

- One of the variants in the *FTL* gene described in this paper is `c.-168G>A`. This is a `HGVS` variant. Enter this.

### Variant category

- Enter 5' UTR

### Functional evaluation

- The authors write : The proband and three other affected individuals from family 1 were heterozygous for a point mutation in the IRE of the L-subunit DNA. a single G32 to A change in the highly conserved, three-nucleotide motif forming the IRE bulge. a profound reduction of the IRE affinity for iron regulatory proteins (IRP).
- Let's enter this as the category `internal ribosome entry site disruption``
-This was a gel retardation assay. Do we need this? 
- We check the "cosegragation" box, because the mutation was found in all affected family members and no unaffected members
- We enter PMID: 9226182 or  9226182 in the citation box.
- Finally, we click on add evaluation to assessment

## Review and Save
Click on save.
- This brings us to the table, where we see the entry. 
- We can serialize to a JSON file.