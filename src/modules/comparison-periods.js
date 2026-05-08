import * as d3 from "d3";

const drawn = new Set();

export async function drawPeriodComparison(containerSelector) {
  if (drawn.has(containerSelector)) return;
  const container = document.querySelector(containerSelector);
  if (!container) return;

  let raw;
  try {
    raw = await fetch("/data/feux_75_24.json").then(r => r.json());
  } catch {
    return;
  }

  let total1 = 0, total2 = 0;
  for (const f of raw.features) {
    const year = f.properties.Ano;
    const area = f.properties.AreaHaSIG || 0;
    if (year >= 1975 && year <= 1999) total1 += area;
    if (year >= 2000 && year <= 2024) total2 += area;
  }

  const data = [
    { label: "1975 — 1999", total: total1, color: "#7A3010" },
    { label: "2000 — 2024", total: total2, color: "#FF5500" },
  ];

  const margin = { top: 24, right: 24, bottom: 64, left: 24 };
  const W = 620 - margin.left - margin.right;
  const H = 460 - margin.top - margin.bottom;

  d3.select(containerSelector).selectAll("*").remove();

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("viewBox", `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("overflow", "visible");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([0, W])
    .padding(0.4);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.total) * 1.18])
    .range([H, 0]);

  // Barres
  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("x", d => x(d.label))
    .attr("width", x.bandwidth())
    .attr("y", H)
    .attr("height", 0)
    .attr("fill", d => d.color)
    .attr("rx", 4)
    .transition()
    .duration(1000)
    .ease(d3.easeCubicOut)
    .attr("y", d => y(d.total))
    .attr("height", d => H - y(d.total));

  // Valeurs au-dessus des barres
  g.selectAll(".val-label")
    .data(data)
    .enter().append("text")
    .attr("x", d => x(d.label) + x.bandwidth() / 2)
    .attr("y", d => y(d.total) - 10)
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .attr("font-size", "20px")
    .attr("font-weight", "700")
    .attr("font-family", "neue-haas-grotesk-text, sans-serif")
    .text(d => Math.round(d.total).toLocaleString("fr-FR") + " ha");

  // Labels axe X
  g.selectAll(".x-label")
    .data(data)
    .enter().append("text")
    .attr("x", d => x(d.label) + x.bandwidth() / 2)
    .attr("y", H + 34)
    .attr("text-anchor", "middle")
    .attr("fill", "rgba(255,255,255,0.65)")
    .attr("font-size", "15px")
    .attr("font-family", "neue-haas-grotesk-text, sans-serif")
    .text(d => d.label);

  // Ligne de base
  g.append("line")
    .attr("x1", 0).attr("x2", W)
    .attr("y1", H).attr("y2", H)
    .attr("stroke", "rgba(255,255,255,0.15)")
    .attr("stroke-width", 1);

  drawn.add(containerSelector);
}
