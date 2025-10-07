import React, { useState, useEffect } from 'react';

function SearchRecipesMain() {
    // States
    const [searchQuery, setSearchQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [recipeDetails, setRecipeDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState('list'); // 'list', 'detail', 'cooking'
    const [currentStep, setCurrentStep] = useState(0);
    const [showLoadingScreen, setShowLoadingScreen] = useState(false);
    
    // KI-States
    const [selectedAI, setSelectedAI] = useState('yolo');
    const [selectedImage, setSelectedImage] = useState(null);
    const [recognizedIngredients, setRecognizedIngredients] = useState([]);
    const [showImageAnalysis, setShowImageAnalysis] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [availableModels, setAvailableModels] = useState({});
    const [isSavingToDb, setIsSavingToDb] = useState(false);
    const [savedToDb, setSavedToDb] = useState(false);
    const [ingredientMappings, setIngredientMappings] = useState([]);
    const [showMappingInterface, setShowMappingInterface] = useState(false);

    // Lade 3 zufällige Rezepte beim Start
    useEffect(() => {
        fetchRandomRecipes();
        fetchAvailableModels();
    }, []);

    const fetchRandomRecipes = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://192.168.10.50:8000/recipe_header/');
            const data = await response.json();
            
            // Prüfe ob data ein Array ist
            if (Array.isArray(data)) {
                const shuffled = data.sort(() => 0.5 - Math.random());
                setRecipes(shuffled.slice(0, 3));
            } else {
                console.error('Unerwartetes Datenformat:', data);
                setRecipes([]);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Rezepte:', error);
            setRecipes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvailableModels = async () => {
        try {
            const response = await fetch('http://192.168.10.50:8000/available_ai_models');
            const data = await response.json();
            setAvailableModels(data);
        } catch (error) {
            console.error('Fehler beim Laden der Modelle:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchRandomRecipes();
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://192.168.10.50:8000/recipe_header/');
            const data = await response.json();
            
            // Prüfe ob data ein Array ist
            if (Array.isArray(data)) {
                const filtered = data.filter(recipe => 
                    recipe[1]?.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setRecipes(filtered);
            } else {
                console.error('Unerwartetes Datenformat:', data);
                setRecipes([]);
            }
        } catch (error) {
            console.error('Fehler bei der Suche:', error);
            setRecipes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecipeClick = async (recipeId) => {
        setIsLoading(true);
        setView('detail');
        try {
            // Sequential requests statt parallel
            const headerRes = await fetch(`http://192.168.10.50:8000/recipe_header/${recipeId}`);
            const header = await headerRes.json();
            
            const ingredientsRes = await fetch(`http://192.168.10.50:8000/recipe_ingredients/${recipeId}`);
            const ingredients = await ingredientsRes.json();
            
            const stepsRes = await fetch(`http://192.168.10.50:8000/recipe_cookingsteps/${recipeId}`);
            const steps = await stepsRes.json();

            setRecipeDetails({
                id: recipeId,
                header: header[0] || [],
                ingredients: ingredients || [],
                steps: steps || []
            });
        } catch (error) {
            console.error('Fehler beim Laden der Details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const startCooking = () => {
        setView('cooking');
        setCurrentStep(0);
    };

    const nextStep = () => {
        if (currentStep < recipeDetails.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const backToList = () => {
        setView('list');
        setSelectedRecipe(null);
        setRecipeDetails(null);
        setCurrentStep(0);
    };

    const backToDetail = () => {
        setView('detail');
        setCurrentStep(0);
    };

    // KI-Funktionen
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            setSavedToDb(false);
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
            alert('Bitte wähle zuerst ein Bild aus');
            return;
        }

        setIsAnalyzing(true);
        setRecognizedIngredients([]);
        setSavedToDb(false);

        try {
            const formData = new FormData();
            formData.append('file', selectedImage);
            formData.append('ai_type', selectedAI);

            const response = await fetch('http://192.168.10.50:8000/analyze_ingredients', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                setRecognizedIngredients(result.ingredients);
                setShowImageAnalysis(true);
                
                const mappings = result.ingredients.map(ing => ({
                    recognized: ing,
                    mapped: ing,
                    amount: '',
                    unit: ''
                }));
                setIngredientMappings(mappings);
            } else {
                const error = await response.json();
                alert('Fehler bei der Analyse: ' + error.detail);
            }
        } catch (error) {
            console.error('Netzwerkfehler:', error);
            alert('Netzwerkfehler bei der Analyse');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const saveIngredientsToDatabase = async () => {
        if (recognizedIngredients.length === 0) {
            alert('Keine Zutaten zum Speichern vorhanden');
            return;
        }

        setIsSavingToDb(true);

        try {
            const response = await fetch('http://192.168.10.50:8000/save_recognized_ingredients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipe_id: recipeDetails?.id || null,
                    ingredients: recognizedIngredients,
                    ai_model_used: selectedAI,
                    image_path: null
                })
            });

            if (response.ok) {
                const result = await response.json();
                setSavedToDb(true);
                alert(`Erfolgreich ${result.ingredients.length} Zutaten gespeichert!`);
            } else {
                const error = await response.json();
                alert('Fehler beim Speichern: ' + error.detail);
            }
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            alert('Netzwerkfehler beim Speichern');
        } finally {
            setIsSavingToDb(false);
        }
    };

    const handleMappingChange = (index, field, value) => {
        const newMappings = [...ingredientMappings];
        newMappings[index][field] = value;
        setIngredientMappings(newMappings);
    };

    const mapIngredientsToRecipe = async () => {
        if (!recipeDetails?.id) {
            alert('Bitte wähle zuerst ein Rezept aus');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('recipe_id', recipeDetails.id);
            formData.append('ingredient_mappings', JSON.stringify(ingredientMappings));

            const response = await fetch('http://192.168.10.50:8000/map_ingredients_to_recipe', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                setShowMappingInterface(false);
                handleRecipeClick(recipeDetails.id);
            } else {
                const error = await response.json();
                alert('Fehler beim Mapping: ' + error.detail);
            }
        } catch (error) {
            console.error('Fehler:', error);
            alert('Netzwerkfehler beim Mapping');
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

    // RENDER: Liste-Ansicht
    if (view === 'list') {
        return (
            <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
                <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                    
                    <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Rezepte durchsuchen</h1>
                    
                    {/* Suchleiste */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Rezeptname eingeben..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '2px solid #ddd', width: '400px' }}
                        />
                        <button onClick={handleSearch} style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
                            Suchen
                        </button>
                        <button onClick={fetchRandomRecipes} style={{ padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
                            Zufällig
                        </button>
                    </div>

                    {/* KI-Sektion */}
                    <div style={{ backgroundColor: '#f0f8ff', border: '2px solid #007BFF', borderRadius: '10px', padding: '20px', marginBottom: '30px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>KI-Zutatenerkennung</h2>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>KI-Modell:</label>
                            <select 
                                value={selectedAI} 
                                onChange={(e) => setSelectedAI(e.target.value)}
                                style={{ padding: '10px', width: '100%', maxWidth: '500px', fontSize: '16px', borderRadius: '5px', border: '2px solid #007BFF' }}
                            >
                                <option value="yolo">{getModelStatusIcon('yolo')} {getModelDisplayName('yolo')}</option>
                                <option value="blip">{getModelStatusIcon('blip')} {getModelDisplayName('blip')}</option>
                                <option value="opencv">{getModelStatusIcon('opencv')} {getModelDisplayName('opencv')}</option>
                                <option value="detectron2">{getModelStatusIcon('detectron2')} {getModelDisplayName('detectron2')}</option>
                            </select>
                            <div style={{ fontStyle: 'italic', color: '#666', fontSize: '14px', marginTop: '5px' }}>
                                {getModelDescription(selectedAI)}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Bild hochladen:</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ padding: '10px', border: '2px dashed #007BFF', borderRadius: '5px', backgroundColor: '#f8f9fa', width: '100%' }}
                            />
                            <img 
                                id="image-preview" 
                                alt="Vorschau" 
                                style={{ display: 'none', maxWidth: '300px', maxHeight: '200px', marginTop: '10px', borderRadius: '8px', border: '2px solid #ddd' }}
                            />
                        </div>

                        <button 
                            onClick={analyzeIngredients}
                            disabled={isAnalyzing || !selectedImage}
                            style={{ 
                                padding: '12px 30px', 
                                backgroundColor: isAnalyzing ? '#6c757d' : '#28a745', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                marginBottom: '10px'
                            }}
                        >
                            {isAnalyzing ? 'Analysiere...' : 'Zutaten erkennen'}
                        </button>

                        {showImageAnalysis && recognizedIngredients.length > 0 && (
                            <div style={{ backgroundColor: '#e8f5e8', border: '2px solid #28a745', borderRadius: '8px', padding: '15px', marginTop: '20px' }}>
                                <h3>Erkannte Zutaten ({getModelDisplayName(selectedAI)}):</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                                    {recognizedIngredients.map((ingredient, index) => (
                                        <span 
                                            key={index} 
                                            style={{ 
                                                backgroundColor: '#28a745', 
                                                color: 'white', 
                                                padding: '6px 12px', 
                                                borderRadius: '15px', 
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {ingredient}
                                        </span>
                                    ))}
                                </div>
                                
                                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button 
                                        onClick={saveIngredientsToDatabase}
                                        disabled={isSavingToDb || savedToDb}
                                        style={{ 
                                            padding: '10px 20px', 
                                            backgroundColor: savedToDb ? '#6c757d' : '#007BFF', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '5px', 
                                            cursor: savedToDb ? 'not-allowed' : 'pointer' 
                                        }}
                                    >
                                        {savedToDb ? 'Gespeichert' : 'In DB speichern'}
                                    </button>
                                    
                                    {recipeDetails && (
                                        <button 
                                            onClick={() => setShowMappingInterface(!showMappingInterface)}
                                            style={{ 
                                                padding: '10px 20px', 
                                                backgroundColor: '#ffc107', 
                                                color: '#000', 
                                                border: 'none', 
                                                borderRadius: '5px', 
                                                cursor: 'pointer' 
                                            }}
                                        >
                                            {showMappingInterface ? 'Mapping schließen' : 'Zu Rezept hinzufügen'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rezept-Liste */}
                    <h2 style={{ marginBottom: '20px' }}>
                        {searchQuery ? `Suchergebnisse für "${searchQuery}"` : 'Zufällige Rezepte'}
                    </h2>
                    
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>Lade Rezepte...</div>
                    ) : recipes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Keine Rezepte gefunden</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {recipes.map((recipe, index) => (
                                <div 
                                    key={recipe[0] || index} 
                                    onClick={() => handleRecipeClick(recipe[0])}
                                    style={{ 
                                        backgroundColor: 'white', 
                                        padding: '20px', 
                                        borderRadius: '12px', 
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                    }}
                                >
                                    <h3 style={{ marginBottom: '10px', color: '#007bff' }}>{recipe[1]}</h3>
                                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                        <strong>Rezept-ID:</strong> {recipe[0]}
                                    </p>
                                    {recipe[6] && (
                                        <p style={{ color: '#666', fontSize: '14px' }}>{recipe[6]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // RENDER: Detail-Ansicht
    if (view === 'detail' && recipeDetails) {
        return (
            <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
                <div style={{ backgroundColor: '#f9f9f9', padding: '30px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                    
                    <button 
                        onClick={backToList}
                        style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}
                    >
                        ← Zurück zur Liste
                    </button>

                    <h1 style={{ marginBottom: '30px', color: '#333' }}>{recipeDetails.header[1]}</h1>

                    {/* Zutaten */}
                    <div style={{ marginBottom: '30px' }}>
                        <h2 style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #e0e0e0' }}>Zutaten</h2>
                        {recipeDetails.ingredients.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {recipeDetails.ingredients.map((ing, index) => (
                                    <li key={index} style={{ padding: '10px', backgroundColor: 'white', marginBottom: '8px', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
                                        <strong>{ing[2]}</strong> {ing[3]} {ing[4]}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: '#666' }}>Keine Zutaten vorhanden</p>
                        )}
                    </div>

                    {/* Schritte */}
                    <div style={{ marginBottom: '30px' }}>
                        <h2 style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #e0e0e0' }}>Zubereitungsschritte</h2>
                        {recipeDetails.steps.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {recipeDetails.steps.map((step, index) => (
                                    <div key={index} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff', marginBottom: '10px' }}>
                                            Schritt {step[1]}
                                        </div>
                                        <p style={{ margin: 0, lineHeight: '1.6' }}>{step[2]}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#666' }}>Keine Schritte vorhanden</p>
                        )}
                    </div>

                    {/* Kochen starten Button */}
                    {recipeDetails.steps.length > 0 && (
                        <button 
                            onClick={startCooking}
                            style={{ 
                                width: '100%',
                                width: '100%',
                                padding: '15px', 
                                backgroundColor: '#28a745', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                fontSize: '18px',
                                fontWeight: 'bold'
                            }}
                        >
                            Kochen starten
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // RENDER: Koch-Ansicht (Schritt-für-Schritt)
    if (view === 'cooking' && recipeDetails) {
        const step = recipeDetails.steps[currentStep];
        const progress = ((currentStep + 1) / recipeDetails.steps.length) * 100;

        return (
            <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', minHeight: '100vh' }}>
                <div style={{ backgroundColor: '#f9f9f9', padding: '30px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                    
                    <button 
                        onClick={backToDetail}
                        style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}
                    >
                        ← Zurück zur Übersicht
                    </button>

                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
                        {recipeDetails.header[1]}
                    </h2>

                    {/* Fortschrittsbalken */}
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                            <span>Schritt {currentStep + 1} von {recipeDetails.steps.length}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#28a745', transition: 'width 0.3s' }}></div>
                        </div>
                    </div>

                    {/* Aktueller Schritt */}
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '2px solid #007bff', marginBottom: '30px', minHeight: '200px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff', marginBottom: '20px', textAlign: 'center' }}>
                            Schritt {step[1]}
                        </div>
                        <p style={{ fontSize: '18px', lineHeight: '1.8', margin: 0 }}>
                            {step[2]}
                        </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button 
                            onClick={previousStep}
                            disabled={currentStep === 0}
                            style={{ 
                                flex: 1,
                                padding: '15px', 
                                backgroundColor: currentStep === 0 ? '#e0e0e0' : '#007bff', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            ← Vorheriger Schritt
                        </button>
                        
                        {currentStep < recipeDetails.steps.length - 1 ? (
                            <button 
                                onClick={nextStep}
                                style={{ 
                                    flex: 1,
                                    padding: '15px', 
                                    backgroundColor: '#28a745', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Nächster Schritt →
                            </button>
                        ) : (
                            <button 
                                onClick={backToDetail}
                                style={{ 
                                    flex: 1,
                                    padding: '15px', 
                                    backgroundColor: '#28a745', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Fertig!
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

export default SearchRecipesMain;