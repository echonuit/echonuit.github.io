# echonuit.fr

Page d'accueil du projet **VigieChiro Companion**, publiée sur GitHub Pages à l'adresse
<https://echonuit.fr>.

Site statique, sans dépendance : `index.html`, `style.css`, `app.js` et `assets/`.
Le bouton de téléchargement détecte le système du visiteur et pointe l'artefact correspondant
de la dernière version publiée (via l'API GitHub, avec repli sur la page des versions).

Les visuels proviennent du dépôt du produit
([echonuit/vigiechiro-pr-companion](https://github.com/echonuit/vigiechiro-pr-companion)).

## Mettre à jour les captures d'écran

Les captures affichées sur la page sont celles de `.github/assets/` du dépôt du produit, où la CI
les régénère à chaque évolution des écrans. Elles sont converties en **WebP sans perte**, qui les
allège d'environ un tiers sans toucher au texte des interfaces (le lossy le rendrait flou) :

```bash
convert ../vigiechiro-pr-companion/.github/assets/apercu-<ecran>.png \
        -define webp:lossless=true assets/apercu-<ecran>.webp
```

Les captures retenues et leurs légendes vivent dans `index.html` : l'écran d'accueil en pleine
largeur, puis la galerie de vignettes qui suit le parcours décrit plus haut sur la page (importer,
vérifier, déposer, relire les espèces, explorer, suivre).

## Incrémenter `?v=` en modifiant le CSS ou le JS

`index.html` charge `style.css?v=<date>` et `app.js?v=<date>`. **Ce jeton est à changer à chaque
modification de l'un ou de l'autre.**

GitHub Pages sert le HTML, le CSS et le JS avec des caches indépendants de dix minutes. Sans jeton,
un visiteur qui revient dans cette fenêtre reçoit le **nouveau HTML avec l'ancienne feuille de
style**, et voit une mise en page cassée sans avoir aucune raison de soupçonner un cache. C'est
arrivé le 2026-07-22 sur la galerie : elle s'affichait en une colonne, avec les légendes centrées.

## La typographie est tenue par un garde

`.github/scripts/verifie-typographie.sh` refuse le tiret cadratin, le demi-cadratin et l'apostrophe
courbe dans les fichiers texte versionnés, à tolérance zéro, comme le dépôt de l'application le fait
chez lui. Le workflow `Typographie` le lance à chaque poussée et chaque demande de fusion.

Il joue d'abord son auto-test, sur deux cas dont un qui doit refuser : un garde qui a cessé de
détecter reste vert, et ce vert est indiscernable d'un dépôt propre.

Ce qu'il ne lit pas : `LICENSE`, texte tiers que ce dépôt ne réécrit pas, `CNAME`, qui ne porte
qu'un nom de domaine, et les binaires. Son verdict affiche le nombre de fichiers lus, pour qu'un
ciblage manqué ne passe pas pour un succès.

Pour le lancer à la main :

```bash
./.github/scripts/verifie-typographie.sh --auto-test
./.github/scripts/verifie-typographie.sh
```

## Les autres sites

- Guide d'utilisation : <https://companion.echonuit.fr>
- Dossier de conception : <https://brief.echonuit.fr>
- Documentation développeur : <https://companion-dev.echonuit.fr>
