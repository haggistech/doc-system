import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Load config to get baseUrl
const config = JSON.parse(fs.readFileSync(path.join(rootDir, 'config.json'), 'utf-8'));

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from build directory at the baseUrl path
// This allows local dev to match production URLs
if (config.baseUrl && config.baseUrl !== '/') {
  app.use(config.baseUrl, express.static(path.join(rootDir, 'build')));
  console.log(`Serving files at baseUrl: ${config.baseUrl}`);
}

// Also serve at root for convenience during local development
app.use(express.static(path.join(rootDir, 'build')));

app.listen(PORT, () => {
  console.log(`Documentation server running at http://localhost:${PORT}`);
  if (config.baseUrl && config.baseUrl !== '/') {
    console.log(`Visit: http://localhost:${PORT}${config.baseUrl}`);
  }
});
