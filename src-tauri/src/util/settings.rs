//! Module to persist settings including the location of the hp.json file
//!

use dirs::home_dir;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

/// Settings to persist between sessions.

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HrmdbqSettings {
    /// Directory where we store go-basic.json and annotation files
    pub(crate) go_dir: Option<PathBuf>,
    /// Research ID of curator
    pub(crate) orcid_id: Option<String>,
    /// Path to the file in which we keep our curations
    pub(crate) curation_json_path: Option<PathBuf>
}

impl HrmdbqSettings {
    fn empty() -> Self {
        Self {
            go_dir: None,
            orcid_id: None,
            curation_json_path: None
        }
    }

    pub fn set_go_dir_path<P: Into<PathBuf>>(&mut self, go_dir: P) -> Result<(), String> {
        let path = go_dir.into();
        if !path.is_dir() {
            return Err(format!("Did not find directory at {}", path.display()));
        }
        self.go_dir = Some(path);
        self.save_settings()
    }

    pub fn get_go_dir(&self) -> Result<PathBuf, String> {
        match &self.go_dir {
            Some(godir) => Ok(godir.clone()),
            None => Err(format!("GO data directory not initialized")),
        }
    }

    pub fn set_curation_file<P: Into<PathBuf>>(&mut self, path: P) -> Result<(), String> {
        let p = path.into();
        // Check if the parent directory exists (we can't save a file in a non-existent folder)
        if let Some(parent) = p.parent() {
            if !parent.is_dir() && parent.to_string_lossy() != "" {
                return Err(format!("Parent directory does not exist: {}", parent.display()));
            }
        }
        self.curation_json_path = Some(p);
        self.save_settings()
    }

    pub fn get_biocurator_orcid(&self) -> Result<String, String> {
        match &self.orcid_id {
            Some(orcid) => Ok(orcid.clone()),
            None => Err("ORCID not initialized".to_string()),
        }
    }

    pub fn save_biocurator_orcid(&mut self, orcid: String) -> Result<(), String> {
        self.orcid_id = Some(orcid);
        self.save_settings()
    }

    pub fn load_settings() -> HrmdbqSettings {
        let _ = ensure_config_directory();
        let path = match get_config_file() {
            Ok(p) => p,
            Err(_) => return HrmdbqSettings::empty(),
        };

        if !path.exists() {
            let default_settings = HrmdbqSettings::empty();
            if let Ok(toml_string) = toml::to_string_pretty(&default_settings) {
                let _ = fs::write(&path, toml_string);
            }
            return default_settings;
        }

        fs::read_to_string(&path)
            .and_then(|contents| {
                toml::from_str(&contents).map_err(|e| {
                    std::io::Error::new(std::io::ErrorKind::InvalidData, e)
                })
            })
            .unwrap_or_else(|err| {
                eprintln!("Warning: Failed to load settings.toml: {}. Using defaults.", err);
                HrmdbqSettings::empty()
            })
    }

    pub fn save_settings(&self) -> Result<(), String> {
        let config_file = get_config_file()?;
        
        let toml_string = toml::to_string_pretty(&self)
            .map_err(|e| format!("Could not serialize settings: {}", e))?;

        fs::write(config_file, toml_string)
            .map_err(|e| format!("Could not write to settings file: {}", e))?;
            
        Ok(())
    }
}

fn get_config_path() -> Result<PathBuf, String> {
    match home_dir() {
        Some(mut home) => {
            home.push(".hrmdbq");
            Ok(home)
        }
        None => Err(format!("Could not determine home directory for HRMDBQ.")),
    }
}

fn get_config_file() -> Result<PathBuf, String> {
    let mut config_file = get_config_path()?;
    config_file.push("settings.toml"); // ~/.phenoboard/settings.toml
    Ok(config_file)
}

fn ensure_config_directory() -> Result<(), String> {
    let config_dir = get_config_path()?;
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir).expect("Failed to create config directory");
    }
    Ok(())
}
