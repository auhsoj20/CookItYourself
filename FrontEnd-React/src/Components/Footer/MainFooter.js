import React from "react";
import './MainFooter.css';

function MainFooter ({footerTab, setFooterTab}) {
return (
	<nav className="Footer">
		<ul>
			<li
			className={footerTab === 1 ? 'active' : ''}
			onClick={() => {
				console.log(''); // Dies wird nur ausgeführt, wenn auf die Registerkarte "Impressum" geklickt wird
				setFooterTab(1); // Hier setzen Sie den Wert von footerTab
			}}
			>
			Impressum
			</li>
			<li
			className={footerTab === 2 ? 'active' : ''}
			onClick={() => setFooterTab(2)}
				>
				Kontakt
			</li>
			<li
			className={footerTab === 3 ? 'active' : ''}
			onClick={() => setFooterTab(3)}
				>
				Datenschutzerklärung
			</li>
		</ul>
	</nav>
);
};

export default MainFooter;