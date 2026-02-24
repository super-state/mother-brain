import type { Logger } from 'pino';
import type Database from 'better-sqlite3';

// ---------------------------------------------------------------------------
// Usage Optimization Analyzer
// ---------------------------------------------------------------------------
// Reviews usage_tracking data to identify patterns, anomalies, and
// optimization opportunities. Mirrors Child Brain's retrospective pattern
// but applied to token/cost data instead of task delivery.
// ---------------------------------------------------------------------------

export interface OptimizationInsight {
  category: 'tier-balance' | 'model-efficiency' | 'project-hotspot' | 'time-pattern' | 'general';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  detail: string;
  suggestion: string;
}

export interface OptimizationReport {
  generatedAt: string;
  periodDays: number;
  totalRequests: number;
  totalCost: number;
  insights: OptimizationInsight[];
  summary: string;
}

export class UsageOptimizer {
  constructor(
    private db: Database.Database,
    private logger: Logger,
  ) {}

  /** Run a full optimization analysis over recent usage data. */
  analyze(periodDays = 7): OptimizationReport {
    const since = new Date(Date.now() - periodDays * 86_400_000).toISOString();
    const insights: OptimizationInsight[] = [];

    const totals = this.getTotals(since);

    if (totals.requestCount === 0) {
      return {
        generatedAt: new Date().toISOString(),
        periodDays,
        totalRequests: 0,
        totalCost: 0,
        insights: [{
          category: 'general',
          severity: 'info',
          title: 'No usage data',
          detail: `No API calls recorded in the last ${periodDays} days.`,
          suggestion: 'Zero cost when idle — working as designed.',
        }],
        summary: 'No usage in this period — zero cost.',
      };
    }

    // Run all analyzers
    insights.push(...this.analyzeTierBalance(since, totals));
    insights.push(...this.analyzeModelEfficiency(since, totals));
    insights.push(...this.analyzeProjectHotspots(since, totals));
    insights.push(...this.analyzeTimePatterns(since));
    insights.push(...this.analyzeCostPerRequest(since));

    // Sort: critical > warning > info
    const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
    insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const summary = this.buildSummary(totals, insights);

    this.logger.info(
      { periodDays, totalCost: totals.totalCost, insightCount: insights.length },
      'Usage optimization analysis complete',
    );

    return {
      generatedAt: new Date().toISOString(),
      periodDays,
      totalRequests: totals.requestCount,
      totalCost: totals.totalCost,
      insights,
      summary,
    };
  }

  // -------------------------------------------------------------------------
  // Analyzers
  // -------------------------------------------------------------------------

  /** Check if one tier dominates spending — suggest model tier rebalancing. */
  private analyzeTierBalance(since: string, totals: Totals): OptimizationInsight[] {
    const insights: OptimizationInsight[] = [];

    const tiers = this.db.prepare(`
      SELECT tier, SUM(cost_usd) as cost, COUNT(*) as requests,
             SUM(input_tokens + output_tokens) as tokens
      FROM usage_tracking
      WHERE timestamp >= ? AND tier IS NOT NULL
      GROUP BY tier ORDER BY cost DESC
    `).all(since) as Array<{ tier: string; cost: number; requests: number; tokens: number }>;

    if (tiers.length === 0) return insights;

    const topTier = tiers[0];
    const topPct = (topTier.cost / totals.totalCost) * 100;

    if (topPct >= 80 && tiers.length > 1) {
      insights.push({
        category: 'tier-balance',
        severity: 'warning',
        title: `"${topTier.tier}" tier uses ${topPct.toFixed(0)}% of budget`,
        detail: `The ${topTier.tier} tier accounts for $${topTier.cost.toFixed(4)} out of $${totals.totalCost.toFixed(4)} total (${topTier.requests} requests).`,
        suggestion: topTier.tier === 'chat'
          ? 'Consider using a smaller model for chat (e.g., gpt-4.1-mini) or routing simple queries to a local model.'
          : `Review whether all ${topTier.tier} requests need the current model. A cheaper model may suffice for some.`,
      });
    }

    // Check if chat tier uses an expensive model
    const chatTier = tiers.find(t => t.tier === 'chat');
    if (chatTier && chatTier.requests > 10) {
      const avgCostPerChat = chatTier.cost / chatTier.requests;
      if (avgCostPerChat > 0.005) {
        insights.push({
          category: 'tier-balance',
          severity: 'warning',
          title: 'Chat conversations are expensive',
          detail: `Average chat request costs $${avgCostPerChat.toFixed(4)} (${chatTier.requests} requests total).`,
          suggestion: 'Switch chat tier to a smaller model (gpt-4.1-mini or local Ollama) — chat doesn\'t need coding-grade intelligence.',
        });
      }
    }

    return insights;
  }

  /** Compare cost efficiency across models. */
  private analyzeModelEfficiency(since: string, totals: Totals): OptimizationInsight[] {
    const insights: OptimizationInsight[] = [];

    const models = this.db.prepare(`
      SELECT model, SUM(cost_usd) as cost, COUNT(*) as requests,
             SUM(input_tokens) as inputTokens, SUM(output_tokens) as outputTokens
      FROM usage_tracking
      WHERE timestamp >= ?
      GROUP BY model ORDER BY cost DESC
    `).all(since) as Array<{
      model: string; cost: number; requests: number;
      inputTokens: number; outputTokens: number;
    }>;

    if (models.length <= 1) return insights;

    // Flag if a premium model is used for high-volume low-value work
    for (const m of models) {
      const avgTokensPerReq = (m.inputTokens + m.outputTokens) / m.requests;
      const avgCostPerReq = m.cost / m.requests;

      // Small requests on expensive models
      if (avgTokensPerReq < 500 && avgCostPerReq > 0.002 && m.requests >= 5) {
        insights.push({
          category: 'model-efficiency',
          severity: 'info',
          title: `Small requests on ${m.model}`,
          detail: `${m.requests} requests averaging only ${avgTokensPerReq.toFixed(0)} tokens each at $${avgCostPerReq.toFixed(4)}/req.`,
          suggestion: 'These small requests could use a cheaper mini model with minimal quality loss.',
        });
      }

      // Very large requests (context stuffing)
      if (avgTokensPerReq > 10000 && m.requests >= 3) {
        insights.push({
          category: 'model-efficiency',
          severity: 'warning',
          title: `Large context on ${m.model}`,
          detail: `${m.requests} requests averaging ${avgTokensPerReq.toLocaleString()} tokens each. High input token cost.`,
          suggestion: 'Review context building — can prompts be trimmed? Consider summarizing context before sending.',
        });
      }
    }

    return insights;
  }

  /** Identify if one project consumes disproportionate resources. */
  private analyzeProjectHotspots(since: string, totals: Totals): OptimizationInsight[] {
    const insights: OptimizationInsight[] = [];

    const projects = this.db.prepare(`
      SELECT COALESCE(project_id, 'system') as project,
             SUM(cost_usd) as cost, COUNT(*) as requests
      FROM usage_tracking
      WHERE timestamp >= ?
      GROUP BY project_id ORDER BY cost DESC
    `).all(since) as Array<{ project: string; cost: number; requests: number }>;

    if (projects.length <= 1) return insights;

    const topProject = projects[0];
    const topPct = (topProject.cost / totals.totalCost) * 100;

    if (topPct >= 70 && projects.length >= 2) {
      const second = projects[1];
      const ratio = topProject.cost / (second.cost || 0.0001);
      insights.push({
        category: 'project-hotspot',
        severity: ratio > 5 ? 'warning' : 'info',
        title: `Project "${topProject.project}" uses ${topPct.toFixed(0)}% of budget`,
        detail: `${topProject.requests} requests costing $${topProject.cost.toFixed(4)} — ${ratio.toFixed(1)}x more than the next project.`,
        suggestion: 'Investigate whether this project has unusually complex tasks or if simpler models could handle some of its work.',
      });
    }

    return insights;
  }

  /** Look for usage spikes or patterns over time. */
  private analyzeTimePatterns(since: string): OptimizationInsight[] {
    const insights: OptimizationInsight[] = [];

    const daily = this.db.prepare(`
      SELECT DATE(timestamp) as day, SUM(cost_usd) as cost, COUNT(*) as requests
      FROM usage_tracking
      WHERE timestamp >= ?
      GROUP BY DATE(timestamp)
      ORDER BY day
    `).all(since) as Array<{ day: string; cost: number; requests: number }>;

    if (daily.length < 2) return insights;

    // Detect spike days (> 3x average)
    const avgDailyCost = daily.reduce((s, d) => s + d.cost, 0) / daily.length;
    const spikeDays = daily.filter(d => d.cost > avgDailyCost * 3);

    for (const spike of spikeDays) {
      insights.push({
        category: 'time-pattern',
        severity: 'info',
        title: `Usage spike on ${spike.day}`,
        detail: `$${spike.cost.toFixed(4)} spent (${spike.requests} requests) — ${(spike.cost / avgDailyCost).toFixed(1)}x daily average.`,
        suggestion: 'Review what happened this day — was there a large task, retry loop, or runaway conversation?',
      });
    }

    return insights;
  }

  /** Check overall cost-per-request efficiency. */
  private analyzeCostPerRequest(since: string): OptimizationInsight[] {
    const insights: OptimizationInsight[] = [];

    const row = this.db.prepare(`
      SELECT AVG(cost_usd) as avgCost, MAX(cost_usd) as maxCost,
             COUNT(*) as total
      FROM usage_tracking WHERE timestamp >= ?
    `).get(since) as { avgCost: number; maxCost: number; total: number } | undefined;

    if (!row || row.total < 5) return insights;

    // Flag if there are very expensive individual requests
    if (row.maxCost > 0.05) {
      insights.push({
        category: 'general',
        severity: 'warning',
        title: 'Expensive individual request detected',
        detail: `Most expensive single request cost $${row.maxCost.toFixed(4)} (average: $${row.avgCost.toFixed(4)}).`,
        suggestion: 'Check for oversized prompts or unnecessary context in the most expensive calls.',
      });
    }

    return insights;
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private getTotals(since: string): Totals {
    const row = this.db.prepare(`
      SELECT COALESCE(SUM(cost_usd), 0) as totalCost,
             COALESCE(SUM(input_tokens + output_tokens), 0) as totalTokens,
             COUNT(*) as requestCount
      FROM usage_tracking WHERE timestamp >= ?
    `).get(since) as Totals;
    return row;
  }

  private buildSummary(totals: Totals, insights: OptimizationInsight[]): string {
    const critical = insights.filter(i => i.severity === 'critical').length;
    const warnings = insights.filter(i => i.severity === 'warning').length;
    const info = insights.filter(i => i.severity === 'info').length;

    const parts = [];
    if (critical > 0) parts.push(`${critical} critical`);
    if (warnings > 0) parts.push(`${warnings} warning${warnings > 1 ? 's' : ''}`);
    if (info > 0) parts.push(`${info} info`);

    const insightStr = parts.length > 0 ? parts.join(', ') : 'no issues found';
    return `$${totals.totalCost.toFixed(4)} spent across ${totals.requestCount} requests — ${insightStr}.`;
  }
}

interface Totals {
  totalCost: number;
  totalTokens: number;
  requestCount: number;
}
