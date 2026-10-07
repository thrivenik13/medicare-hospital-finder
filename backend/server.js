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
    message: 'Thira Care API is running.',
  });
});

const toBool = (value) => value === 'true' || value === true;

app.get('/api/hospitals', async (req, res) => {
  try {
    const { city, state, specialty, zip, radius, medicareOnly, emergencyOnly } = req.query;
    const filePath = path.join(__dirname, 'data', 'hospitals.json');
    const raw = await readFile(filePath, 'utf8');
    let hospitals = JSON.parse(raw);

    hospitals = hospitals.filter((hospital) => {
      const cityMatch = !city || hospital.city.toLowerCase().includes(String(city).toLowerCase());
      const stateMatch = !state || hospital.state.toLowerCase() === String(state).toLowerCase();
      const specialtyMatch =
        !specialty || hospital.specialty.toLowerCase().includes(String(specialty).toLowerCase());
      const zipMatch = !zip || hospital.zip === String(zip);
      const medicareMatch = !toBool(medicareOnly) || hospital.acceptsMedicare;
      const emergencyMatch = !toBool(emergencyOnly) || hospital.emergencyCare;

      return cityMatch && stateMatch && specialtyMatch && zipMatch && medicareMatch && emergencyMatch;
    });

    const maxRadius = radius ? Number(radius) : null;
    if (maxRadius && Number.isFinite(maxRadius)) {
      hospitals = hospitals.filter((hospital) => Number(hospital.distance) <= maxRadius);
    }

    hospitals = hospitals.sort((a, b) => Number(a.distance) - Number(b.distance));

    res.json(hospitals);
  } catch (error) {
    console.error('Failed to load hospitals:', error);
    res.status(500).json({ error: 'Unable to load hospital data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Thira Care API listening on http://localhost:${PORT}`);
});
