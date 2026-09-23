/**
 * Retina AI Analysis Viewer — Express Backend
 *
 * ─── BLIND SELECTION CONTRACT ───────────────────────────────────────────────
 *   GET /api/images      → { id, slotLabel } ONLY — zero real data leaked
 *   GET /api/analysis/:id → full JSON + resolved originalImage URL
 * ────────────────────────────────────────────────────────────────────────────
 *
 * To plug in a real AI model later: replace ONLY the `getAnalysis` function.
 * Keep its signature and return shape — the entire frontend works unchanged.
 *
 * ─── FOLDER LAYOUT ──────────────────────────────────────────────────────────
 *   sample-folder/
 *   ├── images/    original fundus images  (served at /images)
 *   └── data/      per-id JSON             (never bulk-exposed as static)
 *
 *   Join key: numeric id ("01", "02", ...)
 *   Image : images/<id>.<any-ext>   — extension scanned at runtime
 *   Data  : data/<id>.json
 * ────────────────────────────────────────────────────────────────────────────
 */

import express  from 'express';
import cors     from 'cors';
import fs       from 'fs/promises';
import path     from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Directory paths ──────────────────────────────────────────────────────────
const SAMPLE_DIR = path.join(__dirname, '..', 'sample-folder');
const IMAGES_DIR = path.join(SAMPLE_DIR, 'images');
const DATA_DIR   = path.join(SAMPLE_DIR, 'data');

// ─── App setup ────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve original images — files reachable by direct URL only.
// No directory listing or bulk enumeration route is exposed.
app.use('/images', express.static(IMAGES_DIR));

// ─── File-system helper ───────────────────────────────────────────────────────

/**
 * Scans `dir` for a file whose basename (sans extension) equals `id`.
 * Accepts any file extension — do NOT hardcode `.jpg`.
 *
 * @param {string} dir  Absolute directory to search
 * @param {string} id   Numeric id string, e.g. '01'
 * @returns {Promise<string|null>} Matched filename (with extension), or null
 */
async function findImageById(dir, id) {
  let entries;
  try {
    entries = await fs.readdir(dir);
  } catch {
    return null; // directory missing or unreadable — treat as empty
  }
  const match = entries.find(
    (name) => path.basename(name, path.extname(name)) === id
  );
  return match ?? null;
}

// ─── Core data helpers ────────────────────────────────────────────────────────

/**
 * Reads the analysis JSON for `id` and attaches the resolved image URL.
 *
 * ► SWAP THIS FUNCTION to call a real AI API when ready.
 *   Return shape must stay identical: { ...jsonFields, originalImage: string }
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
async function getAnalysis(id) {
  // 1. Load JSON — throws ENOENT if the file doesn't exist
  const jsonPath = path.join(DATA_DIR, `${id}.json`);
  const raw  = await fs.readFile(jsonPath, 'utf-8');
  const data = JSON.parse(raw);

  // 2. Resolve original image (required — 404 if missing)
  const imgFile = await findImageById(IMAGES_DIR, id);
  if (!imgFile) {
    const err  = new Error(`No image file found for id '${id}' in images/`);
    err.code   = 'ENOENT';
    throw err;
  }
  data.originalImage = `/images/${imgFile}`;

  // No heatmapImage — removed entirely from the data contract.

  return data;
}

/**
 * Scans data/*.json, verifies each id has a matching image, and returns
 * ONLY { id, slotLabel } — nothing that exposes real data to devtools.
 *
 * slotLabel ("Sample 01") is server-generated and reveals nothing about
 * the diagnosis, category, or any other field in the JSON.
 *
 * @returns {Promise<Array<{id: string, slotLabel: string}>>}
 */
async function listSlots() {
  let dataFiles;
  try {
    dataFiles = await fs.readdir(DATA_DIR);
  } catch {
    return []; // data directory missing — return empty list gracefully
  }

  const jsonFiles = dataFiles
    .filter((f) => f.endsWith('.json'))
    .sort(); // deterministic order

  const slots = [];
  for (const file of jsonFiles) {
    const id = path.basename(file, '.json');

    // Only surface ids that have a corresponding image file
    const imgFile = await findImageById(IMAGES_DIR, id);
    if (!imgFile) {
      console.log(`[listSlots] Skipping id '${id}' — no matching image in images/`);
      continue;
    }

    slots.push({ id, slotLabel: `Sample ${id}` });
  }

  return slots;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/images
 * BLIND CONTRACT: returns ONLY { id, slotLabel } — zero diagnostic data.
 */
app.get('/api/images', async (_req, res) => {
  try {
    const slots = await listSlots();
    res.json({ success: true, data: slots });
  } catch (err) {
    console.error('[GET /api/images]', err.message);
    res.status(500).json({ success: false, error: 'Failed to load image list.' });
  }
});

/**
 * GET /api/analysis/:id
 * Called only on card click. Returns full analysis JSON + resolved originalImage.
 * Replace `getAnalysis` above to swap in a real AI model.
 */
app.get('/api/analysis/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const analysis = await getAnalysis(id);
    res.json({ success: true, data: analysis });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        error: `No data or image found for id: '${id}'`,
      });
    }
    console.error('[GET /api/analysis/:id]', err.message);
    res.status(500).json({ success: false, error: 'Failed to load analysis.' });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🔬 Retina AI Server  →  http://localhost:${PORT}`);
  console.log(`  Sample folder        →  ${SAMPLE_DIR}\n`);
});
