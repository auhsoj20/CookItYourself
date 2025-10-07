import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Main.css';

function MainPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="body-main">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Cook<span className="accent">It</span>Yourself
          </h1>
          <p className="hero-subtitle">
            {t('mainPage.heroSubtitle', 'Entdecke die Kunst des Kochens - Schritt für Schritt')}
          </p>
          
          {/* GitHub Link Card */}
          <div className="github-card">
            <div className="github-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </div>
            <div className="github-content">
              <p className="github-text">
                {t('mainPage.followProject', 'Folge unserem Projekt auf')}
              </p>
              <a
                className="github-link"
                href="https://github.com/auhsoj20/CookItYourself/"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Repository →
              </a>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="hero-decoration">
          <div className="float-element float-1">🍳</div>
          <div className="float-element float-2">🥘</div>
          <div className="float-element float-3">👨‍🍳</div>
          <div className="float-element float-4">🍽️</div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          <h2 className="section-title">Was dich erwartet</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📖</div>
              <h3>Rezepte entdecken</h3>
              <p>Tausende Rezepte aus aller Welt warten auf dich</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📸</div>
              <h3>Schritt für Schritt</h3>
              <p>Detaillierte Anleitungen mit Bildern für jeden Schritt</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Community</h3>
              <p>Teile deine eigenen Kreationen mit anderen</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Tipps & Tricks</h3>
              <p>Lerne von Profis und verbessere deine Kochkünste</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">
            {t('mainPage.ctaTitle', 'Bereit, loszulegen?')}
          </h2>
          <p className="cta-subtitle">
            {t('mainPage.ctaSubtitle', 'Werde Teil unserer Koch-Community und entdecke neue Geschmackswelten')}
          </p>
          <div className="cta-buttons">
            <button 
              className="cta-button primary"
              onClick={() => navigate('/Search_Recipes')}
            >
              {t('mainPage.ctaExplore', 'Rezepte erkunden')}
            </button>
            <button 
              className="cta-button secondary"
              onClick={() => navigate('/Upload_Create_Recipe')}
            >
              {t('mainPage.ctaCreate', 'Rezept erstellen')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Rezepte</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">50k+</div>
            <div className="stat-label">Nutzer</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">100+</div>
            <div className="stat-label">Kategorien</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">4.9★</div>
            <div className="stat-label">Bewertung</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;