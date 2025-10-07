import React, { useState, useEffect } from 'react';

function UploadCreateRecipeMain() {
    // State Management
    const [recipeName, setRecipeName] = useState('');
    const [rows, setRows] = useState([{ 
        recipe_id: 1, 
        description: '', 
        images: []
    }]);
    const [isMobile, setIsMobile] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');
    const [submitMessage, setSubmitMessage] = useState('');
    
    const maxRows = 10;
    const maxImagesPerStep = 3;

    // Screen Size Detection
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Event Handlers
    const handleAddRow = () => {
        if (rows.length < maxRows) {
            setRows([...rows, { 
                recipe_id: rows.length + 1, 
                description: '', 
                images: [] 
            }]);
        }
    };

    const handleRemoveRow = (index) => {
        if (rows.length > 1) {
            const newRows = [...rows];
            newRows.splice(index, 1);
            const updatedRows = newRows.map((row, idx) => ({ 
                ...row, 
                recipe_id: idx + 1 
            }));
            setRows(updatedRows);
        }
    };

    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const newRows = [...rows];
        newRows[index][name] = value;
        setRows(newRows);
    };

    const handleImageAdd = (index, event) => {
        const files = Array.from(event.target.files);
        const newRows = [...rows];
        const currentImages = newRows[index].images || [];
        const remainingSlots = maxImagesPerStep - currentImages.length;
        const filesToAdd = files.slice(0, remainingSlots);
        newRows[index].images = [...currentImages, ...filesToAdd];
        setRows(newRows);
        event.target.value = '';
    };

    const handleImageRemove = (rowIndex, imageIndex) => {
        const newRows = [...rows];
        newRows[rowIndex].images.splice(imageIndex, 1);
        setRows(newRows);
    };

    const handleSubmit = async () => {
        setSubmitStatus('');
        setSubmitMessage('');
        
        // Validierung
        if (!recipeName.trim()) {
            setSubmitStatus('error');
            setSubmitMessage('Bitte gib einen Rezeptnamen ein');
            return;
        }

        const hasEmptyFields = rows.some(row => !row.description.trim());
        if (hasEmptyFields) {
            setSubmitStatus('error');
            setSubmitMessage('Bitte fülle alle Beschreibungsfelder aus');
            return;
        }

        setIsSubmitting(true);

        try {
            // Bereite Schritte-Daten vor
            const stepsData = rows.map((row, index) => ({
                step_number: index + 1,
                description: row.description
            }));

            // FormData erstellen
            const formData = new FormData();
            formData.append('recipe_name', recipeName);
            formData.append('steps_data', JSON.stringify(stepsData));
            // user_id kann optional hinzugefügt werden
            // formData.append('user_id', userId);

            // API Request
            const response = await fetch('http://192.168.10.50:8000/recipes', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                setSubmitStatus('success');
                setSubmitMessage(`Rezept erfolgreich erstellt! Rezept-ID: ${result.recipe_id}`);
                
                // Formular nach 3 Sekunden zurücksetzen
                setTimeout(() => {
                    setRecipeName('');
                    setRows([{ recipe_id: 1, description: '', images: [] }]);
                    setSubmitStatus('');
                    setSubmitMessage('');
                }, 3000);
            } else {
                const error = await response.json();
                setSubmitStatus('error');
                setSubmitMessage(`Fehler: ${error.detail}`);
            }
        } catch (error) {
            console.error('Netzwerkfehler:', error);
            setSubmitStatus('error');
            setSubmitMessage('Netzwerkfehler beim Hochladen');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render Functions
    const renderDesktopTable = () => (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
                <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                    <th style={{ padding: '15px', width: '80px' }}>Schritt</th>
                    <th style={{ padding: '15px', width: '40%' }}>Beschreibung</th>
                    <th style={{ padding: '15px', width: '40%' }}>Bilder (später)</th>
                    <th style={{ padding: '15px', width: '100px', textAlign: 'center' }}>Aktionen</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, index) => (
                    <tr key={row.recipe_id}>
                        <td style={{ padding: '15px', borderBottom: '1px solid #e0e0e0', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                            {row.recipe_id}
                        </td>
                        <td style={{ padding: '15px', borderBottom: '1px solid #e0e0e0', verticalAlign: 'middle' }}>
                            <textarea
                                name="description"
                                value={row.description}
                                placeholder="Beschreibe diesen Zubereitungsschritt..."
                                onChange={(e) => handleInputChange(index, e)}
                                style={{ 
                                    width: '100%', 
                                    minHeight: '100px', 
                                    padding: '12px', 
                                    border: '2px solid #ddd', 
                                    borderRadius: '6px', 
                                    fontSize: '15px', 
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </td>
                        <td style={{ padding: '15px', borderBottom: '1px solid #e0e0e0', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-start' }}>
                                {row.images.map((image, imgIndex) => (
                                    <div key={imgIndex} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', border: '2px solid #e0e0e0', overflow: 'hidden' }}>
                                        <img 
                                            src={URL.createObjectURL(image)} 
                                            alt={`Bild ${imgIndex + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <button
                                            onClick={() => handleImageRemove(index, imgIndex)}
                                            style={{ 
                                                position: 'absolute', 
                                                top: '5px', 
                                                right: '5px', 
                                                width: '24px', 
                                                height: '24px', 
                                                borderRadius: '50%', 
                                                backgroundColor: 'rgba(220, 53, 69, 0.9)', 
                                                color: 'white', 
                                                border: 'none', 
                                                fontSize: '18px', 
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {row.images.length < maxImagesPerStep && (
                                    <label style={{ 
                                        width: '100px', 
                                        height: '100px', 
                                        border: '2px dashed #007bff', 
                                        borderRadius: '8px', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        cursor: 'pointer', 
                                        backgroundColor: '#f8f9fa'
                                    }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageAdd(index, e)}
                                            style={{ display: 'none' }}
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '32px', height: '32px', color: '#007bff', marginBottom: '5px' }}>
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                        <span style={{ fontSize: '11px', color: '#007bff', textAlign: 'center', fontWeight: '500' }}>Bild hinzufügen</span>
                                    </label>
                                )}
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#6c757d', textAlign: 'center' }}>
                                {row.images.length}/{maxImagesPerStep} (Upload folgt später)
                            </div>
                        </td>
                        <td style={{ padding: '15px', borderBottom: '1px solid #e0e0e0', textAlign: 'center', verticalAlign: 'middle' }}>
                            <button 
                                onClick={() => handleRemoveRow(index)}
                                disabled={rows.length === 1}
                                style={{ 
                                    backgroundColor: rows.length === 1 ? '#e0e0e0' : '#dc3545', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    padding: '10px 15px', 
                                    fontSize: '20px', 
                                    cursor: rows.length === 1 ? 'not-allowed' : 'pointer',
                                    opacity: rows.length === 1 ? 0.5 : 1
                                }}
                            >
                                🗑️
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderMobileCards = () => (
        <div>
            {rows.map((row, index) => (
                <div key={row.recipe_id} style={{ backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #dee2e6' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                            Schritt {row.recipe_id}
                        </span>
                        {rows.length > 1 && (
                            <button 
                                onClick={() => handleRemoveRow(index)}
                                style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}
                            >
                                Löschen
                            </button>
                        )}
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', color: '#333', marginBottom: '8px', fontSize: '16px' }}>Beschreibung</label>
                        <textarea
                            name="description"
                            value={row.description}
                            placeholder="Beschreibe diesen Zubereitungsschritt..."
                            onChange={(e) => handleInputChange(index, e)}
                            style={{ width: '100%', minHeight: '100px', padding: '12px', border: '2px solid #ddd', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', color: '#333', marginBottom: '8px', fontSize: '16px' }}>
                            Bilder ({row.images.length}/{maxImagesPerStep}) - Upload folgt später
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {row.images.map((image, imgIndex) => (
                                <div key={imgIndex} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e0e0e0' }}>
                                    <img 
                                        src={URL.createObjectURL(image)} 
                                        alt={`Bild ${imgIndex + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <button
                                        onClick={() => handleImageRemove(index, imgIndex)}
                                        style={{ position: 'absolute', top: '5px', right: '5px', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(220, 53, 69, 0.9)', color: 'white', border: 'none', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            {row.images.length < maxImagesPerStep && (
                                <label style={{ width: '100px', height: '100px', border: '2px dashed #007bff', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'white' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageAdd(index, e)}
                                        style={{ display: 'none' }}
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '36px', height: '36px', color: '#007bff', marginBottom: '5px' }}>
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                    <span style={{ fontSize: '12px', color: '#007bff', textAlign: 'center', fontWeight: '500' }}>Bild hinzufügen</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ padding: isMobile ? '15px' : '30px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <div style={{ backgroundColor: 'white', padding: isMobile ? '20px' : '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', maxWidth: '1400px', margin: '0 auto' }}>
                
                <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px', fontSize: isMobile ? '24px' : '32px' }}>
                    Neues Rezept erstellen
                </h2>
                
                {/* Rezeptname Section */}
                <div style={{ marginBottom: '40px', padding: isMobile ? '15px' : '20px', backgroundColor: '#f0f8ff', borderRadius: '10px', border: '2px solid #007bff' }}>
                    <label htmlFor="recipe-name" style={{ display: 'block', fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                        Rezeptname
                    </label>
                    <input
                        id="recipe-name"
                        type="text"
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                        placeholder="z.B. Spaghetti Carbonara"
                        style={{ 
                            width: '100%', 
                            padding: isMobile ? '12px' : '15px', 
                            fontSize: isMobile ? '16px' : '18px', 
                            border: '2px solid #ddd', 
                            borderRadius: '6px', 
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Schritte Section */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: isMobile ? '20px' : '24px', color: '#333', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #e0e0e0' }}>
                        Zubereitungsschritte
                    </h3>
                    {isMobile ? renderMobileCards() : renderDesktopTable()}
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '15px', justifyContent: 'center', marginTop: '30px', paddingTop: '30px', borderTop: '2px solid #e0e0e0' }}>
                    {rows.length < maxRows && (
                        <button 
                            onClick={handleAddRow}
                            style={{ 
                                padding: isMobile ? '14px' : '15px 30px', 
                                width: isMobile ? '100%' : 'auto',
                                backgroundColor: '#007bff', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontSize: '16px', 
                                fontWeight: '600', 
                                cursor: 'pointer'
                            }}
                        >
                            ➕ Schritt hinzufügen
                        </button>
                    )}
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{ 
                            padding: isMobile ? '14px' : '15px 30px', 
                            width: isMobile ? '100%' : 'auto',
                            backgroundColor: isSubmitting ? '#6c757d' : '#28a745', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            cursor: isSubmitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSubmitting ? '⏳ Wird hochgeladen...' : '✅ Rezept hochladen'}
                    </button>
                </div>

                {/* Status Messages */}
                {submitStatus && (
                    <div style={{ 
                        marginTop: '20px', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        textAlign: 'center',
                        backgroundColor: submitStatus === 'success' ? '#d4edda' : '#f8d7da',
                        color: submitStatus === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${submitStatus === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                        <strong>{submitStatus === 'success' ? '✅ Erfolg!' : '❌ Fehler'}</strong>
                        <div style={{ marginTop: '5px' }}>{submitMessage}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UploadCreateRecipeMain;