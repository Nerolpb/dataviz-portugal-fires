> **Projet réalisé dans le cadre du cours VisualDon (Visualisation de données) à la HEIG-VD.**

## 1. Portugal : L'eucalyptus, l'or vert qui attise les flammes.

**Le Sujet :** L'aménagement du territoire portugais a subi des mutations profondes au cours du dernier demi-siècle. Pour maximiser les rendements à court terme et propulser son industrie de la pâte à papier, le pays a massivement planté l'Eucalyptus globulus, une essence exotique originaire d'Australie. Aujourd'hui, le Portugal détient le record mondial de la plus forte densité d'eucalyptus, recouvrant environ 26% de ses surfaces forestières.



**Le Problème :** 
Plus qu'une simple corrélation, l'eucalyptus agit comme un catalyseur de catastrophe. En remplaçant les barrières naturelles (chênes-lièges) par des rangées de 'torches' industrielles, le pays a transformé ses forêts en barils de poudre.
Cette corrélation tragique entre cette sylviculture industrielle et la vulnérabilité du pays face aux méga-feux de forêt (comme ceux ravageurs de 2017). L'eucalyptus a des propiété hautement inflammable par rapport aux espèces comme le chêne-liège. La prolifération de ces plantations, gérées pour la production de papier, modifie profondément le régime des incendies (vitesse de propagation, intensité). 

**Notre But** : Notre visualisation a pour but de dénoncer. Raconter l'histoire d'un désastre "manufacturé". Nous voulons vulgariser la corrélation entre les choix d'aménagement du territoire et l'aggravation des incendies, en expliquant visuellement pourquoi cette monoculture agit comme une bombe à retardement. En parallèle, nous voulons offrir à l'utilisateur la liberté d'explorer les données spatiales par lui-même. À travers une cartographie interactive, le public pourra superposer l'historique des surfaces brûlées avec la densité des plantations d'eucalyptus, afin de constater de ses propres yeux la réalité géographique du problème, région par région. 

---

## 2. Contexte des Données
**D'où viennent les données et qui les a créées ?**
Pour prouver cette corrélation, nous agrégeons des données ouvertes (Open Data) provenant de multiples strates institutionnelles et scientifiques :
* **Incendies (Historique et Cinématique) :** Les données proviennent de l'**ICNF** (Instituto da Conservação da Natureza e das Florestas).
* **Occupation des Sols :** La **DGT** (Direção-Geral do Território).

**Quels biais ou absences peut-on identifier ?**
Les données portent la trace des entités qui les publient. Par exemple, les classifications de la DGT ou de l'ICNF regroupent souvent l'eucalyptus sous le terme générique de "forêt", ce qui masque aux yeux du grand public la différence entre un écosystème naturel résilient et une monoculture industrielle. L'Open Data n'est jamais neutre. En classant l'eucalyptus sous l'étiquette générique de 'forêt', les institutions (DGT/ICNF) opèrent un effacement sémantique. Notre projet vise à 'dé-brouiller' cette nomenclature pour isoler la monoculture industrielle de la forêt résiliente.

## 3. Description des Données
**Structure, format et attributs :**
Notre architecture d'information repose sur :

Fichiers Shapefile (.shp) et GeoJSON provenant de l'ICNF (polygones des zones brûlées depuis 1975) et de la DGT (zones d'eucalyptus).

## 4. Notre But
Deux approches coexistent dans notre projet :

* **Expliquer :** Le visiteur sera guidé par un récit (*scrollytelling*) expliquant la biologie de la combustion et la logique économique de l'industrie papetière.
* **Explorer :** L'utilisateur pourra interagir avec la carte, filtrer les années, et voir par lui-même la superposition des polygones "Eucalyptus" avec les "Cicatrices de feu" dans sa propre région.

**Le message :** Les incendies extrêmes au Portugal ne sont pas qu'une fatalité climatique, mais le sous-produit d'une politique d'aménagement du territoire dictée par des intérêts industriels et économiques tout en délaissant l'aspect écologique. 

## 5. Références

Bien que la création d'une cartographie interactive dédiée spécifiquement à ce sujet soit une démarche novatrice, l'utilisation croisée des données forestières et incendies a déjà été abordée dans d'autres sphères. 

**Dans les médias et la presse d'information :**
Plusieurs grands médias publics européens se sont emparés de ce sujet pour alerter l'opinion, confirmant la pertinence journalistique de notre démarche :
* **RTS (Radio Télévision Suisse) :** A publié un article pointant du doigt l'eucalyptus comme un "arbre qui attise les feux de forêt" (en se penchant notamment sur la péninsule ibérique).
    * *Leur but :* Informer le grand public sur le danger de ces monocultures face au changement climatique.
* **Radio France (France Inter) :** A consacré un épisode du "Zoom de la rédaction" (mai 2023) à l'impact controversé de l'eucalyptus.
    * *Leur but :* Documenter, via le reportage de terrain, le conflit entre la rentabilité de l'industrie papetière et le désespoir des populations locales face aux incendies.

**Inspirations visuelles et méthodologiques :**
* **The Pudding / The New York Times (Visual Investigations) :** Bien que ces médias n'aient pas traité spécifiquement de la forêt portugaise, nous nous inspirons fortement de leurs méthodes de *scrollytelling*.
