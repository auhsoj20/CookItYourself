import './App.css';
import React, { useState } from 'react';
import Nav from './Components/Nav/Nav.js'; // Importiere die Nav-Komponente aus der separaten Datei
import MainFooter from './Components/Footer/MainFooter.js';
import MainPage from './Components/Pages/Main/Main.js';
import NoPage from './Components/Pages/NoPage/NoPage.js';
import Account from './Components/Pages/Account/AccountMain.js';
import Contact from './Components/Pages/Contact/ContactMain.js';
import Imprint from './Components/Pages/Imprint/ImprintMain.js';
import PrivacyPolicy from './Components/Pages/PrivacyPolicy/PrivacyPolicyMain.js';
import SearchRecipes from './Components/Pages/SearchRecipes/SearchRecipesMain.js';
import UploadCreateRecipe from './Components/Pages/UploadCreateRecipe/UploadCreateRecipeMain.js';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function AppRouter() {
  const [activeTab, setActiveTab] = useState(0);
  const [footerTab, setFooterTab] = useState(0);

  return (
      <BrowserRouter>
        <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/Search_Recipes" element={<SearchRecipes />} />
            <Route path="/Upload_Create_Recipe" element={<UploadCreateRecipe />} />
            <Route path="/account" element={<Account />} />
            <Route path="/Imprint" element={<Imprint />} />   
            <Route path="/Contact" element={<Contact />} />
            <Route path="/Privacy_policy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NoPage />} />  
          </Routes>
        <MainFooter footerTab={footerTab} setFooterTab={setFooterTab}/>
      </BrowserRouter>
  );
}

export default AppRouter;