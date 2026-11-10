import React from 'react';
import "../styles/styles.css";
import Navbar from '../components/layout/navbar.jsx';
import InventoryAdmin from '../components/ui/InventoryAdmin.jsx';
import Footer from '../components/layout/Footer.jsx';

export default function InventoryPage() {
	return (
		<>
			<Navbar />
			<main className="inventory-page">
				<InventoryAdmin />
			</main>
			<Footer />
		</>
	);
}