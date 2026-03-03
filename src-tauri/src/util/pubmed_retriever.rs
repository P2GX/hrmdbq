use serde::Deserialize;
use std::fmt::Debug;

use crate::dto::citation::Citation;

#[derive(Debug, Deserialize)]
struct PubmedResponse {
    result: PubmedResult,
}

#[derive(Debug, Deserialize)]
struct PubmedResult {
    #[serde(rename = "uids")]
    #[allow(dead_code)]
    uids: Vec<String>,
    #[serde(flatten)]
    records: std::collections::HashMap<String, ArticleRecord>,
}

#[derive(Debug, Deserialize)]
struct ArticleRecord {
    authors: Vec<Author>,
    title: Option<String>,

    #[serde(rename = "fulljournalname")]
    journal: Option<String>,

    #[serde(rename = "pubdate")]
    year: Option<String>,

    volume: Option<String>,
    pages: Option<String>,
}


/*

#[derive(Debug, Deserialize, Serialize)]
pub struct Citation {
    pub author_list: String,
    pub title: String,
    pub journal: String,
    pub year: usize,
    pub volume: String,
    pub pages: String,
    pub pmid: String,
}
     */

#[derive(Debug, Deserialize)]
struct Author {
    name: String,
    authtype: String,
    clusterid: String,
}

pub async  fn retrieve_citation(input: &str) -> Result<Citation, String> {
    let num_pmid = match extract_numerical_pmid(input) {
        Some(pmid) => pmid,
        None => { return Err(format!("Could not extract numerical PMID from {}", input)); }
    };
    fetch_citation(&num_pmid).await
}


/// We might get PMIDs in one of three input formats: 'PMID: 20802478', 'PMID:20802478', and '20802478', and in some cases there
/// may be leading or trailing whitespace. This function returns the numerical part ('20802478'), which is what we need for the
/// eUtils API
fn extract_numerical_pmid(input: &str) -> Option<String> {
    input
        .to_uppercase()
        .replace("PMID:", "")
        .trim()
        .parse::<u32>()
        .ok()
        .map(|n| n.to_string())
}


  



async fn fetch_citation(numerical_pmid: &str) -> Result<Citation, String> {
    let url = format!(
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={}&retmode=json",
        numerical_pmid
    );

    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    println!("{:?}", response);
    let json: PubmedResponse = response.json().await.map_err(|e| e.to_string())?;
    let article_record = match  json.result.records.get(numerical_pmid) {
        Some(record) => record,
        None => { return Err("Could not fetch".to_string())}
    };
    let formatted_authors = article_record.authors
        .iter()
        .map(|a| a.name.trim().to_string())
        .collect::<Vec<String>>()
        .join(", ");
    
    let author_list = if formatted_authors.is_empty() { 
        "No authors listed".to_string() 
    } else { 
        formatted_authors 
    };
    let title = match &article_record.title {
        Some(t) => t.to_string(),
        None => { return Err("Could not retrieve title from record".to_string()); }
    };
    let title = title.trim().to_string();
    let journal = match &article_record.journal {
        Some(j) => j.to_string(),
        None => { return Err("Could not retrieve journal from record".to_string()); }
    };
    let journal = journal.trim().to_string();
    let year = match &article_record.year {
        Some(y) => y.to_string(),
        None => {return Err("Could not retrieve year from record".to_string()); }
    };
    let year: usize = year.parse().unwrap();
    let volume = match &article_record.volume {
        Some(v) => v.to_string(),
        None => { return Err("Could not retrieve volume from record".to_string()); }
    };
    let volume = volume.trim().to_string();
    let pages = match &article_record.pages {
        Some(p) => p.to_string(),
        None => { return Err("Could not retrieve pages from record".to_string()); }
    };
    let pages = pages.trim().to_string();
    
    println!("{:?}", article_record);
    let mut citation = Citation::from_numerical_pmid(numerical_pmid, "placeholder");
    citation.author_list = author_list;
    citation.title = title;
    citation.journal = journal;
    citation.year = year;
    citation.volume = volume;
    citation.pages = pages;
    Ok(citation)

}


// region:    --- Tests

#[cfg(test)]
mod tests {
    use super::*;
    use rstest::rstest;
    use tokio;

    #[rstest]
    fn test_remove_pmid() {
        let full_pmid = "PMID:12345";
        let numerical_pmid = extract_numerical_pmid(full_pmid).unwrap();
        assert_eq!("12345", numerical_pmid);
    }

    #[rstest]
    #[tokio::test]
    ///#[ignore = "API call"]
    async fn fetch_pmid_test() -> Result<(), Box<dyn std::error::Error>> {
        let pmid = "13168976";
        let result = retrieve_citation(pmid).await;
        assert!(result.is_ok());
        let citation = result.unwrap();
        println!("{:?}", citation);
       
        // assert!(dto.title.contains("PIGV"));
        Ok(())
    }
}
// endregion: --- Tests
