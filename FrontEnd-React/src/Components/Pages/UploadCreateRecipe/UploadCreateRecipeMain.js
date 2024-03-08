import React, { useState } from 'react';

function UploadCreateRecipeMain() {

    const [rows, setRows] = useState([{ recipe_id: 1, name: '' }]);
    const maxRows = 5; // Maximale Anzahl von Zeilen

    const handleAddRow = () => {
        if (rows.length < maxRows) {
            const newRow = { recipe_id: rows.length + 1, name: '' };
            setRows([...rows, newRow]);
        }
    };

    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const newRows = [...rows];
        newRows[index][name] = value;
        setRows(newRows);
    };

    return(
        <div className="App">
            <div>
                <table>
                    <thead>
                        
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={row.recipe_id}>
                                <td>{row.recipe_id}</td>
                                <td>
                                    <input
                                        type="text"
                                        name="name"
                                        value={row.name}
                                        onChange={(e) => handleInputChange(index, e)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {rows.length < maxRows && (
                    <button onClick={handleAddRow}>Zeile hinzufügen</button>
                )}
            </div>
        </div>
    )

}

export default UploadCreateRecipeMain;