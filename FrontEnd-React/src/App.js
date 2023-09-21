import logo from './Pictures/Cooking.png';
import './App.css';
import React, { useEffect, useState } from 'react';
import { fetchData } from './Components/RestAPI/api.js'; // Stellen Sie sicher, dass der Pfad zur Datei korrekt ist

function App() {

  const [data, setData] = useState(null);

  const handleApiButtonClick = () => {
    
    var apiUrl;

    if (data == null){
      apiUrl = 'http://127.0.0.1:8000/test';
    }
    else{
      apiUrl = 'http://127.0.0.1:8000/items/1';
    }

    fetchData(apiUrl)
      .then((responseData) => {
        console.log(responseData);
        setData(responseData);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    // Führen Sie den API-Aufruf aus, wenn die Komponente montiert ist
    handleApiButtonClick();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" /> 
        <a>
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
        </a>
        <button onClick={handleApiButtonClick}>API-Daten abrufen</button>
      </header>
      {data ? (
        <div>
          {/* Hier können Sie die Daten in Ihrer Komponente verwenden */}
          <h1>Data from API:</h1>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <footer>
        <table>
            <td>
              <tr>
                Datenschutzerklärung
              </tr>
            </td>
            <td>
              <tr>
                Impressum
              </tr>
            </td>
            <td>
              <tr>
                Kontakt
              </tr>
            </td>
        </table> 
      </footer>
    </div>
  );

}

export default App;
