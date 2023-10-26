import './App.css';
import React, { useEffect, useState } from 'react';
import { fetchData } from './Components/RestAPI/api.js';
import Nav from './Components/Nav/Nav.js'; // Importiere die Nav-Komponente aus der separaten Datei
import MainFooter from './Components/Footer/MainFooter.js';

function App() {

  const [data, setData] = useState(null);
  // eslint-disable-next-line
  const [buttonClicked, setButtonClicked] = useState(false);
  const [variableValue, setVariableValue] = useState(''); // Hier wird der Wert der Variable gespeichert
  const [activeTab, setActiveTab] = useState(1);
  const [footerTab, setFooterTab] = useState('');

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
// eslint-disable-next-line 
    <div className="App">
      <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
      <header className="App-header">
        <a>
          Jetzt das Projekt auf &nbsp;
          <a
          className="App-link" #
          
          href="https://github.com/auhsoj20/CookItYourself/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github 
        </a>
        &nbsp; verfolgen!
        </a>
        <button onClick={handleApiButtonClick}>API-Daten abrufen</button>
      </header>
      {data ? (
        <div className="ApiDesign">
          {/* Hier fügen Sie die Input-Box hinzu */}
          <input
            type="text"
            placeholder="Geben Sie die Variable ein"
            value={variableValue}
            onChange={(e) => setVariableValue(e.target.value)}
          />
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <p className="ApiDesign">Loading...</p>
      )}
      <MainFooter footerTabTab={footerTab} setFooterTab={setFooterTab}/>
    </div>
  );

}

export default App;
