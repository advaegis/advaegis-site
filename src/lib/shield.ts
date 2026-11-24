/**
 * Geometry for the Advaegis shield, shared by the logo mark,
 * the favicon and the layered hero graphic.
 *
 * The unit shield is 2 wide, centred on (0, 0):
 * the top edge peaks at y = -0.68, the point sits at y = 0.95.
 */
export const SHIELD_TOP = -0.68;
export const SHIELD_BOTTOM = 0.95;

const r = (n: number) => Math.round(n * 100) / 100;

/** SVG path for a shield of half-width `w`, centred on (cx, cy). */
export function shieldPath(w: number, cx = 0, cy = 0): string {
  const p = (x: number, y: number) => `${r(cx + x * w)},${r(cy + y * w)}`;
  return [
    `M${p(-1, -0.6)}`,
    `Q${p(0, -0.76)} ${p(1, -0.6)}`,
    `L${p(1, 0.15)}`,
    `C${p(1, 0.55)} ${p(0.5, 0.8)} ${p(0, 0.95)}`,
    `C${p(-0.5, 0.8)} ${p(-1, 0.55)} ${p(-1, 0.15)}`,
    'Z',
  ].join(' ');
}

/** Y coordinate of the top-centre of a shield of half-width `w`. */
export const shieldTopY = (w: number, cy = 0) => r(cy + SHIELD_TOP * w);
