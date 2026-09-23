/**
 * API client — interfaces and fetch wrappers.
 */

// ─── List endpoint ────────────────────────────────────────────────────────────

export interface ImageEntry {
  /** Numeric string id, e.g. "01" */
  id: string;
  /** Server-generated label ("Sample 01") */
  slotLabel: string;
  /** URL to fundus image preview thumbnail */
  thumbnail?: string;
}

// ─── Vessel analysis sub-type ─────────────────────────────────────────────────

export interface VesselAnalysis {
  arteriovenousRatio?: string;
  tortuosity?: string;
  neovascularization?: string;
}

// ─── Full analysis response ───────────────────────────────────────────────────

export interface Analysis {
  id: string;
  category: string;
  displayName: string;
  condition: string;
  confidence: number;
  severity: string;
  findings: string[];
  recommendation: string;
  analysisSummary: string;
  processingTimeMs: number;
  originalImage: string;

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
