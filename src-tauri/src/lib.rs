use std::{fs, path::PathBuf, sync::{Arc, Mutex}};

use ga4ghphetools::dto::{
    hgvs_variant::HgvsVariant, intergenic_variant::IntergenicHgvsVariant,
    structural_variant::StructuralVariant, variant_dto::VariantDto,
};

use crate::{
    dto::{citation::Citation, nc_variant_annotation::{NcVariantAssessment}},
    util::{hgnc_rest::HgncBundle, settings::HrmdbqSettings},
};



pub mod dto;
pub mod util;
pub mod ncvar;

struct AppState {
    curated_variant_list: Mutex<Vec<NcVariantAssessment>>,
    settings: Mutex<HrmdbqSettings>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let initial_settings = HrmdbqSettings::load_settings();

    let mut initial_variants: Vec<NcVariantAssessment> = Vec::new();
    if let Some(ref path_buf) = initial_settings.curation_json_path {
        if path_buf.exists() {
            match fs::read_to_string(path_buf) {
                Ok(contents) => {
                    // Try to deserialize. If it fails, we just start with an empty list.
                    if let Ok(evals) = serde_json::from_str::<Vec<NcVariantAssessment>>(&contents) {
                        initial_variants = evals;
                        println!("Successfully loaded {} items from saved path.", initial_variants.len());
                    }
                }
                Err(e) => eprintln!("Failed to read saved curation file: {}", e),
            }
        }
    } 


    let app_state = Arc::new(AppState {
        curated_variant_list: Mutex::new(initial_variants),
        settings: Mutex::new(initial_settings),
    });
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(app_state)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            add_nc_variant_assesment,
            fetch_gene_data_from_hgnc,
            get_variant_assessments,
            get_annot_count,
            get_biocuration_orcid,
            get_settings,
            retrieve_pmid_citation,
            select_curation_file,
            serialize_variant_assessments,
            set_biocuration_orcid,
            update_orcid,
            validate_hgvs_variant,
            validate_intergenic_variant,
            validate_structural_variant
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


#[tauri::command]
fn get_annot_count(state: tauri::State<'_, Arc<AppState>>) -> usize {
    let state_handle = state.inner().clone();
    let singleton = state_handle.curated_variant_list.lock().unwrap();
    singleton.len()
}

#[tauri::command]
fn get_variant_assessments(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<Vec<NcVariantAssessment>, String> {
    let assessments = (|| -> anyhow::Result<Vec<NcVariantAssessment>> {
        let state_handle = state.inner().clone();
        let singleton = state_handle
            .curated_variant_list
            .lock()
            .map_err(|_| anyhow::anyhow!("Mutex poisoned"))?;

        Ok(singleton.clone())
    })()
    .map_err(|e| e.to_string())?;
    Ok(assessments)
}

#[tauri::command]
async fn fetch_gene_data_from_hgnc(symbol: &str) -> Result<HgncBundle, String> {
    util::hgnc_rest::fetch_gene_data(symbol)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn validate_hgvs_variant(
    symbol: &str,
    hgnc: &str,
    transcript: &str,
    allele: &str,
) -> Result<HgvsVariant, String> {
    ga4ghphetools::variant::validate_hgvs_variant(symbol, hgnc, transcript, allele)
}

#[tauri::command]
fn validate_structural_variant(variant_dto: VariantDto) -> Result<StructuralVariant, String> {
    ga4ghphetools::variant::validate_structural_variant(variant_dto)
}

#[tauri::command]
fn validate_intergenic_variant(
    symbol: String,
    hgnc: String,
    allele: String,
) -> Result<IntergenicHgvsVariant, String> {
    let vsto = VariantDto::hgvs_g(&allele, &hgnc, &symbol);
    ga4ghphetools::variant::validate_intergenic_variant(vsto)
}

#[tauri::command]
fn get_settings(state: tauri::State<Arc<AppState>>) -> Result<HrmdbqSettings, String> {
    let settings = state
        .settings
        .lock()
        .map_err(|_| "Failed to lock settings")?;
    Ok(settings.clone())
}

#[tauri::command]
fn update_orcid(state: tauri::State<Arc<AppState>>, orcid: String) -> Result<(), String> {
    let mut settings = state
        .settings
        .lock()
        .map_err(|_| "Failed to lock settings")?;
    settings.save_biocurator_orcid(orcid)
}

#[tauri::command]
fn set_go_dir(state: tauri::State<Arc<AppState>>, go_dir_path: String) -> Result<(), String> {
    let mut settings = state
        .settings
        .lock()
        .map_err(|_| "Failed to lock settings")?;
    settings.set_go_dir_path(&go_dir_path)?;
    Ok(())
}


/// Open the native Save/As window
#[tauri::command]
async fn select_curation_file(
    app: tauri::AppHandle,
   state: tauri::State<'_, Arc<AppState>>
) -> Result<Vec<NcVariantAssessment>, String> {
    use tauri_plugin_dialog::DialogExt;

    // Use the sync/blocking call or the async one
   let file_path = app.dialog()
        .file()
        .set_title("Select or Create Curation File")
        .add_filter("JSON", &["json"])
        .blocking_save_file(); // This opens the native "Save As" window

    if let Some(path) = file_path {
        let path_buf = PathBuf::from(path.to_string());
        {
            let mut settings = state.settings.lock()
                .map_err(|_| "Failed to lock settings".to_string())?;
            settings.set_curation_file(path_buf.clone())?;
        }
        if !path_buf.exists() || fs::metadata(&path_buf).map(|m| m.len()).unwrap_or(0) == 0 {
            // File is new or 0 bytes: return empty list
            return Ok(vec![]);
        }
        let contents = fs::read_to_string(&path_buf)
            .map_err(|e| format!("Failed to read file: {}", e))?;
            
        let evaluations: Vec<NcVariantAssessment> = serde_json::from_str(&contents)
            .map_err(|e| format!("Failed to parse JSON: {}", e))?;
        {
            let mut list = state.curated_variant_list.lock()
                .map_err(|_| "Failed to lock variant list".to_string())?;
            *list = evaluations.clone();
        }
        return Ok(evaluations);
    }
    Err("User canceled selection".into())
}


#[tauri::command]
async fn get_biocuration_orcid(
   state: tauri::State<'_, Arc<AppState>>
) -> Result<String, String> {
 let  settings = state
        .settings
        .lock()
        .map_err(|_| "Failed to lock settings")?;
    settings.get_biocurator_orcid()
}

#[tauri::command]
async fn set_biocuration_orcid(
   state: tauri::State<'_, Arc<AppState>>,
   orcid: String
) -> Result<(), String> {
    let mut settings = state
        .settings
        .lock()
        .map_err(|_| "Failed to lock settings")?;
    settings.save_biocurator_orcid(orcid).map_err(|e| e.to_string())
}



#[tauri::command]
async fn retrieve_pmid_citation(
    pmid: &str
) -> Result<Citation, String> {
    println!("retrieve_pmid_citation pmid={}", pmid);
    util::pubmed_retriever::retrieve_citation(pmid).await
}

#[tauri::command]
fn add_nc_variant_assesment(
      state: tauri::State<'_, Arc<AppState>>,
      assess: NcVariantAssessment
) -> Result<Vec<NcVariantAssessment>, String> {
     let mut guard = state.curated_variant_list
        .lock()
        .map_err(|_| "Failed to lock mutex".to_string())?;
    let current_list = std::mem::take(&mut *guard);
    let list = ncvar::ncvar_assessment::update_ncvar_list(current_list, assess)?;
    Ok(list.clone())
}



#[tauri::command]
fn serialize_variant_assessments(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<(), String> {
    let assessments = state.curated_variant_list.lock().map_err(|_|"Failed to locl variant assessment list")?;
    let settings = state.settings.lock().unwrap();
    let path = settings.curation_json_path.as_ref()
        .ok_or("No save path configured in settings")?;
    ncvar::ncvar_assessment::save_curation_list(path, &assessments)?;


    Ok(())
}