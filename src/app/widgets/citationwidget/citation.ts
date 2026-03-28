import { Component, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Citation } from '../../service/models'; 
import { PubmedComponent } from '../pubmed/pubmed.component';
import { NotificationService } from '../../service/notification.service';


/* This widget returns a few bits of data-"everything else", including the PMID */
export interface CitationPacket {
  cosegregation: boolean;
  phenotypicEvidence: boolean;
  comment: string;
  citation: Citation; 
}

@Component({
  selector: 'app-citation',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCheckboxModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    PubmedComponent
  ],
  templateUrl: './citation.html',
  styleUrl: './citation.scss'
})
export class CitationComponent {

  stepComplete = output<CitationPacket>(); 
  submitted = signal<boolean>(false);

  // State Signals
  cosegregation = signal(false);
  phenotypicEvidence = signal<boolean>(false);
  comment = signal('');
  citation = signal<Citation | null>(null);
    notificationService = inject(NotificationService);

  // Validation
  canSubmit = computed(() => !!this.citation());

  handleNewCitation(event: Citation) {
    this.citation.set(event);
  }

  submit() {
    const cite = this.citation();
    if (! cite)  {
        this.notificationService.showError("Cannot submit before entering citation data");
        return;
    }
    if (this.canSubmit()) {
      const result: CitationPacket = {
        cosegregation: this.cosegregation(),
        phenotypicEvidence: this.phenotypicEvidence(),
        comment: this.comment().trim(),
        citation: cite
      };
      this.submitted.set(true);
      this.stepComplete.emit(result);
    }
  }

  edit() {
    this.submitted.set(false);
  }
}