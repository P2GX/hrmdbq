use crate::dto::nc_variant_annotation::{NcVariantAssessment, Pathomechanism, VariantClass};



impl NcVariantAssessment {
    /// returns Ok(()) if the pathomechanism is biologically plausible for the variant category
    pub fn validate_mechanism(&self) -> Result<(), String> {
        for anno in &self.pathomechanisms {
            match (&self.variant_category, &anno) {
                // 5' UTR specific
                (VariantClass::Utr5, Pathomechanism::KozakDisruption | Pathomechanism::UORFCreation | Pathomechanism::UORFDisruption |
                Pathomechanism::NovelUpstreamStart) => continue,
                
                // Promoter / Enhancer / ICR specific
                (VariantClass::Promoter | VariantClass::Enhancer | VariantClass::ICR, 
                 Pathomechanism::ReducedTranscription | Pathomechanism::IncreasedTranscription | Pathomechanism::InsulatorLoss | Pathomechanism::EnhancerHijacking) => continue,
                
                // 3' UTR / RNA Stability specific
                (VariantClass::Utr3, Pathomechanism::MicroRNAbindingSiteCreation | Pathomechanism::MicroRNAbindingSiteDisruption | Pathomechanism::Polyadenlyation | Pathomechanism::MrnaStability) => continue,
                
                // Non-coding RNA specific
                (VariantClass::SnRNA | VariantClass::tRNA | VariantClass::SnoRNA | VariantClass::MicroRNA, 
                 Pathomechanism::ImpairedRnaProcessing | Pathomechanism::SecondaryStructure) => continue,

                // Universal / Protein-level (can happen almost anywhere via splicing or general expression)
                (_, Pathomechanism::LossOfFunction | Pathomechanism::GainOfFunction | Pathomechanism::DominantNegative | Pathomechanism::ReducedExpression | Pathomechanism::IncreasedExpression | Pathomechanism::SpliceDefect | Pathomechanism::Unknown) => continue,

                // If it hits here, the combination is suspicious
                (cat, mech) => return Err(format!("Incompatible combination: Mechanism '{}' is unlikely for Variant Class '{}'", mech, cat)),
            }
        }
        Ok(())
    }
}




