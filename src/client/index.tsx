import ReactDom from "react-dom/client";
import React, { useState } from "react";

import level0 from "../level0";
import layouter from "./layouter";
import makeProtogrid from "./protogrid";

type IWizardState = 'init' | { "step1": 'prototree' | 'adjacencygrid' } | { "step2": 'size' } | 'final'

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

const ClientApp = (props) => {

  const [step, setStep] = useState<IWizardState>('init');

  const layouted = layouter(level0)
  const { protogrid, graph, squashedProtogrid, materializedGrid } = makeProtogrid(layouted);


  return <>
    <h3>shipbuilder</h3>
    <pre>{JSON.stringify(step)}</pre>
    <>
      {
        step === "init" && <>
          <button onClick={(e) => setStep({ "step1": "prototree" })}>{`start ->`}</button>
        </>
      }

      {
        step.step1 && <>

          <button onClick={(e) => setStep({ "step1": "adjacencygrid" })}>{`next ->`}</button>

          <ul>
            <li><button onClick={(e) => setStep({ "step1": "prototree" })}> {`proto tree`}</button></li>
            <li><button onClick={(e) => setStep({ "step1": "adjacencygrid" })}>{`adjacency grid`}</button></li>
          </ul>


        </>
      }

      {
        step.step1 === "prototree" && <>
          <pre>{JSON.stringify(level0, null, 2)}</pre>
        </>
      }

      {
        step.step1 === "adjacencygrid" && <>

          <table>
            <tbody>
              {
                ...squashedProtogrid.map((row) => {
                  return (<tr>
                    {
                      ...row.map((col) => {
                        // console.log("col", col.map((res: Layout) => res).map((x) => x.name) )

                        const results = col.map((res: Layout) => res).map((x) => x.name);

                        return (<td
                          style={
                            { backgroundColor: results.length === 1 ? layouted.find((l) => l.name === results[0]).color : "white" }
                          }
                        >

                          _

                        </td>)
                      })
                    }
                  </tr>)
                })
              }
            </tbody>
          </table>

          <svg viewBox="0 0 100 100">
            {
              layouted.map((l) => {
                return (
                  <>
                    <rect {...l.layoutParams} stroke={l.color || 'black'} fill={l.color || 'black'} opacity="90%" />
                    <circle cx={l.x} cy={l.y} r="1" />
                    <text x={l.x} y={l.y} fontSize="4">{l.name} </text>
                  </>
                )
              })
            }

            {
              graph.mapEdges((lId, attr, source, target) => {
                const a = layouted.find((l) => l.name === source)
                const b = layouted.find((l) => l.name === target)

                // console.log(attr);

                return (
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="black" />
                );
              })
            }
          </svg>


        </>
      }


    </>
  </>
};

document.addEventListener("DOMContentLoaded", function () {
  ReactDom.createRoot(
    document.getElementById('body-children')
  ).render(React.createElement(ClientApp));
});
