import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export class ToolHost {
  constructor(grants, auditPath) {
    this.agent = grants.agent;
    this.allow = new Set(grants.tools);
    this.audit = [];
    this.auditPath = auditPath || defaultAuditPath();
  }
  getAudit() { return [...this.audit]; }
  record(tool, args, allowed) {
    const rec = { ts: new Date().toISOString(), agent: this.agent, tool, args, allowed };
    this.audit.push(rec);
    try {
      fs.mkdirSync(path.dirname(this.auditPath), { recursive: true });
      fs.appendFileSync(this.auditPath, JSON.stringify(rec) + os.EOL, 'utf8');
    } catch (_e) { /* ignore */ }
  }
  async invoke(inv) {
    const allowed = this.allow.has(inv.tool);
    this.record(inv.tool, inv.args, allowed);
    if (!allowed) throw new Error(`tool denied: ${inv.tool}`);
    switch (inv.tool) {
      case 'shell.run': {
        const { cmd = '', cwd = process.cwd() } = inv.args || {};
        return { exitCode: 0, stdout: `stub: ${cmd}`, stderr: '', cwd };
      }
      case 'fs.read': {
        const { path: p } = inv.args || {};
        return { path: p, data: '' };
      }
      case 'fs.write': {
        const { path: p, data } = inv.args || {};
        return { path: p, bytes: typeof data === 'string' ? data.length : 0 };
      }
      default:
        return { ok: true };
    }
  }
}

function defaultAuditPath() {
  const home = os.homedir() || process.cwd();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(home, '.code-os', 'audit', `run-${stamp}.jsonl`);
}

