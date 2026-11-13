import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotifyService } from './core/notify.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="nav">
      <strong>MiniProjet</strong>
      <a routerLink="/clients" routerLinkActive="active">Clients</a>
      <a routerLink="/produits" routerLinkActive="active">Produits</a>
      <a routerLink="/commandes" routerLinkActive="active">Commandes</a>
    </header>
    <main class="container">
      @if (notify.msg(); as m) {
        <div class="alert" [class.ok]="m.type === 'success'" [class.ko]="m.type === 'error'">
          {{ m.text }}
          <button class="close" (click)="notify.clear()">×</button>
        </div>
      }
      <router-outlet />
    </main>
  `,
})
export class App {
  notify = inject(NotifyService);
}
