import './App.css';
import ReactDOM from "react-dom/client";
import React, { useState } from 'react';
import Nav from './Components/Nav/Nav.js'; // Importiere die Nav-Komponente aus der separaten Datei
import MainFooter from './Components/Footer/MainFooter.js';
import MainPage from './Components/Pages/Main/Main.js';
import NoPage from './Components/Pages/NoPage/NoPage.js';
import { BrowserRouter, Routes, Route, Router } from "react-router-dom";

function AppRouter() {
  const [activeTab, setActiveTab] = useState(0);
  const [footerTab, setFooterTab] = useState(0);

  return (
      <BrowserRouter>
        <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
          <Routes>
            <Route path="/" element={<MainPage />} />  
            <Route path="*" element={<NoPage />} />  
          </Routes>
        <MainFooter footerTab={footerTab} setFooterTab={setFooterTab}/>
      </BrowserRouter>
  );
}

export default AppRouter;