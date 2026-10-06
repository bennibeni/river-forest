// Adattato dal motore fornito nello ZIP: stessa codifica, BFS senza duplicati.
export const PEOPLE = [
  "Padre",
  "Madre",
  "Figlio 1",
  "Figlio 2",
  "Figlia 1",
  "Figlia 2",
  "Poliziotto",
  "Criminale",
];
export const SHORT = ["Pa", "Ma", "F1", "F2", "D1", "D2", "Po", "Cr"];
export const START = "000000000";
export const GOAL = "111111111";

function safe(group) {
  const has = (i) => group.includes(i);
  return (
    !(has(0) && !has(1) && (has(4) || has(5))) &&
    !(has(1) && !has(0) && (has(2) || has(3))) &&
    !(has(7) && !has(6) && group.some((i) => i < 6))
  );
}

export function isValid(state) {
  if (!/^[01]{9}$/.test(state)) return false;
  return ["0", "1"].every((side) =>
    safe(PEOPLE.flatMap((_, i) => (state[i + 1] === side ? [i] : []))),
  );
}

export function moves(state) {
  if (!isValid(state)) return [];
  const present = PEOPLE.flatMap((_, i) =>
    state[i + 1] === state[0] ? [i] : [],
  );
  const crews = present.flatMap((person, i) => [
    [person],
    ...present.slice(i + 1).map((other) => [person, other]),
  ]);
  return crews
    .filter((crew) => crew.some((i) => [0, 1, 6].includes(i)) && safe(crew))
    .flatMap((crew) => {
      const bits = [...state];
      for (const i of [0, ...crew.map((i) => i + 1)])
        bits[i] = bits[i] === "0" ? "1" : "0";
      const target = bits.join("");
      return isValid(target) ? [{ target, crew }] : [];
    });
}

export function buildGraph() {
  const nodes = new Map([[START, { id: START, depth: 0 }]]);
  const queue = [START];
  const adjacency = new Map();
  const edges = [];
  // Visita ogni nodo una sola volta; la coda usa un indice, non shift().
  for (let head = 0; head < queue.length; head++) {
    const id = queue[head];
    const next = moves(id);
    adjacency.set(id, next);
    for (const move of next) {
      if (id < move.target)
        edges.push({ source: id, target: move.target, crew: move.crew });
      if (!nodes.has(move.target)) {
        nodes.set(move.target, {
          id: move.target,
          depth: nodes.get(id).depth + 1,
        });
        queue.push(move.target);
      }
    }
  }
  // Una seconda BFS assegna la distanza esatta dall'obiettivo.
  const distances = new Map([[GOAL, 0]]);
  const back = [GOAL];
  for (let head = 0; head < back.length; head++) {
    for (const { target } of adjacency.get(back[head]) || []) {
      if (!distances.has(target)) {
        distances.set(target, distances.get(back[head]) + 1);
        back.push(target);
      }
    }
  }
  for (const node of nodes.values()) node.remaining = distances.get(node.id);
  return { nodes, edges, adjacency };
}

export function pathToGoal(graph, start = START) {
  if (!graph.nodes.has(start) || graph.nodes.get(start).remaining === undefined)
    return [];
  const path = [start];
  while (path.at(-1) !== GOAL) {
    const current = path.at(-1);
    const next = graph.adjacency
      .get(current)
      .find(
        (move) =>
          graph.nodes.get(move.target).remaining ===
          graph.nodes.get(current).remaining - 1,
      );
    if (!next) return [];
    path.push(next.target);
  }
  return path;
}
