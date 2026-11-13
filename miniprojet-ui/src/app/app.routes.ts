import { Routes } from '@angular/router';
import { ClientsList } from './pages/clients-list';
import { ClientForm } from './pages/client-form';
import { ProduitsList } from './pages/produits-list';
import { ProduitForm } from './pages/produit-form';
import { CommandesList } from './pages/commandes-list';
import { CommandeForm } from './pages/commande-form';
import { CommandeDetail } from './pages/commande-detail';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'clients' },
  { path: 'clients', component: ClientsList },
  { path: 'clients/new', component: ClientForm },
  { path: 'clients/:id/edit', component: ClientForm },
  { path: 'produits', component: ProduitsList },
  { path: 'produits/new', component: ProduitForm },
  { path: 'produits/:id/edit', component: ProduitForm },
  { path: 'commandes', component: CommandesList },
  { path: 'commandes/new', component: CommandeForm },
  { path: 'commandes/:id/edit', component: CommandeForm },
  { path: 'commandes/:id', component: CommandeDetail },
  { path: '**', redirectTo: 'clients' },
];
