import logo from './Cooking.png';
import './App.css';

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
    </div>
  );
}

export default App;
