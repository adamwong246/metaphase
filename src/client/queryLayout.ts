import { Layout, SpacePartition_ish } from "./Types";

type rectangle = { x1: number, x2: number, y1: number, y2: number };

function overlaps(a: rectangle, b: rectangle) {
  // no horizontal overlap
  if (a.x1 > b.x2 || b.x1 > a.x2) return false;

  // no vertical overlap
  if (a.y1 > b.y2 || b.y1 > a.y2) return false;

  return true;
}

export default (layouts: Layout[], x: number, y: number, w: number, h: number): Layout[] => {

  return layouts.filter((layout) => overlaps({
    x1: ((x - 0.5) * w) + 0,
    y1: ((y - 0.5) * h) + 0,
    x2: ((x + 0.5) * w) + 0,
    y2: ((y + 0.5) * h) + 0,
  }, {
    x1: layout.layoutParams.x,
    x2: layout.layoutParams.x + layout.layoutParams.width,
    y1: layout.layoutParams.y,
    y2: layout.layoutParams.y + layout.layoutParams.height
  })).filter((f) => f)
}
