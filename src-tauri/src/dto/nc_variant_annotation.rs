use std::{cmp::Ordering, fmt};

use crate::dto::citation::Citation;
use ga4ghphetools::dto::{
    hgvs_variant::HgvsVariant, intergenic_variant::IntergenicHgvsVariant,
    structural_variant::StructuralVariant,
};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum VariantClass {
    Utr5,
    Promoter,
    Enhancer,
    Utr3,
    MicroRNA,
    LncRna,
    Icr,
    MultiGene,
}

impl VariantClass {
    // Helper to define your custom priority/rank
    fn rank(&self) -> u8 {
        match self {
            VariantClass::Promoter  => 1,
            VariantClass::Enhancer  => 2,
            VariantClass::Utr5      => 3,
            VariantClass::Utr3      => 4,
            VariantClass::MicroRNA  => 5,
            VariantClass::LncRna    => 6,
            VariantClass::Icr       => 7,
            VariantClass::MultiGene => 8,
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

impl fmt::Display for VariantClass {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let label = match self {
            Self::Utr5 => "5' UTR",
            Self::Promoter => "Promoter",
            Self::Enhancer => "Enhancer",
            Self::Utr3 => "3' UTR",
            Self::MicroRNA => "microRNA",
            Self::LncRna => "lncRNA",
            Self::Icr => "ICR",
            Self::MultiGene => "Multi-Gene",
        };
        write!(f, "{}", label)
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum Pathomechanism {
    LossOfFunction,
    GainOfFunction,
    DominantNegative,
    ReducedTranscription,
    IncreasedTranscription,
    IREdisruption,
    SpliceDefect,
    UORFCreation,
    UORFDisruption,
    ReducedTranslation,
    IncreasedTranslation,
    ReducedExpression,
    IncreasedExpression,
    MicroRNAbindingSiteDisruption,
    MicroRNAbindingSiteCreation,
    KozakDisruption,
    SecondaryStructure,
    Unknown,
}


#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum ReporterAssay {
    Qpcr,
    Luciferase,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum ReporterRegulation {
    Up,
    Down,
    Unchanged,
}
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Reporter {
    assay: ReporterAssay,
    regulation: ReporterRegulation,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NcVariantEvaluation {
    /// e.g. reduced transcription
    pub pathomechanism: Pathomechanism,
    /// Was the variant shown to cosegregate in the current paper?
    pub cosegregation: Option<bool>,
    pub reporter: Vec<Reporter>,
    pub comment: Option<String>,
    pub citation: Citation,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum NcVariant {
    Hgvs(HgvsVariant),
    Structural(StructuralVariant),
    Intergenic(IntergenicHgvsVariant),
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
pub struct NcVariantAssessment {
    /// Data we receive from VariantValidator
    pub variant_coordinates: NcVariant,
    /// e.g., promotor, enhancer, ncRNA, 5UTR
    pub variant_category: VariantClass,
    /// assessment of the pathogenicity in one PMID
    pub annotations: Vec<NcVariantEvaluation>,
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




#[cfg(test)]
mod test {
    use rstest::{rstest};

    #[rstest]
    fn retrieve_citation() {}
}
