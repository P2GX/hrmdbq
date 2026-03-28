import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
@Component({
  selector: 'app-about',
  imports: [MatDividerModule, CommonModule, MatIconModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {



}
