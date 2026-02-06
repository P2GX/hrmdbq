


enum VariantClass {
    Utr5,
    Promoter,
    Enhancer,
    Utr3,
    MicroRNA,
    LncRna,
    Icr
}


enum Pathomechanism {
    ReducedTranscription,
}

enum Context {
    Mendelian
}

enum ReporterRegulation {
    Up,
    Down,
    Unchanged
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
}



#[cfg(test)]
mod test {
    use rstest::{fixture, rstest};
    
    #[rstest]
    fn retrieve_citation() {



    }


}