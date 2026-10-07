import express from 'express';
import cors from 'cors';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'Medicare Hospital Finder API is running.',
  });
});

app.get('/api/hospitals', async (req, res) => {
  try {
    const { city, state, specialty, zip } = req.query;
    const filePath = path.join(__dirname, 'data', 'hospitals.json');
    const raw = await readFile(filePath, 'utf8');
    const hospitals = JSON.parse(raw);

    const filteredHospitals = hospitals.filter((hospital) => {
      const cityMatch = !city || hospital.city.toLowerCase().includes(String(city).toLowerCase());
      const stateMatch = !state || hospital.state.toLowerCase() === String(state).toLowerCase();
      const specialtyMatch =
        !specialty || hospital.specialty.toLowerCase().includes(String(specialty).toLowerCase());
      const zipMatch = !zip || hospital.zip === String(zip);

      return cityMatch && stateMatch && specialtyMatch && zipMatch;
    });

    res.json(filteredHospitals);
  } catch (error) {
    console.error('Failed to load hospitals:', error);
    res.status(500).json({ error: 'Unable to load hospital data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Medicare Hospital Finder API listening on http://localhost:${PORT}`);
});
