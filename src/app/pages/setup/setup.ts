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


@Component({
  selector: 'app-about',
  imports: [
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule
 ],
  templateUrl: './setup.html',
  styleUrl: './setup.css'
})
export class Setup {


  public curationService = inject(CurationService);
  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  selectedTab = 'introduction';


  public orcidDisplay = computed(() => {
    const orcid = this.configService.settings()?.orcid_id;
    return orcid && orcid.trim() !== '' ? orcid : 'N/A';
  });

  public curationFileDisplay = computed(() => {
    const fpath = this.configService.settings()?.curation_json_path;
    if (fpath) {
      return `Curation file: ${fpath}`;
    } else {
      return "Curation file not loaded";
    }
  });


  async selectTab(tab: string) {
    this.selectedTab = tab;
  }

  async onSelectFile() {
    try {
      await this.curationService.loadCurationFile();
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

}
