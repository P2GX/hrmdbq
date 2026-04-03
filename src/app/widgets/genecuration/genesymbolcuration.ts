import { CommonModule } from '@angular/common';
import { Component, signal, computed, inject, output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { invoke } from '@tauri-apps/api/core';
import { MatIcon } from "@angular/material/icon";
import { HgncBundle } from '../../service/models';
import { NotificationService } from '../../service/notification.service';
import { MatInputModule } from '@angular/material/input';
import { CurationService } from '../../service/curation_service';
import { Router } from '@angular/router';


export interface GeneStepResult {
  symbol: string;
  hgncId: string;
  maneId: string;
}

@Component({
  selector: 'app-gene-curation-widget',
  templateUrl: './genesymbolcuration.html',
  styleUrl: './genesymbolcuration.scss',
    imports: [
    CommonModule,
    FormsModule,
    MatDividerModule,
    MatInputModule,
    MatIcon
]
})
export class GeneCurationWidget implements OnInit {
  // Data Signals
  geneSymbol = signal('');
  hgncId = signal('');
  maneTranscriptId = signal('');
  
  // State Signals
  isSearching = signal(false);
  isConfirmed = signal(false); // Controls the toggle

  stepComplete = output<GeneStepResult>();

  notificationService = inject(NotificationService);
    public curationService = inject(CurationService);
      private router = inject(Router);

  
ngOnInit() {
   const activeCuration = this.curationService.currentCuration();
    if (activeCuration) {
      const initialGene: GeneStepResult = {
        symbol: activeCuration.geneData.symbol,
        hgncId: activeCuration.geneData.hgncId,
        maneId: activeCuration.geneData.maneId
      };
      this.geneSymbol.set(initialGene.symbol);
      this.hgncId.set(initialGene.hgncId);
      this.maneTranscriptId.set(initialGene.maneId);
      this.notificationService.showSuccess(`Initialized workspace for ${initialGene.symbol}`);
    } else {
      this.notificationService.showError("Could not initialize gene curation. Go back to setup page!")
    }
  }

  onReset() {
    this.isConfirmed.set(false);
    this.geneSymbol.set('');
    this.hgncId.set('');
    this.maneTranscriptId.set('');
    this.router.navigate(["/setup"]);
   }

  /* Reach out the the HGNC API to get the MANE transcript */
  async onSearchGene() {
    const symbol = this.geneSymbol().trim().toUpperCase();
    if (!symbol) return;
    this.isSearching.set(true);
    try {
      const data = await invoke<HgncBundle>('fetch_gene_data_from_hgnc', { symbol });
      this.hgncId.set(data.hgncId);
      this.maneTranscriptId.set(data.maneSelect);
      this.stepComplete.emit({
        symbol: this.geneSymbol(),
        hgncId: this.hgncId(),
        maneId: this.maneTranscriptId()
      });
    } catch (err) {
      this.notificationService.showError(`Could not retrieve HGNC data: ${err}.`);
    } finally {
      this.isSearching.set(false);
    }
  }

}