import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ContactMain.css';

// API Base URL Konfiguration - hier einfach änderbar
const API_BASE_URL = 'http://192.168.10.50:8000';

function ContactMain() {
    const { t } = useTranslation();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('');

        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Fehler beim Senden:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="body">
            <div className="contact-container">
                <h1>{t('contact.title')}</h1>
                <p>{t('contact.description')}</p>
                
                <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                        <label htmlFor="name">{t('contact.form.name.label')} *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder={t('contact.form.name.placeholder')}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">{t('contact.form.email.label')} *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder={t('contact.form.email.placeholder')}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="subject">{t('contact.form.subject.label')} *</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                            placeholder={t('contact.form.subject.placeholder')}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">{t('contact.form.message.label')} *</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            placeholder={t('contact.form.message.placeholder')}
                            rows="6"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t('contact.form.submitting') : t('contact.form.submit')}
                    </button>
                </form>

                {submitStatus === 'success' && (
                    <div className="status-message success">
                        ✅ {t('contact.messages.success')}
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div className="status-message error">
                        ❌ {t('contact.messages.error')}
                    </div>
                )}

                <div className="contact-info">
                    <h3>{t('contact.info.title')}</h3>
                    <p>📧 {t('contact.info.email')}: kontakt@cookityourself.de</p>
                    <p>📞 {t('contact.info.phone')}: +49 123 456 789</p>
                    <p>🏢 {t('contact.info.address')}: Musterstraße 123, 12345 Musterstadt</p>
                </div>
            </div>
        </div>
    );
}

export default ContactMain;