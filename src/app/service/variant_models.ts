
export enum VariantClass {
  Promoter = 'promoter',
  Enhancer = 'enhancer',
  Utr5 = 'utr5',
  Utr3 = 'utr3',
  MicroRNA = 'microRNA',
  LncRNA = 'lncRNA',
  tRNA = 'tRNA',
  SnRNA = 'snRNA',
  SnoRNA = 'snoRNA',
  ICR = 'ICR',
  MultiGene = 'multiGene',
  ThreePrimeFlanking = 'ThreePrimeFlanking',
}

export interface GeneCurationStats {
  geneSymbol: string;
  variantCategoryCounts: Record<VariantClass, number>;
  total: number;
}