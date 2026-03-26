# CLAUDE.md — Cours VisualDon (HEIG-VD / COMEM+)

## Contexte du cours

Cours de **Visualisation de données** du Bachelor en Ingénierie des Médias (MEI) à la HEIG-VD.
Repo du cours : https://github.com/MediaComem/comem-visualdon

---

## Technologies autorisées

Ce projet utilise **uniquement** les technologies vues en cours. Ne pas introduire de librairies externes non listées ici.

### SVG (Scalable Vector Graphics)
- Dessiner des formes directement dans le DOM : `<svg>`, `<circle>`, `<rect>`, `<line>`, `<path>`, `<text>`, `<g>`
- Attributs de style : `fill`, `stroke`, `stroke-width`, `opacity`, `transform`
- Animations CSS sur éléments SVG (`transition`, `@keyframes`)
- Pas de canvas 2D, pas de WebGL sauf mention explicite

### JavaScript vanilla
- Manipulation du DOM : `document.querySelector`, `document.querySelectorAll`
- Fetch API pour charger des données : `fetch()`, `async/await`
- Formats de données : JSON, CSV

### D3.js (v7)
La librairie principale du cours. Utiliser **uniquement** les modules suivants :

| Module | Usage |
|---|---|
| `d3-selection` | Sélection et manipulation du DOM (`d3.select`, `.append`, `.attr`, `.style`, `.data`, `.join`) |
| `d3-fetch` | Chargement de données (`d3.json`, `d3.csv`) |
| `d3-array` | Manipulation de données (`d3.min`, `d3.max`, `d3.extent`, `d3.group`, `d3.rollup`) |
| `d3-scale` | Échelles (`d3.scaleLinear`, `d3.scaleBand`, `d3.scaleOrdinal`, `d3.scaleTime`, `d3.scaleLog`) |
| `d3-axis` | Axes (`d3.axisBottom`, `d3.axisLeft`, `d3.axisRight`, `d3.axisTop`) |
| `d3-zoom` | Zoom et pan (`d3.zoom`) |
| `d3-brush` | Sélection par brosse (`d3.brush`) |
| `d3-geo` | Projections cartographiques (`d3.geoPath`, `d3.geoMercator`, `d3.geoNaturalEarth1`, etc.) |
| `d3-transition` | Transitions et animations (`.transition()`, `.duration()`, `.ease()`) |
| `d3-shape` | Formes (`d3.line`, `d3.area`, `d3.arc`, `d3.pie`) |

### Cartographie
- **Leaflet** : cartes interactives 2D tuilées (`L.map`, `L.tileLayer`, `L.geoJSON`, `L.marker`)
- **OpenLayers** : alternative à Leaflet
- **MapLibre GL** : rendu WebGL pour données vectorielles
- Données géographiques : format **GeoJSON** et **TopoJSON**
- Sources de données : opendata.swiss, swisstopo, Natural Earth, Overpass Turbo

### Scrollytelling
- **scrollama** : déclenchement d'étapes au scroll (`scrollama()`, `.setup()`, `.onStepEnter()`)
- **Intersection Observer API** (natif navigateur) : alternative légère à scrollama
- Principe : lier des changements de visualisation à des étapes de scroll

---

## Structure d'un projet type

```
projet/
├── index.html
├── style.css
├── main.js          # Point d'entrée, chargement des données + init D3
├── data/
│   ├── data.csv
│   └── geodata.geojson
└── modules/         # (optionnel) découpage en fichiers JS
    ├── chart.js
    └── map.js
```

---

## Patterns D3 standards (à respecter)

### Chargement de données
```js
const data = await d3.csv("data/data.csv", d => ({
  year: new Date(d.year),
  value: +d.value,      // toujours caster en nombre
  label: d.label
}));
```

### Mise en place d'un SVG responsive
```js
const margin = { top: 20, right: 30, bottom: 40, left: 50 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);
```

### Échelles
```js
const xScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.value))
  .range([0, width]);

const yScale = d3.scaleBand()
  .domain(data.map(d => d.label))
  .range([0, height])
  .padding(0.1);
```

### Axes
```js
svg.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(xScale));

svg.append("g")
  .call(d3.axisLeft(yScale));
```

### Data join (pattern enter/update/exit)
```js
svg.selectAll("circle")
  .data(data)
  .join("circle")
  .attr("cx", d => xScale(d.x))
  .attr("cy", d => yScale(d.y))
  .attr("r", 5);
```

### Transitions
```js
selection
  .transition()
  .duration(750)
  .ease(d3.easeCubicInOut)
  .attr("cx", d => xScale(d.x));
```

### Carte avec D3-geo
```js
const projection = d3.geoMercator().fitSize([width, height], geojsonData);
const path = d3.geoPath().projection(projection);

svg.selectAll("path")
  .data(geojsonData.features)
  .join("path")
  .attr("d", path);
```

### Carte avec Leaflet
```js
const map = L.map("map").setView([46.8, 8.2], 8);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
L.geoJSON(geojsonData).addTo(map);
```

### Scrollytelling avec scrollama
```js
const scroller = scrollama();
scroller.setup({
  step: ".step",
  offset: 0.5
}).onStepEnter(({ index }) => {
  // mettre à jour la visualisation selon l'index
});
```

---

## Règles à respecter

- **Ne pas utiliser** React, Vue, Angular ou tout autre framework JS
- **Ne pas utiliser** Chart.js, Highcharts, Vega-Lite ou autres librairies de charts — sauf si le cours 12 (Alternatives à D3) est explicitement visé
- **Toujours caster** les valeurs numériques avec `+` ou `Number()` lors du parsing CSV
- **Toujours utiliser** le pattern margin convention pour les SVG D3
- **Privilégier** `.join()` au lieu de `.enter().append()` (syntaxe D3 v5+)
- **Les données** doivent être chargées de façon asynchrone (`async/await` ou `.then()`)
- Le projet final doit être un **site web publié**, code source sur GitHub

---

## Ressources officielles du cours

- Slides : https://comem-visualdon.onrender.com/
- Repo exercices : https://github.com/MediaComem/comem-visualdon
- Notebooks Observable : https://observablehq.com/collection/@romanoe/heig-vd-visualisation-de-donnees
- Docs D3 : https://d3js.org/
- MDN SVG : https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial
