use crate::dto::nc_variant_annotation::NcVariantAssessment;
use std::fs;
use std::path::PathBuf;





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




pub fn save_curation_list(
    path: &PathBuf, 
    variants: &Vec<NcVariantAssessment>
) -> Result<(), String> {
    // 1. Serialize the Vec to a pretty-printed JSON string
    let json_contents = serde_json::to_string_pretty(variants)
        .map_err(|e| format!("Failed to serialize variants: {}", e))?;

    // 2. Ensure the parent directory exists (e.g., if it's in a new subfolder)
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory {:?}: {}", parent, e))?;
    }

    // 3. Write the string to the file (Atomic overwrite)
    fs::write(path, json_contents)
        .map_err(|e| format!("Failed to write file to {:?}: {}", path, e))?;

    println!("Successfully saved {} items to {:?}", variants.len(), path);
    Ok(())
}