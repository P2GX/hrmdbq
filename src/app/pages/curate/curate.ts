import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NcVariant, NcVariantAssessment, NcVariantEvaluation, Pathomechanism, Reporter, VariantClass, VariantKind } from '../../service/models';
import { AddVariantComponent } from '../../addvariant/addvariant.component';
import { NotificationService } from '../../service/notification.service';
import { GeneStepResult, GeneCurationWidget } from '../../widgets/genecuration/genesymbolcuration';
import { VariantCategorySelectorComponent } from "../../widgets/variantcategory/variantcategory";
import { PathomechanismCurationComponent } from "../../widgets/pathomechanismwidget/pathomechanismwidget";
import { ConfigService } from '../../service/configService';
import { CurationService } from '../../service/curation_service';
import { Router } from '@angular/router';
import { ReporterWidgetComponent } from "../../widgets/reporter/reporter";
import { CitationComponent, CitationPacket } from "../../widgets/citationwidget/citation";
import { MatIconModule } from "@angular/material/icon"; 


export interface AddVariantDialogData {
  rowId: string;
  kind: VariantKind;
}






@Component({
  selector: 'app-about',
  imports: [
    CommonModule,
    FormsModule,
    MatDividerModule,
    GeneCurationWidget,
    AddVariantComponent,
    VariantCategorySelectorComponent,
    PathomechanismCurationComponent,
    ReporterWidgetComponent,
    CitationComponent,
    MatIconModule
],
  templateUrl: './curate.html',
  styleUrl: './curate.css'
})
export class CurationWidget implements OnInit {

  readonly VariantKind = VariantKind;
  currentStep = signal(1); 

    // 2. Data collection from steps
  geneData = signal<GeneStepResult | null>(null);
  variantData = signal<NcVariant | null>(null);
  variantClass = signal<VariantClass | null>(null);
  pathomechanism = signal<Pathomechanism | null>(null);
  reporters = signal<Reporter[]>([]);
  cite_packet = signal<CitationPacket | null>(null);



  ngOnInit(): void {
    const activeCuration = this.curationService.currentCuration();
    if (activeCuration) {
      const initialGene: GeneStepResult = {
        symbol: activeCuration.geneData.symbol,
        hgncId: activeCuration.geneData.hgncId,
        maneId: activeCuration.geneData.maneId
      };
      this.geneData.set(initialGene);
      this.currentStep.set(2); 
      this.notificationService.showSuccess(`Initialized workspace for ${initialGene.symbol}`);
    } else {
      this.notificationService.showError("Could not initialize gene curation. Go back to setup page!")
    }
  }

  private notificationService = inject(NotificationService);
   private configService = inject(ConfigService);
   private curationService = inject(CurationService);
   private router = inject(Router);

  onGeneStepComplete(result: GeneStepResult) {
    this.geneData.set(result);
    this.currentStep.set(2); 
    this.notificationService.showSuccess(`Retrieved HGNC data for ${this.geneData()?.symbol}`)
  }

  onVariantStepComplete(variant: NcVariant) {
    this.variantData.set(variant);
    this.currentStep.set(3); 
  }

  onCategoryStepComplete(category: VariantClass) {
    this.variantClass.set(category);
    this.currentStep.set(4);
  }

  onPathomechanismStepComplete(pathomechanism: Pathomechanism): void {
    this.pathomechanism.set(pathomechanism);
    console.log("setting path", pathomechanism);
    this.currentStep.set(5);
  }

  onReporterStepComplete(reporters: Reporter[]): void {
    this.reporters.update(() => reporters);
    this.currentStep.set(6);
  }

  onCitationStepComplete(citePacket: CitationPacket): void {
    this.cite_packet.set(citePacket);
    this.currentStep.set(7);
  }

  resetToStep(step: number) {
    if (step <= 6) this.cite_packet.set(null);
    if (step <= 5) this.reporters.set([]);
    if (step <= 4) this.pathomechanism.set(null);
    if (step <= 3) this.variantClass.set(null);
    if (step <= 2) this.variantData.set(null);
    if (step <= 1) this.geneData.set(null);
    this.currentStep.set(step);
  }

  async onFinalSave() {
    const cat = this.variantClass();
    if (! cat) {
      this.notificationService.showError("Cannot save without variant category");
      return;
    }
    const variant = this.variantData();
    if (! variant) {
       this.notificationService.showError("Cannot save without variant data");
      return;
    }
    const pathomechanism = this.pathomechanism();
    if (! pathomechanism) {
      this.notificationService.showError("Cannot save without variant pathomechanism");
      return;
    }

    const reporter_list = this.reporters(); // allowed to be empty, no check performed
    const citation = this.cite_packet();
    if (! citation ) {
       this.notificationService.showError("Cannot save without citation");
      return;
    }
    const currentOrcid = this.configService.getOrcid();
    if (! currentOrcid) {
         this.notificationService.showError("Cannot save without valid ORCID");
      return;
    }
    const curation = this.configService.createCurationEvent(currentOrcid);

    const annot: NcVariantEvaluation = {
      pathomechanism: pathomechanism,
      reporter: reporter_list,
      citation: citation.citation
    };

    if (citation.cosegregation) {
      annot.cosegregation_evidence = true;
    }
    if (citation.phenotypicEvidence) {
      annot.phenotypic_evidence = true;
    }
    let cmt = citation.comment;
    if (cmt && cmt.length > 0) {
      annot.comment = cmt;
    }

    const ncAssess: NcVariantAssessment = {
      variantCoordinates: variant,
      variantCategory: cat,
      annotations: [annot],
      biocuration: [curation],
    };
    console.log("Adding ncAsses=", ncAssess);
    try {
        await this.curationService.saveVariant(ncAssess);
        this.notificationService.showSuccess("Variant assessment saved.");
        this.router.navigate(["/annots"]);
    } catch (err) {
        this.notificationService.showError(`Save failed: ${err}`);
    }

  }



}
