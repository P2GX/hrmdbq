
use serde::Deserialize;

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

#[derive(Debug, Deserialize)]
struct Author {
    name: String,
}

impl PubmedRetriever {

    pub fn new(pmid: &str) -> Result<Self, String> {
        match Self::extract_pmid(pmid) {
            Some(pmid) => Ok(Self { numerical_pmid: pmid}),
            None => Err(format!("Could not extract PMID from {pmid}")),
        }
    }

    pub async fn get(&self) -> Result<Citation, String> {
        let title = match self.fetch_article_title().await {
            Ok(Some(title)) => title,
            Ok(None) => { return Err("No title found".to_string()) },
            Err(e) => {return Err(e.to_string())},
        };
        Ok(Citation::from_numerical_pmid(&self.numerical_pmid, &title))
    }
    

    /// We might get PMIDs in one of three input formats: 'PMID: 20802478', 'PMID:20802478', and '20802478', and in some cases there
    /// may be leading or trailing whitespace. This function returns the numerical part ('20802478'), which is what we need for the 
    /// eUtils API
    pub fn extract_pmid(input: &str) -> Option<String> {
        input
            .to_uppercase()
            .replace("PMID:", "")
            .trim()
            .parse::<u32>()
            .ok()
            .map(|n| n.to_string())
    }

    async fn fetch_article_title(&self) -> Result<Option<String>, String> {
        let url = format!(
            "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={}&retmode=json",
            &self.numerical_pmid
        );

        let response = reqwest::get(&url).await.map_err(|e|e.to_string())?;
        println!("{:?}", response);
        let json: PubmedResponse = response.json().await.map_err(|e|e.to_string())?;

        if let Some(record) = json.result.records.get(&self.numerical_pmid) {
            Ok(record.title.clone())
        } else {
            Ok(None)
        }
    }
}






// region:    --- Tests

#[cfg(test)]
mod tests {
    use super::*;
use rstest::{fixture, rstest};
    use tokio;

   #[rstest]
   fn test_remove_pmid() {
    let full_pmid = "PMID:12345";
    let retriever = PubmedRetriever::new(full_pmid).unwrap();
    assert_eq!("12345", retriever.numerical_pmid);

   }
   
   
   
   
    #[rstest]
    #[tokio::test]
     async fn fetch_pmid_test() -> Result<(), Box<dyn std::error::Error>> {
        let pmid = "13168976";
        let retr = PubmedRetriever::new(pmid).unwrap();
        let result = retr.get().await;
        assert!(result.is_ok());
        let citation = result.unwrap();
        println!("{:?}", citation);
        let expected_title = "The structure of DNA";
        assert_eq!(expected_title, citation.title);
       // assert!(dto.title.contains("PIGV"));
        Ok(())
    }
 
  

}
// endregion: --- Tests
