import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import SelectLocationPage from './pages/SelectLocation'
import AuthPage from './pages/AuthPage'
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';

function App() {


  return (
    <AuthProvider>
      <BrowserRouter>
          <Routes>
          <Route path='/' element={<AuthPage/>} />
          <Route path="/locationSelect" element={<SelectLocationPage />} />
          <Route path='/dashboard' element={<Dashboard/>} />
          </Routes>
      </BrowserRouter>
    </AuthProvider>

  )
}

export default App