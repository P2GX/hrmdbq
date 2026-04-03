use std::{cmp::Ordering, path::PathBuf};

use crate::{dto::citation::Citation, util::hgnc_rest::HgncBundle};
use ga4ghphetools::dto::{
    hgvs_variant::HgvsVariant, intergenic_variant::IntergenicHgvsVariant,
    structural_variant::StructuralVariant,
};
use serde::{Deserialize, Serialize};


#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum VariantClass {
    Promoter,
    Enhancer,
    Utr5,
    Utr3,
    MicroRNA,
    LncRna,
    TRna,          // Added for tRNA (Mitochondrial/Nuclear)
    SnRna,         // Added for Spliceosomal RNAs (e.g., RNU4ATAC)
    SnoRna,        // Added for Small Nucleolar RNAs
    Icr,           // Imprinting Control Region
    MultiGene,
}

impl VariantClass {
    fn rank(&self) -> u8 {
        match self {
            VariantClass::Promoter  => 1,
            VariantClass::Enhancer  => 2,
            VariantClass::Utr5      => 3,
            VariantClass::Utr3      => 4,
            VariantClass::MicroRNA  => 5,
            VariantClass::LncRna    => 6,
            VariantClass::TRna      => 7,
            VariantClass::SnRna     => 8,
            VariantClass::SnoRna    => 9,
            VariantClass::Icr       => 10,
            VariantClass::MultiGene => 11,
        }
    }
}


impl Ord for VariantClass {
    fn cmp(&self, other: &Self) -> Ordering {
        self.rank().cmp(&other.rank())
    }
}

impl PartialOrd for VariantClass {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl std::fmt::Display for VariantClass {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let label = match self {
            Self::Promoter => "Promoter",
            Self::Enhancer => "Enhancer",
            Self::Utr5 => "5' UTR",
            Self::Utr3 => "3' UTR",
            Self::MicroRNA => "microRNA",
            Self::LncRna => "lncRNA",
            Self::TRna => "tRNA",
            Self::SnRna => "snRNA",
            Self::SnoRna => "snoRNA",
            Self::Icr => "ICR",
            Self::MultiGene => "Multi-Gene",
        };
        write!(f, "{}", label)
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Pathomechanism {
    // General / Functional
    LossOfFunction,
    GainOfFunction,
    DominantNegative,
    
    // Transcriptional / Architecture
    ReducedTranscription,
    IncreasedTranscription,
    ReducedExpression,
    IncreasedExpression,
    EnhancerHijacking,
    InsulatorLoss,
    
    // RNA Processing & Stability
    SpliceDefect,
    MrnaStability,
    SecondaryStructure,
    ImpairedRnaProcessing,
    
    // Translational Control (5' UTR)
    UORFCreation,
    UORFDisruption,
    KozakDisruption,
    ReducedTranslation,
    IncreasedTranslation,
    
    // Regulatory Site Interaction (UTRs)
    MicroRNAbindingSiteDisruption,
    MicroRNAbindingSiteCreation,
    IREdisruption,      // Iron Responsive Element
    IRESdisruption,     // Internal Ribosome Entry Site
    RBPbindingSiteDisruption,
    
    Unknown,
}

impl std::fmt::Display for Pathomechanism {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let label = match self {
            Self::LossOfFunction => "Loss of Function (LoF)",
            Self::GainOfFunction => "Gain of Function (GoF)",
            Self::DominantNegative => "Dominant Negative",
            Self::ReducedTranscription => "Reduced transcription",
            Self::IncreasedTranscription => "Increased transcription",
            Self::ReducedExpression => "Reduced expression",
            Self::IncreasedExpression => "Increased expression",
            Self::EnhancerHijacking => "Enhancer hijacking",
            Self::InsulatorLoss => "Insulator/CTCF site loss",
            Self::SpliceDefect => "Splice defect",
            Self::MrnaStability => "mRNA stability alteration",
            Self::SecondaryStructure => "Secondary structure alteration",
            Self::ImpairedRnaProcessing => "Impaired ncRNA processing",
            Self::UORFCreation => "uORF creation",
            Self::UORFDisruption => "uORF disruption",
            Self::KozakDisruption => "Kozak sequence disruption",
            Self::ReducedTranslation => "Reduced translation",
            Self::IncreasedTranslation => "Increased translation",
            Self::MicroRNAbindingSiteDisruption => "microRNA binding site disruption",
            Self::MicroRNAbindingSiteCreation => "microRNA binding site creation",
            Self::IREdisruption => "IRE disruption",
            Self::IRESdisruption => "IRES disruption",
            Self::RBPbindingSiteDisruption => "RBP site disruption",
            Self::Unknown => "Unknown pathomechanism",
        };
        write!(f, "{}", label)
    }
}


#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum EvidenceSource {
    Qpcr,
    Luciferase,   // CAT or Luciferase
    Emsa,
    WesternBlot,
    Splicing,
    ClinicalRna,
    ClinicalProtein,
    ClinicalEnzymeActivity,
    // --- Computational (In Silico) ---
    InSilicoSplicePredictor, // e.g., SpliceAI, MaxEntScan
    InSilicoMissensePredictor, // e.g., REVEL, CADD, PolyPhen
    TfbsChangePrediction,     // Transcription Factor Binding Site
    ConservationScore,        // e.g., PhyloP, GERP++, PhastCons
    // --- Regulatory/Other ---
    ChromatinAccessibilityAssay,   // e.g., ATAC-seq data
    OtherExperimental,
    OtherComputational
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum EvidenceType {
    Supports,
    Contradicts,
    Na,
}

impl Default for EvidenceType {
    fn default() -> Self {
        Self::Na
    }
}

impl std::fmt::Display for EvidenceSource {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let label = match self {
            Self::Qpcr => "qPCR",
            Self::Luciferase => "Luciferase",
            Self::Emsa => "EMSA",
            Self::WesternBlot => "Western Blot",
            Self::Splicing => "Splicing Assay",
            Self::ClinicalRna => "Patient-derived RNA Study",
            Self::ClinicalProtein => "Patient-derived Protein Study",
            Self::ClinicalEnzymeActivity => "Patient-derived Enzyme Activity",
            Self::InSilicoSplicePredictor => "In silico splicing predictor",
            Self::InSilicoMissensePredictor => "In silico missense predictor",
            Self::TfbsChangePrediction => "TFBS Change prediction",
            Self::ConservationScore => "Conservation score",
            Self::ChromatinAccessibilityAssay => "Chromatic accessibility",
            Self::OtherExperimental => "Other experimental",
            Self::OtherComputational => "Other computational",
        };
        write!(f, "{}", label)
    }
}

impl std::fmt::Display for EvidenceType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let label = match self {
            Self::Supports => "Supports",
            Self::Contradicts => "Contradicts",
            Self::Na => "Not available/Not applicable (N/A)",
        };
        write!(f, "{}", label)
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EvidenceRecord {
    source: EvidenceSource,
    assessment: EvidenceType,
}


#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum NcVariant {
    Hgvs(HgvsVariant),
    Structural(StructuralVariant),
    Intergenic(IntergenicHgvsVariant),
}


impl PartialEq for NcVariant {
    fn eq(&self, other: &Self) -> bool {
        match (&self, &other) {
            // 1. If both are the same category, compare the inner data
            (NcVariant::Hgvs(a), NcVariant::Hgvs(b)) => a == b,
            (NcVariant::Structural(a), NcVariant::Structural(b)) => a == b,
            (NcVariant::Intergenic(a), NcVariant::Intergenic(b)) => a == b,
            // 2. If they are different variants, define the order of the variants themselves
            (NcVariant::Hgvs(_), _) => false,  
            (_, NcVariant::Hgvs(_)) => false,

            (NcVariant::Structural(_), NcVariant::Intergenic(_)) => false,
            (NcVariant::Intergenic(_), NcVariant::Structural(_)) => false,
        }
    }
}



#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CurationEvent {
    /// ORCID identifier of the curator
    pub orcid: String,
    /// Date of curation in YYYY-MM-DD format
    pub date: String,
}



#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum EvidenceLevel {
    Yes,
    NotAvailable,
    No,
}
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CitationEntry {
    pub citation: Citation,
    pub note: Option<String>, 
    /// Was the variant shown to cosegregate in the current paper?
    /// Yes = evidence present
    /// No = evidence explicitly absent
    /// NotAvailable = not assessed / not reported
    pub cosegregation_evidence: EvidenceLevel,
    /// Were clinical manifestations consistent with the disease in the current paper?
    /// see above
    pub phenotypic_evidence: EvidenceLevel,
    /// Did the authors perform some experimental/molecular validation?
    pub experimental_evidence: EvidenceLevel, 
    /// Did the authors provide computational evidence in support of pathogenicity
    pub computational_evidence: EvidenceLevel 
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NcVariantAssessment {
    pub id: String,
    /// Data we receive from VariantValidator
    pub variant_coordinates: NcVariant,
    /// e.g., promotor, enhancer, ncRNA, 5UTR
    pub variant_category: VariantClass,
    /// assessment of the pathogemechanism (Multiple are allowed)
    pub pathomechanisms: Vec<Pathomechanism>,
    /// ClinVar variation identifier
    pub variation_id: Option<u64>,
    /// Anything else?
    pub comment: Option<String>,
    /// List of PMIDs about the current variant
    pub citation: Vec<CitationEntry>,
    /// ORCID id of curation and time of curation(s)
    pub biocuration: Vec<CurationEvent>,
}



impl PartialEq for NcVariantAssessment {
    fn eq(&self, other: &Self) -> bool {
        self.variant_coordinates == other.variant_coordinates
    }
}

impl Eq for NcVariantAssessment {}

impl PartialOrd for NcVariantAssessment {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for NcVariantAssessment {
    fn cmp(&self, other: &Self) -> Ordering {
        let class_cmp = self.variant_category.cmp(&other.variant_category);
        if class_cmp != Ordering::Equal {
            return class_cmp;
        }

        match (&self.variant_coordinates, &other.variant_coordinates) {
            // 1. If both are the same category, compare the inner data
            (NcVariant::Hgvs(a), NcVariant::Hgvs(b)) => a.cmp(&b),
            (NcVariant::Structural(a), NcVariant::Structural(b)) => a.cmp(&b),
            (NcVariant::Intergenic(a), NcVariant::Intergenic(b)) => a.cmp(&b),
            // 2. If they are different variants, define the order of the variants themselves
            (NcVariant::Hgvs(_), _) => Ordering::Less,    // Hgvs is "smallest" (first)
            (_, NcVariant::Hgvs(_)) => Ordering::Greater,

            (NcVariant::Structural(_), NcVariant::Intergenic(_)) => Ordering::Less,
            (NcVariant::Intergenic(_), NcVariant::Structural(_)) => Ordering::Greater,
        }
    }
}

/// Information about the current gene being curated
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "camelCase")]
pub struct  GeneTranscriptData {
    pub symbol: String,
    pub hgnc_id: String,
    pub mane_id: String
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct WebResource {
    pub name: String,
    pub url: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GeneNote {
    pub id: String, // Useful for tracking/deleting in Angular
    pub title: String,
    pub content: String,
    pub date_modified: String,
}


#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneCuration {
    pub gene_data: GeneTranscriptData,
    pub web_resources: Vec<WebResource>,
    pub notes: Vec<GeneNote>,
    pub annotations: Vec<NcVariantAssessment>,
    pub genome_assembly: String,
}

/// Standard assembly - presumably for some time to come.
const ASSEMBLY: &str = "hg38";

impl GeneCuration {
    pub fn new(gene_data: GeneTranscriptData) -> Self {
        Self { gene_data, web_resources: vec![], notes: vec![], annotations: vec![], genome_assembly: ASSEMBLY.to_string() }
    }

    pub fn get_symbol(&self) -> &str {
        &self.gene_data.symbol
    }

    pub fn from_hgnc_bundle(symbol: String, hgnc: HgncBundle) -> Self {
        let gene_data = GeneTranscriptData { 
            symbol: symbol, 
            hgnc_id: hgnc.hgnc_id, 
            mane_id: hgnc.mane_select
        };
        GeneCuration::new(gene_data)
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneCurationFile {
    pub gene_symbol: String,
    pub file: PathBuf
}





#[cfg(test)]
mod test {
    use rstest::{rstest};

    #[rstest]
    fn retrieve_citation() {}
}
