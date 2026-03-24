import { Component, computed, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { CurationService } from '../../service/curation_service'; 
import { NcVariant, NcVariantAssessment } from '../../service/models';
import { MatIconModule } from "@angular/material/icon";
import { ConfigService } from '../../service/configService';
@Component({
  selector: 'app-about',
  imports: [
    CommonModule,
    MatDividerModule,
    MatTableModule,
    MatIconModule
],
  templateUrl: './annotations.html',
  styleUrl: './annotations.css'
})
export class AnnotationTable {

    public curationService = inject(CurationService);
    private configService = inject(ConfigService);

    displayedColumns: string[] = ['label', 'category', 'symbol', 'curator'];

  // Create a reactive data source for the Material Table
  dataSource = computed(() => {
    return new MatTableDataSource<NcVariantAssessment>(this.curationService.variants());
  });

  /**
   * Helper to extract a display label from the variant enum
   */
  getVariantLabel(variant: NcVariant): string {
    if ('hgvs' in variant) return variant.hgvs.hgvs;
    if ('structural' in variant) return variant.structural.label;
    if ('intergenic' in variant) return variant.intergenic.gHgvs;
    return 'Unknown Variant';
  }

  /**
   * Helper to get the gene symbol safely
   */
  getGeneSymbol(variant: NcVariant): string {
    if ('hgvs' in variant) return variant.hgvs.symbol;
    if ('structural' in variant) return variant.structural.geneSymbol;
    if ('intergenic' in variant) return variant.intergenic.symbol || 'n/a';
    return "n/a"  
  }

   
  exportData(): void {
    const variants = this.curationService.variants();
    this.configService.serializeVariantAssessments(variants);
  }

}
