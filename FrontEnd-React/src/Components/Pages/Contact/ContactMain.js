import './ContactMain.css';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function ContactMain() {
    const { t } = useTranslation();
    const [form, setForm] = useState({ name: '', email: '', message: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(t('contact.messageSent') + '\n' + JSON.stringify(form, null, 2));
        setForm({ name: '', email: '', message: '' });
    };

    return (
        <div className="ContactMain">
            <div>
                <h1>{t('contact.title')}</h1>
                <form className="contact-form" onSubmit={handleSubmit}>
                    <label className="form-label">
                        {t('contact.name')}:
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={form.name}
                            onChange={handleChange}
                            placeholder={t('contact.namePlaceholder')}
                            required
                        />
                    </label>
                    <label className="form-label">
                        {t('contact.email')}:
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={form.email}
                            onChange={handleChange}
                            placeholder={t('contact.emailPlaceholder')}
                            required
                        />
                    </label>
                    <label className="form-label">
                        {t('contact.message')}:
                        <textarea
                            name="message"
                            className="form-textarea"
                            value={form.message}
                            onChange={handleChange}
                            placeholder={t('contact.messagePlaceholder')}
                            rows="5"
                            required
                        ></textarea>
                    </label>
                    <button type="submit" className="form-button">
                        {t('contact.submit')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ContactMain;