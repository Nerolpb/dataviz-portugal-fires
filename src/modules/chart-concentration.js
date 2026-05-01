import * as d3 from "d3";

export function drawConcentrationChart(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const data = [
    { country: "Portugal",  code: "pt", percent: 26   },
    { country: "Espagne",   code: "es", percent: 4    },
    { country: "Chine",     code: "cn", percent: 2.5  },
    { country: "Brésil",    code: "br", percent: 1.5  },
    { country: "Australie", code: "au", percent: 1    },
  ];

  const sel = d3.select(containerSelector);
  sel.selectAll("svg").remove();

  const W = 900, H = 290;
  const maxR    = 90;
  const bottomY = 205; // toutes les bulles s'alignent par le bas
  const xPos    = [105, 285, 455, 625, 790];

  const rScale = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.percent)])
    .range([0, maxR]);

  const svg = sel
    .append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const defs = svg.append("defs");

  data.forEach((d, i) => {
    const r  = rScale(d.percent);
    const cx = xPos[i];
    const cy = bottomY - r;
    const isPortugal = d.country === "Portugal";

    // Pattern avec centrage manuel pour drapeaux 3:2
    const patternId = `flag-${d.code}`;
    const flagW = r * 3;          // largeur naturelle (ratio 3:2)
    const flagH = r * 2;          // hauteur = diamètre du cercle
    const flagOffsetX = -r * 0.5; // décalage pour centrer horizontalement

    defs.append("pattern")
      .attr("id", patternId)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("x", cx - r)
      .attr("y", cy - r)
      .attr("width",  r * 2)
      .attr("height", r * 2)
      .append("image")
      .attr("href", `/src/assets/flags/${d.code}.png`)
      .attr("x", flagOffsetX)
      .attr("y", 0)
      .attr("width",  flagW)
      .attr("height", flagH)
      .attr("preserveAspectRatio", "none");

    const group = svg.append("g").attr("class", "bubble-group");

    // Cercle rempli avec le pattern drapeau (animé via rayon)
    group.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 0)
      .attr("fill", `url(#${patternId})`)
      .transition()
      .duration(900)
      .delay(i * 120)
      .ease(d3.easeCubicOut)
      .attr("r", r);

    // Bordure du cercle (animée)
    group.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 0)
      .attr("fill", "none")
      .attr("stroke", isPortugal ? "var(--vert-elec)" : "rgba(255,255,255,0.35)")
      .attr("stroke-width", isPortugal ? 3 : 2)
      .transition()
      .duration(900)
      .delay(i * 120)
      .ease(d3.easeCubicOut)
      .attr("r", r);

    // Pourcentage
    group.append("text")
      .attr("x", cx)
      .attr("y", bottomY + 22)
      .attr("text-anchor", "middle")
      .attr("fill", isPortugal ? "var(--vert-elec)" : "rgba(255,255,255,0.9)")
      .attr("font-size", isPortugal ? "17px" : "13px")
      .attr("font-weight", "700")
      .attr("font-family", "neue-haas-grotesk-text, sans-serif")
      .style("opacity", 0)
      .text(`${d.percent} %`)
      .transition()
      .duration(600)
      .delay(i * 120 + 400)
      .style("opacity", 1);

    // Nom du pays
    group.append("text")
      .attr("x", cx)
      .attr("y", bottomY + 42)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.5)")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .attr("font-family", "neue-haas-grotesk-text, sans-serif")
      .style("opacity", 0)
      .text(d.country)
      .transition()
      .duration(600)
      .delay(i * 120 + 400)
      .style("opacity", 1);
  });
}
