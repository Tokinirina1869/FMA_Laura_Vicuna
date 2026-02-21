// src/main.jsx (votre fichier actuel)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import Register from './components/auth/Register';

import Inscription from './components/Inscription';
import { Login } from './components/Users/Login';
import Page from './components/Page';
import ReinscriptionLycee from './components/modals/ReinscriptionLycee';
import ProfileComponent from './components/modals/ProfileComponent';
import ListeFormation from './components/liste/ListeFormation';
import ListeEleve from './components/liste/ListeEleve';
import NouvelleInscription from './components/modals/NouvelleInscription';
// import DashboadFormation from './components/liste/Dash_Formation';
// import DashboardPage from './components/DashboadPage';
// import DashboardEleve from './components/liste/Dash_Eleve';
import { ThemeProvider } from './components/ThemeContext';
import ProtectedRoute from './components/Users/ProtectedRoute';
import { AuthProvider } from './components/Users/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode> 
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<ReinscriptionLycee />} />
            {/* <Route path='/' element={<Inscription />} /> */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* Routes protégées avec la syntaxe children */}
            <Route path='/profil' element={
              <ProtectedRoute>
                <ProfileComponent />
              </ProtectedRoute>
            } />
            {/* <Route path='/dash_global' element={
              <ProtectedRoute> 
                <DashboardPage />
              </ProtectedRoute>
            }/>
            <Route path='/dash_eleve' element={
              <ProtectedRoute> 
                <DashboardEleve />
              </ProtectedRoute>
            }/>
            <Route path='/dash_formation' element={
              <ProtectedRoute> 
                <DashboadFormation />
              </ProtectedRoute>
            }/> */}

            <Route path='/page' element={
              <ProtectedRoute>
                <Page />
              </ProtectedRoute>
            } />
            <Route path='/listeFormation' element={
              <ProtectedRoute>
                <ListeFormation />
              </ProtectedRoute>
            } />
            <Route path='/listeEleve' element={
              <ProtectedRoute>
                <ListeEleve />
              </ProtectedRoute>
            } />
            <Route path='/nouvelleInscription' element={
              <ProtectedRoute>
                <NouvelleInscription />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);