import React, { useState } from 'react';
import './AddMedicine.css';
import axios from 'axios';

function AddMedicine() {
  const [formData, setFormData] = useState({
    tabletName: '',
    quantityInStock: '',
    price: '',
    dosageFrequency: '',
    usageInstructions: '',
    foodWarnings: '',
  });

  const [successMsg, setSuccessMsg] = useState(''); // NEW

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/medicines`, formData);

      // Show success message
      setSuccessMsg(`${formData.tabletName} added`);

      // Hide after 2 seconds
      setTimeout(() => setSuccessMsg(''), 2000);

      // Clear form (optional)
      setFormData({
        tabletName: '',
        quantityInStock: '',
        price: '',
        dosageFrequency: '',
        usageInstructions: '',
        foodWarnings: '',
      });

    } catch (error) {
      alert(error.response?.data?.msg || "Error occurred");
    }
  };

  return (
    <div className="add-form-container">
      <form className="add-medicine-form" onSubmit={handleSubmit}>
        {['tabletName', 'quantityInStock', 'price', 'dosageFrequency', 'usageInstructions', 'foodWarnings'].map((field) => (
          <div className="form-group" key={field}>
            <label htmlFor={field}>{field}</label>
            <input
              type="text"
              id={field}
              name={field}
              value={formData[field]}
              onChange={handleChange}
            />
          </div>
        ))}
        <button type="submit">Add Medicine</button>
      </form>

      {successMsg && (
        <div className="success-message">
          ✅ {successMsg}
        </div>
      )}
    </div>
  );
}

export default AddMedicine;
