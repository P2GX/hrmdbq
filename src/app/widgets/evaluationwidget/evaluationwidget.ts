import { Component, EventEmitter, Output } from "@angular/core";
import { NcVariantEvaluation, Pathomechanism, PATHOMECHANISM_LABELS } from "../../service/models";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDividerModule } from "@angular/material/divider";
import { MatIcon } from "@angular/material/icon";
import { MatFormField, MatInputModule, MatLabel } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";



@Component({
  selector: 'app-evaulation-widget',
  templateUrl: './evaluationwidget.html',
  styleUrl: './evaluationwidget.scss',
    imports: [
    CommonModule,
    FormsModule,
    MatDividerModule,
    MatFormField,
    MatInputModule,
    MatLabel,
    MatIcon,
    MatSelectModule,
    MatButtonToggleModule,
    MatCardModule
]
})
export class NcEvaluationCurationComponent {
cancel() {
throw new Error('Method not implemented.');
}
  @Output() evaluationAdded = new EventEmitter<NcVariantEvaluation>();

  readonly pathoLabels = PATHOMECHANISM_LABELS;
  pathomechanismOptions = Object.keys(PATHOMECHANISM_LABELS) as Pathomechanism[];

  // The work-in-progress evaluation
  evaluation: Partial<NcVariantEvaluation> = {
    reporter: [],
    cosegregation: false,
    comment: ''
  };

  addReporter() {
    this.evaluation.reporter?.push({ assay: 'luciferase', regulation: 'unchanged' });
  }

  removeReporter(index: number) {
    this.evaluation.reporter?.splice(index, 1);
  }

  isEvaluationValid(): boolean {
    return !!(
      this.evaluation.pathomechanism && 
      this.evaluation.citation && 
      this.evaluation.reporter && this.evaluation.reporter.length > 0
    );
  }

  submit() {
    if (this.isEvaluationValid()) {
      this.evaluationAdded.emit(this.evaluation as NcVariantEvaluation);
    }
  }



  getPathoLabel(pm: Pathomechanism) {
    return PATHOMECHANISM_LABELS[pm]; // Using the mapper from previous prompt
  }
}