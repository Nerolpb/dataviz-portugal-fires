import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { geoContains } from "d3-geo";

let mapInstance = null;

// Superficie estimée (point médian) pour chaque catégorie dimensmanc
const AREA_MIDPOINT = {
  "[0,5; 2] ha":   1.25,
  "]2, 10[ ha":    6,
  "[10; 50[ ha":   30,
  "[50, ... [ ha": 75,
  "NULL":          0,
};

export function initEucalyptusMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (mapInstance) {
    mapInstance.resize();
    return;
  }

  // ── Tooltip ──
  let tooltip = document.getElementById("map-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "map-tooltip";
    document.body.appendChild(tooltip);
  }

  const map = new maplibregl.Map({
    container: containerId,
    style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    center: [-8.2, 39.5],
    zoom: 6.5,
    pitch: 50, // Inclinaison de la caméra pour l'effet 3D
    bearing: -10, // Légère rotation
    minZoom: 5,
    maxZoom: 14,
    interactive: true,
    attributionControl: false,
    dragRotate: true, // Autorise la rotation 3D pour l'utilisateur
  });

  map.touchZoomRotate?.disableRotation?.();
  mapInstance = map;

  map.on("load", async () => {
    const [eucaData, portugalData] = await Promise.all([
      fetch("/data/eucalyptus.json").then(r => r.json()),
      fetch("/data/portugal.geojson").then(r => r.json()),
    ]);

    // ── Génération d'une grille 3D (binning) ──
    const cellSize = 0.05; // environ 5km
    const grid = new Map();
    let maxCount = 0;

    for (const point of eucaData.features) {
      if (point.geometry.type !== "Point") continue;
      const coords = point.geometry.coordinates;
      const gx = Math.floor(coords[0] / cellSize);
      const gy = Math.floor(coords[1] / cellSize);
      const key = `${gx},${gy}`;
      
      if (!grid.has(key)) {
        grid.set(key, { count: 0, area: 0, gx, gy });
      }
      const cell = grid.get(key);
      cell.count++;
      cell.area += (AREA_MIDPOINT[point.properties.dimensmanc] ?? 0);
      if (cell.count > maxCount) maxCount = cell.count;
    }

    const gridFeatures = [];
    grid.forEach(cell => {
      const minLng = cell.gx * cellSize;
      const minLat = cell.gy * cellSize;
      const pad = cellSize * 0.1; // Léger espace entre les carrés
      const maxLng = minLng + cellSize - pad;
      const maxLat = minLat + cellSize - pad;
      
      gridFeatures.push({
        type: "Feature",
        id: Math.abs(cell.gx * 100000 + cell.gy), // ID unique
        properties: {
          id: Math.abs(cell.gx * 100000 + cell.gy), // ID dans les properties
          count: cell.count,
          area: Math.round(cell.area),
          centerLng: minLng + (cellSize / 2),
          centerLat: minLat + (cellSize / 2)
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [minLng + pad, minLat + pad],
            [maxLng, minLat + pad],
            [maxLng, maxLat],
            [minLng + pad, maxLat],
            [minLng + pad, minLat + pad]
          ]]
        }
      });
    });

    const gridGeoJSON = { type: "FeatureCollection", features: gridFeatures };

    // ── Masque inversé (Cacher tout sauf le Portugal) ──
    // On crée un polygone de la taille du monde, avec un "trou" de la forme du Portugal
    const portugalRing = portugalData.features[0].geometry.coordinates[0];
    const maskGeoJSON = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-180, 90],
              [-180, -90],
              [180, -90],
              [180, 90],
              [-180, 90]
            ],
            portugalRing // Le trou
          ]
        }
      }]
    };

    map.addSource("mask", { type: "geojson", data: maskGeoJSON });
    map.addLayer({
      id: "world-mask",
      type: "fill",
      source: "mask",
      paint: {
        "fill-color": "#000000", // Noir profond pour cacher l'extérieur
        "fill-opacity": 0.95     // 0.95 cache l'Espagne et l'Océan tout en les laissant presque invisibles
      }
    });

    // ── Couche : Frontières du Portugal ──
    map.addSource("portugal", { type: "geojson", data: portugalData });
    map.addLayer({
      id: "portugal-line",
      type: "line",
      source: "portugal",
      paint: {
        "line-color": "rgba(255, 255, 255, 0.4)", // Un peu plus visible
        "line-width": 1.5,
      },
    });

    // ── Couche : Barres 3D (Eucalyptus) ──
    map.addSource("euca-grid", { type: "geojson", data: gridGeoJSON, promoteId: "id" });
    
    map.addLayer({
      id: "euca-3d-bars",
      type: "fill-extrusion",
      source: "euca-grid",
      paint: {
        // Couleur : Hover effect géré ici
        "fill-extrusion-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#FFFFFF", // Éclaircissement au survol
          [
            "interpolate", ["linear"], ["get", "count"],
            1, "#1a6b2f",
            Math.max(2, maxCount * 0.3), "#2ECC71",
            Math.max(3, maxCount * 0.7), "#00E676",
            Math.max(4, maxCount), "#FFEA00"
          ]
        ],
        // Hauteur : Extrusion
        "fill-extrusion-height": [
          "interpolate", ["linear"], ["get", "count"],
          1, 500,
          Math.max(2, maxCount), 80000 // 80 km de hauteur virtuelle
        ],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.95
      }
    });

    // ── Hover tooltip sur les barres 3D ──
    let hoveredId = null;
    const regionCache = new Map();
    let hoverTimeout = null;

    map.on("mousemove", "euca-3d-bars", (e) => {
      if (!e.features.length) return;
      const feat = e.features[0];
      const { id: cellId, count, area, centerLng, centerLat } = feat.properties;

      if (hoveredId !== null && hoveredId !== cellId) {
        map.setFeatureState({ source: "euca-grid", id: hoveredId }, { hover: false });
      }
      hoveredId = cellId;
      map.setFeatureState({ source: "euca-grid", id: hoveredId }, { hover: true });

      tooltip.style.display = "block";
      tooltip.style.left = (e.originalEvent.clientX + 14) + "px";
      tooltip.style.top  = (e.originalEvent.clientY + 14) + "px";
      
      const regionName = regionCache.get(cellId) || "Recherche de la région...";
      
      tooltip.innerHTML = `
        <div class="tooltip-title" id="tooltip-region-name">${regionName}</div>
        <div class="tooltip-row">
          <span>Superficie</span>
          <span>~${area.toLocaleString("fr-CH")} ha</span>
        </div>
      `;

      clearTimeout(hoverTimeout);
      if (!regionCache.has(cellId)) {
        hoverTimeout = setTimeout(() => {
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${centerLat}&lon=${centerLng}&accept-language=fr`)
            .then(r => r.json())
            .then(data => {
               if(data && data.address) {
                 // Nominatim renvoie state, county, region, city...
                 const region = data.address.state || data.address.county || data.address.region || data.address.city || "Portugal";
                 regionCache.set(cellId, region);
                 
                 const titleEl = document.getElementById("tooltip-region-name");
                 if(titleEl && hoveredId === cellId) {
                   titleEl.innerText = region;
                 }
               }
            }).catch(err => console.log(err));
        }, 400); // Debounce de 400ms pour ne pas spammer l'API
      }
    });

    map.on("mouseleave", "euca-3d-bars", () => {
      if (hoveredId !== null) {
        map.setFeatureState({ source: "euca-grid", id: hoveredId }, { hover: false });
      }
      hoveredId = null;
      clearTimeout(hoverTimeout);
      tooltip.style.display = "none";
      map.getCanvas().style.cursor = "";
    });

    map.on("mouseenter", "euca-3d-bars", () => {
      map.getCanvas().style.cursor = "pointer";
    });
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
}
