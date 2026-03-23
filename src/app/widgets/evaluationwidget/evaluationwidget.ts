import { Component, EventEmitter, inject, Output, signal } from "@angular/core";
import { NcVariantEvaluation, Pathomechanism, PATHOMECHANISM_LABELS, Reporter } from "../../service/models";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDividerModule } from "@angular/material/divider";
import { MatIcon } from "@angular/material/icon";
import { MatFormField, MatInputModule, MatLabel } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from '@angular/material/checkbox'; // <--- Import this
import { NotificationService } from "../../service/notification.service";
import { PubmedComponent } from "../pubmed/pubmed.component";
import { Citation } from "../../service/citation";



@Component({
  selector: 'app-evaulation-widget',
  templateUrl: './evaluationwidget.html',
  styleUrl: './evaluationwidget.scss',
    imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatDividerModule,
    MatFormField,
    MatInputModule,
    MatLabel,
    MatIcon,
    MatSelectModule,
    MatButtonToggleModule,
    MatCardModule,
    PubmedComponent
]
})
export class NcEvaluationCurationComponent {



  @Output() evaluationAdded = new EventEmitter<NcVariantEvaluation>();

  private notificationService = inject(NotificationService);

  readonly pathoLabels = PATHOMECHANISM_LABELS;
  pathomechanismOptions = Object.keys(PATHOMECHANISM_LABELS) as Pathomechanism[];

  pathomechanism = signal<Pathomechanism | undefined>(undefined);
  citation = signal<Citation | undefined>(undefined);
  reporters = signal<Reporter[]>([]);
  cosegregation = signal<boolean>(false);
  comment = signal<string | undefined>(undefined);
 

    addReporter() {
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
    }

    submit() {
        if (this.isEvaluationValid()) {
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
        this.evaluationAdded.emit(evaluation as NcVariantEvaluation);
        }
    }



    getPathoLabel(pm: Pathomechanism | undefined) {
        if (! pm) { return 'Unknown Pathomechanism'; }
        return PATHOMECHANISM_LABELS[pm]; 
    }

    cancel() {
        this.pathomechanism.set(undefined);
        this.reporters.set([]);
        this.cosegregation.set(false);
        this.citation.set(undefined);
        this.comment.set(undefined);
    }


  handleNewCitation(cite: Citation) {
    this.citation.set(cite);
  }
}