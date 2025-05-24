import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App'
import CardBrowser from './pages/Card'
import Deck from './pages/Deck'
import Login from './pages/Login'
import Register from './pages/Register'
import InitAccount from './pages/InitAccount'
import PrivateRoute from './components/PrivateRoute'
import './styles/global.css'

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={
          <PrivateRoute>
            <App />
          </PrivateRoute>
        } />
        <Route path="/cards" element={
          <PrivateRoute>
            <CardBrowser />
          </PrivateRoute>
        } />
        <Route path="/deck" element={
          <PrivateRoute>
            <Deck />
          </PrivateRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/init-account" element={<InitAccount />} />
      </Routes>
    </Router>
  </React.StrictMode>
)