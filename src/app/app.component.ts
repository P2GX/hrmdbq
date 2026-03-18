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

  greetingMessage = "";

  annotationCount: number = 0;

  greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    invoke<string>("greet", { name }).then((text) => {
      this.greetingMessage = text;
    });
  }

  getAnnotationCount(event: Event): void {
     event.preventDefault();
     invoke<number>("get_annot_count").then((n) => {
      this.annotationCount = n;
     })

  }

  toggleMenu(): void {
    this.isCollapsed.set(!this.isCollapsed());
  }



}
