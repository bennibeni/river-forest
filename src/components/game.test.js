import { describe, it, expect } from "vitest";
import { crossing, crewProblem } from "./game.js";
import { buildGraph, START, GOAL, pathToGoal } from "./engine.js";

describe("Human puzzle rules", () => {
  it("rejects unsafe crews, capacity, no driver, and unsafe shores", () => {
    expect(crewProblem([0, 4])).toBeTruthy();
    expect(crewProblem([1, 2])).toBeTruthy();
    expect(crewProblem([7, 0])).toBeTruthy();
    expect(crewProblem([0, 1, 6])).toBeTruthy();
    expect(crossing(START, []).error).toBeTruthy();
    expect(crossing(START, [2]).error).toBeTruthy();
    expect(crossing(START, [0]).error).toBeTruthy();
    expect(crossing(START, [6, 7]).state).toBe("100000011");
  });
  it("accepts every legal crossing and the complete minimum solution", () => {
    const graph = buildGraph();
    for (const [s, options] of graph.adjacency)
      for (const m of options) expect(crossing(s, m.crew).state).toBe(m.target);
    const path = pathToGoal(graph);
    expect(path).toHaveLength(18);
    expect(path.at(-1)).toBe(GOAL);
    expect(crossing("100000011", [0]).error).toBeTruthy();
  });
});
