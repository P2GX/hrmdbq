import { Component, signal, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { invoke } from '@tauri-apps/api/core';

@Component({
  selector: 'app-gene-search',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, MatButtonModule, 
    MatProgressSpinnerModule, FormsModule
  ],
  templateUrl: './genesearch.html',
  styleUrls: ['./genesearch.scss']
})
export class GeneSearchComponent {
  // Signals for state management
  symbol = signal('');
  hgncResult = signal<string | null>(null);
  isLoading = signal(false);

  async searchGene() {
    const query = this.symbol().trim();
    if (!query) return;

    this.isLoading.set(true);
    this.hgncResult.set(null); // Clear previous results

    try {
      // Calling your fixed Rust command
      const data = await invoke<any>('fetch_gene_data_from_hgnc', { 
        symbol: query 
      });
      
      // For now, we stringify the HGNC Bundle to display it
      this.hgncResult.set(JSON.stringify(data, null, 2));
    } catch (error) {
      this.hgncResult.set(`Error: ${error}`);
    } finally {
      this.isLoading.set(false);
    }
  }
}