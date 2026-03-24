use crate::dto::nc_variant_annotation::NcVariantAssessment;






/// TODO develop better error message!
pub fn update_ncvar_list(mut list: Vec<NcVariantAssessment>, assess: NcVariantAssessment) 
    -> Result<Vec<NcVariantAssessment>, String> {

   if let Some(index) = list.iter().position(|existing| {
        existing.variant_coordinates == assess.variant_coordinates
    }) {
        // This position was previously curated. Add the new curation to the existing one
       let mut entry = list.remove(index);
       if entry.variant_category != assess.variant_category {
        return Err(format!("Disagreement with previous variant category: previous: {} and current {}",
            entry.variant_category, assess.variant_category));
       }
       let ann = assess.annotations.first()
            .ok_or_else(|| format!("Could not find NcVariantEvaluation in new entry {:?}", assess))?;
        entry.annotations.push(ann.clone());
        
        for bioc in assess.biocuration {
            entry.biocuration.push(bioc);
        };
        list.push(entry);
    } else {
        // first curation for this variant
        list.push(assess);
    }
    Ok(list)
}