use std::{collections::HashMap, fs};

use crate::dto::{curation_stats::CurationStats, nc_variant_annotation::{GeneCuration, GeneCurationFile}};



fn get_curation(gcf: &GeneCurationFile) -> Result<GeneCuration, String> {
    let path_buf = gcf.file.clone();
    let contents = fs::read_to_string(&path_buf)
            .map_err(|e| format!("Failed to read file: {}", e))?;  
    let curation: GeneCuration= serde_json::from_str(&contents)
            .map_err(|e| format!("Failed to parse JSON: {}", e))?;
    Ok(curation)
}


pub fn get_stats(curation_files: &Vec<GeneCurationFile>) -> Result<CurationStats, String> {
    let mut gene_symbol_counts: HashMap<String, usize> = HashMap::new();
    let mut variant_category_counts: HashMap<String, usize> = HashMap::new();
    for curation_file in curation_files {
        let gc = get_curation(&curation_file)?;
        let symbol = gc.get_symbol();
        let n_curations = gc.n_curations();
        gene_symbol_counts.insert(symbol.to_string(), n_curations);
        for annot in &gc.annotations {
            let category = annot.category();
            *variant_category_counts.entry(category).or_insert(0) += 1;
        }
    }
    let n1: usize = gene_symbol_counts.values().sum();
    let n2: usize = variant_category_counts.values().sum();
    if n1 != n2 {
        // should never happen!
        return Err(format!("Inequal counts for genes {} and categories {}.", n1, n2));
    }
    Ok(CurationStats { gene_symbol_counts, variant_category_counts, total: n1 })
}