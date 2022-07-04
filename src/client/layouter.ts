import {Layout, SpacePartition_ish} from "./Types";

export default (file: SpacePartition_ish): Layout[] => {
  return recrusiveLayout(file).filter((l) => {
    return l.leaf;
  }).map((l) => {
    return ({
      ...l,
      x: l.layoutParams.x + (l.layoutParams.width) / 2,
      y: l.layoutParams.y + (l.layoutParams.height) / 2,
    });
  });
}

const recrusiveLayout =  (
  sp: SpacePartition_ish, 
  layoutParams = { x: 0, y: 0, width: 100, height: 100 },
  depth: number = 0
  ): Layout[] => {

  const { children } = sp;
  const { x, y, width, height } = layoutParams;

  let kids: SpacePartition_ish[] = [];
  let numberOfkids = 0;
  let totalWeight = 0;

  if (children) {
    const { son, daughter, stepKids } = children;
    kids = [son, daughter, ...stepKids];
    numberOfkids = kids.length;
    totalWeight = kids.reduce((mm, e) => { return mm = mm + e.weight }, 0);
  }

  let weightAccumulator = 0;

  return [
    {
      layoutParams, 
      ...sp,
      leaf: numberOfkids === 0
    },

    ...kids.map((child, ndx) => {
      let childLayoutParams;

      if (depth % 2 === 0) {
        childLayoutParams = {
          x,
          y: ((weightAccumulator / totalWeight) * height) + y,
          width,
          height: (child.weight / totalWeight) * height,
        };
      } else if (depth % 2 === 1) {
        childLayoutParams = {
          x: ((weightAccumulator / totalWeight) * width) + x,
          y,
          width: (child.weight / totalWeight) * width,
          height,
        }
      } else {
        console.error('wtf')
      }

      weightAccumulator = weightAccumulator + child.weight;

      return recrusiveLayout(child, childLayoutParams, depth + 1);
    }).flat()
  


  ];

  // return {
  //   layoutParams, 
  //   ...sp, 
  //   children: children && kids.map((child, ndx) => {
  //     let childLayoutParams;

  //     if (depth % 2 === 0) {
  //       childLayoutParams = {
  //         x,
  //         y: ((weightAccumulator / totalWeight) * height) + y,
  //         width,
  //         height: (child.weight / totalWeight) * height,
  //       };
  //     } else if (depth % 2 === 1) {
  //       childLayoutParams = {
  //         x: ((weightAccumulator / totalWeight) * width) + x,
  //         y,
  //         width: (child.weight / totalWeight) * width,
  //         height,
  //       }
  //     } else {
  //       console.error('wtf')
  //     }

  //     weightAccumulator = weightAccumulator + child.weight;

  //     return recrusiveLayout(child, childLayoutParams, depth + 1);
  //   })
  // }
  
};