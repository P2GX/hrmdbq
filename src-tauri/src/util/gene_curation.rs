use std::{fs, path::{Path, PathBuf}};

use crate::{dto::nc_variant_annotation::{GeneCuration, GeneCurationFile}};




pub fn get_path(curation_files: &Vec<GeneCurationFile>, symbol: &str) -> Option<PathBuf> {
    curation_files
        .iter()
        .find(|gc| gc.gene_symbol == symbol)
        .map(|gc| gc.file.clone())
}

pub fn scan_curation_directory(directory: &Path) -> Vec<GeneCurationFile> {
    let mut gene_list = Vec::new();

    if let Ok(entries) = std::fs::read_dir(directory) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Ok(content) = std::fs::read_to_string(&path) {
                    // Tip: Use a "Light" struct if you don't want to parse 
                    // the whole file just to get the symbol!
                    if let Ok(curation) = serde_json::from_str::<GeneCuration>(&content) {
                        gene_list.push(GeneCurationFile {
                            gene_symbol: curation.gene_data.symbol,
                            file: path,
                        });
                    }
                }
            }
        }
    }
    gene_list.sort_by(|a, b| a.gene_symbol.cmp(&b.gene_symbol));
    gene_list
}



pub fn save_gene_curation(
    path: &PathBuf, 
    gene_curation: &GeneCuration
) -> Result<(), String> {
    let mut gc = gene_curation.clone();
    gc.annotations.sort();
    let json_contents = serde_json::to_string_pretty(&gc)
        .map_err(|e| format!("Failed to serialize GeneCuration: {}", e))?;
    
    fs::write(path, json_contents)
        .map_err(|e| format!("Failed to write file to {:?}: {}", path, e))?;

    println!("Successfully saved GeneCuration to {:?}", path);
    Ok(())
}