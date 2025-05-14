import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

function CrearUsuario() {
    const navigate = useNavigate();
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [usuario, setUsuario] = useState({
        nombre: '',
        apellido: '',
        direccion: '',
        correo: '',
        contrasena: '',
        rol: 'usuario',
    });
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

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
            const response = await axios.post(`${VITE_API_BASE_URL}/api/admin/usuarios/create`, usuario, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 201) {
                setMensaje('Usuario creado con éxito.');
                setUsuario({
                    nombre: '',
                    apellido: '',
                    direccion: '',
                    correo: '',
                    contrasena: '',
                    rol: 'usuario',
                });
            } else {
                const errorData = response.data;
                console.error("Error al crear el usuario:", errorData);
                setError(errorData.message || 'Error al crear el usuario');
            }
        } catch (error) {
            if (error.response && error.response.status === 422 && error.response.data && error.response.data.errors) {
                const errors = error.response.data.errors;
                const firstErrorKey = Object.keys(errors)[0];
                setError(errors[firstErrorKey][0]);
            } else {
                console.error("Error", error);
                setError('Error');
            }
        }
    };

    return (
        <div className="container mt-4">
            <h2>Crear Nuevo Usuario</h2>
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
                    <Form.Control type="email" name="correo" value={usuario.correo} onChange={handleChange} autoComplete="username" required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formContrasena">
                    <Form.Label>Contraseña <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="password" name="contrasena" value={usuario.contrasena} onChange={handleChange} autoComplete="new-password" required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formRol">
                    <Form.Label>Rol</Form.Label>
                    <Form.Control as="select" name="rol" value={usuario.rol} onChange={handleChange}>
                        <option value="usuario">Usuario</option>
                        <option value="admin">Administrador</option>
                    </Form.Control>
                </Form.Group>

                <Button variant="primary" type="submit">Crear Usuario</Button>
                <Button variant="secondary" onClick={() => navigate('/admin/usuarios')}>Volver</Button>
            </Form>
        </div>
    );
}

export default CrearUsuario;