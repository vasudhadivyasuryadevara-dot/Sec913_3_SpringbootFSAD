import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createRoot } from 'react-dom/client';

import './index.css';

import App from './App.jsx';
import Home from './components/Home.jsx';
import Admin from './pages/Admin.jsx';
import JwtTool from './components/JwtTool.jsx';

createRoot(document.getElementById('root')).render(

  <BrowserRouter>

    <Routes>

      <Route
        path='/'
        element={<App />}
      />

      <Route
        path='/home'
        element={<Home />}
      />

      <Route
        path='/admin'
        element={<Admin />}
      />

      <Route
        path='/jwt'
        element={<JwtTool />}
      />

    </Routes>

  </BrowserRouter>

)