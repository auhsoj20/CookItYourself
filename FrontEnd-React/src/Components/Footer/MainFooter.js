import React from "react";
import './MainFooter.css';

function MainFooter ({footerTab, setFooterTab}) {
return (
	<nav className="Footer">
		<ul>
			<li
			className={footerTab === 1 ? 'active' : ''}
			onClick={() => setFooterTab(1)}>
				Impressum
			</li>
			<li
			className={footerTab === 2 ? 'active' : ''}
			onClick={() => setFooterTab(2)}>
				Kontakt
			</li>
			<li
			className={footerTab === 3 ? 'active' : ''}
			onClick={() => setFooterTab(3)}>
				Datenschutzerklärung
			</li>
		</ul>
	</nav>
);
};

export default MainFooter;