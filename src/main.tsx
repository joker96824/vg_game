import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App'
import CardBrowser from './pages/Card'
import Deck from './pages/Deck'
import './styles/global.css'

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/cards" element={<CardBrowser />} />
        <Route path="/deck" element={<Deck />} />
      </Routes>
    </Router>
  </React.StrictMode>
)