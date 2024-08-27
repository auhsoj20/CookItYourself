import React, { useState } from 'react';
import './AccountMain.css';

function AccountMain() {
    const [currentTab, setCurrentTab] = useState('Stammdaten');
    const [isEditing, setIsEditing] = useState(false);

    const [userData, setUserData] = useState({
        username: "MaxMustermann",
        email: "max.mustermann@example.com",
        firstName: "Max",
        lastName: "Mustermann",
        birthDate: "1990-01-01",
        phoneNumber: "+49 170 1234567",
        gender: "männlich",
        street: "Musterstraße 1",
        city: "Musterstadt",
        postalCode: "12345",
        country: "Deutschland"
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const renderTabContent = () => {
        switch (currentTab) {
            case 'Stammdaten':
                return (
                    <div className="account-fields">
                        <div>
                            <label>Benutzername:</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    name="username" 
                                    value={userData.username} 
                                    onChange={handleInputChange} 
                                    className="editing"  /* Klasse "editing" wird hinzugefügt */
                                />
                            ) : (
                                <span>{userData.username}</span>
                            )}
                        </div>
                        <div>
                            <label>Email:</label>
                            {isEditing ? (
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={userData.email} 
                                    onChange={handleInputChange} 
                                    className="editing"  /* Klasse "editing" wird hinzugefügt */
                                />
                            ) : (
                                <span>{userData.email}</span>
                            )}
                        </div>
                        <div>
                            <label>Vorname:</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    name="firstName" 
                                    value={userData.firstName} 
                                    onChange={handleInputChange} 
                                    className="editing"  /* Klasse "editing" wird hinzugefügt */
                                />
                            ) : (
                                <span>{userData.firstName}</span>
                            )}
                        </div>
                        <div>
                            <label>Nachname:</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    name="lastName" 
                                    value={userData.lastName} 
                                    onChange={handleInputChange} 
                                    className="editing"  /* Klasse "editing" wird hinzugefügt */
                                />
                            ) : (
                                <span>{userData.lastName}</span>
                            )}
                        </div>
                        <div>
                            <label>Geburtsdatum:</label>
                            {isEditing ? (
                                <input 
                                    type="date" 
                                    name="birthDate" 
                                    value={userData.birthDate} 
                                    onChange={handleInputChange} 
                                    className="editing"  /* Klasse "editing" wird hinzugefügt */
                                />
                            ) : (
                                <span>{userData.birthDate}</span>
                            )}
                        </div>
                        <div>
                            <label>Telefonnummer:</label>
                            {isEditing ? (
                                <input 
                                    type="tel" 
                                    name="phoneNumber" 
                                    value={userData.phoneNumber} 
                                    onChange={handleInputChange} 
                                    className="editing"  /* Klasse "editing" wird hinzugefügt */
                                />
                            ) : (
                                <span>{userData.phoneNumber}</span>
                            )}
                        </div>
                        <div>
                            <label>Geschlecht:</label>
                            {isEditing ? (
                                <select 
                                    name="gender" 
                                    value={userData.gender} 
                                    onChange={handleInputChange}
                                    className="editing"  /* Klasse "editing" wird hinzugefügt */
                                >
                                    <option value="männlich">Männlich</option>
                                    <option value="weiblich">Weiblich</option>
                                    <option value="divers">Divers</option>
                                </select>
                            ) : (
                                <span>{userData.gender}</span>
                            )}
                        </div>
                    </div>
                );
            case 'Adresse':
                return (
                    <div className="account-fields">
                        <div>
                            <label>Straße:</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    name="street" 
                                    value={userData.street} 
                                    onChange={handleInputChange} 
                                    className="editing"  /* Klasse "editing" wird hinzugefügt */
                                />
                            ) : (
                                <span>{userData.street}</span>
                            )}
                        </div>
                        <div>
                            <label>Stadt:</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    name="city" 
                                    value={userData.city} 
                                    onChange={handleInputChange} 
                                    className="editing"  /* Klasse "editing" wird hinzugefügt */
                                />
                            ) : (
                                <span>{userData.city}</span>
                            )}
                        </div>
                        <div>
                            <label>Postleitzahl:</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    name="postalCode" 
                                    value={userData.postalCode} 
                                    onChange={handleInputChange} 
                                    className="editing"  /* Klasse "editing" wird hinzugefügt */
                                />
                            ) : (
                                <span>{userData.postalCode}</span>
                            )}
                        </div>
                        <div>
                            <label>Land:</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    name="country" 
                                    value={userData.country} 
                                    onChange={handleInputChange} 
                                    className="editing"  /* Klasse "editing" wird hinzugefügt */
                                />
                            ) : (
                                <span>{userData.country}</span>
                            )}
                        </div>
                    </div>
                );
            case 'Favoriten':
                return (
                    <div className="account-fields">
                        <div>
                            <label>Favoriten ID:</label>
                            <span>123456</span> {/* Hier nur eine ID anzeigen, weitere Eigenschaften später */}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="body_AccountMain">
            <div className="Page_AccountMain">
                <h1>Account Verwaltung</h1>
                <div className="tabs">
                    <button onClick={() => setCurrentTab('Stammdaten')}>Stammdaten</button>
                    <button onClick={() => setCurrentTab('Adresse')}>Adresse</button>
                    <button onClick={() => setCurrentTab('Favoriten')}>Favoriten</button>
                </div>
                {renderTabContent()}
                {currentTab !== 'Favoriten' && (
                    <div className="Button_AccountMain_edit">
                        <button onClick={toggleEdit}>
                            {isEditing ? 'Speichern' : 'Bearbeiten'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AccountMain;
