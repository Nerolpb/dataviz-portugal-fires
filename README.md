> **Projet réalisé dans le cadre du cours VisualDon (Visualisation de données) à la HEIG-VD.**

# 1. Portugal : L'eucalyptus, l'or vert qui attise les flammes.

**Le Sujet :**
Le paysage du Portugal a beaucoup changé ces 50 dernières années. Pour produire plus de pâte à papier rapidement, le pays a planté énormément d'Eucalyptus globulus, un arbre qui vient d'Australie. Aujourd'hui, le Portugal bat le record mondial de densité d'eucalyptus : cette espèce recouvre près d'un tiers de ses forêts.

**Le Problème :**
L'eucalyptus ne fait pas qu'occuper de la place, il aggrave les incendies. En remplaçant les arbres locaux (comme les chênes-lièges) par des rangées de "torches" industrielles, le pays a transformé ses forêts en barils de poudre. Ce lien direct entre ces plantations industrielles et les méga-feux (comme ceux, tragiques, de 2017) est le cœur de notre projet. L'eucalyptus brûle beaucoup plus vite et plus fort que les arbres natifs, ce qui change complètement la façon dont les feux se propagent.

**Notre But :**
Nous voulons raconter l'histoire d'un désastre créé par l'homme. Notre objectif est d'expliquer simplement le lien entre ces choix d'aménagements et les incendies, en montrant pourquoi cette monoculture est une bombe à retardement. En parallèle, nous voulons offrir une preuve visuelle claire. Grâce à des cartes interactive, le public pourra superposer les zones brûlées et les forêts d'eucalyptus pour comprendre le problème en un coup d'œil.

---

## 2. Contexte des Données

**D'où viennent les données ?** 
Pour prouver ce lien, nous utilisons des données publiques qui proviennent d'institutions officielles :

* **Incendies (Historique) et Eucalyptus :** Les données viennent de l'ICNF (Institut pour la Conservation de la Nature et des Forêts).
* **Maplibre :** Pour les cartes intéractive.

**Quels sont les biais ou les problèmes rencontrés ?**
Nous avons eu des problèmes de dates : les données sur les feux sont complètes et vont de 1975 à 2024, mais les recensements sur les eucalyptus n'ont été faits que pour certaines années (1995, 2005, 2010, 2015). À cause de cela, nous ne pouvons pas proposer un curseur "année par année" totalement libre à l'utilisateur.

Un autre défi technique vient du format des données géographique : les données d'origine utilisent un système de coordonnées GPS spécifique au Portugal (PT-TM06). Nous avons dû faire plusieurs manipulations techniques pour pouvoir les afficher correctement sur nos cartes web.

---

## 3. Description des Données

Nous utilisons des formats de données géographiques standards : des fichiers Shapefile (.shp) venant de l'ICNF (pour dessiner les zones brûlées et les forêts d'eucalyptus)

## 4. Transformation des Données

Pour réaliser cette visualisation, un important travail de préparation a été nécessaire. Les bases de données officielles sont exhaustives, mais n'étaient pas du tout adaptées pour le web. Nous avons utilisé l'outil **Mapshaper** pour nettoyer, alléger et convertir ces fichiers.

### A. Les données des Incendies (1975 - 2024)

* **Fusion spatiale :** Les archives étaient fournies avec un fichier séparé pour chaque année. Nous les avons toutes fusionnées (`merge-layers target=* force`) pour créer un seul jeu de données historique.

* **Allègement géométrique:** Vouloir afficher les polygones complexes de centaines de milliers d'incendies sur 50 ans faisait planter le navigateur. Nous avons donc transformé les zones brûlées en simples points centraux (`-points`). L'impact analytique reste intact : le rayon de chaque cercle sur la carte est calculé proportionnellement à la surface réellement brûlée.

* **Standardisation et nettoyage :** Nous avons converti les coordonnées du format national portugais (PT-TM06) vers le standard web mondial WGS84 (`-proj wgs84`) et supprimé toutes les colonnes de texte inutiles (`-filter-fields Cod_SGIF,Ano,AreaHaSIG`) pour diviser le poids du fichier.

* **Traduction :** Les causes d'incendies étaient en portugais. Pour traduie, nous avons créé un dictionnaire de traduction directement dans notre code. Au survol d'un feu, le code traduit à la volée la cause en français dans l'infobulle.

### B. Les données de l'Eucalyptus 
L'inventaire forestier de 2015 contenait plus de 350 000 lignes. Pour éviter la saturation mémoire, nous avons séparé l'information géographique de l'information statistique en deux fichiers distincts :

**1. Le fichier Géospatial (Pour la carte) :**
Nous avons filtré le fichier pour ne garder que l'eucalyptus, reprojeté les coordonnées pour le web, et purgé le texte. Puisque le calque entier est dédié à l'eucalyptus, répéter le mot "Eucaliptos" sur 350 000 lignes était inutile. Nous n'avons gardé que la taille de la parcelle.

**2. Le fichier Statistique (Pour le graphique en barres) :**
Pour afficher la répartition des différentes essences d'arbres, les coordonnées GPS sont inutiles. Nous avons donc supprimé toute la géométrie et exporté les données au format .csv. Plutôt que de forcer le navigateur web à analyser un fichier massif, nous avons écrit des scripts pour pré-calculer le total de chaque espèce en amont.
Résultat : Notre code ne reçoit que les chiffres finaux du "Top 5" des arbres les plus présents. L'interface affiche ainsi le graphique instantanément, évitant au navigateur de faire de lourds calculs en direct à partir de la base de données brute.

---

## 5. Notre But

Notre projet se divise en deux parties :

* **Expliquer :** Le visiteur sera guidé par un récit interactif (scrollytelling) qui explique pourquoi l'eucalyptus brûle si bien, les enjeux financiers du papier, et le bilan terrible des incendies, surtout l'année noire de 2017.
* **Explorer :** Pour éviter de fausser l'information à cause des "trous" dans nos données, l'utilisateur sera accompagné dans sa découverte. Une animation cartographique lui montrera clairement la superposition entre l'eucalyptus et les zones détruites par le feu.

**Le message :** Les grands incendies au Portugal ne sont pas qu'une fatalité liée au climat. Ils sont aussi le résultat de choix politiques et industriels faits au détriment de l'écologie.

---

## 6. Références

Même si notre approche de carte interactive est nouvelle, le lien entre l'eucalyptus et les incendies a déjà été traité par plusieurs grands médias, ce qui confirme l'intérêt de notre projet :

* **RTS (Radio Télévision Suisse) :** A publié un article pointant du doigt l'eucalyptus comme un "arbre qui attise les feux de forêt". Leur but : alerter le public sur le danger de cette monoculture face au changement climatique.
* **Radio France (France Inter) :** A consacré un reportage sur le terrain à ce sujet. Leur but : documenter le conflit entre l'industrie du papier et les populations locales qui subissent les feux.

**Inspirations visuelles :**

* **The Pudding / The New York Times (Visual Investigations) :** Même s'ils n'ont pas parlé de ce sujet précis, nous nous inspirons beaucoup de leur façon de raconter des histoires de manière très visuelle et fluide (scrollytelling).

---

## 7. Wireframe

Lien Figma : https://www.figma.com/design/8dw0vXh8VyPJ0hsZXwik8A/VisualDon---Wireframe?node-id=0-1&t=QX3HgHBPznadx6dO-1
Lien Prototype Figma (Preview) : https://www.figma.com/proto/8dw0vXh8VyPJ0hsZXwik8A/VisualDon---Wireframe?page-id=0%3A1&node-id=81-284&viewport=-409%2C-67%2C0.12&t=ZJyGRVehw6rPDiwq-1&scaling=contain&content-scaling=fixed
