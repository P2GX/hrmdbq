import { Component, computed, inject, input, output, signal } from "@angular/core";
import { NcVariantEvaluation, Pathomechanism, PATHOMECHANISM_LABELS, Reporter, VariantClass } from "../../service/models";
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
import { PubmedComponent } from "../pubmed/pubmed.component";
import { Citation } from "../../service/citation";
import { single } from "rxjs";


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
  //citation = signal<Citation | undefined>(undefined);
  //reporters = signal<Reporter[]>([]);
  //cosegregation = signal<boolean>(false);
  //comment = signal<string | undefined>(undefined);
  //submitted = signal<boolean>(false);

  stepFinished = computed(() => {
   return  !!this.pathomechanism() 
  });
 

  /*  addReporter() {
        // Use .update() to create a new array with the new object appended
        this.reporters.update(currentReporters => [
            ...currentReporters, 
            { assay: 'luciferase', regulation: 'unchanged' }
        ]);
    }

    removeReporter(index: number) {
        this.reporters.update(currentReporters => 
            currentReporters.filter((_, i) => i !== index)
        );
    }

    isEvaluationValid(): boolean {
        return !!(this.pathomechanism() && this.citation());
    }*/

    submit() {
        const pathomechanism = this.pathomechanism();
            if (!pathomechanism) {
                this.notificationService.showError("Could not retrieve pathomechanism");
                return;
            }
        /*
        if (this.isEvaluationValid()) {
            this.submitted.set(true);
            const pathomechanism = this.pathomechanism();
            if (!pathomechanism) {
                this.notificationService.showError("Could not retrieve pathomechanism");
                return;
            }
            const citation = this.citation();
            if (! citation) {
                this.notificationService.showError("Could not retrieve citation");
                return;
            }
            const coseg = this.cosegregation();
            const comment = this.comment();


            const evaluation: NcVariantEvaluation = {
                pathomechanism: pathomechanism,
                reporter: this.reporters(),
                cosegregation: coseg,
                citation: citation
            };
            if (comment) {
                evaluation.comment = comment;
            }
                */
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


 /* handleNewCitation(cite: Citation) {
    this.citation.set(cite);
  }*/



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