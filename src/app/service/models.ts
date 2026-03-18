

/* TODO. Make these interfaces exact correspondences to the Rust structs */

export interface NcVariantAssessment {
  variantCoordinates: NcVariant;
  variantCategory: VariantClass;
  annotations: NcVariantEvaluation[];
  biocuration: CurationEvent[];
}

export type VariantClass = 'utr5' | 'promoter' | 'enhancer' | 'utr3' | 'microRna' | 'lncRna' | 'icr' | 'multiGene';

export interface NcVariantEvaluation {
  pathomechanism: string;
  cosegregation?: boolean;
  reporter: any[]; // Extend based on your Reporter struct
  comment?: string;
  citation: any; 
}

export interface CurationEvent {
  orcid: string;
  date: string;
}



export interface HgvsVariant {
  assembly: string;
  chr: string;
  position: number; // u32 → number in TS
  refAllele: string;
  altAllele: string;
  symbol: string;
  hgncId: string;
  hgvs: string;
  transcript: string;
  gHgvs: string;
  pHgvs?: string; // corresponds to Option<String> in Rust
  variantKey: string;
}

export interface IntergenicHgvsVariant {
    assembly: string;
    chr: string;
    position: number; // u32 in rust,
    refAllele: string;
    altAllele: string;
    symbol?: string;
    hgncId?: string;
    gHgvs: string;
    geneHgvs?: string;
    variantKey: string 
}


/** 
 * The kind of structural variant being sent for validation.
 */
export enum SvType {
  DEL = 'DEL',
  INV = 'INV', 
  TRANSL = 'TRANSL',
  DUP = 'DUP',
  SV = 'SV'
}

export interface StructuralVariant {
  label: string;
  geneSymbol: string;
  transcript: string;
  hgncId: string;
  svType: SvType;
  chromosome: string;
  variantKey: string
}




// Handling the Rust Enum for Variant Coordinates
export interface NcVariant {
  hgvs?: HgvsVariant;
  structural?: StructuralVariant;
  intergenic?: IntergenicHgvsVariant;
}