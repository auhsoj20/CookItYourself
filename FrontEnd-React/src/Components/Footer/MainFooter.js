import React from "react";
import './MainFooter.css';
import { Link } from 'react-router-dom';

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
				<Link to="/Imprint">
				Impressum
				</Link>
			</li>
			<li
			className={footerTab === 2 ? 'active' : ''}
			onClick={() => setFooterTab(2)}
				>
				<Link to="/Contact">
					Kontakt
				</Link>
			</li>
			<li
			className={footerTab === 3 ? 'active' : ''}
			onClick={() => setFooterTab(3)}
				>
				<Link to="/Privacy_policy">
					Datenschutzerklärung
				</Link>
			</li>
		</ul>
	</nav>
);
};

export default MainFooter;