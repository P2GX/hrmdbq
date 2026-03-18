import { Component, computed, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { VariantService } from '../../service/variant.service';
import { NcVariant, NcVariantAssessment } from '../../service/models';
@Component({
  selector: 'app-about',
  imports: [
    CommonModule,
    MatDividerModule,
    MatTableModule
  ],
  templateUrl: './annotations.html',
  styleUrl: './annotations.css'
})
export class AnnotationTable {

    public variantService = inject(VariantService);

    displayedColumns: string[] = ['label', 'category', 'symbol', 'curator'];

  // Create a reactive data source for the Material Table
  dataSource = computed(() => {
    return new MatTableDataSource<NcVariantAssessment>(this.variantService.variants());
  });

  /**
   * Helper to extract a display label from the variant enum
   */
  getVariantLabel(variant: NcVariant): string {
    if (variant.hgvs) return variant.hgvs.hgvs;
    if (variant.structural) return variant.structural.label;
    if (variant.intergenic) return variant.intergenic.gHgvs;
    return 'Unknown Variant';
  }

  /**
   * Helper to get the gene symbol safely
   */
  getGeneSymbol(variant: NcVariant): string {
    return variant.hgvs?.symbol || 
           variant.structural?.geneSymbol || 
           variant.intergenic?.symbol || 
           'N/A';
  }

   

}
