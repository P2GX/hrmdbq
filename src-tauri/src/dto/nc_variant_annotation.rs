use ga4ghphetools::dto::{hgvs_variant::HgvsVariant, intergenic_variant::IntergenicHgvsVariant, structural_variant::StructuralVariant};
use chrono::Local;
use serde::{Deserialize, Serialize};
use crate::dto::citation::Citation;


#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum VariantClass {
    Utr5,
    Promoter,
    Enhancer,
    Utr3,
    MicroRNA,
    LncRna,
    Icr,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum Pathomechanism {
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
pub enum ReporterRegulation {
    Up,
    Down,
    Unchanged,
}
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Qpcr {
    regulation: ReporterRegulation,
    citation: Citation,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NcVariantAnnotation {
    /// e.g. reduced transcription
    pub pathomechanism: Pathomechanism,
    /// Was the variant shown to cosegregate in the current paper?
    pub cosegregation: Option<bool>,
    pub regulation: ReporterRegulation,
    pub comment: Option<String>,
    pub citation: Citation
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum NcVariant {
    Hgvs(HgvsVariant),
    Structural(StructuralVariant),
    Intergenic(IntergenicHgvsVariant)
    
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
    pub variant: NcVariant,
    /// e.g., promotor, enhancer, ncRNA, 5UTR
    pub variant_class: VariantClass,
    /// assessment of the pathogenicity in one PMID
    pub annotations: Vec<NcVariantAnnotation>,
    /// ORCID id of curation and time of curation(s)
    pub biocuration: Vec<CurationEvent>,

}



#[cfg(test)]
mod test {
    use rstest::{fixture, rstest};
    
    #[rstest]
    fn retrieve_citation() {



    }


}