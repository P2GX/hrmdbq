import { Component, computed, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { Reporter, ReporterAssay, ReporterRegulation } from "../../service/models";
import { MatListModule } from "@angular/material/list";



@Component({
  selector: 'app-reporter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatListModule
],
  templateUrl: './reporter.html',
  styleUrl: './reporter.scss'
})
export class ReporterWidgetComponent {

    stepComplete = output<Reporter[]>();
    submitted = signal<boolean>(false);
    private readonly DEFAULT_ASSAYS = ['luciferase', 'qpcr', 'emsa', 'westernBlot', 'splicing', 'clinicalRna', 'clinicalProtein', 'clinicalEnzymeActivity'];
    reporters = signal<Reporter[]>(
        this.DEFAULT_ASSAYS.map(assay => ({ assay, regulation: 'unchanged' } as Reporter))
    );
    experimentalAssays: ReporterAssay[] = ['luciferase', 'qpcr', 'emsa', 'westernBlot', 'splicing'];
    clinicalAssays: ReporterAssay[] = ['clinicalRna', 'clinicalProtein', 'clinicalEnzymeActivity'];
    hasAnyData = computed(() => 
        this.reporters().some(r => r.regulation !== 'unchanged')
    );

    getReporter(assay: ReporterAssay) {
        return this.reporters().find(r => r.assay === assay) || { assay, regulation: 'unchanged' };
    }

    getDisplayLabel(assay: ReporterAssay): string {
        const labels: Record<ReporterAssay, string> = {
            luciferase: 'Luciferase',
            qpcr: 'qPCR',
            emsa: 'EMSA',
            westernBlot: 'Western',
            splicing: 'Splicing',
            clinicalRna: 'RNA Study',
            clinicalProtein: 'Protein Study',
            clinicalEnzymeActivity: 'Enzyme Act.'
        };
        return labels[assay];
    }

    setReg(assay: ReporterAssay, reg: ReporterRegulation) {
        this.reporters.update(list => 
            list.map(r => r.assay === assay ? { ...r, regulation: reg } : r)
        );
        this.stepComplete.emit(this.reporters());
    }

   
    submit() {
        const activeReporters = this.reporters().filter(
            rep => rep.regulation !== 'unchanged'
        );
        this.submitted.set(true);
        this.stepComplete.emit(activeReporters);
    }

    reset() {
         this.submitted.set(false);
        this.reporters.update(list => list.map(r => ({...r, regulation: 'unchanged'})));
    }
}