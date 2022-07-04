// import { SpacePartition_ish } from "./Types";

export interface SpacePartitionChildren_ish {
  son: SpacePartition_ish;
  daughter: SpacePartition_ish;
  stepKids: SpacePartition_ish[];
};

export interface SpacePartition_ish {
  name: string;
  weight: number;
  children?: SpacePartitionChildren_ish;
  color?: string;
};

export interface Layout {
  name: string;
  weight: number;
  leaf: boolean;
  color?: string;

  layoutParams: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  x?: number;
  y?: number;

};

export interface Tile {
  type: string;
}

const level: SpacePartition_ish = {
  name: '1',
  weight: 1,
  children: {
    son: {
      name: '2',
      weight: 1,
      children: {
        son: {
          color: 'green',
          name: '3',
          weight: 3
        },
        daughter: {
          color: 'grey',
          name: '4',
          weight: 2
        },
        stepKids: [
          {
            color: 'red',
            name: '5',
            weight: 1
          },
          {
            color: 'blue',
            name: '6',
            weight: 1
          },
          {
            color: 'orange',
            name: '7',
            weight: 1
          },
        ]
      }
    },
    daughter: {
      name: '8',
      weight: 2,
      children: {
        // direction: 'horizontal',
        son: {
          color: 'purple',
          name: '9',
          weight: 1
        },
        daughter: {

          name: '10',
          weight: 3,
          children: {
            // direction: 'horizontal',
            son: {
              color: 'cyan',
              name: '17',
              weight: 1
            },
            daughter: {
              color: 'red',
              name: '18',
              weight: 2,
              children: {
                son: {
                  name: '18',
                  weight: 1,
                  color: "yellow"
                },
                daughter: {
                  name: '19',
                  weight: 3,
                  color: 'pink'
                },
                stepKids: [
                  {
                    color: 'green',
                    name: '21',
                    weight: 1
                  },
                ]
              }
            },
            stepKids: [
              {
                color: 'blue',
                name: '22',
                weight: 2
              },
              {
                color: 'red',
                name: '29',
                weight: 8
              },
            ]
          }
        },
        stepKids: [
          {
            name: '23',
            weight: 4,
            children: {
              son: {
                name: "30",
                color: 'orange',
                weight: 1
              },
              daughter: {
                name: "31",
                color: 'pink',
                weight: 5
              },
              stepKids: [
                {
                  name: "32",
                  color: 'green',
                  weight: 10
                },
                {
                  name: "33",
                  color: 'blue',
                  weight: 10
                }
              ]
            }
          },
        ]
      }
    },
    stepKids: [
      {
        name: '11',
        weight: 2,
        children: {
          // direction: 'horizontal',
          son: {
            color: 'red',
            name: '12',
            weight: 1
          },
          daughter: {
            color: 'blue',
            name: '13',
            weight: 1
          },
          stepKids: [
            {
              color: 'green',
              name: '14',
              weight: 1
            },
            {
              color: 'orange',
              name: '15',
              weight: 2
            },
            {
              color: 'yellow',
              name: '16',
              weight: 1
            },
            {
              color: 'red',
              name: '20',
              weight: 2
            },
          ]
        },
      },
      {
        name: '24',
        weight: 1,

        children: {
          son: {
            name: '36',
            weight: 2,
            color: 'red',
          },
          daughter: {
            name: '37',
            weight: 2,
            children: {
              son: {
                name: '38',
                weight: 2,
                color: 'blue',
              },
              daughter: {
                name: '39',
                weight: 2,
                color: 'purple',
              },
              stepKids: []
            }
          },
          stepKids: []
        }
      },
      {
        name: '25',
        weight: 2,
        color: 'pink',
        children: {
          son: {
            color: 'purple',
            name: '26',
            weight: 1
          },
          daughter: {
            color: 'lightblue',
            name: '27',
            weight: 3,
          },
          stepKids: [
            {
              name: '28',
              weight: 1,
              color: 'cyan'
            }
            ,
            {
              name: "34",
              color: 'blue',
              weight: 4
            }
            ,
            {
              name: "35",
              color: 'orange',
              weight: 4
            }
          ]
        }
      }
    ],
  }
}

export default level;