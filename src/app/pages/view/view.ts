import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Citation, CitationEntry, CurationEvent, HgvsVariant, IntergenicHgvsVariant, NcVariantAssessment, Pathomechanism, StructuralVariant, VariantClass, VariantKind } from '../../service/models';
import { NotificationService } from '../../service/notification.service';
import { ConfigService } from '../../service/configService';
import { CurationService } from '../../service/curation_service';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card"; 


export interface AddVariantDialogData {
  rowId: string;
  kind: VariantKind;
}


export interface VariantDisplay {
  valid: boolean,
  id: string,
  kind: string,
  label: string,
  symbol: string,
  hgnc: string,
  hgncUrl: string,
  transcript: string,
  category: string;
  attributes: Record<string,string>;
  pathomechanisms: string[],
  alias: null|String,
  citations: CitationEntry[],
  biocuration: CurationEvent[]
}

function defaultVariantDisplay(): VariantDisplay {
  const dd: VariantDisplay = {
    valid: false,
    id: '',
    kind: '',
    label: '',
    symbol: '',
    hgnc: '',
    hgncUrl: '',
    transcript: '',
    category: '',
    attributes: {},
    pathomechanisms: [],
    alias: null,
    citations: [],
    biocuration: []
  };
  return dd;
}



@Component({
  selector: 'app-about',
  imports: [
    CommonModule,
    FormsModule,
    MatDividerModule,
    MatIconModule,
    MatCardModule
],
  templateUrl: './view.html',
  styleUrl: './view.scss'
})
export class ViewWidget implements OnInit {

  private curationService = inject(CurationService);
  private notificationService = inject(NotificationService);
  private configService = inject(ConfigService);
  private route = inject(ActivatedRoute);
  isEditMode = signal(false);
  editingId = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

   ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.variant.set(this.curationService.editingVariant()); 
    if (!id) {
        this.errorMessage.set(`Variant ${id} not found.`)
      return;
    } 
    
  }

  variant = signal<NcVariantAssessment | null>(null);
  readonly activeGene = computed(() => 
      this.curationService.currentCuration()?.geneData
  );
  activeGeneData = computed(() => {
      const gene = this.activeGene();
      if (! gene) return undefined;
      console.log("active gene", gene);
      const gdata = {
        symbol: gene.symbol,
        hgnc: gene.hgncId,
        hgncUrl: `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${gene.hgncId}`,
        transcript: gene.maneId,
      };
      return gdata;
    });
   
  display = computed(() => {
    let ddata =defaultVariantDisplay();
    const v = this.variant();
    if (!v) {
      return ddata;
    }
    const gene = this.activeGeneData();
    if (! gene) {
      return ddata;
    }
    ddata.id = v.id;
    ddata.category = v.variantCategory;
    ddata.symbol = gene.symbol;
    ddata.hgnc = gene.hgnc;
    ddata.hgncUrl = gene.hgnc;
    ddata.transcript = gene.transcript;
    v.pathomechanisms.forEach(p => {ddata.pathomechanisms.push(p); });
    v.citation.forEach(c => { ddata.citations.push(c); });
    if (v.alias) {
      ddata.alias = v.alias;
    }

    if (v.variantCoordinates && 'hgvs' in v.variantCoordinates) {
      console.log("HGVS",v);
      const h = v.variantCoordinates.hgvs as HgvsVariant;
      ddata.kind = 'HGVS';
      ddata.attributes['Assembly'] = h.assembly;
      ddata.attributes['Position'] = String(h.position);
      ddata.attributes['Chr'] = h.chr;
      ddata.attributes['var'] = `${h.refAllele} → ${h.altAllele}`;
      ddata.attributes['HGVS (c.)'] = h.hgvs;
      ddata.label = h.hgvs;
      ddata.attributes['HGVS (g.)'] = h.gHgvs ;
      if (h.pHgvs) {
        ddata.attributes[ 'HGVS (p.)'] = h.pHgvs;
      }
    } else  if (v.variantCoordinates && 'structural' in v.variantCoordinates) {
      const s = v.variantCoordinates.structural as StructuralVariant;
      ddata.kind = 'structural';
      ddata.label = s.label;
      ddata.attributes['SV type'] =  s.svType;
      ddata.attributes['Chromosome'] = s.chromosome;
    }
    if (v.variantCoordinates && 'intergenic' in v.variantCoordinates) {
        const i = v.variantCoordinates.intergenic as IntergenicHgvsVariant;
        console.log("i=", i);
        ddata.kind = 'intergenic';
        ddata.label = i.gHgvs;
        ddata.attributes['Assembly'] = i.assembly;
        ddata.attributes['Position'] = String(i.position);
        ddata.attributes['Chr'] = i.chr;
        ddata.attributes['var'] = `${i.refAllele} → ${i.altAllele}`; 
    }   
    return ddata;
  });

  
}