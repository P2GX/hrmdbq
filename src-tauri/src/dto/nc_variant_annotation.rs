use ga4ghphetools::dto::{hgvs_variant::HgvsVariant, intergenic_variant::IntergenicHgvsVariant, structural_variant::StructuralVariant};
use chrono::Local;
use serde::{Deserialize, Serialize};
use crate::dto::citation::Citation;

pub enum VariantClass {
    Utr5,
    Promoter,
    Enhancer,
    Utr3,
    MicroRNA,
    LncRna,
    Icr,
}


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

pub enum ReporterRegulation {
    Up,
    Down,
    Unchanged,
}

pub struct Qpcr {
    regulation: ReporterRegulation,
    citation: Citation,
}


pub struct NcVariantAnnotation {
    pub variant_class: VariantClass,
    pub pathomechanism: Pathomechanism,
    pub cosegregation: Option<bool>,
    pub regulation: ReporterRegulation,
    pub citation: Citation
}

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


pub struct NcVariantAssessment {
    variant: NcVariant,
    annotations: Vec<NcVariantAnnotation>,
    biocuration: Vec<CurationEvent>,

}



#[cfg(test)]
mod test {
    use rstest::{fixture, rstest};
    
    #[rstest]
    fn retrieve_citation() {



    }


}