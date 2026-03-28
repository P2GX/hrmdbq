import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../service/configService';
import { Citation } from '../../service/models';
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-pubmed',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './pubmed.component.html',
  styleUrls: ['./pubmed.component.css']
})
export class PubmedComponent {

  private configService = inject(ConfigService);
  citationRetrieved = output<Citation>();
  pmidInput = signal('');
  citation = signal<Citation | undefined>(undefined);
  isLoading = signal(false);
  isConfirmed = signal(false);

async retrieveCitation() {
    const id = this.pmidInput().trim();
    if (!id) return;
    console.log("Retrieving PMID", id);
    this.isLoading.set(true);
    try {
      const data = await this.configService.retrievePmidCitation(id);
      console.log("Got data=", data);
      this.citation.set(data);
      this.citationRetrieved.emit(data);
      this.isConfirmed.set(true);
    } catch (error) {
      console.error(error);
      this.citation.set(undefined);
      this.isConfirmed.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }

  accept() {
    const finalCitation = this.citation() as Citation;
    if (finalCitation.title) {
      this.isConfirmed.set(true);
      // Emit to parent that this step is done
      this.citationRetrieved.emit(finalCitation);
    }
  }

  clear() {
    this.citation.set(undefined);
    this.pmidInput.set('');
    this.isConfirmed.set(false);
  }
  

}


