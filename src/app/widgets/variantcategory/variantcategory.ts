import { Component, effect, input, output, signal } from '@angular/core';
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
  categories: VariantClass[] = Object.values(VariantClass);
  initialCategory = input<VariantClass | null>(null);

  selectedCategory = signal<VariantClass | null>(null);
  categoryConfirmed = signal(false);

  constructor() {
    effect(() => {
      const initial = this.initialCategory();
      if (initial) {
        this.selectedCategory.set(initial);
        this.categoryConfirmed.set(true); // Auto-confirm if we are editing
      }
    });
  }

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
      microRNA: "microRNA",
      lncRNA: "lncRNA",
      ICR: "ICR",
      multiGene: "Multi-Gene",
      tRNA: 'tRNA',
      snRNA: 'snRNA',
      snoRNA: 'snoRNA'
    };
    if (cat) {
      return labels[cat];
    } else {
      return "n/a";
    }
  }

}