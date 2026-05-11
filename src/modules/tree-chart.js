import * as d3 from "d3";

export function drawTreeChart(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const dataArbres = [
    { arbre: "Eucalyptus", total: 35941, wiki: "https://fr.wikipedia.org/wiki/Eucalyptus" },
    { arbre: "Pin maritim", total: 32095, wiki: "https://fr.wikipedia.org/wiki/Pinus_pinaster" },
    { arbre: "Chêne-liège", total: 30366, wiki: "https://fr.wikipedia.org/wiki/Ch%C3%AAne-li%C3%A8ge" },
    { arbre: "Chêne vert",  total: 14629, wiki: "https://fr.wikipedia.org/wiki/Ch%C3%AAne_vert" },
    { arbre: "Pin parasol", total:  8812, wiki: "https://fr.wikipedia.org/wiki/Pin_parasol" }
  ];

  const getImageFile = (arbre) => {
    switch(arbre) {
      case "Eucalyptus": return "eucalyptus.jpg";
      case "Pin maritim": return "pin_maritim.jpg";
      case "Pin parasol": return "Pin_parasol.jpg";
      case "Chêne-liège": return "chene_liege.jpg";
      case "Chêne vert": return "chene_vert.jpg";
      default: return "arbre1.png";
    }
  };

  // ── Overlay : logique d'ouverture/fermeture avec délai ──
  let closeTimer = null;

  const overlay  = document.getElementById("tree-image-overlay");
  const largeImg = document.getElementById("tree-image-large");
  const wikiLink = document.getElementById("tree-wiki-link");

  function openOverlay(d) {
    clearTimeout(closeTimer);
    if (!overlay || !largeImg) return;
    largeImg.src = `./assets/${getImageFile(d.arbre)}`;
    if (wikiLink) wikiLink.href = d.wiki;
    overlay.classList.add("is-visible");
  }

  function scheduleClose() {
    closeTimer = setTimeout(() => {
      if (overlay) overlay.classList.remove("is-visible");
    }, 300);
  }

  if (overlay) {
    overlay.addEventListener("mouseenter", () => clearTimeout(closeTimer));
    overlay.addEventListener("mouseleave", scheduleClose);
  }

  const svgSelection = d3.select(containerSelector);
  svgSelection.selectAll("svg").remove();

  const margin = { top: 100, right: 30, bottom: 40, left: 60 };
  const width  = 800 - margin.left - margin.right;
  const height = 450 - margin.top  - margin.bottom;

  const svg = svgSelection
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(dataArbres.map(d => d.arbre))
    .range([0, width])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(dataArbres, d => d.total) * 1.1])
    .range([height, 0]);

  // Axe X
  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("fill", "rgba(255,255,255,0.85)")
    .attr("font-size", "14px")
    .attr("font-weight", "600")
    .attr("font-family", "neue-haas-grotesk-text, sans-serif");

  // Axe Y
  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(6).tickFormat(d => d / 1000 + "k"))
    .selectAll("text")
    .attr("fill", "rgba(255,255,255,0.75)")
    .attr("font-size", "14px")
    .attr("font-family", "neue-haas-grotesk-text, sans-serif");

  const trees = g.selectAll(".tree-group")
    .data(dataArbres)
    .enter()
    .append("g")
    .attr("class", "tree-group")
    .attr("transform", d => `translate(${x(d.arbre)}, 0)`);

  const bw      = x.bandwidth();
  const imgSize = Math.min(bw * 1.2, 70);

  const getFrontColor = d => d.arbre === "Eucalyptus" ? "var(--vert-elec)" : "rgba(255,255,255,0.22)";

  // Barre simple (sans 3D)
  trees.append("rect")
    .attr("x", 0)
    .attr("y", height)
    .attr("width", bw)
    .attr("height", 0)
    .attr("fill", getFrontColor)
    .transition().duration(1200).ease(d3.easeCubicOut)
    .attr("y", d => y(d.total))
    .attr("height", d => height - y(d.total));

  // Image au-dessus de la barre
  const fo = trees.append("foreignObject")
    .attr("x", (bw - imgSize) / 2)
    .attr("y", height)
    .attr("width", imgSize)
    .attr("height", imgSize)
    .style("opacity", 0);

  const imgContainer = fo.append("xhtml:div")
    .style("width", "100%")
    .style("height", "100%")
    .style("border-radius", "50%")
    .style("overflow", "hidden")
    .style("-webkit-transform", "translateZ(0)");

  imgContainer.append("xhtml:img")
    .attr("src", d => `./assets/${getImageFile(d.arbre)}`)
    .style("width", "100%")
    .style("height", "100%")
    .style("object-fit", "cover")
    .style("object-position", d => {
      if (d.arbre === "Eucalyptus" || d.arbre === "Pin maritim") return "center 10%";
      return "center center";
    })
    .style("transform", d => (d.arbre === "Eucalyptus" || d.arbre === "Pin maritim") ? "scale(1.4)" : "scale(1)")
    .style("transition", "transform 0.4s ease, opacity 0.3s ease, object-position 0.4s ease")
    .style("cursor", "crosshair")
    .on("mouseover", function(event, d) {
      openOverlay(d);
      const el = d3.select(this);
      el.style("opacity", 0.7)
        .style("transform", (d.arbre === "Eucalyptus" || d.arbre === "Pin maritim") ? "scale(1)" : "scale(1.1)");
      if (d.arbre === "Chêne-liège") el.style("object-position", "100% center");
    })
    .on("mouseout", function(event, d) {
      scheduleClose();
      const el = d3.select(this);
      el.style("opacity", 1)
        .style("transform", (d.arbre === "Eucalyptus" || d.arbre === "Pin maritim") ? "scale(1.4)" : "scale(1)");
      if (d.arbre === "Chêne-liège") el.style("object-position", "center center");
    });

  fo.transition()
    .duration(1200)
    .ease(d3.easeCubicOut)
    .style("opacity", 1)
    .attr("y", d => y(d.total) - imgSize - 10);

  // Valeur numérique
  trees.append("text")
    .attr("class", d => d.arbre === "Eucalyptus" ? "tree-label label-euca" : "tree-label")
    .attr("x", bw / 2)
    .attr("y", height)
    .attr("text-anchor", "middle")
    .attr("fill", "#ffffff")
    .attr("font-size", "16px")
    .attr("font-weight", "700")
    .attr("font-family", "neue-haas-grotesk-text, sans-serif")
    .text(d => d3.format(",")(d.total).replace(/,/g, ' '))
    .style("opacity", 0)
    .transition()
    .duration(1200)
    .ease(d3.easeCubicOut)
    .style("opacity", 1)
    .attr("y", d => y(d.total) - imgSize - 20);
}
