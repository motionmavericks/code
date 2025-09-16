export type Capability =
  | "shell.run"
  | "fs.read"
  | "fs.write"
  | "git.read"
  | "web.fetch"
  | "http.request"
  | "browser.open";

export interface Grant {
  tool: Capability;
}

export interface Grants {
  agent: string;
  tools: Capability[];
}

export interface ToolInvocation {
  tool: Capability;
  args: Record<string, unknown>;
}

export interface AuditRecord {
  ts: string;
  agent: string;
  tool: Capability;
  args: Record<string, unknown>;
  allowed: boolean;
}

export class ToolHost {
  readonly agent: string;
  private readonly allow: Set<Capability>;
  private readonly audit: AuditRecord[] = [];

  constructor(grants: Grants) {
    this.agent = grants.agent;
    this.allow = new Set(grants.tools);
  }

  getAudit(): AuditRecord[] { return [...this.audit]; }

  private record(tool: Capability, args: Record<string, unknown>, allowed: boolean) {
    this.audit.push({
      ts: new Date().toISOString(),
      agent: this.agent,
      tool,
      args,
      allowed,
    });
  }

  async invoke(inv: ToolInvocation): Promise<unknown> {
    const allowed = this.allow.has(inv.tool);
    this.record(inv.tool, inv.args, allowed);
    if (!allowed) {
      throw new Error(`tool denied: ${inv.tool}`);
    }
    // Default-deny environment; provide only safe, no-op stubs.
    switch (inv.tool) {
      case "shell.run": {
        const { cmd = "", cwd = process.cwd() } = inv.args as { cmd?: string; cwd?: string };
        return { exitCode: 0, stdout: `stub: ${cmd}`, stderr: "", cwd };
      }
      case "fs.read": {
        const { path } = inv.args as { path: string };
        return { path, data: "" };
      }
      case "fs.write": {
        const { path, data } = inv.args as { path: string; data: string };
        return { path, bytes: typeof data === "string" ? data.length : 0 };
      }
      case "git.read":
      case "web.fetch":
      case "http.request":
      case "browser.open":
        return { ok: true };
      default:
        return { ok: false };
    }
  }
}

