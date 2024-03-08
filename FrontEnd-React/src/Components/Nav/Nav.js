// Importiere die erforderlichen Abhängigkeiten
import React from 'react';
import './Nav.css';
import logo from '../../Pictures/Cooking.png';
import { Link } from 'react-router-dom';

// Erstelle die Nav-Komponente
function Nav({ activeTab, setActiveTab }) {
  return (
    <nav className="Nav">
      <ul>
        <li>
          <Link to="/">  
            <button onClick={() => setActiveTab(0)} className="logo-button">
                
              <img src={logo} className="App-logo" alt="logo" />

            </button>
          </Link>          
        </li>
        <li
          className={activeTab === 1 ? 'active' : ''}
          onClick={() => setActiveTab(1)}
        >
          <Link to="/Search_Recipes">
          Rezepte suchen
          </Link>
        </li>
        <li
          className={activeTab === 2 ? 'active' : ''}
          onClick={() => setActiveTab(2)}
        >
          <Link to="Upload_Create_Recipe">
          Rezept hochladen/erstellen
          </Link>
        </li>
        <li
          className={activeTab === 3 ? 'active' : ''}
          onClick={() => setActiveTab(3)}
        >
          <Link to="/account">
          Konto
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;