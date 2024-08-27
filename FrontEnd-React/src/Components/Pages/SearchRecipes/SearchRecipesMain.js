import React, { useState } from 'react';
import { fetchData } from '../../RestAPI/api.js';
import LoadingScreen from '../../Functions/LoadingScreen/LoadingScreen.js';
import './SearchRecipesMain.css';  // Importiere die CSS-Datei

function SearchRecipesMain() {

    const [header_data, set_header_Data] = useState(null);
    const [ingredients_data, set_ingredients_Data] = useState(null);
    const [cookingsteps_data, set_cookingsteps_Data] = useState(null);
    const [buttonClicked, setButtonClicked] = useState(false);
    const [variableValue, setVariableValue] = useState(''); 
    const [showData, setShowData] = useState(false);
    const [showLoadingScreen, setShowLoadingScreen] = useState(false);

    const handleApiButtonClick = async () => {
        if (!buttonClicked) {
            setShowLoadingScreen(true);
            console.log(variableValue);

            var apiUrl_header = 'http://localhost:8000/recipe_header/' + variableValue;

            await fetchData(apiUrl_header)
                .then((responseData) => {
                    console.log(responseData);
                    set_header_Data(responseData);
                })
                .catch((error) => {
                    console.error(error);
                });

            console.log('Header');

            var apiUrl_ingredients = 'http://localhost:8000/recipe_ingredients/' + variableValue;

            await fetchData(apiUrl_ingredients)
                .then((responseData) => {
                    console.log(responseData);
                    set_ingredients_Data(responseData);
                })
                .catch((error) => {
                    console.error(error);
                });

            console.log('Ingredients');

            var apiUrl_cookingsteps = 'http://localhost:8000/recipe_cookingsteps/' + variableValue;

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

    return (
        <div className="body_SearchRecipesMain">
            <div className="Page_SearchRecipesMain">
                <div className="search-container">
                    <button onClick={handleApiButtonClick}>
                        Rezepte suchen
                    </button>
                    <input
                        type="text"
                        placeholder="Filter Rezept-ID"
                        value={variableValue}
                        onChange={(e) => setVariableValue(e.target.value)}
                    />
                </div>
                {showData ? (
                    <div>
                        <div className="divStyle">
                            Merkmale                
                        </div>
                        {header_data && header_data.length > 0 ? (
                            <table className="tableStyle">
                                <thead>
                                    <tr>
                                        <th>Rezept ID</th>
                                        <th>Titel</th>
                                        <th>User ID</th>
                                        <th>Änderungsdatum</th>
                                        <th>Erstellungsdatum</th>
                                        <th>Bild</th>
                                        <th>Beschreibung</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {header_data.map((row, index) => (
                                        <tr key={index}>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex}>{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data-text">Keine Daten vorhanden.</p>
                        )}
                        <div className="divStyle">
                            Zutaten                
                        </div>      
                        {ingredients_data && ingredients_data.length > 0 ? (
                            <table className="tableStyle">
                                <thead>
                                    <tr>
                                        <th>Rezept ID</th>
                                        <th>Zutat</th>
                                        <th>Menge</th>
                                        <th>Einheit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ingredients_data.map((row, index) => (
                                        <tr key={index}>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex}>{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data-text">Keine Daten vorhanden.</p>
                        )}
                        <div className="divStyle">
                            Schritte
                        </div>
                        {cookingsteps_data && cookingsteps_data.length > 0 ? (
                            <table className="tableStyle">
                                <thead>
                                    <tr>
                                        <th>Rezept ID</th>
                                        <th>Schritt ID</th>
                                        <th>Beschreibung</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cookingsteps_data.map((row, index) => (
                                        <tr key={index}>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex}>{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data-text">Keine Daten vorhanden.</p>
                        )}
                    </div>
                ) : (
                    <div className="loading-container">
                        {showLoadingScreen ? <LoadingScreen /> : <div></div>}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchRecipesMain;
