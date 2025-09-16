export interface MemoryRecord {
  id: string;
  kind: "ephemeral" | "session" | "long";
  text: string;
  ts: string;
}

export interface IMemoryStore {
  put(rec: Omit<MemoryRecord, "id" | "ts">): Promise<MemoryRecord>;
  search(query: string, k?: number): Promise<MemoryRecord[]>;
}

// Minimal in-memory implementation; SQLite adapter can be added later.
export class InMemoryStore implements IMemoryStore {
  private rows: MemoryRecord[] = [];
  async put(rec: Omit<MemoryRecord, "id" | "ts">): Promise<MemoryRecord> {
    const out: MemoryRecord = { id: cryptoRandomId(), ts: new Date().toISOString(), ...rec } as MemoryRecord;
    this.rows.push(out);
    return out;
  }
  async search(query: string, k = 5): Promise<MemoryRecord[]> {
    const q = query.toLowerCase();
    return this.rows.filter(r => r.text.toLowerCase().includes(q)).slice(0, k);
  }
}

function cryptoRandomId(): string {
  // No external deps; acceptable pseudo-UUID for scaffolding
  const n = Math.floor(Math.random() * 0xffffffff);
  return `mem-${n.toString(16).padStart(8, "0")}`;
}

