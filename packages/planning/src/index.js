/**
 * Deterministic, seeded planning scaffold that produces a minimal TaskGraph.
 * Adapter-friendly; no provider coupling. JS build for runtime consumers.
 */

/** @typedef {string} UUID */

/**
 * @typedef {Object} TaskNode
 * @property {UUID} id
 * @property {"plan"|"tool"|"code"|"evaluate"} kind
 * @property {string} label
 * @property {Record<string, any>=} params
 */

/**
 * @typedef {Object} TaskEdge
 * @property {UUID} from
 * @property {UUID} to
 * @property {string=} label
 */

/**
 * @typedef {Object} TaskGraph
 * @property {number} seed
 * @property {string} createdAt
 * @property {TaskNode[]} nodes
 * @property {TaskEdge[]} edges
 * @property {1} version
 */

// Simple xorshift32 for deterministic graph generation
function xorshift32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

function uuidFromSeed(rand) {
  const hex = () => Math.floor(rand() * 0xffffffff).toString(16).padStart(8, "0");
  return `${hex()}-${hex().slice(0, 4)}-${hex().slice(0, 4)}-${hex().slice(0, 4)}-${hex()}${hex()}`;
}

/**
 * @param {{prompt:string, seed?:number}} input
 * @returns {{ok:true, graph: TaskGraph}}
 */
export function plan(input) {
  const seed = (input.seed ?? 1337) >>> 0;
  const rand = xorshift32(seed);
  const now = new Date().toISOString();
  const planId = uuidFromSeed(rand);
  const codeId = uuidFromSeed(rand);
  const evalId = uuidFromSeed(rand);
  const nodes = [
    { id: planId, kind: "plan", label: "Analyze prompt", params: { prompt: input.prompt } },
    { id: codeId, kind: "code", label: "Produce code changes", params: {} },
    { id: evalId, kind: "evaluate", label: "Self-check output", params: {} },
  ];
  const edges = [
    { from: planId, to: codeId, label: "route:code" },
    { from: codeId, to: evalId, label: "route:evaluate" },
  ];
  return { ok: true, graph: { seed, createdAt: now, nodes, edges, version: 1 } };
}

/**
 * @param {TaskGraph} graph
 * @returns {{graph: TaskGraph, frames: Array<{ts:string, event:"begin"|"node"|"end", meta?:Record<string,any>}>}}
 */
export function serializeReplay(graph) {
  const frames = [
    { ts: graph.createdAt, event: "begin" },
    ...graph.nodes.map((n) => ({ ts: graph.createdAt, event: "node", meta: { id: n.id, kind: n.kind, label: n.label } })),
    { ts: graph.createdAt, event: "end" },
  ];
  return { graph, frames };
}

