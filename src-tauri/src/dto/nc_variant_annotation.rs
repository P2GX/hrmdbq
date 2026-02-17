use crate::dto::citation::Citation;

enum VariantClass {
    Utr5,
    Promoter,
    Enhancer,
    Utr3,
    MicroRNA,
    LncRna,
    Icr,
}


enum Pathomechanism {
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

enum Context {
    Mendelian,
}

enum ReporterRegulation {
    Up,
    Down,
    Unchanged,
}

enum Genotype {
    Heterozygous,
    Homozygous,
    Hemizygous,
}

pub struct Qpcr {
    regulation: ReporterRegulation,
    citation: Citation,
}


pub struct NcVariantAnnotation {
    pub variant_class: VariantClass,
    pub pathomechanism: Pathomechanism,
    pub context: Context,
    pub cosegregation: Option<bool>,
    pub regulation: ReporterRegulation,
    pub genotype: Genotype,
}



#[cfg(test)]
mod test {
    use rstest::{fixture, rstest};
    
    #[rstest]
    fn retrieve_citation() {



    }


}