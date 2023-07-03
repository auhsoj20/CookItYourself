import logo from './Cooking.png';
import './App.css';
import React from 'react';

function App() {
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
        
      </header>
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
