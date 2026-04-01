import { Component, computed, inject, input, output, signal } from "@angular/core";
import { Pathomechanism, PATHOMECHANISM_LABELS, VariantClass } from "../../service/models";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDividerModule } from "@angular/material/divider";
import {  MatIconModule } from "@angular/material/icon";
import {  MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from '@angular/material/checkbox'; // <--- Import this
import { NotificationService } from "../../service/notification.service";



export interface PathoGroup {
  label: string;
  icon: string;
  options: Pathomechanism[];
}

@Component({
  selector: 'app-pathomechanism',
  templateUrl: './pathomechanismwidget.html',
  styleUrl: './pathomechanismwidget.scss',
    imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatDividerModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
]
})
export class PathomechanismCurationComponent {
    variantClass = input.required<VariantClass>();
    stepComplete = output<Pathomechanism>();
    activeGroupLabel = computed(() => {
        const vc = this.variantClass();
        if (!vc) return 'General / Protein-level';
        if (vc === 'utr5') return "Translational Control (5' UTR)";
        if (vc === 'utr3' || vc === 'snRna' || vc === 'snoRna') 
            return "RNA Processing & Stability (3' UTR/Introns)";
        if (vc === 'promoter' || vc === 'enhancer' || vc === 'icr') 
            return "Transcriptional Control (Promoters/Enhancers)";
        return 'General / Protein-level';
  });


  private notificationService = inject(NotificationService);

  readonly pathoLabels = PATHOMECHANISM_LABELS;
  pathomechanismOptions = Object.keys(PATHOMECHANISM_LABELS) as Pathomechanism[];

  pathomechanism = signal<Pathomechanism | undefined>(undefined);
  submitted = signal<boolean>(false);

  stepFinished = computed(() => {
   return  !!this.pathomechanism() 
  });
 

  setPathomechanism(pm: Pathomechanism): void {
    this.pathomechanism.set(pm);
    this.submitted.set(true);
    this.stepComplete.emit(pm);
  }

    submit() {
        const pathomechanism = this.pathomechanism();
        if (!pathomechanism) {
            this.notificationService.showError("Could not retrieve pathomechanism");
            return;
        }
        this.submitted.set(true);
        this.stepComplete.emit(pathomechanism);      
    }



    getPathoLabel(pm: Pathomechanism | undefined) {
        if (! pm) { return 'Unknown Pathomechanism'; }
        return PATHOMECHANISM_LABELS[pm]; 
    }

    cancel() {
        this.pathomechanism.set(undefined);
        this.submitted.set(false);
       /* this.reporters.set([]);
        this.cosegregation.set(false);
        this.citation.set(undefined);
        this.comment.set(undefined);*/
    }


 
  pathomechanismLabel(): string {
    let pat = this.pathomechanism();
    if (! pat) return "Unknown";
    const labels: Record<Pathomechanism, string> = {
        lossOfFunction: "Loss of function",
        gainOfFunction: "Gain of function",
        dominantNegative: "Dominant negative",
        reducedTranscription: "Reduced transcription",
        increasedTranscription: "Increased transcriptiom",
        reducedExpression: "Reduced expression",
        increasedExpression: "Increased expression",
        enhancerHijacking: "Enhancer hijacking",
        insulatorLoss: "Insulator loss",
        spliceDefect: "Splice defect",
        mrnaStability: "Altered mRNA stability",
        secondaryStructure: "Altered RNA secondary structure",
        impairedRnaProcessing: "Impaired RNA processing",
        uORFCreation: "uORF creation",
        uORFDisruption: "uORF disruption",
        kozakDisruption: "Kozak sequence disruption",
        reducedTranslation: "Reduced translation",
        increasedTranslation: "Increased translation",
        microRNAbindingSiteDisruption: "miRNA binding site disruption",
        microRNAbindingSiteCreation: "miRNA binding site creation",
        iREdisruption: "iron-responsive element disruption",
        iRESdisruption: "internaql ribosome entry site disruption",
        rBPbindingSiteDisruption: "RNA binding protein site disruption",
        unknown: "Unknown"
    };
   
    return labels[pat];
   
  }



    pathoGroups: PathoGroup[] = [
    {
        label: 'General / Protein-level',
        icon: 'rebase_edit',
        options: ['lossOfFunction', 'gainOfFunction', 'dominantNegative', 'unknown']
    },
    {
        label: 'Transcriptional Control (Promoters/Enhancers)',
        icon: 'settings_input_component',
        options: ['reducedTranscription', 'increasedTranscription', 'reducedExpression', 'increasedExpression', 'enhancerHijacking', 'insulatorLoss']
    },
    {
        label: 'Translational Control (5\' UTR)',
        icon: 'translate',
        options: ['uORFCreation', 'uORFDisruption', 'kozakDisruption', 'reducedTranslation', 'increasedTranslation', 'iRESdisruption']
    },
    {
        label: 'RNA Processing & Stability (3\' UTR/Introns)',
        icon: 'Inventory_2',
        options: ['spliceDefect', 'mrnaStability', 'secondaryStructure', 'impairedRnaProcessing', 'microRNAbindingSiteDisruption', 'microRNAbindingSiteCreation', 'iREdisruption', 'rBPbindingSiteDisruption']
    }
    ];

}