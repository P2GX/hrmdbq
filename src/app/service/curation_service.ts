import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { GeneCuration, GeneCurationFile, GeneNote, HgncBundle, NcVariantAssessment, WebResource } from './models';
import { NotificationService } from './notification.service';


@Injectable({
  providedIn: 'root'
})
export class CurationService {
  private ngZone = inject(NgZone);
  private notificationService = inject(NotificationService);

  private _curationDirectory = signal<string>('');
  readonly curationDirectory = this._curationDirectory.asReadonly();
  private _curationFileList = signal<GeneCurationFile[]>([]);
  readonly curationFileList = this._curationFileList.asReadonly();

  private _currentCuration = signal<GeneCuration | null>(null);
  readonly currentCuration = this._currentCuration.asReadonly();

  private _hasUnsavedChanges = signal<boolean>(false);
  readonly hasUnsavedChanges = this._hasUnsavedChanges.asReadonly();

  clearChanges(): void {
    this._hasUnsavedChanges.set(false);
  }

  // 4. Helper Computeds
  readonly isGeneLoaded = computed(() => !!this._currentCuration());
  readonly activeSymbol = computed(() => this._currentCuration()?.geneData.symbol ?? '');
  readonly variants = computed(() => this._currentCuration()?.annotations ?? []);

 

  readonly fileName = computed(() => {
    const path = this._curationDirectory();
    return path ? path.split(/[/\\]/).pop() : '';
    });

  // 3. Computed signals (Optional, e.g., for a counter)
  readonly count = computed(() => this.variants().length);

  constructor() {}

  async initialize() {
    try {
      // Just fetch settings first to see if a file path already exists
      const settings = await invoke<any>('get_settings');
      if (settings.curation_file) {
        this._curationDirectory.set(settings.curation_file);
        this.loadCurationFileList();
      }
    } catch (err) {
      console.error('Auto-load failed:', err);
    }
  }

  async loadCurationFileList() {
    const directory = this.curationDirectory();
    if (!directory) return;
    try {
      const files = await invoke<GeneCurationFile[]>('get_gene_curation_list', { 
        directory: directory 
      });
      this._curationFileList.set([...files]);
      this.notificationService.showSuccess(`Loaded ${files.length} curation files.`);
    } catch (err) {
      this.notificationService.showError(`Error scanning directory: ${err}`);
    }
  }


 
  async selectCurationDirectory() {
    try {
      const response = await invoke<{evaluations: GeneCurationFile[], path: string}>('select_curation_directory');
      const curation_files = response.evaluations;
      const curation_dir = response.path;
      this._curationFileList.set([...curation_files]);
      this._curationDirectory.set(curation_dir);
      this.loadCurationFileList();
    } catch (err) {
      this.notificationService.showError(`Failed to load curation directory: ${err}.`);
    }
   
  }

    async loadCurationFile(symbol: string): Promise<boolean> {
      try {
        const gc = await invoke<GeneCuration>('load_gene_curation_file', {symbol:symbol});
        this._currentCuration.set(gc);
        return true;
      } catch (err) {
        console.error('Failed to load file:', err);
        return false;
      }
    }

    async saveVariant(assess: NcVariantAssessment) {
      try {
        const newVariantList = await invoke<NcVariantAssessment[]>('add_nc_variant_assessment', { assess });
        this._currentCuration.update(current => {
          if (!current) return null;
          return {
            ...current,           
            annotations: newVariantList 
          };
        });
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    }

  async createGeneCuration(symbol: string, hgnc: HgncBundle): Promise<boolean> {
    try {
      const geneCuration = await invoke<GeneCuration>('create_gene_curation', {symbol: symbol, hgnc: hgnc});
      this._currentCuration.set(geneCuration);
      return true;
    } catch(err) {
       this.notificationService.showError(`Could not create gene curation: ${err}.`);
    }
    return false;
  }

  /**
   * Persists the entire current state to the file system.
   */
  async saveActiveCurationToDisk() {
    const data = this._currentCuration();
    if (!data) return;

    try {
      // Assuming your Rust command takes the whole object
      await invoke('save_gene_curation_file', { curation: data });
      
      this._hasUnsavedChanges.set(false); // Reset dirty flag
      this.notificationService.showSuccess(`Saved ${data.geneData.symbol} to disk.`);
    } catch (err) {
      this.notificationService.showError(`Save failed: ${err}`);
    }
  }

  addWebResource(name: string, url: string) {
    this._currentCuration.update(current => {
      if (!current) return null;
      const newResource: WebResource = { name, url };
      return {
        ...current,
        webResources: [...(current.webResources || []), newResource]
      };
    });
    console.log("service addWebResource name=", name, "n=", this.currentCuration()?.webResources.length);
    const cc = this.currentCuration();
    console.log(cc);
    this._hasUnsavedChanges.set(true);
  }

  addGeneNote(title: string, content: string) {
    this._currentCuration.update(current => {
      if (!current) return null;
      
      const newNote: GeneNote = {
        id: crypto.randomUUID(), 
        title: title,
        content: content,
        dateModified: new Date().toISOString()
      };

      return {
        ...current,
        notes: [...(current.notes || []), newNote]
      };
    });
    this._hasUnsavedChanges.set(true);
  }

  /** Removes a web resource by matching its unique URL */
  removeWebResource(url: string) {
    this._currentCuration.update(current => {
      if (!current) return null;
      return {
        ...current,
        webResources: current.webResources.filter(res => res.url !== url)
      };
    });
    this._hasUnsavedChanges.set(true);
  }

  /** Removes a note by its unique ID */
  removeGeneNote(id: string) {
    this._currentCuration.update(current => {
      if (!current) return null;
      return {
        ...current,
        notes: current.notes.filter(note => note.id !== id)
      };
    });
    this._hasUnsavedChanges.set(true);
  }


  // Helper to clear state if needed
  clear() {
     this.ngZone.run(() => {
        //this._variants.set([]);
      });
  }
}