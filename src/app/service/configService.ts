import { inject, Injectable, NgZone, signal } from '@angular/core';
import { CurationEvent, GeneCuration, HgvsVariant, HrmdbqSettings, IntergenicHgvsVariant, NcVariantAssessment, StructuralVariant } from './models';
import { invoke } from '@tauri-apps/api/core';
import { Citation, VariantDto } from './models';
import { listen } from '@tauri-apps/api/event';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private ngZone = inject(NgZone);
  private _settings = signal<HrmdbqSettings | null>(null);
  readonly settings = this._settings.asReadonly();

  
  constructor() {
    this.refreshSettings();
    this.listen_status();
  }

  private async listen_status(): Promise<void> {
    await listen("settings-update", (event) => {
      const updatedSettings = event.payload as HrmdbqSettings;
      console.log("listen_status ", updatedSettings)
      this.ngZone.run(() => {
        this._settings.set(updatedSettings);
      });
    });
  }

  async validateSv(dto: VariantDto): Promise<StructuralVariant> {
    return invoke<StructuralVariant>('validate_structural_variant',
      {variantDto: dto});
  }

  async validateHgvsVariant(symbol: string, hgnc: string, transcript: string, allele: string): Promise<HgvsVariant> {
    return invoke<HgvsVariant>('validate_hgvs_variant',
      {symbol: symbol, 
        hgnc: hgnc,
        transcript: transcript,
        allele: allele});
  }

  async validateIntergenic(symbol: string, hgnc: string, allele: string): Promise<IntergenicHgvsVariant> {
    return invoke<IntergenicHgvsVariant>('validate_intergenic_variant',
      {symbol: symbol, 
        hgnc: hgnc,
        allele: allele});
  }




  async setOrcid(orcid: string) : Promise<void> {
     invoke<null>('set_biocuration_orcid', {orcid: orcid});
  }


  async refreshSettings() {
    try {
      const s = await invoke<HrmdbqSettings>('get_settings');
      this._settings.set(s);
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  }

  getOrcid() {
    return this._settings()?.orcid_id;
  }


  async retrievePmidCitation(pmid: string) : Promise<Citation> {
   return invoke<Citation>('retrieve_pmid_citation', {pmid: pmid});
  }


createCurationEvent(orcid: string): CurationEvent {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;

  return {
    orcid,
    date
  };
}



  async serializeGeneCuration(curation: GeneCuration) : Promise<void> {
     return invoke<void>('serialize_gene_curation', {curation: curation});
  }


}


