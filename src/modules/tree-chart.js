import * as d3 from "d3";

export function drawTreeChart(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const dataArbres = [
    { arbre: "Eucalyptus", total: 35941 },
    { arbre: "Pin maritim", total: 32095 },
    { arbre: "Chêne-liège", total: 30366 },
    { arbre: "Chêne vert", total: 14629 },
    { arbre: "Pin parasol", total: 8812 }
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

  // Nettoyage au cas où la fonction est appelée plusieurs fois
  const svgSelection = d3.select(containerSelector);
  svgSelection.selectAll("*").remove();

  // Configuration des dimensions (on utilise viewBox pour que ce soit responsive)
  const margin = { top: 100, right: 30, bottom: 40, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const svg = svgSelection
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Échelles
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
    .attr("fill", "#000000")
    .attr("font-size", "14px")
    .attr("font-weight", "600")
    .attr("font-family", "neue-haas-grotesk-text, sans-serif");

  // Axe Y
  g.append("g")
    .attr("class", "axis axis--y")
    .call(
      d3.axisLeft(y)
        .ticks(6)
        .tickFormat(d => d / 1000 + "k")
    )
    .selectAll("text")
    .attr("fill", "#000000")
    .attr("font-size", "14px")
    .attr("font-family", "neue-haas-grotesk-text, sans-serif");

  // Groupes pour chaque arbre
  const trees = g.selectAll(".tree-group")
    .data(dataArbres)
    .enter()
    .append("g")
    .attr("class", "tree-group")
    .attr("transform", d => `translate(${x(d.arbre)}, 0)`);

  const bw = x.bandwidth();
  const imgSize = Math.min(bw * 1.2, 70);

  // Dessin de la barre
  trees.append("rect")
    .attr("x", 0)
    .attr("y", height)
    .attr("width", bw)
    .attr("height", 0)
    .attr("fill", d => d.arbre === "Eucalyptus" ? "var(--vert-elec)" : "#CCCCCC")
    .attr("rx", 6)
    .attr("ry", 6)
    .transition()
    .duration(1200)
    .ease(d3.easeCubicOut)
    .attr("y", d => y(d.total))
    .attr("height", d => height - y(d.total));

  // Ajout de l'image via foreignObject pour permettre un contrôle CSS précis (object-fit, transform)
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
    .style("-webkit-transform", "translateZ(0)"); // Hack Safari pour le border-radius

  imgContainer.append("xhtml:img")
    .attr("src", d => `src/assets/${getImageFile(d.arbre)}`)
    .style("width", "100%")
    .style("height", "100%")
    .style("object-fit", "cover")
    .style("object-position", d => {
        // Le chêne-liège est centré par défaut, on le décale seulement au survol
        if (d.arbre === "Eucalyptus" || d.arbre === "Pin maritim") return "center 10%"; // Descend l'image
        return "center center";
    })
    .style("transform", d => (d.arbre === "Eucalyptus" || d.arbre === "Pin maritim") ? "scale(1.4)" : "scale(1)")
    .style("transition", "transform 0.4s ease, opacity 0.3s ease, object-position 0.4s ease")
    .style("cursor", "crosshair")
    .on("mouseover", function(event, d) {
      const overlay = document.getElementById("tree-image-overlay");
      const largeImg = document.getElementById("tree-image-large");
      if (overlay && largeImg) {
        largeImg.src = `src/assets/${getImageFile(d.arbre)}`;
        overlay.classList.add("is-visible");
      }
      
      const el = d3.select(this);
      el.style("opacity", 0.7)
        .style("transform", (d.arbre === "Eucalyptus" || d.arbre === "Pin maritim") ? "scale(1)" : "scale(1.1)"); // Dezoom pour Euca/Pin
        
      if (d.arbre === "Chêne-liège") {
        el.style("object-position", "100% center"); // Décale l'image vers la gauche au survol
      }
    })
    .on("mouseout", function(event, d) {
      const overlay = document.getElementById("tree-image-overlay");
      if (overlay) {
        overlay.classList.remove("is-visible");
      }
      
      const el = d3.select(this);
      el.style("opacity", 1)
        .style("transform", (d.arbre === "Eucalyptus" || d.arbre === "Pin maritim") ? "scale(1.4)" : "scale(1)"); // Retour au zoom initial
        
      if (d.arbre === "Chêne-liège") {
        el.style("object-position", "center center"); // Retour au centre
      }
    });

  // Animation d'apparition
  fo.transition()
    .duration(1200)
    .ease(d3.easeCubicOut)
    .style("opacity", 1)
    .attr("y", d => y(d.total) - imgSize - 10);

  // Ajout du texte (total)
  trees.append("text")
    .attr("class", d => d.arbre === "Eucalyptus" ? "tree-label label-euca" : "tree-label")
    .attr("x", bw / 2)
    .attr("y", height)
    .attr("text-anchor", "middle")
    .attr("fill", "#000000")
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