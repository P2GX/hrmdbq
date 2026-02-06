

#[derive(Debug, Deserialize, Serialize)]
pub struct Citation {
    pub author_list: String,
    pub title: String,
    pub journal: String,
    pub year: usize,
    pub volume: String,
    pub pages: String,
    pub pmid: String
}


impl Citation {

    pub fn from_numerical_pmid(numerical_pmid: &str, title: &str) -> Self {
        Self { 
            author_list: String::default(), 
            title: title.to_string(), 
            journal: String::default(), 
            year: 0, 
            volume: String::default(), 
            pages: String::default(), 
            pmid: numerical_pmid.to_string()
        }
    }
    
}