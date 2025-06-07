import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';
import '../AdminPanel.css';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';

function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const [mensaje, setMensaje] = useState('');

    const { isAuthenticated, userRol } = useAuth();
    const [currentUserId, setCurrentUserId] = useState(null);

    const fetchCurrentUserId = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const response = await fetch(`${VITE_API_BASE_URL}/api/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setCurrentUserId(data.id);
            } else {
                console.error("Error al obtener el ID del usuario actual:", response.status);
            }
        } catch (err) {
            console.error("Error de conexión al obtener el ID del usuario actual:", err);
        }
    }, [VITE_API_BASE_URL]);

    const fetchUsuarios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${VITE_API_BASE_URL}/api/admin/usuarios`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setUsuarios(data);
        } catch (err) {
            console.error("Error fetching usuarios:", err);
            setError(err.message || "Error al cargar los usuarios.");
            Swal.fire({
                icon: 'error',
                title: 'Error de carga',
                text: err.message || 'No se pudieron cargar los usuarios.',
            });
        } finally {
            setLoading(false);
        }
    }, [VITE_API_BASE_URL]);

    useEffect(() => {
        fetchCurrentUserId();
        fetchUsuarios();

        const editSuccessMessage = localStorage.getItem('usuarioEditSuccess');
        if (editSuccessMessage) {
            setMensaje(editSuccessMessage);
            localStorage.removeItem('usuarioEditSuccess');
        }
    }, [VITE_API_BASE_URL, fetchCurrentUserId, fetchUsuarios]);

    const handleEditarUsuario = (id) => {
        navigate(`/usuarios/edit/${id}`);
    };

    const handleBorrarUsuario = async (id, correo) => {
        if (id === currentUserId) {
            Swal.fire({
                icon: 'warning',
                title: 'Acción no permitida',
                text: 'No puedes eliminar tu propio usuario mientras estás conectado.',
            });
            return;
        }

        const result = await Swal.fire({
            title: `¿Estás seguro de que quieres borrar el usuario "${correo}"?`,
            text: "¡Esta acción no se puede deshacer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Sí, borrarlo'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.delete(`${VITE_API_BASE_URL}/api/admin/usuarios/delete/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setUsuarios(usuarios.filter(usuario => usuario.id !== id));
                    Swal.fire(
                        '¡Borrado!',
                        'El usuario ha sido borrado con éxito.',
                        'success'
                    );
                } else {
                    const errorData = response.data;
                    console.error("Error al borrar el usuario:", errorData);
                    Swal.fire(
                        'Error',
                        errorData.message || 'Error al borrar el usuario.',
                        'error'
                    );
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    Swal.fire(
                        'Error',
                        error.response.data.message || 'Error al borrar el usuario.',
                        'error'
                    );
                } else {
                    Swal.fire(
                        'Error',
                        'Error al conectar con la API o permiso denegado.',
                        'error'
                    );
                }
                console.error("Error al conectar con la API:", error);
            }
        }
    };

    const handleCrearUsuario = () => {
        navigate('/usuarios/create');
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando usuarios...</span>
                </div>
            </div>
        );
    }

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
                    {usuarios.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="text-center">No hay usuarios para mostrar.</td>
                        </tr>
                    ) : (
                        usuarios.map(usuario => (
                            <tr key={usuario.id}>
                                <td>{usuario.nombre}</td>
                                <td>{usuario.apellido}</td>
                                <td>{usuario.correo}</td>
                                <td>{usuario.rol}</td>
                                <td>
                                    <Button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleEditarUsuario(usuario.id)}
                                    >
                                        Editar
                                    </Button>
                                </td>
                                <td>
                                    <Button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleBorrarUsuario(usuario.id, usuario.correo)}
                                        disabled={usuario.id === currentUserId}
                                    >
                                        Borrar
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
}

export default AdminUsuarios;