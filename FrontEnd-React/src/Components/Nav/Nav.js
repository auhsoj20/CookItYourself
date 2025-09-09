// Importiere die erforderlichen Abhängigkeiten
import React, { useState } from 'react';
import './Nav.css';
import logo from '../../Pictures/Cooking.png';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Erstelle die Nav-Komponente
function Nav({ activeTab, setActiveTab }) {
  const { t, i18n } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  function toggleTheme() {
    const body = document.body;
    body.classList.toggle("dark-theme");
  }

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuClick = (tabIndex) => {
    setActiveTab(tabIndex);
    setIsDropdownOpen(false); // Dropdown schließen nach Auswahl
  };

  return (
    <nav className="Nav">
      {/* Desktop Navigation */}
      <ul className="desktop-nav">
        <li>
          <Link to="/">  
            <button onClick={() => setActiveTab(0)} className="logo-button hoverable">
              <img src={logo} className="App-logo" alt="logo" />
            </button>
          </Link>          
        </li>
        <li
          className={activeTab === 1 ? 'active' : ''}
          onClick={() => setActiveTab(1)}
        >
          <Link to="/Search_Recipes">
            {t('navigation.searchRecipes')}
          </Link>
        </li>
        <li
          className={activeTab === 2 ? 'active' : ''}
          onClick={() => setActiveTab(2)}
        >
          <Link to="Upload_Create_Recipe">
            {t('navigation.uploadCreateRecipe')}
          </Link>
        </li>
        <li
          className={activeTab === 3 ? 'active' : ''}
          onClick={() => setActiveTab(3)}
        >
          <Link to="/account">
            {t('navigation.account')}
          </Link>
        </li>
        
        {/* Sprachenwechsel Desktop */}
        <li className="language-switch">
          <button 
            onClick={() => changeLanguage('de')} 
            className={`lang-btn ${i18n.language === 'de' ? 'active-lang' : ''}`}
          >
            DE
          </button>
          <button 
            onClick={() => changeLanguage('en')} 
            className={`lang-btn ${i18n.language === 'en' ? 'active-lang' : ''}`}
          >
            EN
          </button>
        </li>
        
        {/* Theme Switch Desktop */}
        <li className="theme-switch">
          <label className="switch">
            <input type="checkbox" onClick={toggleTheme} />
            <span className="slider round"></span>
          </label>
        </li>
      </ul>

      {/* Mobile Navigation */}
      <div className="mobile-nav">
        {/* Logo */}
        <Link to="/" className="mobile-logo">  
          <button onClick={() => setActiveTab(0)} className="logo-button hoverable">
            <img src={logo} className="App-logo" alt="logo" />
          </button>
        </Link>

        {/* Controls Container */}
        <div className="mobile-controls">
          {/* Hamburger Menu */}
          <button 
            className={`hamburger ${isDropdownOpen ? 'active' : ''}`}
            onClick={toggleDropdown}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Sprachenwechsel Mobile */}
          <div className="language-switch mobile-lang">
            <button 
              onClick={() => changeLanguage('de')} 
              className={`lang-btn ${i18n.language === 'de' ? 'active-lang' : ''}`}
            >
              DE
            </button>
            <button 
              onClick={() => changeLanguage('en')} 
              className={`lang-btn ${i18n.language === 'en' ? 'active-lang' : ''}`}
            >
              EN
            </button>
          </div>

          {/* Theme Switch Mobile */}
          <div className="theme-switch mobile-theme">
            <label className="switch">
              <input type="checkbox" onClick={toggleTheme} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <Link 
              to="/Search_Recipes" 
              className={activeTab === 1 ? 'active' : ''}
              onClick={() => handleMenuClick(1)}
            >
              {t('navigation.searchRecipes')}
            </Link>
            <Link 
              to="Upload_Create_Recipe" 
              className={activeTab === 2 ? 'active' : ''}
              onClick={() => handleMenuClick(2)}
            >
              {t('navigation.uploadCreateRecipe')}
            </Link>
            <Link 
              to="/account" 
              className={activeTab === 3 ? 'active' : ''}
              onClick={() => handleMenuClick(3)}
            >
              {t('navigation.account')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Nav;