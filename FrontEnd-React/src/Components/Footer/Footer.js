import React from "react";
import {
    Box,
    Container,
    Row,
    Column,
    FooterLink,
    Heading,
    } from "./FooterStyles";

const Footer = () => {
return (
	<table>
		<td>
			<tr>
				Datenschutzerklärung
			</tr>
		</td>
		<td>
			<tr>
				Impressum
			</tr>
		</td>
		<td>
			<tr>
				Kontakt
			</tr>
		</td>
	</table>
);
};
export default Footer;
