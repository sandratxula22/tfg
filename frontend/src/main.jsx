import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Home from './components/Home/HomeComponent.jsx';
import LibroDetalles from './components/LibroDetalles/LibroDetallesComponent.jsx';
import Login from './components/Login/Login.jsx';
import 'bootstrap/dist/css/bootstrap.css';
import Registro from './components/Login/Registro.jsx';


const router = createBrowserRouter([
  {
    path: '/',
    element: <App></App>,
    children: [
      {
        path: '/',
        element: <Home></Home>,
      },
      {
        path: '/libro/:id',
        element: <LibroDetalles></LibroDetalles>,
      },
      {
        path: '/login',
        element: <Login></Login>,
      },
      {
        path: '/registro',
        element: <Registro></Registro>
      }
    ]
  }
])

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
