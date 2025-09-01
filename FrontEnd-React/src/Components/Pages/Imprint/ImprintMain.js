import "./ImprintMain.css";

function ImprintMain() {
    return (
            <div className="imprint-container">
                <div>
                <div className="imprint-form">
                    <h1>Impressum</h1>
                    <p><strong>Angaben gemäß § 5 TMG</strong></p>
                    <p>Max Mustermann<br />
                    Musterstraße 1<br />
                    12345 Musterstadt</p>

                    <p><strong>Kontakt</strong><br />
                    Telefon: 01234 / 567890<br />
                    E-Mail: max@mustermann.de</p>

                    <p><strong>Haftungsausschluss</strong><br />
                    Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.
                    Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>
                </div>
                </div>
            </div>
    );
}

export default ImprintMain;