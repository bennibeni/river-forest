import { RandomForestRegression } from 'ml-random-forest';
import { buildGraph, GOAL } from './engine.js';

export const graph = buildGraph();
export const featureNames = ['Barca a destra', 'Padre a destra', 'Madre a destra', 'Figli a destra', 'Figlie a destra', 'Poliziotto a destra', 'Criminale a destra', 'Persone a destra', 'Guide con la barca', 'Mosse disponibili'];
export function canonical(s) {
  return s.slice(0, 3) + [...s.slice(3, 5)].sort().join('') + [...s.slice(5, 7)].sort().join('') + s.slice(7);
}
export function features(s) {
  const b = [...s].map(Number);
  return [b[0], b[1], b[2], (b[3] + b[4]) / 2, (b[5] + b[6]) / 2, b[7], b[8], b.slice(1).reduce((a, v) => a + v, 0) / 8, [1, 2, 7].filter(i => b[i] === b[0]).length / 3, graph.adjacency.get(s).length / 6];
}
export function random(seed) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}
export function splitData(seed = 42) {
  const rng = random(seed);
  const states = [...new Set([...graph.nodes.keys()].map(canonical))].sort();
  for (let i = states.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [states[i], states[j]] = [states[j], states[i]]; }
  const n = Math.floor(states.length * .8);
  return { train: states.slice(0, n), test: states.slice(n) };
}
export function trainForest(split, seed, trees) {
  const model = new RandomForestRegression({ seed, nEstimators: trees, maxFeatures: .7, replacement: false, useSampleBagging: true, noOOB: true, treeOptions: { maxDepth: 8, minNumSamples: 2 } });
  model.train(split.train.map(features), split.train.map(s => graph.nodes.get(s).remaining));
  const states = [...graph.nodes.keys()];
  const values = model.predict(states.map(features));
  const predictions = new Map(states.map((s, i) => [s, values[i]]));
  const rows = split.test.map(s => ({ state: s, actual: graph.nodes.get(s).remaining, predicted: predictions.get(s) }));
  const treeDetails = model.estimators.map((tree, index) => {
    const questions = [];
    const used = new Set();
    let leaves = 0, depth = 0;
    function inspect(node, path = 'Radice', level = 0) {
      depth = Math.max(depth, level);
      if (node.left && node.right) {
        const feature = model.indexes[index][node.splitColumn];
        used.add(feature);
        questions.push({ path, question: describeQuestion(feature, node.splitValue), threshold: node.splitValue, feature });
        inspect(node.left, `${path} → sì`, level + 1);
        inspect(node.right, `${path} → no`, level + 1);
      } else {
        leaves++;
        questions.push({ path, prediction: node.distribution });
      }
    }
    inspect(tree.root);
    const predict = s => tree.predict([model.indexes[index].map(i => features(s)[i])])[0];
    return { number: index + 1, available: model.indexes[index], used: [...used], depth, leaves, nodes: questions.length, questions, startPrediction: predict('000000000'), mae: split.test.reduce((sum, s) => sum + Math.abs(predict(s) - graph.nodes.get(s).remaining), 0) / split.test.length };
  });
  const testDiagnostics = rows.map(row => {
    const run = rollout(row.state, s => predictions.get(s));
    const first = run.path[1];
    return { ...row, success: run.success, reason: run.reason, steps: run.path.length - 1, optimalFirst: first ? graph.nodes.get(first).remaining === row.actual - 1 : null };
  });
  return { predictions, rows, treeDetails, testDiagnostics, split, seed, mae: rows.reduce((sum, r) => sum + Math.abs(r.actual - r.predicted), 0) / rows.length, trees };
}

export function describeQuestion(feature, threshold) {
  const scales = [1, 1, 1, 2, 2, 1, 1, 8, 3, 6];
  const limit = Math.ceil(threshold * scales[feature]) - 1;
  const binary = { 0: 'La barca è a sinistra?', 1: 'Il padre è a sinistra?', 2: 'La madre è a sinistra?', 5: 'Il poliziotto è a sinistra?', 6: 'Il criminale è a sinistra?' };
  if (binary[feature] && limit === 0) return binary[feature];
  return `${featureNames[feature]}: al massimo ${limit}?`;
}
export function suggestedMove(state, score) {
  if (state === GOAL) return null;
  const options = graph.adjacency.get(state);
  return options.find(m => m.target === GOAL) ?? options.reduce((best, move) => score(move.target) < score(best.target) ? move : best);
}
// The policy never reads exact distances. Known goal recognition is a game rule.
export function rollout(start, score) {
  const path = [start];
  const seen = new Set(path);
  while (path.at(-1) !== GOAL && path.length <= 100) {
    const next = suggestedMove(path.at(-1), score).target;
    path.push(next);
    if (next !== GOAL && seen.has(next)) return { path, success: false, reason: 'Ciclo' };
    seen.add(next);
  }
  return { path, success: path.at(-1) === GOAL, reason: path.at(-1) === GOAL ? 'Arrivo' : 'Limite di mosse' };
}
export function evaluate(states, score) {
  const runs = states.filter(s => s !== GOAL).map(s => ({ ...rollout(s, score), start: s }));
  const wins = runs.filter(r => r.success);
  return { total: runs.length, wins: wins.length, extra: wins.length ? wins.reduce((sum, r) => sum + r.path.length - 1 - graph.nodes.get(r.start).remaining, 0) / wins.length : null };
}
