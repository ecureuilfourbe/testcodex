# Le Carnaval du Chien Voltigeur

Un mini-jeu de plateforme en HTML5/Canvas mettant en scène **Samba**, un chien acrobate qui doit récupérer tous les tickets d'or du carnaval pour déclencher le feu d'artifice final.

## Jouer

1. Ouvre le fichier [`index.html`](index.html) dans un navigateur moderne (Chrome, Firefox, Edge ou Safari).
2. Le menu principal apparaît : choisis la couleur de Samba, le niveau souhaité puis clique sur “Jouer” (aucun serveur n'est nécessaire).

## Commandes

- **← →** : déplacer Samba sur les chars.
- **Espace** ou **↑** : sauter.
- **Bouton “Recommencer la fête”** : remettre la partie à zéro à tout moment.
- **Bouton “Menu principal”** ou **Échap** : ouvrir le menu pour choisir le niveau et la couleur du chien.

## Objectif

Collecte l'ensemble des tickets VIP disséminés sur les plateformes carnavalesques. À chaque ticket ramassé, la fête s'intensifie jusqu'à un final scintillant rempli de confettis. Termine un niveau pour déverrouiller le suivant (les niveaux 2 et 3 sont verrouillés au départ).

## Fonctionnalités

- Physique simple avec inertie, saut à la frame précise et "coyote time" pour des contrôles confortables.
- Décor festif animé (grande roue, guirlandes lumineuses, ballons, projecteurs et foule) dessinés en Canvas pur.
- Effets de confettis et célébration finale lorsque tous les tickets sont collectés, avec progression par niveaux.
- Menu principal pour sélectionner le niveau, personnaliser Samba et suivre la progression (sauvegardée dans le navigateur).
- Interface en français adaptée au thème carnavalesque.

## Structure du projet

```
├── index.html   # Conteneur principal du jeu et de l'interface
├── style.css    # Habillage visuel de la page et des éléments UI
└── game.js      # Boucle de jeu, logique de plateforme et rendu Canvas
```

## Développement

Aucun build n'est requis : le projet se joue directement dans le navigateur. Pour modifier le jeu, mets simplement à jour les fichiers HTML/CSS/JS puis recharge la page.
