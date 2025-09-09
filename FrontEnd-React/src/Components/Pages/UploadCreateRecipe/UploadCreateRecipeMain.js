import React, { useState, useEffect } from 'react';
import './UploadCreateRecipeMain.css';
import { useTranslation } from 'react-i18next';

function UploadCreateRecipeMain() {
    const [rows, setRows] = useState([{ recipe_id: 1, name: '', description: '', image: null }]);
    const [isMobile, setIsMobile] = useState(false);
    const maxRows = 5;

    const { t, i18n } = useTranslation();

    // Prüfe Bildschirmgröße
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const handleAddRow = () => {
        if (rows.length < maxRows) {
            const newRow = { recipe_id: rows.length + 1, name: '', description: '', image: null };
            setRows([...rows, newRow]);
        }
    };

    const handleRemoveRow = (index) => {
        if (rows.length > 1) { // Verhindere das Entfernen der letzten Zeile
            const newRows = [...rows];
            newRows.splice(index, 1);
            // Aktualisiere die recipe_ids
            const updatedRows = newRows.map((row, idx) => ({ ...row, recipe_id: idx + 1 }));
            setRows(updatedRows);
        }
    };

    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const newRows = [...rows];
        newRows[index][name] = value;
        setRows(newRows);
    };

    const handleImageChange = (index, event) => {
        const file = event.target.files[0];
        if (file) {
            const newRows = [...rows];
            newRows[index].image = file;
            setRows(newRows);
        }
    };

    const handleSubmit = () => {
        // Validierung
        const hasEmptyFields = rows.some(row => !row.name.trim() || !row.description.trim());
        
        if (hasEmptyFields) {
            alert('Bitte füllen Sie alle Felder aus!');
            return;
        }

        // Hier würden Sie normalerweise die Daten an Ihr Backend senden
        console.log('Rezepte:', rows);
        alert('Rezepte erfolgreich hochgeladen!');
    };

    // Desktop Tabellen-Ansicht
    const renderDesktopTable = () => (
        <table className="recipe-table">
            <thead>
                <tr>
                    <th>Schritt</th>
                    <th className="HeaderName">Name</th>
                    <th className="HeaderDescription">Beschreibung</th>
                    <th className="HeaderPicture">Bild</th>
                    <th className="RemoveRow"></th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, index) => (
                    <tr key={row.recipe_id}>
                        <td>{row.recipe_id}</td>
                        <td>
                            <div className="InputContainer">
                                <input
                                    type="text"
                                    name="name"
                                    value={row.name}
                                    placeholder="Rezeptname eingeben..."
                                    onChange={(e) => handleInputChange(index, e)}
                                />
                            </div>
                        </td>
                        <td>
                            <textarea
                                className="ContainerDescription"
                                name="description"
                                value={row.description}
                                placeholder="Beschreibung eingeben..."
                                onChange={(e) => handleInputChange(index, e)}
                            />
                        </td>
                        <td>
                            <div className="InputContainer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(index, e)}
                                />
                                {row.image && (
                                    <div>
                                        <img 
                                            src={URL.createObjectURL(row.image)} 
                                            alt={`Rezept ${index}`} 
                                            style={{ margin: '10px', width: '50px', height: 'auto' }} 
                                        />
                                    </div>
                                )}
                            </div>
                        </td>
                        <td>
                            <button 
                                className="UCRP_remove_row_button" 
                                onClick={() => handleRemoveRow(index)}
                                disabled={rows.length === 1}
                            >
                                Löschen
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    // Mobile Karten-Ansicht
    const renderMobileCards = () => (
        <div className="recipe-cards">
            {rows.map((row, index) => (
                <div key={row.recipe_id} className="recipe-card">
                    <div className="recipe-card-header">
                        <span className="recipe-card-step">Schritt {row.recipe_id}</span>
                        {rows.length > 1 && (
                            <button 
                                className="recipe-card-remove"
                                onClick={() => handleRemoveRow(index)}
                            >
                                Löschen
                            </button>
                        )}
                    </div>
                    
                    <div className="recipe-card-field">
                        <label>Rezeptname</label>
                        <input
                            type="text"
                            name="name"
                            value={row.name}
                            placeholder="Rezeptname eingeben..."
                            onChange={(e) => handleInputChange(index, e)}
                        />
                    </div>

                    <div className="recipe-card-field">
                        <label>Beschreibung</label>
                        <textarea
                            name="description"
                            value={row.description}
                            placeholder="Beschreibung eingeben..."
                            onChange={(e) => handleInputChange(index, e)}
                        />
                    </div>

                    <div className="recipe-card-field">
                        <label>Bild hochladen</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, e)}
                        />
                        {row.image && (
                            <div className="recipe-card-image">
                                <img 
                                    src={URL.createObjectURL(row.image)} 
                                    alt={`Rezept ${index}`}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="body_UploadCreateRecipe">
            <div className="page_UploadCreateRecipe">
                <h2 className="TitleUploadCreateRecipe">{t('uploadCreateRecipe.title')}</h2>
                
                {/* Zeige entweder Tabelle oder Karten basierend auf Bildschirmgröße */}
                {isMobile ? renderMobileCards() : renderDesktopTable()}
                
                <div className="action-buttons">
                    {rows.length < maxRows && (
                        <button 
                            className="UCRP_add_row_button" 
                            onClick={handleAddRow}
                        >
                            {isMobile ? t('uploadCreateRecipe.buttons.addRow') : t('uploadCreateRecipe.buttons.addRow')}
                        </button>
                    )}
                    <button 
                        className="submit-button" 
                        onClick={handleSubmit}
                    >
                        {t('uploadCreateRecipe.buttons.uploadRecipes')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UploadCreateRecipeMain;