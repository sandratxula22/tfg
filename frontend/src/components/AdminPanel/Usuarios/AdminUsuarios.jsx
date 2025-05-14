import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import '../AdminPanel.css';
import axios from 'axios';

function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${VITE_API_BASE_URL}/api/admin/usuarios`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setUsuarios(data);
            } catch (error) {
                console.error("Error fetching usuarios:", error);
            }
        };

        fetchUsuarios();

        const editSuccessMessage = localStorage.getItem('usuarioEditSuccess');
        if (editSuccessMessage) {
            setMensaje(editSuccessMessage);
            localStorage.removeItem('usuarioEditSuccess');
        }
    }, [VITE_API_BASE_URL]);

    const handleEditarUsuario = (id) => {
        navigate(`/usuarios/edit/${id}`);
    };

    const handleBorrarUsuario = async (id) => {
        if (window.confirm(`¿Estás seguro de que quieres borrar el usuario con ID ${id}?`)) {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.delete(`${VITE_API_BASE_URL}/api/admin/usuarios/delete/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setUsuarios(usuarios.filter(usuario => usuario.id !== id));
                    setMensaje('Usuario borrado exitosamente.');
                } else {
                    console.error("Error al borrar el usuario:", response.data);
                    alert('Error al borrar el usuario');
                }
            } catch (error) {
                console.error("Error al conectar con la API:", error);
                alert('Error al conectar con la API');
            }
        }
    };

    const handleCrearUsuario = () => {
        navigate('/usuarios/create');
    };

    return (
        <div>
            <h2>Gestión de Usuarios</h2>
            {mensaje && <div className="alert alert-success">{mensaje}</div>}
            <div className="mb-3">
                <Button variant="success" onClick={handleCrearUsuario}>Crear Nuevo Usuario</Button>
            </div>
            <Table hover responsive>
                <thead className="cabecera-dark">
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Editar</th>
                        <th>Borrar</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map(usuario => (
                        <tr key={usuario.id}>
                            <td>{usuario.nombre}</td>
                            <td>{usuario.apellido}</td>
                            <td>{usuario.correo}</td>
                            <td>{usuario.rol}</td>
                            <td>
                                <Button className="btn btn-primary btn-sm mr-2" onClick={() => handleEditarUsuario(usuario.id)}>Editar</Button>
                            </td>
                            <td>
                                <Button className="btn btn-danger btn-sm" onClick={() => handleBorrarUsuario(usuario.id)}>Borrar</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default AdminUsuarios;