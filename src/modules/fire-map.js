import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

let mapInstance = null;

export async function initFireMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (mapInstance) {
    mapInstance.resize();
    return;
  }

  // ── Tooltip ──
  let tooltip = document.getElementById("fire-map-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "fire-map-tooltip";
    document.body.appendChild(tooltip);
    // On réutilise les styles du map-tooltip existant (de l'eucalyptus)
    tooltip.className = "map-tooltip"; 
    tooltip.style.cssText = `
      display: none; position: fixed; z-index: 200; pointer-events: none;
      background: #fff; color: #000; border: 1px solid rgba(0,0,0,0.12);
      font-family: var(--font-body); font-size: var(--fs-sm); font-weight: 500;
      padding: 0.6em 0.9em; border-radius: 2px; min-width: 180px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
  }

  const map = new maplibregl.Map({
    container: containerId,
    style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    center: [-8.2, 39.5],
    zoom: 6.5,
    pitch: 50,
    bearing: -10,
    minZoom: 5,
    maxZoom: 14,
    interactive: true,
    attributionControl: false,
    dragRotate: true,
  });

  map.touchZoomRotate?.disableRotation?.();
  mapInstance = map;

  map.on("load", async () => {
    let fireData, portugalData;
    try {
      [fireData, portugalData] = await Promise.all([
        fetch("/data/feux_75_24.json").then(r => r.json()),
        fetch("/data/portugal.geojson").then(r => r.json()),
      ]);
    } catch {
      return;
    }

    // ── Génération d'une grille 3D par année (binning) ──
    const cellSize = 0.05; // environ 5km
    const yearGrid = new Map();
    let maxArea = 0;

    for (const point of fireData.features) {
      if (point.geometry.type !== "Point") continue;
      const coords = point.geometry.coordinates;
      const year = point.properties.Ano;
      const area = point.properties.AreaHaSIG || 0;
      
      const gx = Math.floor(coords[0] / cellSize);
      const gy = Math.floor(coords[1] / cellSize);
      const key = `${year}-${gx}-${gy}`;
      
      if (!yearGrid.has(key)) {
        yearGrid.set(key, { year, area: 0, gx, gy });
      }
      const cell = yearGrid.get(key);
      cell.area += area;
      if (cell.area > maxArea) maxArea = cell.area;
    }

    const gridFeatures = [];
    yearGrid.forEach(cell => {
      if (cell.area <= 0) return; // Ne pas afficher les statistiques de 0 ha
      
      const minLng = cell.gx * cellSize;
      const minLat = cell.gy * cellSize;
      const pad = cellSize * 0.1;
      const maxLng = minLng + cellSize - pad;
      const maxLat = minLat + cellSize - pad;
      
      gridFeatures.push({
        type: "Feature",
        id: Math.abs(cell.year * 1000000 + cell.gx * 1000 + cell.gy),
        properties: {
          id: Math.abs(cell.year * 1000000 + cell.gx * 1000 + cell.gy),
          year: cell.year,
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
    const portugalRing = portugalData.features[0].geometry.coordinates[0];
    const maskGeoJSON = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [[-180, 90], [-180, -90], [180, -90], [180, 90], [-180, 90]],
            portugalRing
          ]
        }
      }]
    };

    map.addSource("mask-fire", { type: "geojson", data: maskGeoJSON });
    map.addLayer({
      id: "world-mask-fire",
      type: "fill",
      source: "mask-fire",
      paint: {
        "fill-color": "#000000",
        "fill-opacity": 0.95
      }
    });

    // ── Couche : Frontières du Portugal ──
    map.addSource("portugal-fire", { type: "geojson", data: portugalData });
    map.addLayer({
      id: "portugal-line-fire",
      type: "line",
      source: "portugal-fire",
      paint: {
        "line-color": "rgba(255, 255, 255, 0.4)",
        "line-width": 1.5,
      },
    });

    // ── Couche : Barres 3D (Incendies) ──
    map.addSource("fire-grid", { type: "geojson", data: gridGeoJSON, promoteId: "id" });
    
    map.addLayer({
      id: "fire-3d-bars",
      type: "fill-extrusion",
      source: "fire-grid",
      filter: ["==", ["get", "year"], 1975], // Filtre initial
      paint: {
        "fill-extrusion-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#FFFFFF", // Éclaircissement au survol
          [
            "interpolate", ["linear"], ["get", "area"],
            1, "#FFD54F",      // Jaune chaud (petits feux)
            Math.max(100, maxArea * 0.1), "#FF8F00", // Orange (moyens)
            Math.max(1000, maxArea * 0.4), "#E53935", // Rouge vif (grands)
            Math.max(5000, maxArea * 0.8), "#8B0000"  // Rouge profond (catastrophes)
          ]
        ],
        "fill-extrusion-height": [
          "interpolate", ["linear"], ["get", "area"],
          1, 500,
          Math.max(2, maxArea), 80000
        ],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.95
      }
    });

    // ── Hover tooltip sur les barres 3D ──
    let hoveredId = null;

    map.on("mousemove", "fire-3d-bars", (e) => {
      if (!e.features.length) return;
      const feat = e.features[0];
      const { id: cellId, area } = feat.properties;

      if (hoveredId !== null && hoveredId !== cellId) {
        map.setFeatureState({ source: "fire-grid", id: hoveredId }, { hover: false });
      }
      hoveredId = cellId;
      map.setFeatureState({ source: "fire-grid", id: hoveredId }, { hover: true });

      tooltip.style.display = "block";
      tooltip.style.left = (e.originalEvent.clientX + 14) + "px";
      tooltip.style.top  = (e.originalEvent.clientY + 14) + "px";
      
      tooltip.innerHTML = `
        <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 0.3em; color: #000;">Surface Brûlée</div>
        <div style="display: flex; justify-content: space-between; gap: 1.5em; line-height: 1.6; opacity: 0.75;">
          <span>Total :</span>
          <span style="font-weight:bold;">~${area.toLocaleString("fr-CH")} ha</span>
        </div>
      `;
    });

    map.on("mouseleave", "fire-3d-bars", () => {
      if (hoveredId !== null) {
        map.setFeatureState({ source: "fire-grid", id: hoveredId }, { hover: false });
      }
      hoveredId = null;
      tooltip.style.display = "none";
      map.getCanvas().style.cursor = "";
    });

    map.on("mouseenter", "fire-3d-bars", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    // ── Logique du Slider (Manuel uniquement) ──
    const slider = document.getElementById("timeline-slider");
    const yearDisplay = document.getElementById("timeline-year-display");
    
    if (slider && yearDisplay) {
      slider.addEventListener("input", (e) => {
        const year = parseInt(e.target.value);
        updateFireYear(year);
      });
    }
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
}

export function updateFireYear(year) {
  if (!mapInstance || !mapInstance.isStyleLoaded()) return;
  const slider = document.getElementById("timeline-slider");
  const yearDisplay = document.getElementById("timeline-year-display");
  if (slider && yearDisplay) {
    slider.value = year;
    yearDisplay.innerText = year;
    mapInstance.setFilter("fire-3d-bars", ["==", ["get", "year"], year]);
  }
}
