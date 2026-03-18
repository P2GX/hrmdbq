use std::sync::{Arc, Mutex};

use crate::dto::{citation::Citation, nc_variant_annotation::NcVariantAssessment};

pub mod dto;
pub mod util;


struct AppState {
    curated_variant_list: Mutex<Vec<NcVariantAssessment>>,
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let ncvarass_list = vec![NcVariantAssessment::fake_remove_later()];
     let app_state = Arc::new(AppState {
        curated_variant_list: Mutex::new(ncvarass_list)
    });
    tauri::Builder::default()
        .manage(app_state)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_variant_assessments,
            get_annot_count])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}



#[tauri::command]
fn greet() -> Result<Citation, String> {
    println!("Greeting");
    Err("testing".to_string())
}


#[tauri::command]
fn get_annot_count(
       state: tauri::State<'_, Arc<AppState>>, 
) -> usize {
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
            let singleton = state_handle.curated_variant_list
                    .lock()
                    .map_err(|_| anyhow::anyhow!("Mutex poisoned"))?;

                Ok(singleton.clone())
            })()
        .map_err(|e| e.to_string())?; 
    Ok(assessments)
}
