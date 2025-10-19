import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import SelectLocationPage from './pages/SelectLocation'
import AuthPage from './pages/AuthPage'
import { AuthProvider } from './context/AuthContext';

function App() {


  return (
    <AuthProvider>
      <BrowserRouter>
          <Routes>
          <Route path="/locationSelect" element={<SelectLocationPage />} />
          <Route path='/' element={<AuthPage/>} />
          </Routes>
      </BrowserRouter>
    </AuthProvider>

  )
}

export default App