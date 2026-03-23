

export interface Citation {
  authorList: string;
  title: string;
  journal: string;
  year: number;
  volume: string;
  pages: string;
  pmid: string;
}



export function defaultCitation(): Citation {
    return {
         authorList: '',
            title: '',
            journal: '',
            year: 0,
            volume: '',
            pages: '',
            pmid: ''
    };
}