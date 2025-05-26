// src/pages/AddPage.js
import React from 'react';
import AddMedicine from '../components/AddMedicine';
import './AddPage.css';

function AddPage() {

  return (
    <div className="add-page-container">
      
      <h2>Add New Medicine</h2>
      <AddMedicine />
    </div>
  );
}

export default AddPage;
