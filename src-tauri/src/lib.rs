use std::{fs::{self}, path::PathBuf, sync::Mutex};

use ga4ghphetools::dto::{
    hgvs_variant::HgvsVariant, intergenic_variant::IntergenicHgvsVariant,
    structural_variant::StructuralVariant, variant_dto::VariantDto,
};


use crate::{
    dto::{citation::Citation, nc_variant_annotation::{GeneCuration, GeneCurationFile, NcVariantAssessment}},
    util::{gene_curation::get_path, hgnc_rest::HgncBundle, settings::HrmdbqSettings},
};

use rfd::FileDialog;

pub mod dto;
pub mod util;
pub mod ncvar;

struct AppState {
    pub settings: Mutex<HrmdbqSettings>,
    pub gene_list: Mutex<Vec<GeneCurationFile>>,
    pub current_gene_curation: Mutex<Option<GeneCuration>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let initial_settings = HrmdbqSettings::load_settings();
    let mut curation_list: Vec<GeneCurationFile> = Vec::new();
    if let Ok(dir_path) = initial_settings.get_hrmd_dir() {
        curation_list = util::gene_curation::scan_curation_directory(&dir_path);
    }
    let app_state = AppState {
                settings: Mutex::new(initial_settings),
                gene_list: Mutex::new(curation_list),
                current_gene_curation: Mutex::new(None)
    };
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(app_state)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            add_nc_variant_assessment,
            create_gene_curation,
            fetch_gene_data_from_hgnc,
            get_variant_assessments,
            get_biocuration_orcid,
            get_gene_curation_list,
            get_settings,
            load_gene_curation_file,
            retrieve_pmid_citation,
            select_curation_directory,
            serialize_gene_curation,
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
fn get_variant_assessments(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<NcVariantAssessment>, String> {
    let curation_guard = state.current_gene_curation.lock()
        .map_err(|_| "Failed to lock gene curation state".to_string())?;
    if let Some(curation) = curation_guard.as_ref() {
        Ok(curation.annotations.clone())
    } else {
        /* When we just create an object for a gene, we have no annotations yet, this is not an error */
        Ok(Vec::new())
    }
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
fn get_settings(state: tauri::State<AppState>) -> Result<HrmdbqSettings, String> {
    let settings = state
        .settings
        .lock()
        .map_err(|_| "Failed to lock settings")?;
    Ok(settings.clone())
}

#[tauri::command]
fn update_orcid(state: tauri::State<AppState>, orcid: String) -> Result<(), String> {
    let mut settings = state
        .settings
        .lock()
        .map_err(|_| "Failed to lock settings")?;
    settings.save_biocurator_orcid(orcid)
}

#[derive(serde::Serialize)]
pub struct SelectionResponse {
    pub evaluations: Vec<GeneCurationFile>,
    pub path: PathBuf,
}


#[tauri::command]
async fn select_curation_directory(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>
) -> Result<SelectionResponse, String> {
    let mut settings = state
        .settings
        .lock()
        .map_err(|_| "Failed to lock settings")?;
     let home_dir = settings.get_home_dir()?;
     let file_path = FileDialog::new()
        .set_directory(home_dir)
        .set_title("Select gene curation directory")
        .pick_folder();
    match file_path {
        Some(path) => {
            settings.set_hrmdata_path(&path)?;
            let curation_files = crate::util::gene_curation::scan_curation_directory(&path);
            Ok(SelectionResponse { evaluations: curation_files, path })
        }
        None => {
            return Err(format!("Could not retrieve path to directory"));
        }
    }
}



#[tauri::command]
async fn load_gene_curation_file(state: tauri::State<'_, AppState>, symbol: String)
    -> Result<GeneCuration, String> {
        let gene_list = state.gene_list.lock()
                .map_err(|_| "Failed to lock settings".to_string())?;
        let gfile = gene_list
            .iter()
            .find(|g| g.gene_symbol == symbol)
            // 2. Convert Option to Result with a custom error message
            .ok_or_else(|| format!("Gene symbol '{}' not found in the current directory", symbol))?;
        let path_buf = gfile.file.clone();

         let contents = fs::read_to_string(&path_buf)
            .map_err(|e| format!("Failed to read file: {}", e))?;  
        let curation: GeneCuration= serde_json::from_str(&contents)
            .map_err(|e| format!("Failed to parse JSON: {}", e))?;
        {
            let mut current_lock = state.current_gene_curation.lock()
                .map_err(|_| "Failed to lock current curation".to_string())?;
            *current_lock = Some(curation.clone());
        } 
        return Ok(curation);
    }





#[tauri::command]
async fn get_biocuration_orcid(
   state: tauri::State<'_, AppState>
) -> Result<String, String> {
 let  settings = state
        .settings
        .lock()
        .map_err(|_| "Failed to lock settings")?;
    settings.get_biocurator_orcid()
}

#[tauri::command]
async fn set_biocuration_orcid(
   state: tauri::State<'_, AppState>,
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
fn add_nc_variant_assessment(
      state: tauri::State<'_, AppState>,
      assess: NcVariantAssessment
) -> Result<Vec<NcVariantAssessment>, String> {
    let mut gene_curation_guard = state.current_gene_curation
        .lock()
        .map_err(|_| "Failed to lock mutex".to_string())?;
    let gene_curation = gene_curation_guard.as_mut()
        .ok_or("No active gene curation found in state")?;
    let current_list = std::mem::take(&mut gene_curation.annotations);
    println!("add_nc_variant_assesment current list size= {}", current_list.len());
    let updated_list: Vec<NcVariantAssessment> = ncvar::ncvar_assessment::update_ncvar_list(current_list, assess)?;
    println!("add_nc_variant_assesment updated list size= {}", updated_list.len());
    gene_curation.annotations = updated_list.clone();
    Ok(updated_list)
}



#[tauri::command]
fn serialize_gene_curation(
    state: tauri::State<'_, AppState>,
    curation: GeneCuration
) -> Result<(), String> {
    let gene_symbol = curation.get_symbol().to_string();
    let guard = state.gene_list
        .lock()
        .map_err(|_| "Failed to lock mutex".to_string())?;
    let path_buf = match get_path(&guard, &gene_symbol) {
        Some(pb) => pb,
        None => { return Err(format!("Could not retrieve path for {}", gene_symbol)); },
    };
    crate::util::gene_curation::save_gene_curation(&path_buf, &curation)?;
    Ok(())
}

#[tauri::command]
async fn get_gene_curation_list(
    directory: PathBuf,
    state: tauri::State<'_, AppState>,
) -> Result<Vec<GeneCurationFile>, String> {
    let mut gene_list = Vec::new();
    let entries = std::fs::read_dir(&directory)
        .map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("json") {
            if let Ok(content) = std::fs::read_to_string(&path) {
                // Using the full GeneCuration struct for now, 
                // but consider a 'Light' version if performance dips
                if let Ok(curation) = serde_json::from_str::<GeneCuration>(&content) {
                    gene_list.push(GeneCurationFile {
                        gene_symbol: curation.gene_data.symbol,
                        file: path,
                    });
                }
            }
        }
    }
    gene_list.sort_by(|a, b| a.gene_symbol.to_lowercase().cmp(&b.gene_symbol.to_lowercase()));
    let mut state_list = state.gene_list.lock().map_err(|_| "State lock poisoned")?;
    *state_list = gene_list.clone();

    Ok(gene_list)
}


#[tauri::command]
fn create_gene_curation(
    state: tauri::State<'_, AppState>,
    symbol: String,
    hgnc: HgncBundle
) -> Result<GeneCuration, String> {
    let guard = state.gene_list
        .lock()
        .map_err(|_| "Failed to lock mutex".to_string())?;
     let settings = state.settings
        .lock()
        .map_err(|_| "Failed to lock mutex".to_string())?;
    let curation_dir = settings.get_hrmd_dir()?;
    let file_path = curation_dir.join(format!("{}.json", symbol));
    let already_exists = guard
        .iter()
        .find_map(|gc| Some(gc.gene_symbol == symbol))
        .is_some();
    if already_exists {
        return Err(format!("Curation file for {} exists already!", symbol));
    }
    let gene_curation =  GeneCuration::from_hgnc_bundle(symbol, hgnc);
    crate::util::gene_curation::save_gene_curation(&file_path, &gene_curation)?;
    Ok(gene_curation)
}