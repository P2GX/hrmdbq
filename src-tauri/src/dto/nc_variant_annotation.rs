use std::fmt;

use crate::dto::citation::Citation;
use ga4ghphetools::dto::{
    hgvs_variant::HgvsVariant, intergenic_variant::IntergenicHgvsVariant,
    structural_variant::StructuralVariant,
};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
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

impl NcVariantAssessment {
    pub fn fake_remove_later() -> Self {
        let fake_sv = StructuralVariant::new(
            "fake".to_string(),
            "fake".to_string(),
            "NM_fake.1".to_string(),
            "HGNC:123456789".to_string(),
            ga4ghphetools::dto::structural_variant::SvType::Del,
            "fake".to_string(),
        )
        .unwrap();

        Self {
            variant_coordinates: NcVariant::Structural(fake_sv),
            variant_category: VariantClass::Enhancer,
            annotations: vec![],
            biocuration: vec![],
        }
    }
}

#[cfg(test)]
mod test {
    use rstest::{fixture, rstest};

    #[rstest]
    fn retrieve_citation() {}
}
