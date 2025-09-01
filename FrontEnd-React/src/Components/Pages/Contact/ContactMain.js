import './ContactMain.css';
import { useState } from 'react';

function ContactMain() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Nachricht wurde gesendet:\n' + JSON.stringify(form, null, 2));
        setForm({ name: '', email: '', message: '' });
    };

return (
    <div className="ContactMain">
        <div>
            <h1>Kontakt</h1>
            <form className="contact-form" onSubmit={handleSubmit}>
                <label className="form-label">
                    Name:
                    <input
                        type="text"
                        name="name"
                        className="form-input"
                        value={form.name}
                        onChange={handleChange}
                        required
                />
            </label>
            <label className="form-label">
                E-Mail-Adresse:
                <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
            </label>
            <label className="form-label">
                Nachricht:
                <textarea
                    name="message"
                    className="form-textarea"
                    value={form.message}
                    onChange={handleChange}
                    rows="5"
                    required
                ></textarea>
            </label>
            <button type="submit" className="form-button">Absenden</button>
            </form>
        </div>
    </div>
    );
}
export default ContactMain;