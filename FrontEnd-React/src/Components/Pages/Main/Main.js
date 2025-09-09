import React, { useEffect, useState } from 'react';
import { fetchData } from '../../RestAPI/api.js';
import { useTranslation } from 'react-i18next';

// Erstelle die Nav-Komponente 
function MainPage() {
  // ✅ Korrekte Verwendung des useTranslation Hooks
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  // eslint-disable-next-line
  const [buttonClicked, setButtonClicked] = useState(false);
  const [variableValue, setVariableValue] = useState(''); // Hier wird der Wert der Variable gespeichert

  const handleApiButtonClick = () => {
    if (!buttonClicked) {
      console.log(variableValue);

      // Führen Sie die API-Anfrage nur aus, wenn der Button noch nicht geklickt wurde
      var apiUrl;
  
      if (variableValue === '') {
        apiUrl = 'http://localhost:8000/test';
      } else {
        apiUrl = 'http://localhost:8000/items/' + variableValue;
      }
  
      fetchData(apiUrl)
        .then((responseData) => {
          console.log(responseData);
          setData(responseData);
        })
        .catch((error) => {
          console.error(error);
        });
      //setButtonClicked(true);
    }
  };

  useEffect(() => {
    // Only run the API call if the button has been clicked
    if (buttonClicked) {
      handleApiButtonClick();
    }
  }, [buttonClicked]);

  return (
    <div className="Body_Main">
      <div className="Page_Main">
        <header className="App-header">
          <div>
            {/* ✅ Übersetzter Text mit Link */}
            {t('mainPage.followProject')} &nbsp;
            <a
              className="App-link"
              href="https://github.com/auhsoj20/CookItYourself/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('mainPage.githubLink')}
            </a>
            &nbsp; {t('mainPage.followProjectEnd')}
          </div>
          <button onClick={handleApiButtonClick}>
            {/* ✅ Korrekte Verwendung des t() Hooks */}
            {t('mainPage.buttonText')}
          </button>
        </header>
        {data ? (
          <div>
            <input
              type="text"
              placeholder={t('mainPage.inputPlaceholder')} 
              value={variableValue}
              onChange={(e) => setVariableValue(e.target.value)}
            />
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        ) : (
          <p className="ApiDesign">{t('mainPage.waitingMessage')}</p> 
        )}
      </div>
    </div>
  );
}

export default MainPage;