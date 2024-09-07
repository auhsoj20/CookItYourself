import React from 'react';
import './PrivacyPolicyMain.css'; // Importiere die CSS-Datei

function PrivacyPolicyMain() {
    return (
        <div className="body_PrivacyPolicyMain">
            <div className="Page_PrivacyPolicyMain">
                <h1>Datenschutzerklärung</h1>
                
                <p><strong>1. Verantwortlicher</strong></p>
                <p>
                    Verantwortlicher für die Datenverarbeitung auf dieser Website ist:
                    <br />
                    [Name und Anschrift des Verantwortlichen]
                    <br />
                    [Telefonnummer]
                    <br />
                    [E-Mail-Adresse]
                </p>

                <p><strong>2. Erhebung und Speicherung personenbezogener Daten sowie Art und Zweck von deren Verwendung</strong></p>
                <p>
                    Beim Besuch unserer Website werden durch den auf Ihrem Endgerät zum Einsatz kommenden Browser automatisch Informationen an den Server unserer Website gesendet. Diese Informationen werden temporär in einem sogenannten Logfile gespeichert. Folgende Informationen werden dabei ohne Ihr Zutun erfasst und bis zur automatisierten Löschung gespeichert:
                </p>
                <ul>
                    <li>IP-Adresse des anfragenden Rechners,</li>
                    <li>Datum und Uhrzeit des Zugriffs,</li>
                    <li>Name und URL der abgerufenen Datei,</li>
                    <li>Website, von der aus der Zugriff erfolgt (Referrer-URL),</li>
                    <li>verwendeter Browser und ggf. das Betriebssystem Ihres Rechners sowie der Name Ihres Access-Providers.</li>
                </ul>
                <p>
                    Die genannten Daten werden durch uns zu folgenden Zwecken verarbeitet:
                </p>
                <ul>
                    <li>Gewährleistung eines reibungslosen Verbindungsaufbaus der Website,</li>
                    <li>Gewährleistung einer komfortablen Nutzung unserer Website,</li>
                    <li>Auswertung der Systemsicherheit und -stabilität sowie</li>
                    <li>zu weiteren administrativen Zwecken.</li>
                </ul>
                <p>
                    Die Rechtsgrundlage für die Datenverarbeitung ist Art. 6 Abs. 1 S. 1 lit. f DSGVO. Unser berechtigtes Interesse folgt aus oben aufgelisteten Zwecken zur Datenerhebung.
                </p>

                <p><strong>3. Weitergabe von Daten</strong></p>
                <p>
                    Eine Übermittlung Ihrer persönlichen Daten an Dritte zu anderen als den im Folgenden aufgeführten Zwecken findet nicht statt.
                </p>
                <p>
                    Wir geben Ihre persönlichen Daten nur an Dritte weiter, wenn:
                </p>
                <ul>
                    <li>Sie Ihre nach Art. 6 Abs. 1 S. 1 lit. a DSGVO ausdrückliche Einwilligung dazu erteilt haben,</li>
                    <li>die Weitergabe nach Art. 6 Abs. 1 S. 1 lit. f DSGVO zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich ist und kein Grund zur Annahme besteht, dass Sie ein überwiegendes schutzwürdiges Interesse an der Nichtweitergabe Ihrer Daten haben,</li>
                    <li>für den Fall, dass für die Weitergabe nach Art. 6 Abs. 1 S. 1 lit. c DSGVO eine gesetzliche Verpflichtung besteht, sowie</li>
                    <li>dies gesetzlich zulässig und nach Art. 6 Abs. 1 S. 1 lit. b DSGVO für die Abwicklung von Vertragsverhältnissen mit Ihnen erforderlich ist.</li>
                </ul>

                <p><strong>4. Cookies</strong></p>
                <p>
                    Wir setzen auf unserer Seite Cookies ein. Hierbei handelt es sich um kleine Dateien, die Ihr Browser automatisch erstellt und auf Ihrem Endgerät (Laptop, Tablet, Smartphone o.ä.) gespeichert werden, wenn Sie unsere Seite besuchen. Cookies richten auf Ihrem Endgerät keinen Schaden an, enthalten keine Viren, Trojaner oder sonstige Schadsoftware.
                </p>
                <p>
                    In dem Cookie werden Informationen abgelegt, die sich jeweils im Zusammenhang mit dem spezifisch eingesetzten Endgerät ergeben. Dies bedeutet jedoch nicht, dass wir dadurch unmittelbar Kenntnis von Ihrer Identität erhalten.
                </p>
                <p>
                    Der Einsatz von Cookies dient einerseits dazu, die Nutzung unseres Angebots für Sie angenehmer zu gestalten. So setzen wir sogenannte Session-Cookies ein, um zu erkennen, dass Sie einzelne Seiten unserer Website bereits besucht haben. Diese werden nach Verlassen unserer Seite automatisch gelöscht.
                </p>
                <p>
                    Darüber hinaus setzen wir ebenfalls zur Optimierung der Benutzerfreundlichkeit temporäre Cookies ein, die für einen bestimmten festgelegten Zeitraum auf Ihrem Endgerät gespeichert werden. Besuchen Sie unsere Seite erneut, um unsere Dienste in Anspruch zu nehmen, wird automatisch erkannt, dass Sie bereits bei uns waren und welche Eingaben und Einstellungen Sie getätigt haben, um diese nicht noch einmal eingeben zu müssen.
                </p>
                <p>
                    Zum anderen setzen wir Cookies ein, um die Nutzung unserer Website statistisch zu erfassen und zum Zwecke der Optimierung unseres Angebotes für Sie auszuwerten (siehe Ziff. 5). Diese Cookies ermöglichen es uns, bei einem erneuten Besuch unserer Seite automatisch zu erkennen, dass Sie bereits bei uns waren. Diese Cookies werden nach einer jeweils definierten Zeit automatisch gelöscht.
                </p>
                <p>
                    Die durch Cookies verarbeiteten Daten sind für die genannten Zwecke zur Wahrung unserer berechtigten Interessen sowie der Dritter nach Art. 6 Abs. 1 S. 1 lit. f DSGVO erforderlich.
                </p>
                
                {/* Fortsetzung der Datenschutzerklärung hier */}
            </div>
        </div>
    );
}

export default PrivacyPolicyMain;
