import { Component, computed, inject, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CurationStats } from '../../service/models';
import { ConfigService } from '../../service/configService';
import { NotificationService } from '../../service/notification.service';
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
    stats = signal<CurationStats | null>(null);
    viewMode = signal<'gene' | 'category'>('gene');
    isLoading = signal(false);
    configService = inject(ConfigService);
    notificationService = inject(NotificationService);

    displayData = computed(() => {
        const currentStats = this.stats();
        if (!currentStats) return [];

        const targetMap = this.viewMode() === 'gene' 
        ? currentStats.geneSymbolCounts 
        : currentStats.variantCategoryCounts;

        return Object.entries(targetMap)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);
    });

  async fetchData() {
    this.isLoading.set(true);
    try {
        const data = await this.configService.fetchVariantStats();
        if (! data) {
             this.notificationService.showError(`Could not fetch stats.`);
        } else {
            this.stats.set(data);
        }
         this.isLoading.set(false);
    } catch(err) {
        this.notificationService.showError(`Could not fetch stats: ${err}.`);
        this.isLoading.set(false);
    }
  }
}
