import { Component, computed, inject, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CurationStats, VariantClass } from '../../service/models';
import { ConfigService } from '../../service/configService';
import { NotificationService } from '../../service/notification.service';
import { GeneCurationStats } from '../../service/variant_models';




@Component({
  selector: 'app-about',
  imports: [MatDividerModule, 
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatButtonToggleModule],
  templateUrl: './status.html',
  styleUrl: './status.scss'
})
export class StatusWidget {
    statsList = signal<GeneCurationStats[]>([]);
    viewMode = signal<'gene' | 'category'>('gene');
    isLoading = signal(false);
    configService = inject(ConfigService);
    notificationService = inject(NotificationService);

    readonly columns = Object.values(VariantClass); 


    readonly matrixRows = computed(() => {
      const list = this.statsList();
      if (!list || list.length === 0) return [];

      // Sort descending by total mutations so the most heavily variant-loaded genes bubble up
      return [...list].sort((a, b) => b.total - a.total);
    });

    readonly totalTrackedVars = computed(() => {
      return this.statsList().reduce((sum, item) => sum + item.total, 0);
    });

    readonly columnTotals = computed<Record<VariantClass, number>>(() => {
      const rows = this.matrixRows();
      
      // Initialize a blank map with 0 for all classes
      const totals = Object.values(VariantClass).reduce((acc, vClass) => {
        acc[vClass] = 0;
        return acc;
      }, {} as Record<VariantClass, number>);

      // Aggregate counts
      for (const row of rows) {
        for (const vClass of this.columns) {
          totals[vClass] += row.variantCategoryCounts[vClass] || 0;
        }
      }

      return totals;
    });


  async fetchData() {
    this.isLoading.set(true);
    try {
        const data = await this.configService.fetchVariantStats();
        if (! data) {
             this.notificationService.showError(`Could not fetch stats.`);
        } else {
            this.statsList.set(data);
        }
         this.isLoading.set(false);
    } catch(err) {
        this.notificationService.showError(`Could not fetch stats: ${err}.`);
        this.isLoading.set(false);
    }
  }

  /**
   * Snaps the viewport container down to the very bottom row
   * @param container The HTML element handling the table scroll overflow
   */
  scrollToTotals(container: HTMLDivElement): void {
    if (!container) return;
    
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth' // Gives a satisfying scrolling transition down the grid
    });
  }
}
