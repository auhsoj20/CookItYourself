import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AccountMain.css';

function AccountMain() {
    const { t } = useTranslation();
    const [currentTab, setCurrentTab] = useState('masterData');
    const [isEditing, setIsEditing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const [userData, setUserData] = useState({
        username: "MaxMustermann",
        email: "max.mustermann@example.com",
        firstName: "Max",
        lastName: "Mustermann",
        birthDate: "1990-01-01",
        phoneNumber: "+49 170 1234567",
        gender: "male",
        street: "Musterstraße 1",
        city: "Musterstadt",
        postalCode: "12345",
        country: "Deutschland"
    });

    // Prüfe Bildschirmgröße
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        });
    };

    const toggleEdit = () => {
        if (isEditing) {
            // Hier würde normalerweise eine API-Call zum Speichern stattfinden
            console.log('Saving user data:', userData);
        }
        setIsEditing(!isEditing);
    };

    const handleTabChange = (tab) => {
        // Beim Tab-Wechsel den Edit-Modus beenden
        if (isEditing) {
            setIsEditing(false);
        }
        setCurrentTab(tab);
    };

    const renderField = (labelKey, name, type = 'text', options = null) => {
        return (
            <div className="field-container">
                <label>{t(`account.labels.${labelKey}`)}</label>
                <div className="field-value">
                    {isEditing ? (
                        type === 'select' ? (
                            <select 
                                name={name} 
                                value={userData[name]} 
                                onChange={handleInputChange}
                                className="editing"
                            >
                                {options.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {t(option.label)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input 
                                type={type} 
                                name={name} 
                                value={userData[name]} 
                                onChange={handleInputChange} 
                                className="editing"
                            />
                        )
                    ) : (
                        <span className="display-value">
                            {type === 'select' && options ? 
                                t(options.find(opt => opt.value === userData[name])?.label || '') :
                                userData[name]
                            }
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (currentTab) {
            case 'masterData':
                return (
                    <div className="account-fields">
                        {renderField('username', 'username')}
                        {renderField('email', 'email', 'email')}
                        {renderField('firstName', 'firstName')}
                        {renderField('lastName', 'lastName')}
                        {renderField('birthDate', 'birthDate', 'date')}
                        {renderField('phoneNumber', 'phoneNumber', 'tel')}
                        {renderField('gender', 'gender', 'select', [
                            { value: 'male', label: 'account.gender.male' },
                            { value: 'female', label: 'account.gender.female' },
                            { value: 'diverse', label: 'account.gender.diverse' }
                        ])}
                    </div>
                );
            case 'address':
                return (
                    <div className="account-fields">
                        {renderField('street', 'street')}
                        {renderField('city', 'city')}
                        {renderField('postalCode', 'postalCode')}
                        {renderField('country', 'country')}
                    </div>
                );
            case 'favorites':
                return (
                    <div className="account-fields">
                        <div className="field-container">
                            <label>{t('account.labels.favoritesId')}</label>
                            <div className="field-value">
                                <span className="display-value">123456</span>
                            </div>
                        </div>
                        <div className="favorites-placeholder">
                            <p>{t('account.messages.favoritesComingSoon')}</p>
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
                <h1>{t('account.title')}</h1>
                
                <div className="tabs">
                    <button 
                        className={currentTab === 'masterData' ? 'active' : ''}
                        onClick={() => handleTabChange('masterData')}
                    >
                        {t('account.tabs.masterData')}
                    </button>
                    <button 
                        className={currentTab === 'address' ? 'active' : ''}
                        onClick={() => handleTabChange('address')}
                    >
                        {t('account.tabs.address')}
                    </button>
                    <button 
                        className={currentTab === 'favorites' ? 'active' : ''}
                        onClick={() => handleTabChange('favorites')}
                    >
                        {t('account.tabs.favorites')}
                    </button>
                </div>
                
                <div className="tab-content">
                    {renderTabContent()}
                </div>
                
                {currentTab !== 'favorites' && (
                    <div className="Button_AccountMain_edit">
                        <button 
                            onClick={toggleEdit}
                            className={isEditing ? 'save-button' : 'edit-button'}
                        >
                            {isEditing ? t('account.buttons.save') : t('account.buttons.edit')}
                        </button>
                        {isEditing && (
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="cancel-button"
                            >
                                {t('account.buttons.cancel')}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AccountMain;