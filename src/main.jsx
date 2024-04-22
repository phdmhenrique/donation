import React from 'react';
import ReactDOM from 'react-dom/client';

// REACT-ROUTER-DOM
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// IMPORT DE ARQUIVOS DE CSS
import "./Fonts/fonts.css";
// import "./Styles/Medias.css";
import GlobalStyles from "./Styles/GlobalStyles.js";

// COMPONENTS
import App from './App.jsx';
import Teste from './Components/Teste/Teste.jsx';
import Layout from './Components/Layout/Layout.jsx';
import CreateAccount from './Components/CreateAccount/CreateAccount.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalStyles />
      <Routes>
        <Route exact path="/" element={<App />} />
        <Route path="/layout" element={<Layout />} />
        <Route path="/teste" element={<Teste />}></Route>
        <Route path="/create-account" element={<CreateAccount />}></Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
