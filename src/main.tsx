import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CardBrowser from './pages/Card'
import Deck from './pages/Deck'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import InitAccount from './pages/InitAccount'
import Permissions from './pages/admin/Permissions'
import Skills from './pages/admin/Skills'
import PrivateRoute from './components/PrivateRoute'
import NotificationProvider from './components/NotificationProvider'
import './styles/global.css'
import AvatarAudit from './pages/admin/AvatarAudit'
import Room from './pages/Room'
import RoomList from './pages/RoomList'
import Loading from './pages/Loading'
import { websocketManager } from './services/websocketManager'

// 初始化 WebSocket 管理器
console.log('初始化 WebSocket 管理器...');
websocketManager.connect();

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
              <Home />
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
          <Route path="/room/:roomId" element={
            <PrivateRoute>
              <Room />
            </PrivateRoute>
          } />
          <Route path="/room-list" element={
            <PrivateRoute>
              <RoomList />
            </PrivateRoute>
          } />
          <Route path="/loading" element={
            <PrivateRoute>
              <Loading />
            </PrivateRoute>
          } />
          <Route path="/admin/permissions" element={
            <PrivateRoute>
              <Permissions />
            </PrivateRoute>
          } />
          <Route path="/admin/skills" element={
            <PrivateRoute>
              <Skills />
            </PrivateRoute>
          } />
          <Route path="/admin/avatar-audit" element={
            <PrivateRoute>
              <AvatarAudit />
            </PrivateRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/init-account" element={<InitAccount />} />
        </Routes>
      </Router>
    </NotificationProvider>
  </React.StrictMode>
)