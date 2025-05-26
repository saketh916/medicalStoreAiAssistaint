import React, { useState } from 'react';
import axios from 'axios';
import './MedicineSearch.css';

function MedicineSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/medicines/check?name=${query}`);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setResult({ error: 'Something went wrong. Try again!' });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setResult(null);

    // Programmatically trigger form submission
    setTimeout(() => {
      document.querySelector('form').dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 0);
  };

  return (
    <div className="search-container">
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg mb-4">
        <strong>Note:</strong> Please enter the <span className="font-semibold">generic name</span> of the medicine, not the brand name.
        For example, use <span className="italic">"paracetmol"</span> instead of <span className="italic">"Dolo 650"</span>.
      </div>
      <form onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Enter medicine name"
            value={query}
            onChange={handleChange}
          />
          {query && (
            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
              aria-label="Clear input"
            >
              ×
            </button>
          )}
        </div>

        <button type="submit" className="check-btn">
          Check Availability
        </button>
      </form>

      {loading && <div className="loading-text">Loading...</div>}

      {result && (
        <div className="result-box">
          <h4>{result.message || result.error}</h4>

          {result.data && (
            <ul>
              <li><strong>Name:</strong> {result.data.tabletName}</li>
              <li><strong>Stock:</strong> {result.data.quantityInStock}</li>
              <li><strong>Price:</strong> ₹{result.data.price}</li>

              {result.data.dosageFrequency && (
                <li><strong>Dosage Frequency:</strong> {result.data.dosageFrequency}</li>
              )}
              {result.data.usageInstructions && (
                <li><strong>Usage Instructions:</strong> {result.data.usageInstructions}</li>
              )}
              {result.data.foodWarnings && (
                <li><strong>Food Warnings:</strong> {result.data.foodWarnings}</li>
              )}
            </ul>

          )}

          {result.suggestions && (
            <div>
              <h5>Similar Medicines:</h5>
              <div className="suggestion-buttons">
                {result.suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="suggestion-btn"
                    onClick={() => handleSuggestionClick(sug)}
                  >
                    🔍 {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {result.rxNavSuggestions && (
            <div>
              <h5>RxNav Alternatives:</h5>
              <div className="suggestion-buttons">
                {result.rxNavSuggestions.map((alt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="suggestion-btn"
                    onClick={() => handleSuggestionClick(alt)}
                  >
                    💊 {alt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MedicineSearch;
