# MiniProjet – Front-end Angular

## Lancer
1. Démarrer l'API .NET (profil `https`, https://localhost:7182).
2. Dans ce dossier :
   ```
   npm install
   npm start
   ```
3. Ouvrir http://localhost:4200

L'API n'active pas CORS : `proxy.conf.json` redirige `/api/*` vers `https://localhost:7182`.
Si l'API tourne sur un autre port, modifier `target` dans ce fichier.

## Pages
/clients, /clients/new, /clients/:id/edit, /produits, /produits/new, /produits/:id/edit,
/commandes, /commandes/new, /commandes/:id/edit, /commandes/:id (détail)
