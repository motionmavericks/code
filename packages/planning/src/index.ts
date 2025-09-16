/**
 * Deterministic, seeded planning scaffold that produces a minimal TaskGraph.
 * Adapter-friendly; no provider coupling.
 */

export type UUID = string;

export interface TaskNode {
  id: UUID;
  kind: "plan" | "tool" | "code" | "evaluate";
  label: string;
  params?: Record<string, unknown>;
}

export interface TaskEdge {
  from: UUID;
  to: UUID;
  label?: string;
}

export interface TaskGraph {
  seed: number;
  createdAt: string;
  nodes: TaskNode[];
  edges: TaskEdge[];
  version: 1;
}

// Simple xorshift32 for deterministic graph generation
function xorshift32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

function uuidFromSeed(rand: () => number): UUID {
  const hex = () =>
    Math.floor(rand() * 0xffffffff)
      .toString(16)
      .padStart(8, "0");
  // Fake but stable UUID-like string (avoid external deps)
  return `${hex()}-${hex().slice(0, 4)}-${hex().slice(0, 4)}-${hex().slice(
    0,
    4
  )}-${hex()}${hex()}`;
}

export interface PlanInput {
  prompt: string;
  seed?: number;
}

export interface PlanResult {
  ok: true;
  graph: TaskGraph;
}

export function plan(input: PlanInput): PlanResult {
  const seed = (input.seed ?? 1337) >>> 0;
  const rand = xorshift32(seed);
  const now = new Date().toISOString();

  const planId = uuidFromSeed(rand);
  const codeId = uuidFromSeed(rand);
  const evalId = uuidFromSeed(rand);

  const nodes: TaskNode[] = [
    { id: planId, kind: "plan", label: "Analyze prompt", params: { prompt: input.prompt } },
    { id: codeId, kind: "code", label: "Produce code changes", params: {} },
    { id: evalId, kind: "evaluate", label: "Self-check output", params: {} }
  ];
  const edges: TaskEdge[] = [
    { from: planId, to: codeId, label: "route:code" },
    { from: codeId, to: evalId, label: "route:evaluate" }
  ];

  return {
    ok: true,
    graph: { seed, createdAt: now, nodes, edges, version: 1 }
  };
}

export interface ReplayFrame {
  ts: string;
  event: "begin" | "node" | "end";
  meta?: Record<string, unknown>;
}

export interface SerializedReplay {
  graph: TaskGraph;
  frames: ReplayFrame[];
}

export function serializeReplay(graph: TaskGraph): SerializedReplay {
  // Minimal deterministic replay trace
  const frames: ReplayFrame[] = [
    { ts: graph.createdAt, event: "begin" },
    ...graph.nodes.map((n) => ({
      ts: graph.createdAt,
      event: "node" as const,
      meta: { id: n.id, kind: n.kind, label: n.label }
    })),
    { ts: graph.createdAt, event: "end" }
  ];
  return { graph, frames };
}
