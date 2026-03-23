import { Component, EventEmitter, Output, signal } from '@angular/core';
import { VariantClass } from '../../service/models';
import { CommonModule } from '@angular/common';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatFormField } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";

@Component({
  selector: 'app-variant-category-selector',
   templateUrl: './variantcategory.html',
  styleUrl: './variantcategory.scss',
  imports: [CommonModule, MatCardModule, MatIconModule, MatFormField, MatSelectModule]
})
export class VariantCategorySelectorComponent {
  @Output() categorySelected = new EventEmitter<VariantClass>();

  categories: VariantClass[] = [
    'utr5', 'promoter', 'enhancer', 'utr3', 
    'microRna', 'lncRna', 'icr', 'multiGene'
  ];

  selectedCategory: VariantClass | null = null;
  categoryConfirmed = signal(false);

  selectCategory(cat: VariantClass) {
    this.selectedCategory = cat;
    this.confirmCategory(); 
  }

  formatCategoryLabel(cat: VariantClass): string {
    // Converts 'utr5' to '5\' UTR', 'microRna' to 'Micro RNA', etc.
    const labels: Record<VariantClass, string> = {
      utr5: "5' UTR",
      promoter: "Promoter",
      enhancer: "Enhancer",
      utr3: "3' UTR",
      microRna: "microRNA",
      lncRna: "lncRNA",
      icr: "ICR",
      multiGene: "Multi-Gene"
    };
    return labels[cat];
  }

  confirmCategory() {
    if (this.selectedCategory) {
      this.categoryConfirmed.set(true);
      this.categorySelected.emit(this.selectedCategory);
    }
  }

  cancel() {
    this.selectedCategory = null;
    this.categoryConfirmed.set(false);
  }
}