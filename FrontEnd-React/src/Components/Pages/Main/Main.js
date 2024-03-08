// Importiere die erforderlichen Abhängigkeiten
import React, { useEffect, useState } from 'react';
import { fetchData } from '../../RestAPI/api.js';

// Erstelle die Nav-Komponente 
function MainPage() {

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
    <div className="body">
        <header className="App-header">
        <div>
          Jetzt das Projekt auf &nbsp;
          <a
          className="App-link"
          href="https://github.com/auhsoj20/CookItYourself/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github 
        </a>
        &nbsp; verfolgen!
        </div>
        <button onClick={handleApiButtonClick}>API-Daten abrufen</button>
      </header>
      {data ? (
        <div>
          <input
            type="text"
            placeholder="Geben Sie die Variable ein"
            value={variableValue}
            onChange={(e) => setVariableValue(e.target.value)}
          />
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <p className="ApiDesign">Waiting for API Action!</p>
      )}
    </div>
  );
}

export default MainPage;