import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface Msg {
  type: 'success' | 'error';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class NotifyService {
  readonly msg = signal<Msg | null>(null);
  private timer: any;

  success(text: string) {
    this.show({ type: 'success', text });
  }

  error(err: unknown, fallback = 'Une erreur est survenue.') {
    let text = fallback;
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) text = "Impossible de joindre l'API (est-elle démarrée ?).";
      else if (err.error?.message) text = err.error.message;
      else if (err.status === 400 && err.error?.errors) text = 'Données invalides : vérifiez le formulaire.';
      else if (err.status === 404) text = 'Élément introuvable.';
    }
    this.show({ type: 'error', text });
  }

  clear() {
    this.msg.set(null);
  }

  private show(m: Msg) {
    this.msg.set(m);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.msg.set(null), 5000);
  }
}
