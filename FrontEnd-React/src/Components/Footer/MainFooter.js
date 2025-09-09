import React from "react";
import './MainFooter.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function MainFooter ({footerTab, setFooterTab}) {
	const { t } = useTranslation();

	return (
		<nav className="Footer">
			<ul>
				<li
					className={footerTab === 1 ? 'active' : ''}
					onClick={() => {
						console.log(''); // Dies wird nur ausgefÃ¼hrt, wenn auf die Registerkarte "Impressum" geklickt wird
						setFooterTab(1); // Hier setzen Sie den Wert von footerTab
					}}
				>
					<Link to="/Imprint">
						{t('footer.imprint')}
					</Link>
				</li>
				<li
					className={footerTab === 2 ? 'active' : ''}
					onClick={() => setFooterTab(2)}
				>
					<Link to="/Contact">
						{t('footer.contact')}
					</Link>
				</li>
				<li
					className={footerTab === 3 ? 'active' : ''}
					onClick={() => setFooterTab(3)}
				>
					<Link to="/Privacy_policy">
						{t('footer.privacyPolicy')}
					</Link>
				</li>
			</ul>
		</nav>
	);
};

export default MainFooter;