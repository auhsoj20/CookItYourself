import React, { useState } from 'react';
import './UploadCreateRecipeMain.css';  // Importiere die CSS-Datei

function UploadCreateRecipeMain() {
    const [rows, setRows] = useState([{ recipe_id: 1, name: '', description: '', image: null }]);
    const maxRows = 5;

    const handleAddRow = () => {
        if (rows.length < maxRows) {
            const newRow = { recipe_id: rows.length + 1, name: '', description: '', image: null };
            setRows([...rows, newRow]);
        }
    };

    const handleRemoveRow = (index) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);

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

    // UploadCreateRecipeMain.js (hinzufügen)
    const handleRowsChange = () => {
        const newRows = rows.map((row, index) => ({ recipe_id: index + 1, name: row.name }));
        setRows(newRows);
    };

    const handleSubmit = () => {
        // Here you would typically send the rows data to your backend
        console.log('Recipes:', rows);
    };

    return (
        <div className="body_UploadCreateRecipe">
            <div className="page_UploadCreateRecipe">
                <h2 className="TitleUploadCreateRecipe">Rezepte Hochladen</h2>
                <table>
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
                                            onChange={(e) => handleInputChange(index, e)}
                                        />
                                    </div>
                                </td>
                                <td>
                                        <textarea
                                            className="ContainerDescription"
                                            name="description"
                                            value={row.description}
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
                                        {
                                        row.image 
                                        && (
                                            <div>
                                                <img src={URL.createObjectURL(row.image)} alt={`Recipe ${index}`} style={{ margin: '10px', width: '50px', height: 'auto' }} />
                                            </div>
                                        )
                                        }
                                     </div>
                                </td>
                                <td>
                                    <button className="UCRP_remove_row_button" onClick={() => handleRemoveRow(index)}>Löschen</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {rows.length < maxRows && (
                    <button className="UCRP_add_row_button" onClick={handleAddRow}>Zeile hinzufügen</button>
                )}
                <button type="submit" onClick={handleSubmit}>Rezepte hochladen</button>
            </div>
        </div>
    );
}

export default UploadCreateRecipeMain;