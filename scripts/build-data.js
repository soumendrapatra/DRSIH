import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const SAMPLE_DIR = path.join(ROOT_DIR, 'sample-folder');
const DATA_DIR = path.join(SAMPLE_DIR, 'data');
const IMAGES_DIR = path.join(SAMPLE_DIR, 'images');

const CLIENT_PUBLIC_DIR = path.join(ROOT_DIR, 'client', 'public');
const CLIENT_IMAGES_DIR = path.join(CLIENT_PUBLIC_DIR, 'images');
const NETLIFY_FUNCTIONS_DIR = path.join(ROOT_DIR, 'netlify', 'functions');

// Ensure target directories exist
fs.mkdirSync(CLIENT_IMAGES_DIR, { recursive: true });
fs.mkdirSync(NETLIFY_FUNCTIONS_DIR, { recursive: true });

// Copy images to client/public/images for static CDN hosting
if (fs.existsSync(IMAGES_DIR)) {
  const imageFiles = fs.readdirSync(IMAGES_DIR);
  for (const file of imageFiles) {
    fs.copyFileSync(path.join(IMAGES_DIR, file), path.join(CLIENT_IMAGES_DIR, file));
  }
  console.log(`[build-data] Copied ${imageFiles.length} images to client/public/images`);
}

// Build index of data
const slots = [];
const analyses = {};

if (fs.existsSync(DATA_DIR) && fs.existsSync(IMAGES_DIR)) {
  const dataFiles = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json')).sort();
  const imageFiles = fs.readdirSync(IMAGES_DIR);

  for (const file of dataFiles) {
    const id = path.basename(file, '.json');
    const matchedImg = imageFiles.find((img) => path.basename(img, path.extname(img)) === id);

    if (!matchedImg) {
      console.log(`[build-data] Skipping id '${id}' — no matching image`);
      continue;
    }

    const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
    const data = JSON.parse(raw);

    // Resolve original image URL (served from static CDN)
    data.originalImage = `/images/${matchedImg}`;

    // Blind slot definition
    slots.push({ id, slotLabel: `Sample ${id}` });
    analyses[id] = data;
  }
}

const payload = { slots, analyses };
fs.writeFileSync(
  path.join(NETLIFY_FUNCTIONS_DIR, 'data.json'),
  JSON.stringify(payload, null, 2),
  'utf-8'
);

console.log(`[build-data] Generated Netlify function manifest with ${slots.length} samples.`);
