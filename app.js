/* Bouton de téléchargement : détecte le système du visiteur et pointe DIRECTEMENT le bon
   fichier de la dernière version publiée.
 *
 * Pourquoi une requête à l'API plutôt qu'un lien fixe : une version publie 14 artefacts, et
 * GitHub n'offre pas d'URL « dernière version » qui accepte un nom de fichier versionné. On lit
 * donc la dernière release et on y cherche l'artefact du système détecté.
 *
 * Dégradation : si la détection ou la requête échoue, le bouton garde son lien d'origine vers la
 * page des versions. L'utilisateur n'est jamais bloqué. */

(function () {
  "use strict";

  var DEPOT = "echonuit/vigiechiro-pr-companion";

  // Un système = un libellé + comment reconnaître SON artefact parmi les 14.
  var SYSTEMES = {
    windows: { libelle: "Windows", motif: /-x64\.msi$/i },
    macos:   { libelle: "macOS",   motif: /-arm64\.dmg$/i },
    linux:   { libelle: "Linux",   motif: /\.AppImage$/i }
  };

  function detecterSysteme() {
    var plateforme =
      (navigator.userAgentData && navigator.userAgentData.platform) ||
      navigator.platform ||
      navigator.userAgent ||
      "";
    var ua = (plateforme + " " + navigator.userAgent).toLowerCase();

    // Android et iOS d'abord : leur UA contient « linux » / « mac », on les écarte
    // explicitement car aucun artefact de bureau ne leur convient.
    if (/android|iphone|ipad|ipod/.test(ua)) return null;
    if (/win/.test(ua)) return "windows";
    if (/mac/.test(ua)) return "macos";
    if (/linux|x11|ubuntu|fedora|debian/.test(ua)) return "linux";
    return null;
  }

  var bouton = document.getElementById("btn-telecharger");
  var libelle = document.getElementById("btn-libelle");
  var note = document.getElementById("version-note");
  if (!bouton || !libelle) return;

  var cle = detecterSysteme();

  // Sans système reconnu (mobile, navigateur exotique), on annonce la page des versions
  // plutôt qu'un fichier qui ne s'installerait pas.
  if (!cle) {
    libelle.textContent = "Voir les téléchargements";
    return;
  }

  var systeme = SYSTEMES[cle];
  libelle.textContent = "Télécharger pour " + systeme.libelle;

  fetch("https://api.github.com/repos/" + DEPOT + "/releases/latest", {
    headers: { Accept: "application/vnd.github+json" }
  })
    .then(function (reponse) {
      if (!reponse.ok) throw new Error("HTTP " + reponse.status);
      return reponse.json();
    })
    .then(function (release) {
      var artefacts = release.assets || [];
      var trouve = null;
      for (var i = 0; i < artefacts.length; i++) {
        if (systeme.motif.test(artefacts[i].name)) { trouve = artefacts[i]; break; }
      }
      if (!trouve) return; // on garde le lien vers la page des versions

      bouton.href = trouve.browser_download_url;
      var version = (release.tag_name || "").replace(/^v/, "");
      if (version) {
        libelle.textContent = "Télécharger pour " + systeme.libelle + " " + version;
      }
      if (note) {
        var poids = Math.round((trouve.size || 0) / 1048576);
        note.textContent =
          "Gratuit et open source, sous licence GPLv3" + (poids ? " - " + poids + " Mo." : ".");
      }
    })
    .catch(function () {
      /* Silencieux : le lien par défaut vers la page des versions reste valable. */
    });
})();

/* Visionneuse de la galerie : agrandit une capture par-dessus la page.
 *
 * Les vignettes sont d'abord des LIENS vers l'image. Sans JavaScript, ou si <dialog> n'est pas
 * géré, le clic ouvre donc l'image normalement : personne ne se retrouve devant une vignette
 * morte. Le script ne fait qu'intercepter ce clic quand il peut faire mieux.
 *
 * <dialog>.showModal() apporte gratuitement ce qu'une visionneuse maison réimplémente mal :
 * fermeture par Échap, piège à focus, retour du focus sur la vignette d'origine, et inertie du
 * reste de la page pour les lecteurs d'écran. */
(function () {
  "use strict";

  var boite = document.getElementById("visionneuse");
  var image = document.getElementById("visionneuse-image");
  var legende = document.getElementById("visionneuse-legende");
  if (!boite || !image || !legende || typeof boite.showModal !== "function") return;

  var vignettes = document.querySelectorAll(".vignette");

  for (var i = 0; i < vignettes.length; i++) {
    vignettes[i].addEventListener("click", function (evenement) {
      // Clic milieu, Ctrl/Cmd+clic : l'usage attendu est d'ouvrir dans un onglet, on n'intercepte pas.
      if (evenement.metaKey || evenement.ctrlKey || evenement.shiftKey || evenement.button !== 0) return;
      evenement.preventDefault();
      var vignette = evenement.currentTarget;
      var source = vignette.querySelector("img");
      image.src = vignette.getAttribute("href");
      image.alt = source ? source.alt : "";
      legende.textContent = vignette.getAttribute("data-legende") || "";
      boite.showModal();
    });
  }

  // Clic hors de l'image : le <dialog> occupe toute la zone, on ne ferme donc que si le clic
  // tombe sur le fond (l'élément dialog lui-même) et non sur l'image ou la légende.
  boite.addEventListener("click", function (evenement) {
    if (evenement.target === boite) boite.close();
  });

  // Libère la mémoire de l'image affichée, et évite qu'elle réapparaisse au prochain clic
  // avant le chargement de la suivante.
  boite.addEventListener("close", function () {
    image.removeAttribute("src");
    image.alt = "";
  });
})();
