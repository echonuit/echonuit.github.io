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
