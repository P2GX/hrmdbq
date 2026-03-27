import { Component, signal } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule, MatDivider } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: "app-root",
  imports: [RouterOutlet,
      RouterModule,
      MatSidenavModule,
      MatListModule,
      MatIconModule,
      MatButtonModule,
      MatDivider
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  isCollapsed = signal(false);

  toggleMenu(): void {
    this.isCollapsed.set(!this.isCollapsed());
  }

}
