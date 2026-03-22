import { Injectable } from '@angular/core';
import { HgvsVariant, IntergenicHgvsVariant, NcVariantEvaluation, StructuralVariant } from './models';
import { invoke } from '@tauri-apps/api/core';
import { VariantDto } from './models';



@Injectable({
  providedIn: 'root'
})
export class ConfigService {
 

  
  constructor() {}

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


  async loadFile(): Promise<NcVariantEvaluation[]> {
      return invoke<NcVariantEvaluation[]>('select_curation_file');
  }




}