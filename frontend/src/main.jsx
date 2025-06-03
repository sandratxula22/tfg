import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';

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
import AdminUsuarios from './components/AdminPanel/Usuarios/AdminUsuarios.jsx';
import CrearLibro from './components/AdminPanel/Libros/CrearLibro.jsx';
import SubirImagenLibro from './components/AdminPanel/Imagenes/SubirImagenLibro.jsx';
import AdminImagenes from './components/AdminPanel/Imagenes/AdminImagenes.jsx';
import EditarImagen from './components/AdminPanel/Imagenes/EditarImagen.jsx';
import CrearUsuario from './components/AdminPanel/Usuarios/Crearusuario.jsx';
import EditarUsuario from './components/AdminPanel/Usuarios/EditarUsuario.jsx';
import Carrito from './components/Carrito/Carrito.jsx';
import Pedidos from './components/Pedidos/Pedidos.jsx';


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
        path: '/libros/images-edit/:id',
        element: <EditarImagen></EditarImagen>
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
            path: '/admin/imagenes',
            element: <AdminImagenes></AdminImagenes>,
          },
          {
            path: '/admin/usuarios',
            element: <AdminUsuarios></AdminUsuarios>
          },
        ]
      },
      {
        path: '/usuarios/create',
        element: <CrearUsuario></CrearUsuario>
      },
      {
        path: '/usuarios/edit/:id',
        element: <EditarUsuario></EditarUsuario>
      },
      {
        path: '/carrito',
        element: <Carrito></Carrito>
      },
      {
        path: '/pedidos',
        element: <Pedidos></Pedidos>
      },
      {
        path: '*',
        element: <Home></Home>
      }
    ]
  }
])

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
