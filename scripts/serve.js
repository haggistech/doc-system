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

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Documentation server running at http://localhost:${PORT}`);
});
