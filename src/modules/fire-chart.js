import * as d3 from "d3";

let drawn = false;

export async function drawFireTimeline(containerSelector) {
  if (drawn) return;
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = `<p class="chart-loading">Chargement des données…</p>`;

  let raw;
  try {
    raw = await fetch("/data/feux_75_24.json").then(r => r.json());
  } catch {
    container.innerHTML = `<p class="chart-loading">Données indisponibles</p>`;
    return;
  }

  // Aggrégation par année
  const byYear = d3.rollup(
    raw.features,
    v => d3.sum(v, d => d.properties.AreaHaSIG),
    d => d.properties.Ano
  );

  const data = Array.from(byYear, ([year, area]) => ({ year: +year, area }))
    .filter(d => d.year >= 1975 && d.year <= 2024)
    .sort((a, b) => a.year - b.year);

  d3.select(containerSelector).selectAll("*").remove();

  // Création du tooltip
  const tooltip = d3.select(containerSelector)
    .append("div")
    .attr("class", "chart-tooltip");

  const margin = { top: 45, right: 50, bottom: 52, left: 90 };
  const W = 960 - margin.left - margin.right;
  const H = 360 - margin.top - margin.bottom;

  const svg = d3.select(containerSelector)
    .append("svg")
    .attr("viewBox", `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const maxArea = d3.max(data, d => d.area);
  const avg = d3.mean(data, d => d.area);

  const x = d3.scaleBand()
    .domain(data.map(d => d.year))
    .range([0, W])
    .padding(0.12);

  const y = d3.scaleLinear()
    .domain([0, maxArea * 1.18])
    .range([H, 0]);

  // Grille horizontale
  g.selectAll(".grid")
    .data(y.ticks(5))
    .enter().append("line")
    .attr("x1", 0).attr("x2", W)
    .attr("y1", d => y(d)).attr("y2", d => y(d))
    .attr("stroke", "rgba(0,0,0,0.05)")
    .attr("stroke-dasharray", "4,6");

  // Ligne moyenne
  g.append("line")
    .attr("x1", 0).attr("x2", W)
    .attr("y1", y(avg)).attr("y2", y(avg))
    .attr("stroke", "rgba(255,140,0,0.35)")
    .attr("stroke-dasharray", "8,5")
    .attr("stroke-width", 1.5);

  g.append("text")
    .attr("x", W + 6)
    .attr("y", y(avg) + 4)
    .attr("fill", "rgba(255,140,0,0.5)")
    .attr("font-size", "11px")
    .attr("font-family", "pacaembu, sans-serif")
    .text("moy.");

  // Échelle couleur : brun sombre → orange vif
  const colorScale = d3.scaleSequential()
    .domain([0, maxArea])
    .interpolator(t => d3.interpolateRgb("#2a0800", "#FF5500")(Math.sqrt(t)));

  // Barres
  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.year))
    .attr("width", x.bandwidth())
    .attr("y", H)
    .attr("height", 0)
    .attr("fill", d => d.year === 2017 ? "#FFD060" : colorScale(d.area))
    .attr("rx", 1)
    .on("mouseover", function(event, d) {
      d3.select(this).attr("opacity", 0.7);
      tooltip.style("opacity", 1);
      
      const formatArea = d3.format(",")(Math.round(d.area)).replace(/,/g, ' ');
      const footFields = d3.format(",")(Math.round(d.area / 0.714)).replace(/,/g, ' ');

      tooltip.html(`
        <div class="chart-tooltip-year">${d.year}</div>
        <div class="chart-tooltip-row">
          <span class="chart-tooltip-label">Surface brûlée</span>
          <span class="chart-tooltip-value">${formatArea} ha</span>
        </div>
        <div class="chart-tooltip-row">
          <span class="chart-tooltip-label">Équivalent</span>
          <span class="chart-tooltip-value">~${footFields} terrains de foot</span>
        </div>
      `);
    })
    .on("mousemove", function(event) {
      const [mx, my] = d3.pointer(event, container);
      
      // Ajustement pour ne pas déborder à droite
      const tooltipNode = tooltip.node();
      const tooltipWidth = tooltipNode ? tooltipNode.offsetWidth : 200;
      let left = mx + 15;
      
      if (left + tooltipWidth > container.clientWidth) {
        left = mx - tooltipWidth - 15;
      }

      tooltip
        .style("left", left + "px")
        .style("top", (my - 20) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("opacity", 1);
      tooltip.style("opacity", 0);
    })
    .transition()
    .duration(900)
    .delay((_, i) => i * 9)
    .ease(d3.easeCubicOut)
    .attr("y", d => y(d.area))
    .attr("height", d => H - y(d.area));

  // Axe X — chaque 5 ans
  g.append("g")
    .attr("transform", `translate(0,${H})`)
    .call(
      d3.axisBottom(x)
        .tickValues(data.filter(d => d.year % 5 === 0).map(d => d.year))
        .tickSize(5)
    )
    .call(ax => ax.select(".domain").attr("stroke", "rgba(0,0,0,0.15)"))
    .call(ax => ax.selectAll("line").attr("stroke", "rgba(0,0,0,0.15)"))
    .selectAll("text")
    .attr("fill", "rgba(0,0,0,0.55)")
    .attr("font-size", "12px")
    .attr("font-family", "pacaembu, sans-serif")
    .attr("dy", "1.1em");

  // Axe Y
  g.append("g")
    .call(
      d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => Math.round(d / 1000) + "k ha")
        .tickSize(5)
    )
    .call(ax => ax.select(".domain").attr("stroke", "rgba(0,0,0,0.15)"))
    .call(ax => ax.selectAll("line").attr("stroke", "rgba(0,0,0,0.15)"))
    .selectAll("text")
    .attr("fill", "rgba(0,0,0,0.55)")
    .attr("font-size", "12px")
    .attr("font-family", "pacaembu, sans-serif");

  // Annotation 2017
  const d2017 = data.find(d => d.year === 2017);
  if (d2017) {
    const cx = x(2017) + x.bandwidth() / 2;
    const cy = y(d2017.area);
    g.append("line")
      .attr("x1", cx).attr("x2", cx)
      .attr("y1", cy - 6).attr("y2", cy - 22)
      .attr("stroke", "#FFD060")
      .attr("stroke-width", 1);
    g.append("text")
      .attr("x", cx)
      .attr("y", cy - 28)
      .attr("text-anchor", "middle")
      .attr("fill", "#FFD060")
      .attr("font-size", "13px")
      .attr("font-weight", "700")
      .attr("font-family", "pacaembu, sans-serif")
      .text("▲ 2017 — " + Math.round(d2017.area / 1000) + "k ha");
  }

  drawn = true;
}
