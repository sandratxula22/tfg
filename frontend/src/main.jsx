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
import AdminPanel from './components/AdminPanel/AdminPanel.jsx';
import AdminLibros from './components/AdminPanel/Libros/AdminLibros.jsx';
import AdminLibrosEdit from './components/AdminPanel/Libros/EditarLibro.jsx';
import AdminUsuarios from './components/AdminPanel/AdminUsuarios.jsx';
import CrearLibro from './components/AdminPanel/Libros/CrearLibro.jsx';
import SubirImagenLibro from './components/AdminPanel/Libros/SubirImagenLibro.jsx';


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
        path: '/libros/edit/:id',
        element: <AdminLibrosEdit></AdminLibrosEdit>
      },
      {
        path: '/libros/create',
        element: <CrearLibro></CrearLibro>
      },
      {
        path: '/libros/images-upload',
        element: <SubirImagenLibro></SubirImagenLibro>
      },
      {
        path: '/login',
        element: <Login></Login>,
      },
      {
        path: '/registro',
        element: <Registro></Registro>
      },
      {
        path: '/admin',
        element: <AdminPanel></AdminPanel>,
        children: [
          {
            path: '/admin/libros',
            element: <AdminLibros></AdminLibros>,

          },
          {
            path: '/admin/usuarios',
            element: <AdminUsuarios></AdminUsuarios>
          }
        ]
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
