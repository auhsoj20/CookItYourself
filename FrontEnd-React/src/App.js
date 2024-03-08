import './App.css';
import React, { useState } from 'react';
import Nav from './Components/Nav/Nav.js'; // Importiere die Nav-Komponente aus der separaten Datei
import MainFooter from './Components/Footer/MainFooter.js';
import MainPage from './Components/Pages/Main/Main.js';
/*import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';*/

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [footerTab, setFooterTab] = useState(0);
  return (
    <div className="body">
      {/* Navigationsleiste */}
      <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
      <MainPage />
      {/* Fußzeilenbereich */}
      <MainFooter footerTab={footerTab} setFooterTab={setFooterTab}/>
    </div>
  );

}

export default App;