use std::collections::HashMap;

use serde::Serialize;

use crate::dto::nc_variant_annotation::VariantClass;



#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CurationStats {
    pub gene_symbol_counts: HashMap<String, usize>,
    pub variant_category_counts: HashMap<VariantClass, usize>,
    pub total: usize,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneCurationStats {
    pub gene_symbol: String,
    pub variant_category_counts: HashMap<VariantClass, usize>,
    pub total: usize,
}