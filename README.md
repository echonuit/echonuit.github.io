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

Les six captures retenues et leurs légendes vivent dans `index.html`. Elles suivent le parcours
décrit plus haut sur la page : importer, vérifier, déposer, relire les espèces, suivre.

## Les autres sites

- Guide d'utilisation : <https://companion.echonuit.fr>
- Dossier de conception : <https://brief.echonuit.fr>
- Documentation développeur : <https://companion-dev.echonuit.fr>
