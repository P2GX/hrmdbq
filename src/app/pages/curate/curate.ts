import { Component, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { invoke } from '@tauri-apps/api/core';
import { MatFormField, MatLabel } from "@angular/material/form-field";
  @Component({
    selector: 'app-about',
    imports: [
      CommonModule,
      FormsModule,
      MatDividerModule,  
      MatFormField, 
      MatLabel],
    templateUrl: './curate.html',
    styleUrl: './curate.css'
  })
  export class CurationWidget {

  // Local state for the gene search
  geneSymbol = signal('');
  hgncRawResult = signal<string | null>(null);
  isSearching = signal(false);

  /* Reach out the the HGNC API to get the MANE transcript */
  async onSearchGene() {
    const symbol = this.geneSymbol().trim();
    if (!symbol) return;

    this.isSearching.set(true);
    try {
      const data = await invoke<any>('fetch_gene_data_from_hgnc', { symbol });
      this.hgncRawResult.set(JSON.stringify(data, null, 2));
    } catch (err) {
      this.hgncRawResult.set(`Error: ${err}`);
    } finally {
      this.isSearching.set(false);
    }
  }

  }
