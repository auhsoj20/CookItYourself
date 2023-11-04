import './App.css';
import React, { useState } from 'react';
import Nav from './Components/Nav/Nav.js'; // Importiere die Nav-Komponente aus der separaten Datei
import MainFooter from './Components/Footer/MainFooter.js';
import MainPage from './Components/Pages/Main/Main.js'

function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [footerTab, setFooterTab] = useState(0);
  return (
// eslint-disable-next-line 
    <div className="App">
      <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
      <MainPage />
      <MainFooter footerTab={footerTab} setFooterTab={setFooterTab}/>
    </div>
  );

}

export default App;
