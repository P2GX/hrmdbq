import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { CitationEntry, EvidenceLevel, Citation } from '../../service/models';





@Component({
  selector: 'app-citation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule
  ],
  templateUrl: './citationform.html',
  styleUrls: ['./citationform.scss']
})
export class CitationFormComponent {
    entry = input<CitationEntry|null>(null);
    saveCitationEntry = output<CitationEntry>();
    cancel = output<void>();
    working: CitationEntry = this.createEmpty();
   

   //EvidenceLevel = EvidenceLevel;
    evidenceOptions = [
        { value: EvidenceLevel.yes, label: 'Yes ✅' },
        { value: EvidenceLevel.no, label: 'No ❌' },
        { value: EvidenceLevel.notAvailable, label: 'n/a ⚪️' }
    ];

   evidenceFields: ('cosegregationEvidence' | 'phenotypicEvidence' | 'experimentalEvidence' | 'computationalEvidence')[] = [
    'cosegregationEvidence',
    'phenotypicEvidence',
    'experimentalEvidence',
    'computationalEvidence'
];

    constructor() {
         let lastEntry: CitationEntry | null = null;
        effect(() => {
            const entryVal = this.entry();
            if (entryVal !== lastEntry) {
                this.working = entryVal ? structuredClone(entryVal) as CitationEntry : this.createEmpty();
                lastEntry = entryVal;
            } 
        });
    }

    createEmpty(): CitationEntry {
        return {
        citation: {pmid: '' } as Citation, // adjust if you have required fields
        note: '',
        cosegregationEvidence: EvidenceLevel.notAvailable,
        phenotypicEvidence: EvidenceLevel.notAvailable,
        experimentalEvidence: EvidenceLevel.notAvailable,
        computationalEvidence: EvidenceLevel.notAvailable
        };
    }

    onSave() {
        const working = this.working;
        if (! working.citation) return;
        this.saveCitationEntry.emit(structuredClone(working)); 
        this.working = this.createEmpty();
    }

  onCancel() {
    this.cancel.emit();
    this.working = this.createEmpty();
  }

}