import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

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
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setUsuario(data);
            } catch (error) {
                console.error("Error fetching usuario:", error);
                setError('Error al cargar los datos del usuario');
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

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(`${VITE_API_BASE_URL}/api/admin/usuarios/edit/${id}`, usuario, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                localStorage.setItem('usuarioEditSuccess', 'Usuario actualizado exitosamente.');
                navigate('/admin/usuarios');
            } else {
                const errorData = response.data;
                console.error("Error al actualizar el usuario:", errorData);
                setError(errorData.message || 'Error al actualizar el usuario');
            }
        } catch (error) {
            if (error.response && error.response.status === 422 && error.response.data && error.response.data.errors) {
                const errors = error.response.data.errors;
                const firstErrorKey = Object.keys(errors)[0];
                setError(errors[firstErrorKey][0]);
            } else {
                console.error("Error:", error);
                setError('Error');
            }
        }
    };

    if (loading) {
        return <div className="container mt-4">Cargando detalles del usuario...</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Editar Usuario</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {mensaje && <div className="alert alert-success">{mensaje}</div>}
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
                    <Form.Control type="email" name="correo" value={usuario.correo} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formRol">
                    <Form.Label>Rol</Form.Label>
                    <Form.Control as="select" name="rol" value={usuario.rol} onChange={handleChange}>
                        <option value="usuario">Usuario</option>
                        <option value="admin">Administrador</option>
                    </Form.Control>
                </Form.Group>

                <Button variant="primary" type="submit">Guardar Cambios</Button>
                <Button variant="secondary" onClick={() => navigate('/admin/usuarios')}>Volver</Button>
            </Form>
        </div>
    );
}

export default EditarUsuario;