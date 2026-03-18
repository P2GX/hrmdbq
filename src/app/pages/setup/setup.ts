import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-about',
  imports: [MatDividerModule, CommonModule],
  templateUrl: './setup.html',
  styleUrl: './setup.css'
})
export class Setup {

  selectedTab = 'introduction';


  async selectTab(tab: string) {
    this.selectedTab = tab;
  }

}
