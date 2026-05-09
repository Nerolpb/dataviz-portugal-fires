import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const AREA_MIDPOINT = {
  "[0,5; 2] ha":   1.25,
  "]2, 10[ ha":    6,
  "[10; 50[ ha":   30,
  "[50, ... [ ha": 75,
  "NULL":          0,
};

const FIRE_START = 2015;
const FIRE_END   = 2024;

let mapEuca = null;
let mapFire = null;

// ── Synchronisation caméra bidirectionnelle ───────────────────
function syncMaps(m1, m2) {
  let syncing = false;
  function apply(src, tgt) {
    if (syncing) return;
    syncing = true;
    tgt.jumpTo({
      center:  src.getCenter(),
      zoom:    src.getZoom(),
      bearing: src.getBearing(),
      pitch:   src.getPitch(),
    });
    syncing = false;
  }
  m1.on("move", () => apply(m1, m2));
  m2.on("move", () => apply(m2, m1));
}

// ── Masque Portugal ───────────────────────────────────────────
function addMask(map, ring, suffix) {
  map.addSource(`mask-${suffix}`, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [[-180,90],[-180,-90],[180,-90],[180,90],[-180,90]],
            ring
          ]
        }
      }]
    }
  });
  map.addLayer({ id: `mask-${suffix}`, type: "fill", source: `mask-${suffix}`,
    paint: { "fill-color": "#000", "fill-opacity": 0.95 } });
}

// ── Frontière Portugal ────────────────────────────────────────
function addBorder(map, ptData, suffix) {
  map.addSource(`border-${suffix}`, { type: "geojson", data: ptData });
  map.addLayer({ id: `border-${suffix}`, type: "line", source: `border-${suffix}`,
    paint: { "line-color": "rgba(255,255,255,0.35)", "line-width": 1.5 } });
}

// ── Options MapLibre communes ─────────────────────────────────
function makeMapOptions(containerId) {
  return {
    container: containerId,
    style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    center: [-8.0, 39.6],
    zoom: 6.0,
    pitch: 0,
    bearing: 0,
    minZoom: 5,
    maxZoom: 12,
    interactive: true,
    dragRotate: false,
    pitchWithRotate: false,
    attributionControl: false,
  };
}

// ─────────────────────────────────────────────────────────────
export async function initCorrelationMap() {
  if (mapEuca || mapFire) return;

  mapEuca = new maplibregl.Map(makeMapOptions("map-correlation-euca"));
  mapFire = new maplibregl.Map(makeMapOptions("map-correlation-fire"));

  const [eucaData, fireData, ptData] = await Promise.all([
    fetch("/data/eucalyptus.json").then(r => r.json()),
    fetch("/data/feux_75_24.json").then(r => r.json()),
    fetch("/data/portugal.geojson").then(r => r.json()),
  ]);

  const ring = ptData.features[0].geometry.coordinates[0];

  // ── Points eucalyptus ──
  const eucaPoints = {
    type: "FeatureCollection",
    features: eucaData.features
      .filter(f => f.geometry.type === "Point")
      .map(f => ({
        type: "Feature",
        geometry: f.geometry,
        properties: { area: AREA_MIDPOINT[f.properties.dimensmanc] ?? 0 }
      }))
      .filter(f => f.properties.area > 0)
  };

  // ── Points incendies 2015-2024 (cumulés) ──
  const firePoints = {
    type: "FeatureCollection",
    features: fireData.features
      .filter(f =>
        f.geometry.type === "Point" &&
        f.properties.Ano >= FIRE_START &&
        f.properties.Ano <= FIRE_END &&
        (f.properties.AreaHaSIG || 0) > 0
      )
      .map(f => ({
        type: "Feature",
        geometry: f.geometry,
        properties: { area: f.properties.AreaHaSIG }
      }))
  };

  await Promise.all([
    new Promise(r => mapEuca.on("load", r)),
    new Promise(r => mapFire.on("load", r)),
  ]);

  // ═══════════════════════════════════════════════
  // CARTE GAUCHE — Eucalyptus
  // ═══════════════════════════════════════════════
  mapEuca.addSource("euca-heat", { type: "geojson", data: eucaPoints });
  mapEuca.addLayer({
    id: "euca-heatmap",
    type: "heatmap",
    source: "euca-heat",
    paint: {
      "heatmap-weight": [
        "interpolate", ["linear"], ["get", "area"], 0, 0, 75, 1
      ],
      "heatmap-intensity": [
        "interpolate", ["linear"], ["zoom"], 5, 0.9, 9, 2.5
      ],
      "heatmap-radius": [
        "interpolate", ["linear"], ["zoom"], 5, 12, 8, 22, 10, 40
      ],
      "heatmap-color": [
        "interpolate", ["linear"], ["heatmap-density"],
        0,    "rgba(0,0,0,0)",
        0.15, "rgba(26,107,47,0.35)",
        0.40, "rgba(0,200,100,0.65)",
        0.70, "rgba(0,230,118,0.88)",
        1.0,  "rgba(200,240,50,1)"
      ],
      "heatmap-opacity": 0.90
    }
  });

  addMask(mapEuca, ring, "euca");
  addBorder(mapEuca, ptData, "euca");

  // ═══════════════════════════════════════════════
  // CARTE DROITE — Incendies 2015-2024
  // ═══════════════════════════════════════════════
  mapFire.addSource("fire-heat", { type: "geojson", data: firePoints });
  mapFire.addLayer({
    id: "fire-heatmap",
    type: "heatmap",
    source: "fire-heat",
    paint: {
      "heatmap-weight": [
        "interpolate", ["linear"], ["get", "area"], 0, 0, 5000, 1
      ],
      "heatmap-intensity": [
        "interpolate", ["linear"], ["zoom"], 5, 1.2, 9, 3.5
      ],
      "heatmap-radius": [
        "interpolate", ["linear"], ["zoom"], 5, 18, 8, 32, 10, 55
      ],
      "heatmap-color": [
        "interpolate", ["linear"], ["heatmap-density"],
        0,    "rgba(0,0,0,0)",
        0.10, "rgba(255,200,50,0.3)",
        0.30, "rgba(255,140,0,0.65)",
        0.55, "rgba(229,57,53,0.85)",
        0.80, "rgba(175,56,26,0.92)",
        1.0,  "rgba(100,0,0,1)"
      ],
      "heatmap-opacity": 0.88
    }
  });

  addMask(mapFire, ring, "fire");
  addBorder(mapFire, ptData, "fire");
  mapFire.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

  syncMaps(mapEuca, mapFire);
}
