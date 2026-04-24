import * as d3 from "d3";

export function drawConcentrationChart(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  // Données triées du plus grand au plus petit
  const data = [
    { country: "Portugal",  code: "pt", percent: 26   },
    { country: "Espagne",   code: "es", percent: 4    },
    { country: "Chine",     code: "cn", percent: 2.5  },
    { country: "Brésil",    code: "br", percent: 1.5  },
    { country: "Australie", code: "au", percent: 1    },
  ];

  const sel = d3.select(containerSelector);
  sel.selectAll("svg").remove();

  // Dimensions
  const margin = { top: 30, right: 80, bottom: 50, left: 150 };
  const width  = 750 - margin.left - margin.right;
  const height = 300 - margin.top  - margin.bottom;

  const svg = sel
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Échelles
  const y = d3.scaleBand()
    .domain(data.map(d => d.country))
    .range([0, height])
    .padding(0.35);

  const x = d3.scaleLinear()
    .domain([0, 30])
    .range([0, width]);

  // Axe Y — on le crée mais on cache le texte par défaut
  const yAxis = g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).tickSize(0));

  yAxis.select(".domain").style("display", "none");
  yAxis.selectAll(".tick line").style("display", "none");
  yAxis.selectAll("text").style("display", "none"); // On cache le texte auto

  // Axe X — masqué
  const xAxis = g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(0).tickSize(0));

  xAxis.select(".domain").style("display", "none");
  xAxis.selectAll(".tick line").style("display", "none");
  xAxis.selectAll("text").style("display", "none");

  // Lignes de repère verticales (grille)
  const gridTicks = [5, 10, 15, 20, 25];
  g.selectAll(".grid-line")
    .data(gridTicks)
    .enter()
    .append("line")
    .attr("class", "grid-line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "rgba(0, 0, 0, 0.1)")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "4 4");

  // Labels de repère en bas
  g.selectAll(".grid-label")
    .data(gridTicks)
    .enter()
    .append("text")
    .attr("class", "grid-label")
    .attr("x", d => x(d))
    .attr("y", height + 20)
    .attr("text-anchor", "middle")
    .attr("fill", "rgba(0, 0, 0, 0.35)")
    .attr("font-size", "11px")
    .attr("font-family", "neue-haas-grotesk-text, sans-serif")
    .text(d => `${d}%`);

  // Groupes personnalisés pour chaque barre (drapeau + texte + barre)
  const bars = g.selectAll(".bar-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "bar-group")
    .attr("transform", d => `translate(0, ${y(d.country)})`);

  // Drapeaux (via FlagCDN)
  bars.append("image")
    .attr("href", d => `https://flagcdn.com/w40/${d.code}.png`)
    .attr("x", -140)
    .attr("y", y.bandwidth() / 2 - 12)
    .attr("width", 24)
    .attr("height", 16);

  // Noms des pays
  bars.append("text")
    .attr("x", -108)
    .attr("y", y.bandwidth() / 2 + 5)
    .text(d => d.country)
    .attr("font-size", "15px")
    .attr("font-family", "neue-haas-grotesk-text, sans-serif")
    .attr("font-weight", d => d.country === "Portugal" ? "700" : "500")
    .attr("fill", d => d.country === "Portugal" ? "var(--vert-elec)" : "#333333");

  // Barres
  bars.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", y.bandwidth())
    .attr("width", 0)
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("fill", d => d.country === "Portugal" ? "var(--vert-elec)" : "#E0E0E0")
    .transition()
    .duration(1500)
    .ease(d3.easeCubicOut)
    .attr("width", d => x(d.percent));

  // Labels de pourcentage (suivent le bout de la barre)
  bars.append("text")
    .attr("class", "bar-label")
    .attr("y", y.bandwidth() / 2)
    .attr("x", 0)
    .attr("dy", "0.35em")
    .attr("fill", d => d.country === "Portugal" ? "var(--vert-elec)" : "#666666")
    .attr("font-size", "14px")
    .attr("font-weight", "700")
    .attr("font-family", "neue-haas-grotesk-text, sans-serif")
    .text(d => `${d.percent} %`)
    .transition()
    .duration(1500)
    .ease(d3.easeCubicOut)
    .attr("x", d => x(d.percent) + 10);
}
