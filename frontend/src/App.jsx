import { useEffect, useState } from 'react';

const defaultFilters = {
  city: '',
  state: '',
  specialty: '',
  zip: '',
};

function App() {
  const [filters, setFilters] = useState(defaultFilters);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const searchParams = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value.trim() !== '')
    );
    fetchHospitals(searchParams);
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__content">
          <p className="eyebrow">Medicare Hospital Finder</p>
          <h1>Find nearby hospitals and covered services faster.</h1>
          <p className="subtitle">
            Search by city, state, specialty, or ZIP code to compare hospital options and patient services.
          </p>
        </div>
      </header>

      <main className="content">
        <section className="search-panel">
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

            <div className="button-row">
              <button type="submit">Search hospitals</button>
              <button type="button" className="secondary" onClick={() => { setFilters(defaultFilters); fetchHospitals(); }}>
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className="results-panel">
          {loading ? (
            <p className="status">Loading hospitals...</p>
          ) : error ? (
            <p className="status error">{error}</p>
          ) : hospitals.length === 0 ? (
            <p className="status">No hospitals match your filters.</p>
          ) : (
            <div className="results-grid">
              {hospitals.map((hospital) => (
                <article key={hospital.id} className="hospital-card">
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

                  <div className="badges">
                    <span>{hospital.acceptsMedicare ? 'Medicare accepted' : 'Coverage varies'}</span>
                    <span>{hospital.emergencyCare ? 'Emergency care' : 'Non-emergency services'}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
