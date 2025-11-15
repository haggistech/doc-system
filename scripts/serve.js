import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from build directory
app.use(express.static(path.join(rootDir, 'build')));

// Handle 404s - this isn't a SPA, so we don't need catch-all routing
// Files are served directly from build directory

app.listen(PORT, () => {
  console.log(`Documentation server running at http://localhost:${PORT}`);
});
