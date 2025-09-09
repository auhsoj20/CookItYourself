import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchData } from '../../RestAPI/api.js';
import LoadingScreen from '../../Functions/LoadingScreen/LoadingScreen.js';
import './SearchRecipesMain.css';

function SearchRecipesMain() {
    const { t } = useTranslation();
    
    const [header_data, set_header_Data] = useState(null);
    const [ingredients_data, set_ingredients_Data] = useState(null);
    const [cookingsteps_data, set_cookingsteps_Data] = useState(null);
    const [buttonClicked, setButtonClicked] = useState(false);
    const [variableValue, setVariableValue] = useState(''); 
    const [showData, setShowData] = useState(false);
    const [showLoadingScreen, setShowLoadingScreen] = useState(false);
    
    // Neue States für Bild-Upload und KI-Analyse
    const [selectedImage, setSelectedImage] = useState(null);
    const [recognizedIngredients, setRecognizedIngredients] = useState([]);
    const [showImageLoadingScreen, setShowImageLoadingScreen] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    // Funktion für Bild-Upload
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            
            // Bild-Vorschau erstellen
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Funktion für KI-Bildanalyse
    const handleImageAnalysis = async () => {
        if (!selectedImage) {
            alert(t('searchRecipes.messages.noImageSelected'));
            return;
        }

        setShowImageLoadingScreen(true);
        setRecognizedIngredients([]);

        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            const response = await fetch('http://localhost:8000/analyze-image', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setRecognizedIngredients(result.ingredients || []);
            } else {
                console.error('Error analyzing image:', response.statusText);
                alert(t('searchRecipes.messages.imageAnalysisError'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert(t('searchRecipes.messages.imageAnalysisError'));
        } finally {
            setShowImageLoadingScreen(false);
        }
    };

    // Funktion zum Entfernen einer erkannten Zutat
    const removeIngredient = (index) => {
        const updatedIngredients = recognizedIngredients.filter((_, i) => i !== index);
        setRecognizedIngredients(updatedIngredients);
    };

    // Bestehende Funktion für Rezeptsuche
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

    // Erweiterte Rezeptsuche basierend auf erkannten Zutaten
    const handleIngredientBasedSearch = async () => {
        if (recognizedIngredients.length === 0) {
            alert(t('searchRecipes.messages.noIngredientsRecognized'));
            return;
        }

        setShowLoadingScreen(true);
        setShowData(false);

        const ingredientList = recognizedIngredients.join(',');
        console.log('Searching recipes with ingredients:', ingredientList);

        try {
            var apiUrl_recipes = `http://localhost:8000/recipes_by_ingredients?ingredients=${encodeURIComponent(ingredientList)}`;

            await fetchData(apiUrl_recipes)
                .then((responseData) => {
                    console.log(responseData);
                    // Das Backend gibt jetzt ein Objekt zurück mit recipes Array
                    if (responseData.success && responseData.recipes) {
                        set_header_Data(responseData.recipes);
                    } else {
                        set_header_Data(responseData);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });

            setShowData(true);
        } catch (error) {
            console.error('Error searching recipes:', error);
            alert(t('searchRecipes.messages.searchError'));
        } finally {
            setShowLoadingScreen(false);
        }
    };

    return (
        <div className="body_SearchRecipesMain">
            <div className="Page_SearchRecipesMain">
                {/* Bestehende Suchfunktion */}
                <div className="search-container">
                    <input
                        type="text"
                        placeholder={t('searchRecipes.placeholder.recipeId')}
                        value={variableValue}
                        onChange={(e) => setVariableValue(e.target.value)}
                    />
                    <button className='search-button-srm' onClick={handleApiButtonClick}>
                        {t('searchRecipes.buttons.searchRecipes')}
                    </button>
                </div>

                {/* Neue Bild-Upload Sektion */}
                <div className="image-upload-section">
                    <div className="divStyle">
                        {t('searchRecipes.sections.imageAnalysis')}
                    </div>
                    
                    <div className="search-container">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                            id="image-upload"
                        />
                        <label htmlFor="image-upload" className="search-button-srm" style={{ cursor: 'pointer', display: 'inline-block' }}>
                            {t('searchRecipes.buttons.selectImage')}
                        </label>
                        
                        {selectedImage && (
                            <button className='search-button-srm' onClick={handleImageAnalysis}>
                                {t('searchRecipes.buttons.analyzeImage')}
                            </button>
                        )}
                    </div>

                    {/* Bild-Vorschau */}
                    {imagePreview && (
                        <div className="image-preview" style={{ textAlign: 'center', margin: '20px 0' }}>
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                            />
                        </div>
                    )}

                    {/* Ladeanzeige für Bildanalyse */}
                    {showImageLoadingScreen && (
                        <div className="loading-container">
                            <LoadingScreen />
                            <p>{t('searchRecipes.messages.analyzingImage')}</p>
                        </div>
                    )}

                    {/* Erkannte Zutaten */}
                    {recognizedIngredients.length > 0 && (
                        <div className="recognized-ingredients">
                            <h3>{t('searchRecipes.sections.recognizedIngredients')}</h3>
                            <div className="ingredients-list">
                                {recognizedIngredients.map((ingredient, index) => (
                                    <span key={index} className="ingredient-tag">
                                        {ingredient}
                                        <button 
                                            className="remove-ingredient" 
                                            onClick={() => removeIngredient(index)}
                                            style={{ marginLeft: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <button className='search-button-srm' onClick={handleIngredientBasedSearch} style={{ marginTop: '10px' }}>
                                {t('searchRecipes.buttons.searchByIngredients')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Bestehende Rezeptanzeige */}
                {showData ? (
                    <div>
                        <div className="divStyle">
                            {t('searchRecipes.sections.characteristics')}
                        </div>
                        {header_data && header_data.length > 0 ? (
                            <table className="tableStyle">
                                <thead>
                                    <tr>
                                        <th>{t('searchRecipes.table.headers.recipeId')}</th>
                                        <th>{t('searchRecipes.table.headers.title')}</th>
                                        <th>{t('searchRecipes.table.headers.userId')}</th>
                                        <th>{t('searchRecipes.table.headers.modificationDate')}</th>
                                        <th>{t('searchRecipes.table.headers.creationDate')}</th>
                                        <th>{t('searchRecipes.table.headers.image')}</th>
                                        <th>{t('searchRecipes.table.headers.description')}</th>
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
                            <p className="no-data-text">{t('searchRecipes.messages.noData')}</p>
                        )}
                        <div className="divStyle">
                            {t('searchRecipes.sections.ingredients')}
                        </div>      
                        {ingredients_data && ingredients_data.length > 0 ? (
                            <table className="tableStyle">
                                <thead>
                                    <tr>
                                        <th>{t('searchRecipes.table.headers.recipeId')}</th>
                                        <th>{t('searchRecipes.table.headers.ingredient')}</th>
                                        <th>{t('searchRecipes.table.headers.amount')}</th>
                                        <th>{t('searchRecipes.table.headers.unit')}</th>
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
                            <p className="no-data-text">{t('searchRecipes.messages.noData')}</p>
                        )}
                        <div className="divStyle">
                            {t('searchRecipes.sections.steps')}
                        </div>
                        {cookingsteps_data && cookingsteps_data.length > 0 ? (
                            <table className="tableStyle">
                                <thead>
                                    <tr>
                                        <th>{t('searchRecipes.table.headers.recipeId')}</th>
                                        <th>{t('searchRecipes.table.headers.stepId')}</th>
                                        <th>{t('searchRecipes.table.headers.description')}</th>
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
                            <p className="no-data-text">{t('searchRecipes.messages.noData')}</p>
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