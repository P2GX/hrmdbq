import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { invoke } from '@tauri-apps/api/core';
import { Router } from '@angular/router';
import { ManualHgncDialog } from '../../widgets/hgncwidget/hgncwidget';
import { firstValueFrom } from 'rxjs';
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { getVersion, getName } from '@tauri-apps/api/app';

@Component({
  selector: 'app-about',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    MatSelectModule
],
  templateUrl: './setup.html',
  styleUrl: './setup.css'
})
export class Setup implements OnInit {


  public curationService = inject(CurationService);
  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  selectedTab = 'introduction';
  dataSource = new MatTableDataSource<any>([]);
  version = signal<string|null>(null);
 

  constructor() {
    effect(() => {
      const newData = this.curationService.curationFileList();
      this.dataSource.data = newData;
      this.dataSource.filterPredicate = (data, filter) => {
        return data.geneSymbol.toLowerCase().includes(filter);
      };
    });
  }

   async ngOnInit(): Promise<void> {
    this.curationService.initialize();
    const v  = await getVersion();
    this.version.set(v);
  }

applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  currentHgncBundle = signal<HgncBundle|null>(null);

 
  
  public orcidDisplay = computed(() => {
    const orcid = this.configService.settings()?.orcid_id;
    return orcid && orcid.trim() !== '' ? orcid : 'N/A';
  });

  public curationDirectoryDisplay = computed(() => {
    const fpath = this.curationService.curationDirectory();
    if (fpath) {
      return `${fpath}`;
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
    let hgncBundle: HgncBundle | undefined;
    try {
      hgncBundle = await invoke<HgncBundle>('fetch_gene_data_from_hgnc', { symbol });
      this.currentHgncBundle.set(hgncBundle);
    } catch (err) {
      this.notificationService.showError(`Could not retrieve HGNC data: ${err}.`);
      const dialogRef = this.dialog.open(ManualHgncDialog, {data: { symbol: symbol }, width: '300px', disableClose: true});
      hgncBundle = await firstValueFrom(dialogRef.afterClosed()); 
    } 
    let success = false;
    if (hgncBundle && hgncBundle.hgncId) {
      this.currentHgncBundle.set(hgncBundle);
      success = await this.curationService.createGeneCuration(symbol, hgncBundle);
      console.log("success=", success, "gb=", this.currentHgncBundle);
    } 
    if (success) {
        this.router.navigate(["/annots"]);
      } else {
      this.notificationService.showError("New gene entry failed.");
    }
  }

  public async onGeneClick(gene: GeneCurationFile): Promise<void> {
      const symbol = gene.geneSymbol;
      let success = await this.curationService.loadCurationFile(symbol);
      if (success) {
        this.notificationService.showSuccess(`Loaded ${symbol}.`);
        this.router.navigate(["/annots"]);
      }
     
  }

}
