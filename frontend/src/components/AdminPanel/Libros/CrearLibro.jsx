import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function CrearLibro() {
    const navigate = useNavigate();
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [libro, setLibro] = useState({
        titulo: '',
        autor: '',
        genero: '',
        descripcion: '',
        precio: 0,
        disponible: true,
        imagen_portada: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLibro(prevLibro => ({
            ...prevLibro,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${VITE_API_BASE_URL}/api/admin/libros/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(libro),
            });

            if (response.ok) {
                navigate('/admin/libros');
            } else {
                const errorData = await response.json();
                console.error("Error al crear el libro:", errorData);
                setError(errorData.message || 'Error al crear el libro');
            }
        } catch (error) {
            console.error("Error al conectar con la API:", error);
            setError('Error al conectar con la API');
        }
    };

    return (
        <div className="container mt-4">
            <h2>Crear Nuevo Libro</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formTitulo">
                    <Form.Label>Título</Form.Label>
                    <Form.Control
                        type="text"
                        name="titulo"
                        value={libro.titulo}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formAutor">
                    <Form.Label>Autor</Form.Label>
                    <Form.Control
                        type="text"
                        name="autor"
                        value={libro.autor}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGenero">
                    <Form.Label>Género</Form.Label>
                    <Form.Control
                        type="text"
                        name="genero"
                        value={libro.genero}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDescripcion">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="descripcion"
                        value={libro.descripcion}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPrecio">
                    <Form.Label>Precio</Form.Label>
                    <Form.Control
                        type="number"
                        name="precio"
                        value={libro.precio}
                        onChange={handleChange}
                        step="0.01"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDisponible">
                    <Form.Check
                        type="checkbox"
                        name="disponible"
                        label="Disponible"
                        checked={libro.disponible}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formImagenPortada">
                    <Form.Label>Imagen de Portada</Form.Label>
                    <Form.Control
                        type="text"
                        name="imagen_portada"
                        value={libro.imagen_portada}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Crear Libro
                </Button>
                <Button variant="secondary" onClick={() => navigate('/admin/libros')}>
                    Volver
                </Button>
            </Form>
        </div>
    );
}

export default CrearLibro;