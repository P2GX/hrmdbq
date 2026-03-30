import { Component, computed, inject, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { CurationService } from '../../service/curation_service';
import { OrcidDialogComponent } from '../../widgets/orcid-dialog.component'; 
import { NotificationService } from '../../service/notification.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from '../../service/configService';
import { GeneCurationFile, HgncBundle } from '../../service/models';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { invoke } from '@tauri-apps/api/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule
 ],
  templateUrl: './setup.html',
  styleUrl: './setup.css'
})
export class Setup {

onGeneClick(arg0: any) {
throw new Error('Method not implemented.');
}


  public curationService = inject(CurationService);
  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  selectedTab = 'introduction';

  curationFiles = signal<GeneCurationFile[]>([]);
  displayedGeneSymbols = computed(() => {
    const symbols = this.curationFiles().map((cf) => cf.geneSymbol);
    return symbols;
  });

  currentHgncBundle = signal<HgncBundle|null>(null);


  public orcidDisplay = computed(() => {
    const orcid = this.configService.settings()?.orcid_id;
    return orcid && orcid.trim() !== '' ? orcid : 'N/A';
  });

  public curationDirectoryDisplay = computed(() => {
    const fpath = this.curationService.curationDirectory();
    if (fpath) {
      return `Curation directory: ${fpath}`;
    } else {
      return "Curation directory not loaded";
    }
  });


  async selectTab(tab: string) {
    this.selectedTab = tab;
  }

   async selectCurationDirectory(): Promise<void> {
      try {
        await this.curationService.selectCurationDirectory();
      } catch (err) {
        this.notificationService.showError(`Could not load curation directory: ${err}.`);
      }
  }

  async onSelectFile() {
    try {
      await this.curationService.selectCurationDirectory();
    } catch (err) {
      this.notificationService.showError(`File selection not successful: ${err}.`)
    } 
  }

  async setBiocuratorOrcid(): Promise<void>{
    const currentOrcid = this.configService.getOrcid();
    const dialogRef = this.dialog.open(OrcidDialogComponent, {
      width: '500px',
      data: { 
        currentOrcid: currentOrcid
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      try {
          await this.configService.setOrcid(result);
          await this.configService.refreshSettings();
          this.notificationService.showSuccess("ORCID updated successfully");
      } catch (err) {
          this.notificationService.showError("Failed to save ORCID");
      }
    });
  }


  async createNewGeneCuration(symbol: string): Promise<void> {
    if (!symbol) return;
    this.currentHgncBundle.set(null);
    let hgncBundle: HgncBundle;
    try {
      hgncBundle = await invoke<HgncBundle>('fetch_gene_data_from_hgnc', { symbol });
      this.currentHgncBundle.set(hgncBundle);
    } catch (err) {
      this.notificationService.showError(`Could not retrieve HGNC data: ${err}.`);
      return;
    } 
    const success =  await this.curationService.createGeneCuration(symbol, hgncBundle);
    if (success) {
      this.router.navigate(["/annots"]);
    }
  }

}
