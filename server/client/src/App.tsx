import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import SelectLocationPage from './pages/SelectLocation'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard';

function App() {


  return (
      <BrowserRouter>
          <Routes>
          <Route path='/login' element={<AuthPage/>} />
          <Route path="/locationSelect" element={<SelectLocationPage />} />
          <Route path='/' element={<Dashboard/>} />
          </Routes>
      </BrowserRouter>

  )
}

export default App