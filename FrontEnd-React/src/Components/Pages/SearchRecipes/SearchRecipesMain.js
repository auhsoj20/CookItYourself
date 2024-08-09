// Importiere die erforderlichen Abhängigkeiten
import React, { useState } from 'react';
import { fetchData } from '../../RestAPI/api.js';
import LoadingScreen from '../../Functions/LoadingScreen/LoadingScreen.js';

function SearchRecipesMain() {

    const [header_data, set_header_Data] = useState(null);
    const [ingredients_data, set_ingredients_Data] = useState(null);
    const [cookingsteps_data, set_cookingsteps_Data] = useState(null);
    // eslint-disable-next-line
    const [buttonClicked, setButtonClicked] = useState(false);
    const [variableValue, setVariableValue] = useState(''); // Hier wird der Wert der Variable gespeichert
    const [showData, setShowData] = useState(false);
    const [showLoadingScreen, setShowLoadingScreen] = useState(false);

    const handleApiButtonClick = async () => {
        if (!buttonClicked) {

          setShowLoadingScreen(true);
    
          console.log(variableValue);
    
          // Führen Sie die API-Anfrage nur aus, wenn der Button noch nicht geklickt wurde
          var apiUrl_header;
          apiUrl_header = 'http://localhost:8000/recipe_header/' + variableValue;

          await fetchData(apiUrl_header)
            .then((responseData) => {
              console.log(responseData);
              set_header_Data(responseData);
            })
            .catch((error) => {
              console.error(error);
            });

            console.log('Header');

          var apiUrl_ingredients;
            
          apiUrl_ingredients = 'http://localhost:8000/recipe_ingredients/' + variableValue;

          await fetchData(apiUrl_ingredients)
            .then((responseData) => {
              console.log(responseData);
              set_ingredients_Data(responseData);
            })
            .catch((error) => {
              console.error(error);
            });

            console.log('Ingredients');

          var apiUrl_cookingsteps;

            apiUrl_cookingsteps = 'http://localhost:8000/recipe_cookingsteps/' + variableValue;

            await fetchData(apiUrl_cookingsteps)
                .then((responseData) => {
                    console.log(responseData);
                    set_cookingsteps_Data(responseData);
                })
                .catch((error) => {
                    console.error(error);
                });

            console.log('Cookingsteps');

            setShowData(true);
            setShowLoadingScreen(false);

        }
      };

      const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        right: '15px',
      };

      const thStyle = {
        backgroundColor: '#888', // Grauer Hintergrund für den Header
        color: 'black',
        padding: '8px',
        textAlign: 'center',
        fontWeight: 'bold',
      };
    
      const tdStyle = {
        padding: '8px',
        backgroundColor: 'white',
        textAlign: 'center',
        color: 'black',
      };  

      const divStyle = {
        textAlign: 'center', // Zentriert den Text
        margin: '20px 0',
        fontWeight: 'bold',
        fontSize: '20px',
      };

    return(
        <div className="body">
            <div className="NoPage">
                <button onClick={handleApiButtonClick}
                 style={{ marginTop: '20px' }}> 
                 Rezepte suchen 
                 </button>
                <input
                    type="text"
                    placeholder="Filter Rezept-ID"
                    value={variableValue}
                    onChange={(e) => setVariableValue(e.target.value)}
                    style={{ marginTop: '20px',
                             textAlign: 'center', }}
                />
            </div>
            { showData ? (
                <div>
            <div style={divStyle}>
                Merkmale                
            </div>
            { header_data && header_data.length > 0 ? (
                <table 
                style={tableStyle}>
                <thead>
                    <tr>
                    <th style={thStyle}>Rezept ID</th>
                    <th style={thStyle}>Titel</th>
                    <th style={thStyle}>User ID</th>
                    <th style={thStyle}>Änderungsdatum</th>
                    <th style={thStyle}>Erstellungsdatum</th>
                    <th style={thStyle}>Bild</th>
                    <th style={thStyle}>Beschreibung</th>
                    </tr>
                </thead>
                <tbody>
                    {header_data.map((row, index) => (
                    <tr key={index}>
                        {row.map((cell, cellIndex) => (
                        <td style={tdStyle} key={cellIndex}>{cell}</td>
                        ))}
                    </tr>
                    ))}
                </tbody>
                </table>
                ) : (
                    <p>Keine Daten vorhanden .</p>
                  ) }
            <div style={divStyle}>
                Zutaten                
            </div>      
            {ingredients_data && ingredients_data.length > 0 ? (
                <table border="1" style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Rezept ID</th>
                            <th style={thStyle}>Zutat</th>
                            <th style={thStyle}>Menge</th>
                            <th style={thStyle}>Einheit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingredients_data.map((row, index) => (
                            <tr key={index}>
                                {row.map((cell, cellIndex) => (
                                    <td style={tdStyle} key={cellIndex}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Keine Daten vorhanden.</p>
            )}

            <div style={divStyle}>
                Schritte
            </div>
            {cookingsteps_data && cookingsteps_data.length > 0 ? (
                <table border="1" style={tableStyle}>
                    <thead>
                    <tr>
                        <th style={thStyle}>Rezept ID</th>
                        <th style={thStyle}>Schritt ID</th>
                        <th style={thStyle}>Beschreibung</th>
                    </tr>
                    </thead>
                    <tbody>
                    {cookingsteps_data.map((row, index) => (
                        <tr key={index}>
                            {row.map((cell, cellIndex) => (
                                <td style={tdStyle} key={cellIndex}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>Keine Daten vorhanden.</p>
            )}
                </div>        ) : (

                    <div>

                { showLoadingScreen ? ( <LoadingScreen />

                    ) : ( <div></div> ) }

                    </div>


            ) }

        </div> )

}

export default SearchRecipesMain;