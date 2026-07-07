const WIDTH = 1200;
const HEIGHT = 630;

const INK = "#25142f";
const PAPER = "#fff8ed";

const ACCENTS = [
  { fill: "#ff6f91", soft: "#ffd3df" }, // rose
  { fill: "#5b5eea", soft: "#dcdcff" }, // indigo
  { fill: "#00b8d9", soft: "#c7f7ff" }, // cyan
  { fill: "#35d39d", soft: "#d7ffea" }, // mint
  { fill: "#ff9f1c", soft: "#ffe7b8" } // orange
];

function fnv1a(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return function rng() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function between(rng, min, max) {
  return min + rng() * (max - min);
}

function frame() {
  const corners = [
    [28, 46, 46, 28],
    [WIDTH - 28, 46, WIDTH - 46, 28],
    [28, HEIGHT - 46, 46, HEIGHT - 28],
    [WIDTH - 28, HEIGHT - 46, WIDTH - 46, HEIGHT - 28]
  ];
  const ticks = corners
    .map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="2" opacity="0.35" />`)
    .join("");

  return `
    <rect x="28" y="28" width="${WIDTH - 56}" height="${HEIGHT - 56}" rx="18" fill="none" stroke="${INK}" stroke-width="2" opacity="0.25" />
    ${ticks}
  `;
}

function starField(rng, count, region) {
  let stars = "";
  for (let i = 0; i < count; i += 1) {
    const x = between(rng, region.x0, region.x1);
    const y = between(rng, region.y0, region.y1);
    const r = between(rng, 1.4, 2.6);
    const o = between(rng, 0.25, 0.6);
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${INK}" opacity="${o.toFixed(2)}" />`;
  }
  return stars;
}

function hatchPattern(id, opacity) {
  return `
    <pattern id="${id}" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="12" stroke="${INK}" stroke-width="1" opacity="${opacity}" />
    </pattern>
  `;
}

function tinyFigure(x, groundY, rng) {
  const scale = between(rng, 0.85, 1.15);
  const headR = 4.2 * scale;
  const bodyLen = 20 * scale;
  const staff = rng() > 0.5;
  const staffMarkup = staff
    ? `<line x1="${x + 5 * scale}" y1="${groundY - bodyLen * 0.55}" x2="${x + 5 * scale}" y2="${groundY + 3}" stroke="${INK}" stroke-width="1.6" opacity="0.75" />`
    : "";

  return `
    <g>
      <circle cx="${x}" cy="${groundY - bodyLen - headR}" r="${headR.toFixed(1)}" fill="${INK}" opacity="0.85" />
      <line x1="${x}" y1="${groundY - bodyLen}" x2="${x}" y2="${groundY}" stroke="${INK}" stroke-width="2" opacity="0.85" />
      ${staffMarkup}
    </g>
  `;
}

function duneScene(rng, accent) {
  const baseY = between(rng, 420, 460);
  const dip = between(rng, -50, 50);
  const cp1 = `${WIDTH * 0.3},${baseY + dip}`;
  const cp2 = `${WIDTH * 0.7},${baseY - dip}`;
  const endY = between(rng, 400, 470);
  const curve = `M0,${baseY} C${cp1} ${cp2} ${WIDTH},${endY}`;
  const groundPath = `${curve} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  const sunCx = between(rng, WIDTH * 0.62, WIDTH * 0.82);
  const sunCy = baseY - between(rng, 40, 90);
  const sunR = between(rng, 46, 62);

  let rays = "";
  const rayCount = 14;
  for (let i = 0; i < rayCount; i += 1) {
    const angle = Math.PI + (i / (rayCount - 1)) * Math.PI;
    const r1 = sunR + 14;
    const r2 = sunR + between(rng, 26, 40);
    const x1 = sunCx + Math.cos(angle) * r1;
    const y1 = sunCy + Math.sin(angle) * r1;
    const x2 = sunCx + Math.cos(angle) * r2;
    const y2 = sunCy + Math.sin(angle) * r2;
    rays += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${INK}" stroke-width="1.5" opacity="0.45" />`;
  }

  const figureX = between(rng, WIDTH * 0.15, WIDTH * 0.45);

  return `
    <defs>${hatchPattern("hatch", 0.3)}</defs>
    <path d="${groundPath}" fill="${accent.soft}" />
    <clipPath id="groundClip"><path d="${groundPath}" /></clipPath>
    <rect x="0" y="${baseY - 20}" width="${WIDTH}" height="${HEIGHT}" fill="url(#hatch)" clip-path="url(#groundClip)" />
    <path d="${curve}" fill="none" stroke="${INK}" stroke-width="2.5" opacity="0.85" />
    ${rays}
    <circle cx="${sunCx.toFixed(1)}" cy="${sunCy.toFixed(1)}" r="${sunR.toFixed(1)}" fill="none" stroke="${INK}" stroke-width="2" opacity="0.85" />
    <circle cx="${sunCx.toFixed(1)}" cy="${sunCy.toFixed(1)}" r="${(sunR * 0.55).toFixed(1)}" fill="${accent.fill}" opacity="0.9" />
    ${starField(rng, 18, { x0: 60, y0: 60, x1: WIDTH - 60, y1: baseY - 60 })}
    ${tinyFigure(figureX, baseY + (dip > 0 ? dip * 0.3 : 0), rng)}
  `;
}

function eclipseScene(rng, accent) {
  const arcCx = WIDTH * 0.5;
  const apexY = between(rng, 90, 200);
  const arcCy = HEIGHT + between(rng, 40, 120);
  const arcR = arcCy - apexY;
  const aperture = between(rng, 0.5, 0.78);

  const pointAt = (a) => ({
    x: arcCx + arcR * Math.sin(a),
    y: arcCy - arcR * Math.cos(a)
  });

  const p1 = pointAt(-aperture);
  const p2 = pointAt(aperture);
  const arcPath = `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} A${arcR},${arcR} 0 0 1 ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;

  const t = between(rng, -0.3, 0.3);
  const moon = pointAt(t * aperture);
  const moonCx = moon.x;
  const moonCy = moon.y;
  const moonR = between(rng, 26, 36);

  const ridgeY = between(rng, 500, 540);
  const ridgePoints = [];
  const segments = 7;
  for (let i = 0; i <= segments; i += 1) {
    const x = (WIDTH / segments) * i;
    const y = ridgeY - between(rng, 0, 46);
    ridgePoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const ridgeLine = `M0,${HEIGHT} L${ridgePoints.join(" L")} L${WIDTH},${HEIGHT} Z`;
  const ridgeStroke = `M${ridgePoints.join(" L")}`;

  return `
    <defs>${hatchPattern("hatch", 0.28)}</defs>
    <path d="${arcPath}" fill="none" stroke="${INK}" stroke-width="1.6" opacity="0.4" />
    <circle cx="${arcCx.toFixed(1)}" cy="${arcCy.toFixed(1)}" r="${(arcR * 0.55).toFixed(1)}" fill="none" stroke="${INK}" stroke-width="1.2" opacity="0.2" />
    <path d="${ridgeLine}" fill="${accent.soft}" />
    <clipPath id="ridgeClip"><path d="${ridgeLine}" /></clipPath>
    <rect x="0" y="${ridgeY - 60}" width="${WIDTH}" height="${HEIGHT}" fill="url(#hatch)" clip-path="url(#ridgeClip)" />
    <path d="${ridgeStroke}" fill="none" stroke="${INK}" stroke-width="2.5" opacity="0.85" />
    ${starField(rng, 22, { x0: 60, y0: 60, x1: WIDTH - 60, y1: ridgeY - 40 })}
    <circle cx="${moonCx.toFixed(1)}" cy="${moonCy.toFixed(1)}" r="${moonR.toFixed(1)}" fill="${accent.fill}" opacity="0.92" />
    <circle cx="${moonCx.toFixed(1)}" cy="${moonCy.toFixed(1)}" r="${(moonR + 8).toFixed(1)}" fill="none" stroke="${INK}" stroke-width="1.4" opacity="0.35" />
  `;
}

function monolithScene(rng, accent) {
  const baseY = between(rng, 470, 500);
  const curve = `M0,${baseY + between(rng, -20, 20)} Q${WIDTH * 0.5},${baseY + between(rng, -30, 30)} ${WIDTH},${baseY + between(rng, -20, 20)}`;
  const groundPath = `${curve} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  const monoX = between(rng, WIDTH * 0.42, WIDTH * 0.58);
  const monoW = between(rng, 26, 36);
  const monoH = between(rng, 220, 280);
  const monoTop = baseY - monoH;

  const moon1 = { cx: between(rng, WIDTH * 0.15, WIDTH * 0.3), cy: between(rng, 90, 140), r: between(rng, 30, 42) };
  const moon2 = { cx: between(rng, WIDTH * 0.7, WIDTH * 0.85), cy: between(rng, 130, 180), r: between(rng, 16, 24) };

  let hatchLines = "";
  const lines = 10;
  for (let i = 0; i < lines; i += 1) {
    const y = monoTop + (monoH / lines) * i + 6;
    hatchLines += `<line x1="${(monoX + monoW * 0.15).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(monoX + monoW * 0.85).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${INK}" stroke-width="1" opacity="0.18" />`;
  }

  return `
    <defs>${hatchPattern("hatch", 0.28)}</defs>
    <path d="${groundPath}" fill="${accent.soft}" />
    <clipPath id="groundClip"><path d="${groundPath}" /></clipPath>
    <rect x="0" y="${baseY - 20}" width="${WIDTH}" height="${HEIGHT}" fill="url(#hatch)" clip-path="url(#groundClip)" />
    <path d="${curve}" fill="none" stroke="${INK}" stroke-width="2.5" opacity="0.85" />
    ${starField(rng, 16, { x0: 60, y0: 60, x1: WIDTH - 60, y1: baseY - 60 })}
    <circle cx="${moon1.cx.toFixed(1)}" cy="${moon1.cy.toFixed(1)}" r="${moon1.r.toFixed(1)}" fill="none" stroke="${INK}" stroke-width="2" opacity="0.8" />
    <circle cx="${moon2.cx.toFixed(1)}" cy="${moon2.cy.toFixed(1)}" r="${moon2.r.toFixed(1)}" fill="${accent.fill}" opacity="0.9" />
    <rect x="${(monoX - monoW / 2).toFixed(1)}" y="${monoTop.toFixed(1)}" width="${monoW.toFixed(1)}" height="${monoH.toFixed(1)}" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" opacity="0.9" />
    ${hatchLines}
  `;
}

const SCENES = [duneScene, eclipseScene, monolithScene];

export function buildOgImageSvg(seedText) {
  const seed = fnv1a(seedText);
  const rng = mulberry32(seed);
  const accent = pick(rng, ACCENTS);
  const scene = pick(rng, SCENES);
  const body = scene(rng, accent);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${PAPER}" />
    ${body}
    ${frame()}
  </svg>`;
}

export const OG_IMAGE_SIZE = { width: WIDTH, height: HEIGHT };
