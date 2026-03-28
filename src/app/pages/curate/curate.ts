import { Component, inject, signal } from '@angular/core';
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
    ReporterWidgetComponent
],
  templateUrl: './curate.html',
  styleUrl: './curate.css'
})
export class CurationWidget {

  readonly VariantKind = VariantKind;
  currentStep = signal(108); 

    // 2. Data collection from steps
  geneData = signal<GeneStepResult | null>(null);
  variantData = signal<NcVariant | null>(null);
  variantClass = signal<VariantClass | null>(null);
  pathomechanism = signal<Pathomechanism | null>(null);
  reporters = signal<Reporter[]>([]);

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
    this.currentStep.set(5);
  }

  onReporterStepComplete(reporters: Reporter[]): void {
    this.reporters.update(() => reporters);
    this.currentStep.set(6);
  }

  // 4. Reset logic (if user goes back)
  resetToStep(step: number) {
    this.currentStep.set(step);
    if (step === 1) {
      this.geneData.set(null);
      this.variantData.set(null);
       this.variantClass.set(null);
       this.pathomechanism.set(null);
       this.currentStep.set(0);
    } else if (step === 2) {
      this.variantData.set(null);
       this.variantClass.set(null);
       this.pathomechanism.set(null);
        this.currentStep.set(1);
    } else if (step === 3) {
       this.variantClass.set(null);
       this.pathomechanism.set(null);
        this.currentStep.set(2);
    } else if (step === 4) {
      this.pathomechanism.set(null);
       this.currentStep.set(3);
    }
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


    const annot = null; //this.evaluation();
    if (! annot) {
       this.notificationService.showError("Cannot save without variant Evaluation");
      return;
    }
    const currentOrcid = this.configService.getOrcid();
    if (! currentOrcid) {
         this.notificationService.showError("Cannot save without valid ORCID");
      return;
    }
    const curation = this.configService.createCurationEvent(currentOrcid);

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
