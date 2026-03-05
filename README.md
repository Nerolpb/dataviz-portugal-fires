> **Projet réalisé dans le cadre du cours VisualDon (Visualisation de données) à la HEIG-VD.**

## 1. Le Projet 

**Le Sujet :** L'aménagement du territoire portugais a subi des mutations profondes au cours du dernier demi-siècle. Pour maximiser les rendements à court terme et propulser son industrie de la pâte à papier, le pays a massivement planté l'Eucalyptus globulus, une essence exotique originaire d'Australie. Aujourd'hui, le Portugal détient le record mondial de la plus forte densité d'eucalyptus, recouvrant environ 26% de ses surfaces forestières.



**Le Problème :** Il existe une corrélation tragique entre cette sylviculture industrielle et la vulnérabilité du pays face aux méga-feux de forêt (comme ceux ravageurs de 2017). L'eucalyptus est une essence hautement inflammable par rapport aux espèces comme le chêne-liège. La prolifération de ces plantations, gérées pour la production de papier, modifie profondément le régime des incendies (vitesse de propagation, intensité). 

**Notre But :** Ce projet vise à modéliser spatialement et visuellement cette causalité systémique. ... **à compléter**

---

## 2. Contexte des Données
**D'où viennent les données et qui les a créées ?**
Pour prouver cette corrélation, nous agrégeons des données ouvertes (Open Data) provenant de multiples strates institutionnelles et scientifiques :
* **Incendies (Historique et Cinématique) :** Les données proviennent de l'**ICNF** (Instituto da Conservação da Natureza e das Florestas).
* **Occupation des Sols :** La **DGT** (Direção-Geral do Território).

**Quels biais ou absences peut-on identifier ?**
Les données portent la trace des entités qui les publient. Par exemple, les classifications de la DGT ou de l'ICNF regroupent souvent l'eucalyptus sous le terme générique de "forêt", ce qui masque aux yeux du grand public la différence entre un écosystème naturel résilient et une monoculture industrielle.

## 3. Description des Données
**Structure, format et attributs :**
Notre architecture d'information repose sur :

Fichiers Shapefile (.shp) et GeoJSON provenant de l'ICNF (polygones des zones brûlées depuis 1975) et de la DGT (zones d'eucalyptus).

## 4. Notre But
Deux approches coexistent dans notre projet :

* **Expliquer :** Le visiteur sera guidé par un récit (*scrollytelling*) expliquant la biologie de la combustion et la logique économique de l'industrie papetière.
* **Explorer :** L'utilisateur pourra interagir avec la carte, filtrer les années, et voir par lui-même la superposition des polygones "Eucalyptus" avec les "Cicatrices de feu" dans sa propre région.

**Le message :** Les incendies extrêmes au Portugal ne sont pas qu'une fatalité climatique, mais le sous-produit d'une politique d'aménagement du territoire dictée par des intérêts industriels.

## 5. Références

**à compléter**
