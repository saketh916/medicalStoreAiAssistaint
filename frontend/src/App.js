import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import AddPage from './pages/AddPage';
import MedicineSearch from './components/MedicineSearch';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="logo">💊 Medical Store Assistant</div>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/search">Search</Link></li>
            <li><Link to="/add">Add</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<MedicineSearch />} />
          <Route path="/add" element={<AddPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
