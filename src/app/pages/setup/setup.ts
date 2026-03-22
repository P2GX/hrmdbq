import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { CurationService } from '../../service/curation_service';
import { NotificationService } from '../../service/notification.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';


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
  private notificationService = inject(NotificationService);
  selectedTab = 'introduction';


  async selectTab(tab: string) {
    this.selectedTab = tab;
  }

  async onSelectFile() {
    try {
      await this.curationService.loadCurationFile();
    } catch (err) {
      this.notificationService.showError("File selection not successful.")
    } 
  }

}
