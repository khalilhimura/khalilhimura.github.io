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
    [28, 70, 28, 28, 70, 28],
    [WIDTH - 28, 70, WIDTH - 28, 28, WIDTH - 70, 28],
    [28, HEIGHT - 70, 28, HEIGHT - 28, 70, HEIGHT - 28],
    [WIDTH - 28, HEIGHT - 70, WIDTH - 28, HEIGHT - 28, WIDTH - 70, HEIGHT - 28]
  ];
  const ticks = corners
    .map(([x1, y1, x2, y2, x3, y3]) => `<path d="M${x1},${y1} L${x2},${y2} L${x3},${y3}" fill="none" stroke="${INK}" stroke-width="2" opacity="0.4" />`)
    .join("");

  return `
    <rect x="28" y="28" width="${WIDTH - 56}" height="${HEIGHT - 56}" rx="6" fill="none" stroke="${INK}" stroke-width="1.5" opacity="0.3" />
    ${ticks}
  `;
}

function starburst(x, y, r, opacity) {
  return `
    <line x1="${(x - r).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + r).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${INK}" stroke-width="1" opacity="${opacity}" />
    <line x1="${x.toFixed(1)}" y1="${(y - r).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + r).toFixed(1)}" stroke="${INK}" stroke-width="1" opacity="${opacity}" />
  `;
}

function starField(rng, count, region) {
  let stars = "";
  for (let i = 0; i < count; i += 1) {
    const x = between(rng, region.x0, region.x1);
    const y = between(rng, region.y0, region.y1);
    if (rng() < 0.2) {
      stars += starburst(x, y, between(rng, 3, 5.5), between(rng, 0.28, 0.48).toFixed(2));
    } else {
      const r = between(rng, 1.3, 2.6);
      const o = between(rng, 0.3, 0.62);
      stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${INK}" opacity="${o.toFixed(2)}" />`;
    }
  }
  return stars;
}

function crossHatchPattern(id, opacity) {
  return `
    <pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="9" stroke="${INK}" stroke-width="1" opacity="${opacity}" />
      <line x1="0" y1="0" x2="9" y2="0" stroke="${INK}" stroke-width="1" opacity="${(opacity * 0.65).toFixed(2)}" />
    </pattern>
  `;
}

function fineHatchPattern(id, opacity) {
  return `
    <pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
      <line x1="0" y1="0" x2="0" y2="6" stroke="${INK}" stroke-width="0.8" opacity="${opacity}" />
    </pattern>
  `;
}

function layeredRidges(rng, baseY, count) {
  let out = "";
  for (let i = count; i >= 1; i -= 1) {
    const y = baseY - i * between(rng, 24, 44);
    const dip = between(rng, -22, 22);
    const path = `M0,${y.toFixed(1)} Q${WIDTH * 0.5},${(y + dip).toFixed(1)} ${WIDTH},${(y - dip * 0.6).toFixed(1)}`;
    const opacity = (0.1 + (count - i) * 0.06).toFixed(2);
    out += `<path d="${path}" fill="none" stroke="${INK}" stroke-width="1.3" opacity="${opacity}" />`;
  }
  return out;
}

function flyingBird(x, y, scale) {
  const w = 11 * scale;
  const lift = 6.5 * scale;
  return `<path d="M${(x - w).toFixed(1)},${y.toFixed(1)} Q${(x - w / 2).toFixed(1)},${(y - lift).toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)} Q${(x + w / 2).toFixed(1)},${(y - lift).toFixed(1)} ${(x + w).toFixed(1)},${y.toFixed(1)}" fill="none" stroke="${INK}" stroke-width="1.5" opacity="0.55" />`;
}

function birds(rng, count, region) {
  let out = "";
  for (let i = 0; i < count; i += 1) {
    const x = between(rng, region.x0, region.x1);
    const y = between(rng, region.y0, region.y1);
    out += flyingBird(x, y, between(rng, 0.7, 1.4));
  }
  return out;
}

function texturedOrb(cx, cy, r, fillColor, rng, id) {
  const clipId = `orbClip-${id}`;
  let bands = "";
  const bandCount = 4;
  for (let i = 1; i <= bandCount; i += 1) {
    const yOff = (r * 2 / (bandCount + 1)) * i - r;
    const bw = Math.sqrt(Math.max(r * r - yOff * yOff, 0));
    bands += `<line x1="${(cx - bw).toFixed(1)}" y1="${(cy + yOff).toFixed(1)}" x2="${(cx + bw).toFixed(1)}" y2="${(cy + yOff).toFixed(1)}" stroke="${INK}" stroke-width="1" opacity="0.22" />`;
  }
  let craters = "";
  const craterCount = 4;
  for (let i = 0; i < craterCount; i += 1) {
    const a = between(rng, 0, Math.PI * 2);
    const d = between(rng, 0, r * 0.65);
    const cx2 = cx + Math.cos(a) * d;
    const cy2 = cy + Math.sin(a) * d;
    const cr = between(rng, r * 0.08, r * 0.2);
    craters += `<circle cx="${cx2.toFixed(1)}" cy="${cy2.toFixed(1)}" r="${cr.toFixed(1)}" fill="none" stroke="${INK}" stroke-width="1" opacity="0.3" />`;
  }

  return `
    <clipPath id="${clipId}"><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" /></clipPath>
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${fillColor}" opacity="0.95" />
    <g clip-path="url(#${clipId})">${bands}${craters}</g>
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${INK}" stroke-width="1.8" opacity="0.9" />
  `;
}

function wandererFigure(x, groundY, rng) {
  const scale = between(rng, 0.95, 1.35);
  const headR = 5.2 * scale;
  const shoulderY = groundY - 36 * scale;
  const hemY = groundY - 1;
  const hemHalf = 10 * scale;
  const flare = 4 * scale;
  const cloak = `M${(x - 3 * scale).toFixed(1)},${shoulderY.toFixed(1)}
    C${(x - 9 * scale).toFixed(1)},${(shoulderY + 12 * scale).toFixed(1)} ${(x - hemHalf - flare).toFixed(1)},${(hemY - 14).toFixed(1)} ${(x - hemHalf).toFixed(1)},${hemY.toFixed(1)}
    L${(x + hemHalf).toFixed(1)},${hemY.toFixed(1)}
    C${(x + hemHalf + flare).toFixed(1)},${(hemY - 14).toFixed(1)} ${(x + 9 * scale).toFixed(1)},${(shoulderY + 12 * scale).toFixed(1)} ${(x + 3 * scale).toFixed(1)},${shoulderY.toFixed(1)} Z`;
  const foldCount = 3;
  let folds = "";
  for (let i = 1; i <= foldCount; i += 1) {
    const fx = x - hemHalf * 0.6 + (i / (foldCount + 1)) * hemHalf * 1.2;
    folds += `<line x1="${fx.toFixed(1)}" y1="${(shoulderY + 10 * scale).toFixed(1)}" x2="${(fx * 0.4 + x * 0.6).toFixed(1)}" y2="${hemY.toFixed(1)}" stroke="${INK}" stroke-width="1" opacity="0.3" />`;
  }
  const staff = rng() > 0.35;
  const staffX = x + hemHalf + 2;
  const staffMarkup = staff
    ? `<line x1="${staffX.toFixed(1)}" y1="${(shoulderY - headR).toFixed(1)}" x2="${staffX.toFixed(1)}" y2="${(groundY + 6).toFixed(1)}" stroke="${INK}" stroke-width="1.8" opacity="0.85" />`
    : "";

  return `
    <g>
      <ellipse cx="${x.toFixed(1)}" cy="${(groundY + 3).toFixed(1)}" rx="${(hemHalf + flare + 2).toFixed(1)}" ry="3.2" fill="${INK}" opacity="0.16" />
      <path d="${cloak}" fill="${PAPER}" stroke="${INK}" stroke-width="2" opacity="0.92" />
      ${folds}
      <circle cx="${x.toFixed(1)}" cy="${(shoulderY - headR - 2).toFixed(1)}" r="${headR.toFixed(1)}" fill="${INK}" opacity="0.9" />
      ${staffMarkup}
    </g>
  `;
}

function vignette() {
  return `
    <defs>
      <radialGradient id="vignette" cx="50%" cy="42%" r="75%">
        <stop offset="55%" stop-color="${INK}" stop-opacity="0" />
        <stop offset="100%" stop-color="${INK}" stop-opacity="0.1" />
      </radialGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)" />
  `;
}

function duneScene(rng, accent) {
  const baseY = between(rng, 430, 470);
  const dip = between(rng, -50, 50);
  const cp1 = `${WIDTH * 0.3},${baseY + dip}`;
  const cp2 = `${WIDTH * 0.7},${baseY - dip}`;
  const endY = between(rng, 410, 480);
  const curve = `M0,${baseY} C${cp1} ${cp2} ${WIDTH},${endY}`;
  const groundPath = `${curve} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  const sunCx = between(rng, WIDTH * 0.6, WIDTH * 0.82);
  const sunCy = baseY - between(rng, 50, 100);
  const sunR = between(rng, 44, 60);

  let rays = "";
  const rayCount = 20;
  for (let i = 0; i < rayCount; i += 1) {
    const angle = Math.PI + (i / (rayCount - 1)) * Math.PI;
    const long = i % 2 === 0;
    const r1 = sunR + 12;
    const r2 = sunR + (long ? between(rng, 34, 48) : between(rng, 18, 26));
    const x1 = sunCx + Math.cos(angle) * r1;
    const y1 = sunCy + Math.sin(angle) * r1;
    const x2 = sunCx + Math.cos(angle) * r2;
    const y2 = sunCy + Math.sin(angle) * r2;
    rays += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${INK}" stroke-width="1.4" opacity="${long ? 0.55 : 0.35}" />`;
  }

  const figureX = between(rng, WIDTH * 0.15, WIDTH * 0.45);
  const birdRegion = { x0: WIDTH * 0.05, x1: WIDTH * 0.5, y0: 90, y1: baseY - 120 };

  return `
    <defs>${crossHatchPattern("hatch", 0.4)}${fineHatchPattern("hatchFine", 0.22)}</defs>
    ${layeredRidges(rng, baseY, 3)}
    <path d="${groundPath}" fill="${accent.soft}" />
    <clipPath id="groundClip"><path d="${groundPath}" /></clipPath>
    <g clip-path="url(#groundClip)">
      <rect x="0" y="${baseY - 20}" width="${WIDTH}" height="${HEIGHT}" fill="url(#hatch)" />
      <rect x="0" y="${(baseY + (HEIGHT - baseY) * 0.45).toFixed(1)}" width="${WIDTH}" height="${HEIGHT}" fill="url(#hatchFine)" />
    </g>
    <path d="${curve}" fill="none" stroke="${INK}" stroke-width="2.5" opacity="0.9" />
    ${rays}
    ${texturedOrb(sunCx, sunCy, sunR, accent.fill, rng, "sun")}
    ${starField(rng, 26, { x0: 60, y0: 60, x1: WIDTH - 60, y1: baseY - 60 })}
    ${birds(rng, rng() > 0.4 ? 2 : 0, birdRegion)}
    ${wandererFigure(figureX, baseY + (dip > 0 ? dip * 0.3 : 0), rng)}
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

  const orbitCount = 3;
  let orbits = "";
  for (let i = 0; i < orbitCount; i += 1) {
    const factor = 1 - i * 0.16;
    const p1 = pointAt(-aperture * factor);
    const p2 = pointAt(aperture * factor);
    const r = arcR * factor;
    orbits += `<path d="M${p1.x.toFixed(1)},${p1.y.toFixed(1)} A${r.toFixed(1)},${r.toFixed(1)} 0 0 1 ${p2.x.toFixed(1)},${p2.y.toFixed(1)}" fill="none" stroke="${INK}" stroke-width="${i === 0 ? 1.6 : 1.1}" opacity="${(0.42 - i * 0.1).toFixed(2)}" />`;
  }

  const t = between(rng, -0.3, 0.3);
  const moon = pointAt(t * aperture);
  const moonR = between(rng, 26, 38);

  const ridgeY = between(rng, 500, 540);
  const ridgePoints = [];
  const segments = 8;
  for (let i = 0; i <= segments; i += 1) {
    const x = (WIDTH / segments) * i;
    const y = ridgeY - between(rng, 0, 46);
    ridgePoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const ridgeLine = `M0,${HEIGHT} L${ridgePoints.join(" L")} L${WIDTH},${HEIGHT} Z`;
  const ridgeStroke = `M${ridgePoints.join(" L")}`;

  const birdRegion = { x0: WIDTH * 0.1, x1: WIDTH * 0.9, y0: apexY + 30, y1: ridgeY - 100 };

  return `
    <defs>${crossHatchPattern("hatch", 0.38)}${fineHatchPattern("hatchFine", 0.2)}</defs>
    ${orbits}
    <path d="${ridgeLine}" fill="${accent.soft}" />
    <clipPath id="ridgeClip"><path d="${ridgeLine}" /></clipPath>
    <g clip-path="url(#ridgeClip)">
      <rect x="0" y="${ridgeY - 60}" width="${WIDTH}" height="${HEIGHT}" fill="url(#hatch)" />
      <rect x="0" y="${(ridgeY + (HEIGHT - ridgeY) * 0.4).toFixed(1)}" width="${WIDTH}" height="${HEIGHT}" fill="url(#hatchFine)" />
    </g>
    <path d="${ridgeStroke}" fill="none" stroke="${INK}" stroke-width="2.5" opacity="0.9" />
    ${starField(rng, 30, { x0: 60, y0: 60, x1: WIDTH - 60, y1: ridgeY - 40 })}
    ${birds(rng, rng() > 0.5 ? 2 : 1, birdRegion)}
    ${texturedOrb(moon.x, moon.y, moonR, accent.fill, rng, "moon")}
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
  const lines = 16;
  for (let i = 0; i < lines; i += 1) {
    const y = monoTop + (monoH / lines) * i + 5;
    hatchLines += `<line x1="${(monoX + monoW * 0.12).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(monoX + monoW * 0.88).toFixed(1)}" y2="${(y + monoW * 0.25).toFixed(1)}" stroke="${INK}" stroke-width="1" opacity="0.22" />`;
  }

  const satelliteCount = Math.floor(between(rng, 1, 4));
  let satellites = "";
  for (let i = 0; i < satelliteCount; i += 1) {
    const sx = between(rng, WIDTH * 0.68, WIDTH * 0.92) * (rng() > 0.5 ? 1 : 0.35);
    const sh = between(rng, 40, 90);
    const sw = between(rng, 8, 14);
    satellites += `<rect x="${(sx - sw / 2).toFixed(1)}" y="${(baseY - sh).toFixed(1)}" width="${sw.toFixed(1)}" height="${sh.toFixed(1)}" fill="${PAPER}" stroke="${INK}" stroke-width="1.6" opacity="0.7" />`;
  }

  const birdRegion = { x0: WIDTH * 0.55, x1: WIDTH * 0.95, y0: 200, y1: baseY - 140 };

  return `
    <defs>${crossHatchPattern("hatch", 0.38)}${fineHatchPattern("hatchFine", 0.2)}</defs>
    ${layeredRidges(rng, baseY, 2)}
    <path d="${groundPath}" fill="${accent.soft}" />
    <clipPath id="groundClip"><path d="${groundPath}" /></clipPath>
    <g clip-path="url(#groundClip)">
      <rect x="0" y="${baseY - 20}" width="${WIDTH}" height="${HEIGHT}" fill="url(#hatch)" />
      <rect x="0" y="${(baseY + (HEIGHT - baseY) * 0.45).toFixed(1)}" width="${WIDTH}" height="${HEIGHT}" fill="url(#hatchFine)" />
    </g>
    <path d="${curve}" fill="none" stroke="${INK}" stroke-width="2.5" opacity="0.9" />
    ${starField(rng, 22, { x0: 60, y0: 60, x1: WIDTH - 60, y1: baseY - 60 })}
    ${birds(rng, rng() > 0.5 ? 1 : 0, birdRegion)}
    ${texturedOrb(moon1.cx, moon1.cy, moon1.r, PAPER, rng, "moon1")}
    ${texturedOrb(moon2.cx, moon2.cy, moon2.r, accent.fill, rng, "moon2")}
    ${satellites}
    <rect x="${(monoX - monoW / 2).toFixed(1)}" y="${monoTop.toFixed(1)}" width="${monoW.toFixed(1)}" height="${monoH.toFixed(1)}" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" opacity="0.92" />
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
    ${vignette()}
  </svg>`;
}

export const OG_IMAGE_SIZE = { width: WIDTH, height: HEIGHT };
