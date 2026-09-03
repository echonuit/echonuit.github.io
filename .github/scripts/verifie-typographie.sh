#!/usr/bin/env bash
#
# Refuse le tiret cadratin, le demi-cadratin et l'apostrophe courbe dans les fichiers texte du dépôt.
#
# Pourquoi ici. La page d'accueil du domaine est la première chose qu'un visiteur lit, et sa prose
# n'était tenue par rien : #6 a retiré six cadratins des légendes de la visionneuse, et rien
# n'empêchait le septième. Le dépôt de l'application tient la même règle par deux gardes à tolérance
# zéro ; celui-ci en est l'équivalent minimal, pour un dépôt qui n'a pas d'autre CI.
#
# La mesure d'ouverture, le 2026-09-03 : zéro occurrence sur tous les fichiers texte versionnés,
# `LICENSE` comprise. Ce garde gèle un état propre, il n'ouvre pas une dette.
#
# Ce qu'il lit : les fichiers versionnés d'extension html, css, js, md, txt, yml, yaml et json.
# Ce qu'il ne lit pas, et pourquoi : `LICENSE`, texte tiers que ce dépôt ne réécrit pas ; `CNAME`,
# qui ne porte qu'un nom de domaine ; les binaires. Le compte des `lus` que le verdict affiche est
# celui du parcours réel, pour qu'un ciblage manqué ne passe pas pour un succès.
#
# Usage : verifie-typographie.sh              juge le dépôt
#         verifie-typographie.sh --auto-test  éprouve le garde sur deux cas au verdict connu
set -euo pipefail
export LC_ALL=C.UTF-8

# Les glyphes se CONSTRUISENT plutôt que de s'écrire : sans cela, ce fichier porterait le motif
# qu'il refuse, et se compterait lui-même au premier balayage.
CADRATIN=$(printf '—')
DEMI_CADRATIN=$(printf '–')
APOSTROPHE_COURBE=$(printf '’')
readonly MOTIF="[${CADRATIN}${DEMI_CADRATIN}${APOSTROPHE_COURBE}]"

# Ce script s'exclut de son propre corpus : il porte les glyphes par construction.
readonly MOI=".github/scripts/verifie-typographie.sh"

# Les fichiers que ce garde LIT. Extraits pour que le compte des `lus` soit celui du parcours réel :
# un ciblage manqué rendrait zéro défaut sur zéro fichier, et ce zéro passerait pour un succès.
fichiers() {
    if [ -n "${TYPO_RACINE-}" ]; then
        find "${TYPO_RACINE}" -type f
        return
    fi
    git ls-files -- '*.html' '*.css' '*.js' '*.md' '*.txt' '*.yml' '*.yaml' '*.json' \
        | grep -vx "${MOI}" || true
}

juge() {
    local lus=0 porteurs=0 fichier
    while IFS= read -r fichier; do
        [ -f "${fichier}" ] || continue
        lus=$((lus + 1))
        if grep -n "${MOTIF}" "${fichier}"; then
            porteurs=$((porteurs + 1))
        fi
    done < <(fichiers)

    if [ "${porteurs}" != 0 ]; then
        echo
        echo "TYPOGRAPHIE | lus=${lus} | porteurs=${porteurs} | verdict=refus" >&2
        echo "Écrivez un deux-points, une virgule ou un tiret simple ; l'apostrophe est l'ASCII." >&2
        return 1
    fi
    echo "TYPOGRAPHIE | lus=${lus} | porteurs=0 | verdict=ok"
}

BAC=""
nettoie() { [ -n "${BAC}" ] && rm -rf "${BAC}"; }

auto_test() {
    local echecs=0
    BAC=$(mktemp -d)
    trap nettoie EXIT
    local bac="${BAC}"

    printf 'un titre %s une explication\n' "${CADRATIN}" > "${bac}/porteur.html"
    if TYPO_RACINE="${bac}" juge > /dev/null 2>&1; then
        echo "  KO  un fichier porteur du cadratin aurait du etre REFUSE"
        echecs=1
    else
        echo "  OK  un fichier porteur du cadratin est refuse"
    fi

    rm -f "${bac}/porteur.html"
    printf "un titre : une explication, avec l'apostrophe droite\n" > "${bac}/propre.html"
    if TYPO_RACINE="${bac}" juge > /dev/null 2>&1; then
        echo "  OK  un fichier propre est accepte"
    else
        echo "  KO  un fichier propre aurait du etre ACCEPTE"
        echecs=1
    fi

    if [ "${echecs}" != 0 ]; then
        echo "Auto-test en echec : ce garde ne juge pas ce qu il pretend juger." >&2
        return 1
    fi
    echo "Auto-test concluant : 2 cas, dont 1 qui DOIT refuser."
}

if [ "${1-}" = "--auto-test" ]; then
    auto_test
else
    juge
fi
