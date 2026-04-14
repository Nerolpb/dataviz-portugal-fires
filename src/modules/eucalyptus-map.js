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
    style: "https://demotiles.maplibre.org/style.json",
    center: [-8.2, 39.5],
    zoom: 6.5,
    minZoom: 5,
    maxZoom: 14,
    interactive: true,
    attributionControl: false,
    dragRotate: false,
  });

  map.touchZoomRotate?.disableRotation?.();
  mapInstance = map;

  map.on("load", async () => {
    // ── Masquer toutes les couches du style de base ──
    const layers = map.getStyle().layers;
    for (const layer of layers) {
      try {
        if (layer.type === "background") {
          map.setPaintProperty(layer.id, "background-color", "rgba(0,0,0,0)");
        } else if (layer.type === "fill") {
          map.setPaintProperty(layer.id, "fill-color", "rgba(0,0,0,0)");
          map.setPaintProperty(layer.id, "fill-opacity", 0);
        } else if (layer.type === "line") {
          map.setPaintProperty(layer.id, "line-color", "rgba(0,0,0,0)");
          map.setPaintProperty(layer.id, "line-opacity", 0);
        } else if (layer.type === "symbol") {
          map.setLayoutProperty(layer.id, "visibility", "none");
        }
      } catch (_) { /* ignore */ }
    }

    // ── Chargement des données ──
    const [eucaData, districtsData] = await Promise.all([
      fetch("/data/eucalyptus.json").then(r => r.json()),
      fetch("/data/portugal-districts.geojson").then(r => r.json()),
    ]);

    // ── Agrégation des plantations par district ──
    const stats = {};
    for (const f of districtsData.features) {
      stats[f.properties.name] = { count: 0, area: 0 };
    }

    for (const point of eucaData.features) {
      const coords = point.geometry.coordinates;
      const area = AREA_MIDPOINT[point.properties.dimensmanc] ?? 0;
      for (const district of districtsData.features) {
        if (geoContains(district, coords)) {
          stats[district.properties.name].count++;
          stats[district.properties.name].area += area;
          break;
        }
      }
    }

    // ── Districts enrichis avec les stats ──
    const enrichedDistricts = {
      ...districtsData,
      features: districtsData.features.map((f, i) => ({
        ...f,
        id: i,
        properties: {
          ...f.properties,
          euca_count: stats[f.properties.name]?.count ?? 0,
          euca_area:  Math.round(stats[f.properties.name]?.area ?? 0),
        },
      })),
    };

    // ── Source districts ──
    map.addSource("districts", {
      type: "geojson",
      data: enrichedDistricts,
      promoteId: "id",
    });

    // Fill blanc, légèrement assombri au survol
    map.addLayer({
      id: "districts-fill",
      type: "fill",
      source: "districts",
      paint: {
        "fill-color": "#FFFFFF",
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.75,
          1,
        ],
      },
    });

    // Bordure noire
    map.addLayer({
      id: "districts-line",
      type: "line",
      source: "districts",
      paint: {
        "line-color": "#000000",
        "line-width": 1.5,
      },
    });

    // ── Hover tooltip ──
    let hoveredId = null;

    map.on("mousemove", "districts-fill", (e) => {
      if (!e.features.length) return;
      const feat = e.features[0];
      const { name, euca_count, euca_area } = feat.properties;

      if (hoveredId !== null && hoveredId !== feat.id) {
        map.setFeatureState({ source: "districts", id: hoveredId }, { hover: false });
      }
      hoveredId = feat.id;
      map.setFeatureState({ source: "districts", id: hoveredId }, { hover: true });

      tooltip.style.display = "block";
      tooltip.style.left = (e.originalEvent.clientX + 14) + "px";
      tooltip.style.top  = (e.originalEvent.clientY + 14) + "px";
      tooltip.innerHTML = `
        <div class="tooltip-title">${name}</div>
        <div class="tooltip-row">
          <span>Plantations</span>
          <span>${euca_count.toLocaleString("fr-CH")}</span>
        </div>
        <div class="tooltip-row">
          <span>Superficie est.</span>
          <span>~${euca_area.toLocaleString("fr-CH")} ha</span>
        </div>
      `;
    });

    map.on("mouseleave", "districts-fill", () => {
      if (hoveredId !== null) {
        map.setFeatureState({ source: "districts", id: hoveredId }, { hover: false });
      }
      hoveredId = null;
      tooltip.style.display = "none";
      map.getCanvas().style.cursor = "";
    });

    map.on("mouseenter", "districts-fill", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    // ── Source eucalyptus avec clustering (par-dessus les districts) ──
    map.addSource("eucalyptus", {
      type: "geojson",
      data: eucaData,
      cluster: true,
      clusterMaxZoom: 12,
      clusterRadius: 100,
    });

    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "eucalyptus",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#1a6b2f",
        "circle-radius": [
          "step", ["get", "point_count"],
          7,
          50,  11,
          200, 16,
          1000, 22,
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#2ECC71",
        "circle-opacity": 0.9,
      },
    });

    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "eucalyptus",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": 12,
        "text-allow-overlap": true,
      },
      paint: {
        "text-color": "#FFFFFF",
        "text-halo-color": "#1a6b2f",
        "text-halo-width": 1,
      },
    });

    map.addLayer({
      id: "unclustered",
      type: "circle",
      source: "eucalyptus",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": 5,
        "circle-color": "#2ECC71",
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#1a6b2f",
        "circle-opacity": 0.85,
      },
    });

    map.on("click", "clusters", async (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
      if (!features.length) return;
      const clusterId = features[0].properties.cluster_id;
      const zoom = await map.getSource("eucalyptus").getClusterExpansionZoom(clusterId);
      map.easeTo({ center: features[0].geometry.coordinates, zoom, duration: 500 });
    });

    map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = ""; });
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
}
