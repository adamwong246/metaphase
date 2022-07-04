import Graph from "graphology";

import queryLayout from "./queryLayout";
import { Layout } from "./Types";

export default (listOfRooms: Layout[]) => {
  const graph = new Graph({multi: true});
  listOfRooms.forEach((l) => {
    graph.addNode(l.name);
  })

  const
    protogrid: any[][][] = [[]],
    smallestWidth = listOfRooms.sort((a, b) => a.layoutParams.width - b.layoutParams.width)[0].layoutParams.width,
    smallestHeight = listOfRooms.sort((a, b) => a.layoutParams.height - b.layoutParams.height)[0].layoutParams.height,
    baseWidth = smallestWidth / 2,
    baseheight = smallestHeight / 2,
    width = Math.round(200 / smallestWidth),
    height = Math.round(200 / smallestHeight);

  { // Discrete-ize the space-dividing tree into a sparse adjacency matrix
    for (let x = 0; x < width; x++) {
      protogrid[0][x] = queryLayout(listOfRooms, x, 0, baseWidth, baseheight);
    }

    for (let y = 0; y < height; y++) {

      if (!protogrid[y]) {
        protogrid[y] = [];
      }

      protogrid[y][0] = queryLayout(listOfRooms, 0, y, baseWidth, baseheight);
    }
  }


  for (let y = 1; y < height; y++) {
    for (let x = 1; x < width; x++) {
      protogrid[y][x] = queryLayout(listOfRooms, x, y, baseWidth, baseheight)
    }
  }

  // The adjacency grid is "sparse", in that it contains excess information.
  // We want to "squash" this into a more minimal representation by removing rows and columns which are duplicates of the neighbors.
  // This is done once vertical and once horizontall.
  const squashedProtogridV0: any[][][] = [[]];
  const squashedProtogridV2: any[][][] = [[]];
  const squashedProtogridV3: any[][][] = [];

  { // Collapse the excess horizontal space
    let unique = true;

    for (let x = 0; x < width; x++) {

      if (!squashedProtogridV0[0]) {
        squashedProtogridV0[0] = [];
      }
      squashedProtogridV0[0][x] = protogrid[0][x];
    }

    for (let y = 1; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (unique) {
          const a = protogrid[y][x].map((e) => e.name).join();
          const b = protogrid[y - 1][x].map((e) => e.name).join();
          if (a !== b) {
            unique = false
          };
        }
      }
      if (!unique) {
        for (let i = 0; i < width; i++) {
          if (!squashedProtogridV0[y]) {
            squashedProtogridV0[y] = [];
          }
          squashedProtogridV0[y][i] = protogrid[y][i];
          unique = true;
        }
      }
    }
  }

  { // Collapse the excess vertical space
    let unique = true;
    let counter = 0;

    for (let y = 0; y < height; y++) {

      if (!squashedProtogridV2[y]) {
        squashedProtogridV2[y] = [];
      }

      const x = squashedProtogridV0[y] ? squashedProtogridV0[y][0] : [];

      squashedProtogridV2[y][0] = x;
    }

    for (let x = 1; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (unique) {

          const x2 = squashedProtogridV0[y] ? squashedProtogridV0[y][x] : [];
          const x3 = squashedProtogridV0[y] ? squashedProtogridV0[y][x - 1] : [];

          const a = x2.map((e) => e.name).join();
          const b = x3.map((e) => e.name).join();

          if (a !== b) {
            unique = false;
            counter = counter + 1;
          };
        }
      }

      if (!unique) {
        for (let i = 0; i < height; i++) {
          const x4 = squashedProtogridV0[i] ? squashedProtogridV0[i][x] : [];
          squashedProtogridV2[i][x] = x4;
          unique = true;
        }
      } else {
        // console.log('fail')
      }
    }

    for (let y = 0; y < squashedProtogridV2.length; y++) {
      if (squashedProtogridV2[y][0].length !== 0) {
        squashedProtogridV3.push(squashedProtogridV2[y])
      }
    }

  }

  { // Build the nodes of the graph
    for (let y = 0; y < squashedProtogridV3.length; y++) {
      for (let x = 0; x < squashedProtogridV3[0].length; x++) {
        if((squashedProtogridV3[y][x] || []).length === 2 ){
          graph.addEdge(squashedProtogridV3[y][x][0].name, squashedProtogridV3[y][x][1].name)
        }
      }
    }
  }

  const materializedGrid: any[][][] =[[[]]];
  const xBulkheads = [];
  {
    const w = squashedProtogridV3[0].length-1;
    const h = squashedProtogridV3.length-1;

    let foundBulkHead = false;
    // going horizontally
    for (let x = 0; x < w; x++) {
      // scan vertically for bulheads
      for (let y = 0; y < h && !foundBulkHead; y++) {
        if (squashedProtogridV3[y] && squashedProtogridV3[y][x] && squashedProtogridV3[y][x].length > 2){
          foundBulkHead = true;
        }
      }
      
      if (foundBulkHead){
        xBulkheads.push(x)
        // console.log("yes", x)
        foundBulkHead = false;
      } else {
        // materializedGrid[y][x] = squashedProtogridV3[y][x]
        // console.log("no", x)
      }
    }
  }

  const yBulkheads = [];
  {
    const w = squashedProtogridV3[0].length-1;
    const h = squashedProtogridV3.length-1;

    let foundBulkHead = false;
    // going vertically
    for (let y = 0; y < h; y++) {
      // scan horizontally for bulkheads
      for (let x = 0; x < w && !foundBulkHead; x++) {
        if (squashedProtogridV3[y] && squashedProtogridV3[y][x] && squashedProtogridV3[y][x].length > 2){
          foundBulkHead = true;
        }
      }
      
      if (foundBulkHead){
        yBulkheads.push(y)
        // console.log("yes", x)
        foundBulkHead = false;
      } else {
        // materializedGrid[y][x] = squashedProtogridV3[y][x]
        // console.log("no", x)
      }
    }
  }

  console.log(xBulkheads)
  console.log(yBulkheads)

  return { graph, protogrid, squashedProtogrid: squashedProtogridV3, materializedGrid }
}