import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CitationEntry } from '../../service/models';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-citation-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './citation.html',
  styleUrls: ['./citation.scss']
})
export class CitationListComponent {
  notificationService = inject(NotificationService);
  citations = input<CitationEntry[]>([]);
  add = output<void>();
  edit = output<{ index: number; entry: CitationEntry }>();
  delete = output<number>();
  stepComplete = signal<boolean>(false);
  citationsComplete = output<CitationEntry[]>();

  citationDisplay = computed(() => {
    const cites = this.citations();
    if (cites.length === 0) {
      return "no PMIDs found."
    }
    return cites.
      map(c => c.citation.pmid)
     .join(", ");
  });

  onAdd() {
    this.add.emit();
  }

  // 🔹 Trigger edit flow
  onEdit(index: number) {
    const entry = this.citations()[index];
    this.edit.emit({ index, entry });
  }

  // 🔹 Trigger delete
  onDelete(index: number) {
    this.delete.emit(index);
  }

  // 🔹 Optional helper for display
  trackByIndex(index: number): number {
    return index;
  }

  // 🔹 Optional: safe display helpers
  getCitationLabel(entry: CitationEntry): string {
    if (!entry?.citation) return 'Unknown citation';

    // adjust depending on your Citation model
    if (entry.citation.title) return entry.citation.title;
    if (entry.citation.pmid) return `PMID: ${entry.citation.pmid}`;

    return 'Unnamed citation';
  }


  onFinish(): void {
    const cites = this.citations();
    if (cites) {
      this.stepComplete.set(true);
      this.citationsComplete.emit(cites);
    } else {
      this.notificationService.showError("Could not emit finished citations");
    }
  }

  cancel() {
    this.stepComplete.set(false);  
  }
}