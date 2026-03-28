import { Component, output, signal } from '@angular/core';
import { VariantClass } from '../../service/models';
import { CommonModule } from '@angular/common';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";

@Component({
  selector: 'app-variant-category-selector',
   templateUrl: './variantcategory.html',
  styleUrl: './variantcategory.scss',
  imports: [CommonModule, MatCardModule, MatIconModule, MatSelectModule]
})
export class VariantCategorySelectorComponent {

  stepComplete = output<VariantClass>();
  categories: VariantClass[] = [
    'utr5', 'promoter', 'enhancer', 'utr3', 
    'microRna', 'lncRna', 'icr', 'multiGene','tRna', 'snRna', 'snoRna'
  ];

  selectedCategory = signal<VariantClass | null>(null);
  categoryConfirmed = signal(false);

  selectCategory(cat: VariantClass) {
    this.selectedCategory.set(cat);
    this.categoryConfirmed.set(true);
      this.stepComplete.emit(cat);
  }

  formatCategoryLabel(cat: VariantClass | null): string {
    // Converts 'utr5' to '5\' UTR', 'microRna' to 'Micro RNA', etc.
    const labels: Record<VariantClass, string> = {
      utr5: "5' UTR",
      promoter: "Promoter",
      enhancer: "Enhancer",
      utr3: "3' UTR",
      microRna: "microRNA",
      lncRna: "lncRNA",
      icr: "ICR",
      multiGene: "Multi-Gene",
      tRna: 'tRNA',
      snRna: 'snRNA',
      snoRna: 'snoRNA'
    };
    if (cat) {
      return labels[cat];
    } else {
      return "n/a";
    }
  }

}