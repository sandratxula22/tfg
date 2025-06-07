import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../../contexts/AuthContext';

function EditarUsuario() {
    const navigate = useNavigate();
    const { id } = useParams();
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [usuario, setUsuario] = useState({
        nombre: '',
        apellido: '',
        direccion: '',
        correo: '',
        rol: 'usuario',
    });
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [loading, setLoading] = useState(true);

    const { isAuthenticated, userRol, checkAuthStatus } = useAuth();
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const fetchLoggedInUserId = async () => {
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
        };
        fetchLoggedInUserId();
    }, [VITE_API_BASE_URL]);


    useEffect(() => {
        const fetchUsuario = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${VITE_API_BASE_URL}/api/admin/usuarios/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setUsuario(data);
            } catch (error) {
                console.error("Error fetching usuario:", error);
                setError(error.message || 'Error al cargar los datos del usuario');
                Swal.fire({
                    icon: 'error',
                    title: 'Error de carga',
                    text: error.message || 'No se pudo cargar el usuario para editar.',
                });
                navigate('/admin/usuarios');
            } finally {
                setLoading(false);
            }
        };

        fetchUsuario();
    }, [VITE_API_BASE_URL, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario(prevUsuario => ({
            ...prevUsuario,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        if (id == currentUserId && usuario.rol !== 'admin') {
            Swal.fire({
                icon: 'warning',
                title: 'Acción no permitida',
                text: 'No puedes cambiar tu propio rol de administrador a usuario. Pide a otro administrador que lo haga.',
            });
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(`${VITE_API_BASE_URL}/api/admin/usuarios/edit/${id}`, usuario, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Usuario actualizado con éxito.',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    if (id == currentUserId) {
                        checkAuthStatus();
                    }
                    navigate('/admin/usuarios');
                });
            } else {
                const errorData = response.data;
                console.error("Error al actualizar el usuario:", errorData);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar',
                    text: errorData.message || 'Error al actualizar el usuario.',
                });
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 422 && error.response.data && error.response.data.errors) {
                    const errors = error.response.data.errors;
                    const firstErrorKey = Object.keys(errors)[0];
                    setError(errors[firstErrorKey][0]);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de validación',
                        text: errors[firstErrorKey][0],
                    });
                } else if (error.response.status === 403) {
                    setError('No tienes permiso para realizar esta acción.');
                    Swal.fire({
                        icon: 'error',
                        title: 'Permiso denegado',
                        text: 'No tienes permiso para actualizar este usuario.',
                    });
                } else {
                    console.error("Error en la respuesta de la API:", error.response.data);
                    setError(error.response.data.message || 'Error en la respuesta de la API.');
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de API',
                        text: error.response.data.message || 'Error en la respuesta de la API.',
                    });
                }
            } else {
                console.error("Error de conexión:", error);
                setError('Error de conexión con el servidor.');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error de conexión con el servidor.',
                });
            }
        }
    };

    if (loading) {
        return <div className="container mt-4 text-center">Cargando detalles del usuario...</div>;
    }

    if (error && !loading) {
        return <div className="container mt-4 alert alert-danger">{error}</div>;
    }


    return (
        <div className="container mt-4">
            <h2>Editar Usuario</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formNombre">
                    <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="nombre" value={usuario.nombre} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formApellido">
                    <Form.Label>Apellido <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="apellido" value={usuario.apellido} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDireccion">
                    <Form.Label>Dirección <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="direccion" value={usuario.direccion} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formCorreo">
                    <Form.Label>Correo <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        type="email"
                        name="correo"
                        value={usuario.correo}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formRol">
                    <Form.Label>Rol</Form.Label>
                    <Form.Control
                        as="select"
                        name="rol"
                        value={usuario.rol}
                        onChange={handleChange}
                        disabled={id == currentUserId}
                    >
                        <option value="usuario">Usuario</option>
                        <option value="admin">Administrador</option>
                    </Form.Control>
                    {id == currentUserId && <Form.Text className="text-muted">No puedes cambiar tu propio rol.</Form.Text>}
                </Form.Group>

                <Button variant="primary" type="submit">Guardar Cambios</Button>
                <Button variant="secondary" onClick={() => navigate('/admin/usuarios')} className="ms-3">Volver</Button>
            </Form>
        </div>
    );
}

export default EditarUsuario;