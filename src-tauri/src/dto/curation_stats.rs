use std::collections::HashMap;

use serde::Serialize;



#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CurationStats {
    pub gene_symbol_counts: HashMap<String, usize>,
    pub variant_category_counts: HashMap<String, usize>,
    pub total: usize,
}