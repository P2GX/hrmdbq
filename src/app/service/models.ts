

export interface NcVariantAssessment {
  id: string;
  variantCoordinates: NcVariant;
  variantCategory: VariantClass;
  pathomechanisms: Pathomechanism[];
  variationId?: number;
  comment?: string;
  alias?: string;
  citation: CitationEntry[];
  biocuration: CurationEvent[];
}






export enum VariantClass {
  Promoter = 'promoter',
  Enhancer = 'enhancer',
  Utr5 = 'utr5',
  Utr3 = 'utr3',
  MicroRNA = 'microRNA',
  LncRNA = 'lncRNA',
  tRNA = 'tRNA',       // Exact match
  SnRNA = 'snRNA',     // Exact match
  SnoRNA = 'snoRNA',   // Exact match
  ICR = 'ICR', 
  MultiGene = 'multiGene'
}


export type EvidenceSource = 
  // --- Experimental / Functional ---
  | 'qpcr'
  | 'luciferase'
  | 'emsa'
  | 'westernBlot'
  | 'splicing'
  
  // --- Clinical / Patient Derived ---
  | 'clinicalRna'
  | 'clinicalProtein'
  | 'clinicalEnzymeActivity'

  // --- Computational (In Silico) ---
  | 'inSilicoSplicePredictor'
  | 'inSilicoMissensePredictor'
  | 'tfbsChangePrediction'
  | 'conservationScore'
  
  // --- Regulatory/Other ---
  | 'chromatinAccessibilityAssay'
  | 'otherExperimental'
  | 'otherComputational';

export type EvidenceType = 'supports' | 'contradicts' | 'na';

export interface EvidenceRecord {
  source: EvidenceSource;
  assessment: EvidenceType;
}



export const PATHOMECHANISMS = 
  // General/Functional
  ['lossOfFunction',
   'gainOfFunction',
   'dominantNegative',
  // Transcriptional Control (Promoters/Enhancers/ICR)
   'reducedTranscription',
   'increasedTranscription',
   'reducedExpression',
   'increasedExpression',
   'enhancerHijacking',
    'insulatorLoss', 
    'tfbsDisruption',
  // RNA Processing & Stability (Introns/3' UTR)
   'spliceDefect',
   'mrnaStability',           // Changes in RNA half-life
   'secondaryStructure',      // Folding changes (rRNA/snRNA/tRNA)
   'impairedRnaProcessing',
  // Translational Control (5' UTR)
  'uORFCreation',
   'uORFDisruption',
   'kozakCreation',
  'kozakDisruption',
  'reducedTranslation',
  'increasedTranslation',
  'polyadenlyation',
  // Regulatory Site Interaction (UTRs)
   'microRNAbindingSiteDisruption',
  'microRNAbindingSiteCreation',
  'iREdisruption',            // Iron Responsive Element
   'iRESdisruption', // internal ribosome entry site 
   'rBPbindingSiteDisruption', // RNA-Binding Protein sites (generic)
   'unknown'];

export type Pathomechanism = (typeof PATHOMECHANISMS)[number];

export const PATHOMECHANISM_LABELS: Record<Pathomechanism, string> = {
    // General / Functional
    lossOfFunction: 'Loss of Function (LoF)',
    gainOfFunction: 'Gain of Function (GoF)',
    dominantNegative: 'Dominant Negative',
    
    // Transcriptional / Architecture
    reducedTranscription: "Reduced transcription",
    increasedTranscription: "Increased transcription",
    reducedExpression: "Reduced expression",
    increasedExpression: "Increased expression",
    enhancerHijacking: "Enhancer hijacking",
    insulatorLoss: "Insulator/CTCF site loss",
    tfbsDisruption: "TFBS Disruption",
    
    // RNA Processing & Stability
    spliceDefect: "Splice defect",
    mrnaStability: "mRNA stability alteration",
    secondaryStructure: "Secondary structure alteration",
    impairedRnaProcessing: "Impaired ncRNA processing",
    
    // Translational Control (5' UTR)
    uORFCreation: "uORF creation",
    uORFDisruption: "uORF disruption",
    kozakCreation: "Novel Kozak sequence",
    kozakDisruption: "Kozak sequence disruption",
    reducedTranslation: "Reduced translation",
    increasedTranslation: "Increased translation",
    
    // Regulatory Site Interaction (UTRs)
    microRNAbindingSiteDisruption: "microRNA binding site disruption",
    microRNAbindingSiteCreation: "microRNA binding site creation",
    iREdisruption: "Iron Responsive Element (IRE) disruption",
    iRESdisruption: "Internal Ribosome Entry Site (IRES) disruption",
    rBPbindingSiteDisruption: "RNA-binding protein (RBP) site disruption",
    polyadenlyation: "Polyadenylation site disruption",
    
    unknown: 'Unknown pathomechanism',
};




export enum EvidenceLevel {
    yes = 'yes',
    notAvailable = 'notAvailable',
    no = 'no',
}

export interface CitationEntry {
    citation: Citation;
    note?: string;
    cosegregationEvidence: EvidenceLevel,
    phenotypicEvidence: EvidenceLevel,
    experimentalEvidence: EvidenceLevel, 
    computationalEvidence: EvidenceLevel 
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




export type NcVariant = 
  | { hgvs: HgvsVariant }
  | { structural: StructuralVariant }
  | { intergenic: IntergenicHgvsVariant };

export interface GeneTranscriptData {
    hgncId: string;
    geneSymbol: string;
    transcript: string;
}

  export interface StructuralType {
    label: string;
    id: string;
} 



 /* This widget can validate 
  * 1. small HGVS variants (e.g., small number of nucleotides, "c."("n.")),
  * 2. structural variants (symbolic, e.g., DEL ex3)
  * 3. intergenic variants (not located in transcripts, represented using chromosomal accession numbers). 
  * */
export enum VariantKind {
  HGVS = 'HGVS',
  SV = 'SV',
  INTERGENIC = 'INTERGENIC'
}
 
 /**
 * Simple structure to combine some data about a variant we have validated or still need to 
 * validate. The information is mainly use to display the status of a variant in the GUI. Note
 * that the alleles inthe phenopacket use the vairantKey to extract the full information from 
 * one of the two variant maps (for HGVS and SV). We do not persist this DTO, it is designed merely
 * to simplify handling of data for display in the GUI.
 */

 /**
 * Types of variants we may want to validate. HGVS is c./n. small variants, PreciseSv is a type
 * of structural variant with precise positions (not implemented yet), and the others are symbolic
 * structural variants such as DEL Ex 5-8
 */
export type VariantType =
  | "HGVS"
  | "DEL"
  | "INV"
  | "TRANSL"
  | "DUP"
  | "SV"
  | "PRECISESV"
  | "INTERGENICHGVS"
  | "UNKNOWN";

export interface VariantDto {
  /** either an HGVS String (e.g., c.123T>G) or a SV String: DEL: deletion of exon 5 */
  variantString: string;
  /** Key to be used in the HashMap */
  variantKey?: string | null;
  /** transcript of reference for the gene of interest (usually MANE) with version number, e.g. NM_000123.2 */
  transcript: string;
  /** HUGO Gene Nomenclature Committee identifier, e.g., HGNC:123 */
  hgncId: string;
  /** Symbol recommended by HGNC, e.g. FBN1 */
  geneSymbol: string;
  /** type of variant category */
  variantType: VariantType;
  /** Was this variant validated in the backend? */
  isValidated: boolean;
  /** How many alleles were reported with this variant in the cohort? */
  count: number;
}


export function displayHgvs(hgvs: HgvsVariant, validated: boolean): VariantDto {
  const vdd: VariantDto = {
    variantString: hgvs.hgvs,
    variantKey: hgvs.variantKey,
    geneSymbol: hgvs.symbol,
    transcript: hgvs.transcript,
    hgncId: hgvs.hgncId,
    isValidated: validated,
    count: 0,
    variantType: "HGVS"
  };
  return vdd;
}


export function displayIntergenic(ig: IntergenicHgvsVariant, validated: boolean): VariantDto {
  const igvar_dto: VariantDto = {
    variantString: ig.gHgvs,
    variantKey: ig.variantKey,
    transcript: '',
    hgncId: ig.hgncId || '',
    geneSymbol: ig.symbol || '',
    variantType: "INTERGENICHGVS",
    isValidated: validated,
    count: 0
  };
  return igvar_dto;
}

export function displaySv(sv: StructuralVariant, validated: boolean): VariantDto {
  const vdd: VariantDto = {
    variantString: sv.label,
    variantKey: sv.variantKey,
    geneSymbol: sv.geneSymbol,
    transcript: "TODO",
    hgncId: sv.hgncId,
    isValidated: validated,
    variantType: "SV",
    count: 0
  };
  return vdd;
}


// Not camel case because we are using toml package
export interface HrmdbqSettings {
    orcid_id: string | null;
    /** Path to the file in which we keep our curations */
    hrmdata_dir_path: string | null;
}



export interface HgncBundle {
    hgncId: string,
    maneSelect: string,
}



export interface Citation {
  authorList: string;
  title: string;
  journal: string;
  year: number;
  volume: string;
  pages: string;
  pmid: string;
}



export function defaultCitation(): Citation {
    return {
         authorList: '',
            title: '',
            journal: '',
            year: 0,
            volume: '',
            pages: '',
            pmid: ''
    };
}


/**
 * Information about the current gene being curated
 */
export interface GeneTranscriptData {
  symbol: string;
  hgncId: string; // Matches camelCase rename
  maneId: string; // Matches camelCase rename
}

export interface WebResource {
  name: string;
  url: string;
}

/**
 * Individual evidence or curator notes
 */
export interface GeneNote {
  id: string;
  title: string;
  content: string;
  dateModified: string; // Matches camelCase rename
}

/**
 * The master workspace object for a single gene curation session
 */
export interface GeneCuration {
  geneData: GeneTranscriptData;
  webResources: WebResource[];
  notes: GeneNote[];
  annotations: NcVariantAssessment[];
}

/**
 * Used for the landing page list/scrollbar
 */
export interface GeneCurationFile {
  geneSymbol: string;
  file: string; // PathBuf serializes to a string in JSON
}