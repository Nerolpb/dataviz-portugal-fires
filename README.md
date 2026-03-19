> **Projet réalisé dans le cadre du cours VisualDon (Visualisation de données) à la HEIG-VD.**

# 1. Portugal : L'eucalyptus, l'or vert qui attise les flammes.

**Le Sujet :** Le paysage du Portugal a beaucoup changé ces 50 dernières années. Pour produire plus de pâte à papier rapidement, le pays a planté énormément d'Eucalyptus globulus, un arbre qui vient d'Australie. Aujourd'hui, le Portugal bat le record mondial de densité d'eucalyptus : cette espèce recouvre près d'un tiers (environ 26%) de ses forêts.

**Le Problème :** L'eucalyptus ne fait pas qu'occuper de la place, il aggrave les incendies. En remplaçant les arbres locaux (comme les chênes-lièges) par des rangées de "torches" industrielles, le pays a transformé ses forêts en barils de poudre. Ce lien direct entre ces plantations industrielles et les méga-feux (comme ceux, tragiques, de 2017) est le cœur de notre projet. L'eucalyptus brûle beaucoup plus vite et plus fort que les arbres natifs, ce qui change complètement la façon dont les feux se propagent.

**Notre But :** Nous voulons raconter l'histoire d'un désastre créé par l'homme. Notre objectif est d'expliquer simplement le lien entre ces choix politiques et les incendies, en montrant pourquoi cette monoculture est une bombe à retardement. En parallèle, nous voulons offrir une preuve visuelle claire. Grâce à une carte interactive, le public pourra superposer les zones brûlées et les forêts d'eucalyptus pour comprendre le problème en un coup d'œil.

---

## 2. Contexte des Données

**D'où viennent les données ?** Pour prouver ce lien, nous utilisons des données publiques (Open Data) qui proviennent d'institutions officielles :

* **Incendies (Historique) :** Les données viennent de l'ICNF (Institut pour la Conservation de la Nature et des Forêts).
* **Occupation des Sols :** Les données viennent de la DGT (Direction Générale du Territoire).

**Quels sont les biais ou les problèmes rencontrés ?** Nous avons un gros problème de dates : les données sur les feux sont complètes et vont de 1975 à 2024, mais les recensements sur les eucalyptus n'ont été faits que pour certaines années (1995, 2000, 2005, 2015). À cause de cela, nous ne pouvons pas proposer un curseur "année par année" totalement libre à l'utilisateur, car inventer les données manquantes serait trompeur.

Un autre défi technique vient du format des cartes : les données d'origine utilisent un système de coordonnées GPS spécifique au Portugal. Nous avons dû faire plusieurs manipulations techniques pour pouvoir les afficher correctement sur nos cartes web.

---

## 3. Description des Données

Nous utilisons des formats de données géographiques standards : des fichiers Shapefile (.shp) et GeoJSON venant de l'ICNF (pour dessiner les zones brûlées) et de la DGT (pour dessiner les forêts d'eucalyptus, uniquement pour les années disponibles).

---

## 4. Notre But

Notre projet se divise en deux parties :

* **Expliquer :** Le visiteur sera guidé par un récit interactif (scrollytelling) qui explique pourquoi l'eucalyptus brûle si bien, les enjeux financiers du papier, et le bilan terrible des incendies, surtout l'année noire de 2017.
* **Explorer :** Pour éviter de fausser l'information à cause des "trous" dans nos données, l'utilisateur sera accompagné dans sa découverte. Une animation cartographique lui montrera clairement la superposition entre l'eucalyptus et les zones détruites par le feu.

**Le message :** Les grands incendies au Portugal ne sont pas qu'une fatalité liée au climat. Ils sont aussi le résultat de choix politiques et industriels faits au détriment de l'écologie.

---

## 5. Références

Même si notre approche de carte interactive est nouvelle, le lien entre l'eucalyptus et les incendies a déjà été traité par plusieurs grands médias, ce qui confirme l'intérêt de notre projet :

* **RTS (Radio Télévision Suisse) :** A publié un article pointant du doigt l'eucalyptus comme un "arbre qui attise les feux de forêt". Leur but : alerter le public sur le danger de cette monoculture face au changement climatique.
* **Radio France (France Inter) :** A consacré un reportage sur le terrain à ce sujet. Leur but : documenter le conflit entre l'industrie du papier et les populations locales qui subissent les feux.

**Inspirations visuelles :**

* **The Pudding / The New York Times (Visual Investigations) :** Même s'ils n'ont pas parlé de ce sujet précis, nous nous inspirons beaucoup de leur façon de raconter des histoires de manière très visuelle et fluide (scrollytelling).
