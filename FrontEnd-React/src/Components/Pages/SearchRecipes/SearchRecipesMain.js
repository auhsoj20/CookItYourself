import React, { useState, useEffect } from 'react';
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
    
    // Neue States für KI-Zutatenerkennung
    const [selectedAI, setSelectedAI] = useState('yolo');
    const [selectedImage, setSelectedImage] = useState(null);
    const [recognizedIngredients, setRecognizedIngredients] = useState([]);
    const [showImageAnalysis, setShowImageAnalysis] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [availableModels, setAvailableModels] = useState({});

    // Lade verfügbare KI-Modelle beim Komponenten-Mount
    useEffect(() => {
        fetchAvailableModels();
    }, []);

    const fetchAvailableModels = async () => {
        try {
            const response = await fetchData('http://localhost:8000/available_ai_models');
            setAvailableModels(response);
        } catch (error) {
            console.error(t('ai.errors.loadingModels'), error);
        }
    };

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

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            // Zeige Bildvorschau
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('image-preview');
                if (preview) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeIngredients = async () => {
        if (!selectedImage) {
            alert(t('ai.alerts.selectImageFirst'));
            return;
        }

        setIsAnalyzing(true);
        setRecognizedIngredients([]);

        try {
            const formData = new FormData();
            formData.append('file', selectedImage);
            formData.append('ai_type', selectedAI);

            const response = await fetch('http://localhost:8000/analyze_ingredients', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                setRecognizedIngredients(result.ingredients);
                setShowImageAnalysis(true);
            } else {
                const error = await response.json();
                console.error(t('ai.errors.imageAnalysis'), error);
                alert(t('ai.alerts.imageAnalysisError') + error.detail);
            }
        } catch (error) {
            console.error(t('ai.errors.networkError'), error);
            alert(t('ai.alerts.networkError'));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getModelStatusIcon = (modelName) => {
        const isAvailable = availableModels.models && availableModels.models[modelName];
        return isAvailable ? '✅' : '❌';
    };

    const getModelDescription = (modelName) => {
        return availableModels.descriptions ? availableModels.descriptions[modelName] : '';
    };

    const getModelDisplayName = (modelName) => {
        const displayNames = {
            'yolo': 'YOLO v5',
            'blip': 'BLIP',
            'opencv': 'OpenCV',
            'detectron2': 'Detectron2'
        };
        return displayNames[modelName] || modelName.toUpperCase();
    };

    return (
        <div className="body_SearchRecipesMain">
            <div className="Page_SearchRecipesMain">
                
                {/* Bestehende Rezept-Suche */}
                <div className="search-container">
                    <input
                        type="text"
                        placeholder={t('searchRecipes.placeholder')}
                        value={variableValue}
                        onChange={(e) => setVariableValue(e.target.value)}
                    />
                    <button className='search-button-srm' onClick={handleApiButtonClick}>
                        {t('searchRecipes.searchButton')}
                    </button>
                </div>

                {/* Erweiterte KI-Zutatenerkennung Sektion */}
                <div className="ai-ingredients-section">
                    <div className="divStyle">
                        {t('ai.title')}
                    </div>
                    
                    <div className="ai-selection-container">
                        <label htmlFor="ai-select">{t('ai.selectModel')}</label>
                        <select 
                            id="ai-select"
                            value={selectedAI} 
                            onChange={(e) => setSelectedAI(e.target.value)}
                            className="ai-dropdown"
                        >
                            <option value="yolo">
                                {getModelStatusIcon('yolo')} {getModelDisplayName('yolo')} - {t('ai.models.yolo')}
                            </option>
                            <option value="blip">
                                {getModelStatusIcon('blip')} {getModelDisplayName('blip')} - {t('ai.models.blip')}
                            </option>
                            <option value="opencv">
                                {getModelStatusIcon('opencv')} {getModelDisplayName('opencv')} - {t('ai.models.opencv')}
                            </option>
                            <option value="detectron2">
                                {getModelStatusIcon('detectron2')} {getModelDisplayName('detectron2')}
                            </option>
                        </select>
                        <div className="model-description">
                            {getModelDescription(selectedAI)}
                        </div>
                    </div>

                    <div className="image-upload-container">
                        <label htmlFor="image-input">{t('ai.uploadImage')}</label>
                        <input 
                            type="file" 
                            id="image-input"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="image-input"
                        />
                        <img 
                            id="image-preview" 
                            alt={t('ai.imagePreview')} 
                            className="image-preview"
                            style={{display: 'none'}}
                        />
                    </div>

                    <button 
                        className="analyze-button" 
                        onClick={analyzeIngredients}
                        disabled={isAnalyzing || !selectedImage}
                    >
                        {isAnalyzing ? (
                            <>
                                {t('ai.analyzing')}
                                {selectedAI === 'detectron2' && ' (Detectron2 arbeitet...)'}
                            </>
                        ) : (
                            <>
                                {t('ai.recognizeIngredients')}
                                {selectedAI === 'detectron2' && ' mit Detectron2'}
                            </>
                        )}
                    </button>

                    {isAnalyzing && (
                        <div className="loading-container">
                            <LoadingScreen />
                            {selectedAI === 'detectron2' && (
                                <div style={{textAlign: 'center', marginTop: '10px', color: '#007BFF'}}>
                                    Detectron2 führt erweiterte Objekterkennung durch...
                                </div>
                            )}
                        </div>
                    )}

                    {showImageAnalysis && recognizedIngredients.length > 0 && (
                        <div className="recognized-ingredients">
                            <div className="divStyle">
                                {t('ai.recognizedIngredients', { model: getModelDisplayName(selectedAI) })}
                                {selectedAI === 'detectron2' && (
                                    <div style={{fontSize: '14px', color: '#666', fontWeight: 'normal'}}>
                                        (Mit Detectron2 Konfidenzwerten)
                                    </div>
                                )}
                            </div>
                            <div className="ingredients-list">
                                {recognizedIngredients.map((ingredient, index) => (
                                    <span 
                                        key={index} 
                                        className={`ingredient-tag ${selectedAI === 'detectron2' ? 'detectron2-tag' : ''}`}
                                    >
                                        {ingredient}
                                    </span>
                                ))}
                            </div>
                            {selectedAI === 'detectron2' && recognizedIngredients.length > 0 && (
                                <div style={{marginTop: '10px', fontSize: '12px', color: '#666', textAlign: 'center'}}>
                                    Detectron2 zeigt Konfidenzwerte in Klammern an
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bestehende Rezept-Anzeige */}
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
                            <p className="no-data-text">{t('searchRecipes.noDataAvailable')}</p>
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
                                        <th>{t('searchRecipes.table.headers.quantity')}</th>
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
                            <p className="no-data-text">{t('searchRecipes.noDataAvailable')}</p>
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
                                        <th>{t('searchRecipes.table.headers.stepDescription')}</th>
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
                            <p className="no-data-text">{t('searchRecipes.noDataAvailable')}</p>
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