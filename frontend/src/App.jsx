import { useEffect, useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';

const defaultFilters = {
  city: '',
  state: '',
  specialty: '',
  zip: '',
  radius: '25',
  medicareOnly: false,
  emergencyOnly: false,
};

const readFavorites = () => {
  try {
    const saved = localStorage.getItem('thira-care-favorites');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

function App() {
  const [filters, setFilters] = useState(defaultFilters);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => {
    localStorage.setItem('thira-care-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchHospitals = async (searchParams = {}) => {
    setLoading(true);
    setError('');

    try {
      const query = new URLSearchParams(searchParams).toString();
      const response = await fetch(`/api/hospitals${query ? `?${query}` : ''}`);

      if (!response.ok) {
        throw new Error('Unable to load hospital data.');
      }

      const data = await response.json();
      setHospitals(data);
      if (data.length > 0) {
        setSelectedHospitalId((current) => current ?? data[0].id);
      } else {
        setSelectedHospitalId(null);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setHospitals([]);
      setSelectedHospitalId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (!hospitals.length) return;
    if (!selectedHospitalId || !hospitals.some((hospital) => hospital.id === selectedHospitalId)) {
      setSelectedHospitalId(hospitals[0].id);
    }
  }, [hospitals, selectedHospitalId]);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const searchParams = Object.fromEntries(
      Object.entries(filters)
        .filter(([, value]) => value !== '' && value !== false)
        .map(([key, value]) => [key, String(value)])
    );
    fetchHospitals(searchParams);
  };

  const toggleFavorite = (hospitalId) => {
    setFavorites((prev) =>
      prev.includes(hospitalId) ? prev.filter((id) => id !== hospitalId) : [...prev, hospitalId]
    );
  };

  const selectedHospital = useMemo(
    () => hospitals.find((hospital) => hospital.id === selectedHospitalId) || hospitals[0] || null,
    [hospitals, selectedHospitalId]
  );

  const mapCenter = selectedHospital ? [selectedHospital.lat, selectedHospital.lng] : [39.5, -98.35];

  const favoriteCount = favorites.length;

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="topbar">
          <span className="brand-pill">Thira Care</span>
          <span className="status-chip">Medicare coverage support</span>
        </div>
        <div className="hero__content">
          <p className="eyebrow">Patient-first hospital search</p>
          <h1>Find trusted nearby care and Medicare-covered services.</h1>
          <p className="subtitle">
            Compare hospitals, specialties, ratings, and distance in one place to make faster, safer care decisions.
          </p>
        </div>

        <div className="metrics-row">
          <div className="metric-card">
            <span className="metric-label">Facilities</span>
            <strong>{hospitals.length || 0}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Avg rating</span>
            <strong>
              {hospitals.length
                ? (hospitals.reduce((sum, item) => sum + Number(item.rating), 0) / hospitals.length).toFixed(1)
                : '0.0'}
            </strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Favorites</span>
            <strong>{favoriteCount}</strong>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <section className="search-panel">
          <div className="section-heading">
            <h2>Find a hospital</h2>
          </div>

          <form onSubmit={handleSubmit} className="search-form">
            <div className="input-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                value={filters.city}
                onChange={handleChange}
                placeholder="e.g. Austin"
              />
            </div>

            <div className="input-group">
              <label htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                type="text"
                value={filters.state}
                onChange={handleChange}
                placeholder="e.g. TX"
              />
            </div>

            <div className="input-group">
              <label htmlFor="specialty">Specialty</label>
              <input
                id="specialty"
                name="specialty"
                type="text"
                value={filters.specialty}
                onChange={handleChange}
                placeholder="e.g. cardiology"
              />
            </div>

            <div className="input-group">
              <label htmlFor="zip">ZIP code</label>
              <input
                id="zip"
                name="zip"
                type="text"
                value={filters.zip}
                onChange={handleChange}
                placeholder="e.g. 78701"
              />
            </div>

            <div className="input-group">
              <label htmlFor="radius">Radius (miles)</label>
              <select id="radius" name="radius" value={filters.radius} onChange={handleChange}>
                <option value="5">5 miles</option>
                <option value="10">10 miles</option>
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
                <option value="100">100 miles</option>
              </select>
            </div>

            <div className="checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="medicareOnly"
                  checked={filters.medicareOnly}
                  onChange={handleChange}
                />
                Medicare only
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="emergencyOnly"
                  checked={filters.emergencyOnly}
                  onChange={handleChange}
                />
                Emergency care only
              </label>
            </div>

            <div className="button-row">
              <button type="submit">Search hospitals</button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setFilters(defaultFilters);
                  fetchHospitals();
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className="map-list-panel">
          <div className="map-panel">
            {selectedHospital ? (
              <MapContainer center={mapCenter} zoom={5} scrollWheelZoom={false} className="map-container">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {hospitals.map((hospital) => (
                  <CircleMarker
                    key={hospital.id}
                    center={[hospital.lat, hospital.lng]}
                    radius={selectedHospitalId === hospital.id ? 12 : 8}
                    pathOptions={{
                      color: selectedHospitalId === hospital.id ? '#0f766e' : '#38bdf8',
                      fillColor: selectedHospitalId === hospital.id ? '#0f766e' : '#38bdf8',
                      fillOpacity: 0.8,
                      weight: selectedHospitalId === hospital.id ? 3 : 2,
                    }}
                    eventHandlers={{
                      click: () => setSelectedHospitalId(hospital.id),
                    }}
                  >
                    <Popup>
                      <div className="popup-card">
                        <strong>{hospital.name}</strong>
                        <span>{hospital.specialty}</span>
                        <small>
                          {hospital.city}, {hospital.state}
                        </small>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            ) : (
              <div className="map-empty">No location data available.</div>
            )}
          </div>

          <aside className="results-panel">
            <div className="section-heading compact">
              <h2>Nearby facilities</h2>
            </div>

            {selectedHospital && (
              <div className="detail-card">
                <div className="detail-header">
                  <div>
                    <p className="detail-label">Selected facility</p>
                    <h3>{selectedHospital.name}</h3>
                  </div>
                  <button
                    type="button"
                    className={`fav-button ${favorites.includes(selectedHospital.id) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(selectedHospital.id)}
                    aria-label="Toggle favorite"
                  >
                    {favorites.includes(selectedHospital.id) ? '★ Saved' : '☆ Save'}
                  </button>
                </div>

                <ul className="detail-list">
                  <li>
                    <span>Specialty</span>
                    <strong>{selectedHospital.specialty}</strong>
                  </li>
                  <li>
                    <span>Distance</span>
                    <strong>{selectedHospital.distance} miles</strong>
                  </li>
                  <li>
                    <span>Rating</span>
                    <strong>{selectedHospital.rating} / 5</strong>
                  </li>
                  <li>
                    <span>Availability</span>
                    <strong>{selectedHospital.acceptsMedicare ? 'Medicare accepted' : 'Coverage varies'}</strong>
                  </li>
                </ul>
              </div>
            )}

            {loading ? (
              <p className="status">Loading hospitals...</p>
            ) : error ? (
              <p className="status error">{error}</p>
            ) : hospitals.length === 0 ? (
              <p className="status">No hospitals match your filters.</p>
            ) : (
              <div className="results-grid">
                {hospitals.map((hospital) => (
                  <button
                    key={hospital.id}
                    type="button"
                    className={`hospital-card ${selectedHospitalId === hospital.id ? 'selected' : ''}`}
                    onClick={() => setSelectedHospitalId(hospital.id)}
                  >
                    <div className="card-header">
                      <div>
                        <p className="hospital-name">{hospital.name}</p>
                        <p className="hospital-type">{hospital.specialty}</p>
                      </div>
                      <span className="rating">★ {hospital.rating}</span>
                    </div>

                    <ul className="meta-list">
                      <li>{hospital.address}</li>
                      <li>
                        {hospital.city}, {hospital.state} {hospital.zip}
                      </li>
                      <li>Distance: {hospital.distance} miles</li>
                    </ul>

                    <div className="card-actions">
                      <div className="badges">
                        <span>{hospital.acceptsMedicare ? 'Medicare accepted' : 'Coverage varies'}</span>
                        <span>{hospital.emergencyCare ? 'Emergency care' : 'Routine care'}</span>
                      </div>

                      <span
                        className={`mini-fav ${favorites.includes(hospital.id) ? 'active' : ''}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleFavorite(hospital.id);
                        }}
                      >
                        {favorites.includes(hospital.id) ? '★ Saved' : '☆ Save'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;
