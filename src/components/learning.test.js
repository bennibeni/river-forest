import { describe, it, expect } from 'vitest';
import { graph, canonical, features, splitData, trainForest, rollout, suggestedMove } from './learning.js';
import { START, GOAL } from './engine.js';

describe('River learning experiments', () => {
  it('keeps equivalent configurations together and preserves exact distances', () => {
    expect(graph.nodes.size).toBe(76);
    expect(graph.nodes.get(START).remaining).toBe(17);
    const split = splitData(42);
    expect(split.train.length).toBe(41);
    expect(split.test.length).toBe(11);
    expect(split.train.every(s => !split.test.includes(s))).toBe(true);
    for (const s of graph.nodes.keys()) {
      expect(features(s)).toEqual(features(canonical(s)));
      expect(graph.nodes.get(s).remaining).toBe(graph.nodes.get(canonical(s)).remaining);
    }
  });
  it('never uses held-out distance labels to train the forest', () => {
    const split = splitData(42);
    const first = trainForest(split, 42, 10);
    const saved = split.test.map(s => graph.nodes.get(s).remaining);
    try {
      split.test.forEach(s => { graph.nodes.get(s).remaining = 999; });
      const altered = trainForest(split, 42, 10);
      expect([...altered.predictions]).toEqual([...first.predictions]);
    } finally { split.test.forEach((s, i) => { graph.nodes.get(s).remaining = saved[i]; }); }
  });
  it('recognizes the goal and stops cycles without consulting distances', () => {
    expect(rollout(GOAL, () => 0).path).toEqual([GOAL]);
    const run = rollout(START, () => 0);
    expect(run.success).toBe(false);
    expect(run.reason).toBe('Ciclo');
    for (let i = 1; i < run.path.length; i++) expect(graph.adjacency.get(run.path[i - 1]).some(m => m.target === run.path[i])).toBe(true);
  });
});

it('BFS suggestions solve every reachable starting state optimally', () => {
  for (const state of graph.nodes.keys()) {
    const run = rollout(state, s => graph.nodes.get(s).remaining);
    expect(run.success).toBe(true);
    expect(run.path.length - 1).toBe(graph.nodes.get(state).remaining);
  }
  expect(suggestedMove(GOAL, () => 0)).toBeNull();
});
it('forest suggestions reproduce its policy, including a failed cycle', () => {
  const forest = trainForest(splitData(2026), 2026, 50);
  const score = s => forest.predictions.get(s);
  const run = rollout(START, score);
  expect(run.reason).toBe('Ciclo');
  expect(run.path.at(-1)).toBe('000000001');
  run.path.slice(0, -1).forEach((state, i) => expect(suggestedMove(state, score).target).toBe(run.path[i + 1]));
});
