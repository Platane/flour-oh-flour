import { vec3 } from "gl-matrix";

export let date = 0;

export let flourCount = 0;

export const actionStack: (
  | { type: "work-cell"; cellIndex: number; touchPosition: vec3 }
  | { type: "no" }
)[] = [];

export const maxGrowth = 100;
export const maxTic = 11;

export const touches: { p: vec3; i: number; date: number }[] = [];

export type Cell = {
  area: number;
  growth: number;
} & (
  | {
      type: "growing";
      growingSinceDate: number;
    }
  | {
      type: "grown";
      grownSinceDate: number;

      tic: number;
      ticTarget: number;
      ticVelocity: number;
      ticImmunityDate: number;
    }
  | {
      type: "resting";
      restingSinceDate: number;
    }
);

export const cells: Cell[] = [];

export const stepWorld = () => {
  const dt = 1 / 60;
  date += dt;

  while (actionStack.length) {
    const action = actionStack.shift()!;

    switch (action.type) {
      case "work-cell": {
        const cell = cells[action.cellIndex];

        switch (cell.type) {
          case "grown": {
            cell.ticTarget++;
            cell.ticImmunityDate = date;

            touches.push({
              p: action.touchPosition,
              i: action.cellIndex,
              date,
            });

            if (cell.ticTarget >= maxTic) {
              cell.growth = 0;

              // @ts-ignore
              cell.type = "growing";
              // @ts-ignore
              cell.growingSinceDate = date;

              flourCount += cell.area;
            }
            break;
          }
        }

        break;
      }
    }
  }

  for (const cell of cells)
    switch (cell.type) {
      case "growing": {
        cell.growth = cell.growth + 15 * dt;

        if (cell.growth >= maxGrowth) {
          cell.growth = maxGrowth;

          // @ts-ignore
          cell.type = "grown";
          // @ts-ignore
          cell.grownSinceDate = date;
          // @ts-ignore
          cell.tic = 0;
          // @ts-ignore
          cell.ticTarget = 0;
          // @ts-ignore
          cell.ticVelocity = 0;
        }

        break;
      }

      case "grown": {
        if (date > cell.ticImmunityDate + 0.45 && cell.ticTarget) {
          const v = Math.min(14, 0.1 + cell.ticTarget * 22);

          cell.ticTarget = Math.max(0, cell.ticTarget - v * dt);
        }

        const tension = 120;
        const friction = 6;

        const a =
          (cell.ticTarget - cell.tic) * tension - cell.ticVelocity * friction;
        cell.ticVelocity += a * dt;
        cell.tic += cell.ticVelocity * dt;

        break;
      }
    }

  while (touches[0] && touches[0].date + 500 < date) touches.shift();

  if (process.env.NODE_ENV !== "production") {
    if (!pre) {
      pre = document.createElement("pre");
      pre.style.backgroundColor = "#ddd8";
      pre.style.position = "fixed";
      pre.style.top = "0";
      pre.style.right = "0";
      pre.style.zIndex = "2";
      pre.style.width = "200px";
      pre.style.fontSize = "10px";
      pre.style.padding = "4px";
      pre.style.margin = "2px";
      pre.style.pointerEvents = "none";
      document.body.appendChild(pre);
    }

    pre.innerText = JSON.stringify(
      prepare({
        date,
        cells,
        flourCount,

        // touches,
      }),
      null,
      2
    );
  }
};

const prepare = (o: any): any => {
  if (Array.isArray(o)) return o.map(prepare);
  if (o && typeof o === "object")
    return Object.fromEntries(
      Object.entries(o).map(([k, v]) => [k, prepare(v)])
    );
  if (typeof o === "number") return o.toFixed(2);
  return o;
};

let pre: any;
