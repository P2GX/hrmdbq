use crate::dto::nc_variant_annotation::{GeneCuration, NcVariantAssessment, Pathomechanism, VariantClass};
use std::fs;
use std::path::PathBuf;


impl NcVariantAssessment {
    /// returns Ok(()) if the pathomechanism is biologically plausible for the variant category
    pub fn validate_mechanism(&self) -> Result<(), String> {
        for anno in &self.pathomechanisms {
            match (&self.variant_category, &anno) {
                // 5' UTR specific
                (VariantClass::Utr5, Pathomechanism::KozakDisruption | Pathomechanism::UORFCreation | Pathomechanism::UORFDisruption) => continue,
                
                // Promoter / Enhancer / ICR specific
                (VariantClass::Promoter | VariantClass::Enhancer | VariantClass::Icr, 
                 Pathomechanism::ReducedTranscription | Pathomechanism::IncreasedTranscription | Pathomechanism::InsulatorLoss | Pathomechanism::EnhancerHijacking) => continue,
                
                // 3' UTR / RNA Stability specific
                (VariantClass::Utr3, Pathomechanism::MicroRNAbindingSiteCreation | Pathomechanism::MicroRNAbindingSiteDisruption | Pathomechanism::MrnaStability) => continue,
                
                // Non-coding RNA specific
                (VariantClass::SnRna | VariantClass::TRna | VariantClass::SnoRna | VariantClass::MicroRNA, 
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


/// TODO develop better error message!
pub fn update_ncvar_list(
    mut list: Vec<NcVariantAssessment>, 
    assess: NcVariantAssessment) 
    -> Result<Vec<NcVariantAssessment>, String> {
        assess.validate_mechanism()?; // Throw error is mechanism+variant class is improbable.
       /* let existing_index = list.iter().position(|existing| 
            {existing.variant_coordinates == assess.variant_coordinates});

        if let Some(index) = existing_index {
            let mut entry = list.remove(index);
            if entry.variant_category != assess.variant_category {
                return Err(format!("Disagreement with previous variant category: previous: {} and current {}",
                    entry.variant_category, assess.variant_category));
            }
        for new_ann in assess.citation {
            if !entry.citation == new_ann.citation) {
                entry.annotations.push(new_ann);
            }
        }
        
        for bioc in assess.biocuration {
            entry.biocuration.push(bioc);
        };
        list.push(entry);
       
       
    } else {
        // first curation for this variant
        list.push(assess);
    }
    Ok(list)
     */ 
     return Err("NEED TO REFACTOR".to_ascii_lowercase());
}


