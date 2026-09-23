/**
 * API client — mirrors the server's blind-selection contract exactly.
 *
 * GET /api/images      → ImageEntry[]  ({ id, slotLabel } ONLY)
 * GET /api/analysis/:id → Analysis     (full data + resolved originalImage)
 *
 * No heatmapImage anywhere — removed from schema, API response, and types.
 * category is free-text, sourced as-is from the JSON; never validated here.
 */

// ─── List endpoint ────────────────────────────────────────────────────────────

export interface ImageEntry {
  /** Numeric string id, e.g. "01" */
  id: string;
  /** Server-generated label ("Sample 01") — reveals nothing about diagnosis */
  slotLabel: string;
}

// ─── Vessel analysis sub-type ─────────────────────────────────────────────────

export interface VesselAnalysis {
  arteriovenousRatio?: string;
  tortuosity?: string;
  neovascularization?: string;
}

// ─── Full analysis response ───────────────────────────────────────────────────

export interface Analysis {
  // ── Required fields ────────────────────────────────────────────────────────
  id: string;
  /** Free-text DR grading label as stored in the source JSON — display as-is */
  category: string;
  displayName: string;
  condition: string;
  confidence: number;
  severity: string;
  findings: string[];
  recommendation: string;
  analysisSummary: string;
  processingTimeMs: number;
  /** Resolved by backend from sample-folder/images/<id>.<ext> */
  originalImage: string;

  // ── Optional extended fields (render only when present and non-empty) ───────
  vesselAnalysis?: VesselAnalysis;
  maculaStatus?: string;
  opticDiscStatus?: string;
  riskIndicators?: string[];
  differentialConsiderations?: string;
}

// ─── Fetch wrapper ────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? 'Unknown API error');
  return json.data as T;
}

export const api = {
  listImages:  ()           => apiFetch<ImageEntry[]>('/api/images'),
  getAnalysis: (id: string) => apiFetch<Analysis>(`/api/analysis/${id}`),
};
