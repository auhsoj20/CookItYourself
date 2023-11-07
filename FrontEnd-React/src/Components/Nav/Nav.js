// Importiere die erforderlichen Abhängigkeiten
import React from 'react';
import './Nav.css';
import logo from '../../Pictures/Cooking.png';
import { Link } from 'react-router-dom';

// Erstelle die Nav-Komponente
function Nav({ activeTab, setActiveTab }) {
  return (
    <nav className="Nav">
      <button onClick={() => setActiveTab(0)} className="logo-button">
          <img src={logo} className="App-logo" alt="logo" />
      </button>
      <ul>
        <li
          className={activeTab === 1 ? 'active' : ''}
          onClick={() => setActiveTab(1)}
        >
          Rezepte suchen
        </li>
        <li
          className={activeTab === 2 ? 'active' : ''}
          onClick={() => setActiveTab(2)}
        >
          Rezept hochladen/erstellen
        </li>
        <li
          className={activeTab === 3 ? 'active' : ''}
          onClick={() => setActiveTab(3)}
        >
          Konto
        </li>
      </ul>
    </nav>
  );
}

export default Nav;