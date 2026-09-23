/**
 * Retina AI Analysis Viewer — Express Backend
 *
 * ─── FOLDER LAYOUT ──────────────────────────────────────────────────────────
 *   sample-folder/
 *   ├── images/    original fundus images  (served at /images)
 *   └── data/      per-id JSON
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

// Serve original images as static assets
app.use('/images', express.static(IMAGES_DIR));

// ─── File-system helper ───────────────────────────────────────────────────────

/**
 * Scans `dir` for a file whose basename (sans extension) equals `id`.
 */
async function findImageById(dir, id) {
  let entries;
  try {
    entries = await fs.readdir(dir);
  } catch {
    return null;
  }
  const match = entries.find(
    (name) => path.basename(name, path.extname(name)) === id
  );
  return match ?? null;
}

// ─── Core data helpers ────────────────────────────────────────────────────────

/**
 * Reads the analysis JSON for `id` and attaches the resolved image URL.
 */
async function getAnalysis(id) {
  const jsonPath = path.join(DATA_DIR, `${id}.json`);
  const raw  = await fs.readFile(jsonPath, 'utf-8');
  const data = JSON.parse(raw);

  const imgFile = await findImageById(IMAGES_DIR, id);
  if (!imgFile) {
    const err  = new Error(`No image file found for id '${id}' in images/`);
    err.code   = 'ENOENT';
    throw err;
  }
  data.originalImage = `/images/${imgFile}`;

  return data;
}

/**
 * Scans data/*.json and images/ and returns { id, slotLabel, thumbnail } for each entry.
 */
async function listSlots() {
  let dataFiles;
  try {
    dataFiles = await fs.readdir(DATA_DIR);
  } catch {
    return [];
  }

  const jsonFiles = dataFiles
    .filter((f) => f.endsWith('.json'))
    .sort();

  const slots = [];
  for (const file of jsonFiles) {
    const id = path.basename(file, '.json');

    const imgFile = await findImageById(IMAGES_DIR, id);
    if (!imgFile) {
      console.log(`[listSlots] Skipping id '${id}' — no matching image in images/`);
      continue;
    }

    slots.push({
      id,
      slotLabel: `Sample ${id}`,
      thumbnail: `/images/${imgFile}`,
    });
  }

  return slots;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/images
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
