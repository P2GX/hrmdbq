import { Component, inject } from '@angular/core';
import { CurationService } from '../../service/curation_service';

@Component({
  selector: 'app-variant-list',
  templateUrl: './variantlist.html',
  styleUrl: './variantlist.scss'
})
export class VariantListComponent {
  // Inject the service
  private curationService = inject(CurationService);

  // Expose the signal to the template
  variants = this.curationService.variants;
  totalCount = this.curationService.count;

  async onSelectFile() {
    await this.curationService.loadCurationFile();
  }
}