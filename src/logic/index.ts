import { doc } from "prettier";

export let date = 0;

export let flourCount = 0;

export const actionStack: (
  | { type: "work-cell"; cellIndex: number }
  | { type: "no" }
)[] = [];

export const maxGrowth = 100;

export type Cell = {
  area: number;
  growth: number;
  lastActionDate: number;
};

export const cells: Cell[] = [];

export const stepWorld = () => {
  const dt = 1 / 60;
  date += dt;

  while (actionStack.length) {
    const action = actionStack.shift()!;
    console.log(action);

    switch (action.type) {
      case "work-cell": {
        const cell = cells[action.cellIndex];
        cell.growth += 2;
        if (cell.growth >= maxGrowth) {
          cell.growth = 0;
          flourCount += cell.area;
        }
      }
    }
  }

  for (const cell of cells) {
    cell.growth += 0.00001;
  }

  pre.innerText = JSON.stringify(
    prepare({
      date,
      cells,
      flourCount,
    }),
    null,
    2
  );
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

const pre = document.createElement("pre");
pre.style.backgroundColor = "#ddd8";
pre.style.position = "fixed";
pre.style.top = "0";
pre.style.right = "0";
pre.style.zIndex = "2";
pre.style.width = "200px";
pre.style.fontSize = "10px";
pre.style.padding = "4px";
pre.style.margin = "2px";
document.body.appendChild(pre);
