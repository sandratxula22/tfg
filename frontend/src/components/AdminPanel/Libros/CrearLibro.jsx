import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

function CrearLibro() {
    const navigate = useNavigate();
    const [libro, setLibro] = useState({
        titulo: '',
        autor: '',
        genero: '',
        descripcion: '',
        precio: 0,
        disponible: true,
        imagen_portada: null,
    });
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLibro(prevLibro => ({
            ...prevLibro,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImagenPortadaChange = (e) => {
        setLibro(prevLibro => ({
            ...prevLibro,
            imagen_portada: e.target.files[0],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        const formData = new FormData();
        formData.append('titulo', libro.titulo);
        formData.append('autor', libro.autor);
        formData.append('genero', libro.genero);
        formData.append('descripcion', libro.descripcion);
        formData.append('precio', libro.precio);
        formData.append('disponible', libro.disponible ? 1 : 0);
        if (libro.imagen_portada) {
            formData.append('imagen_portada', libro.imagen_portada);
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`/api/admin/libros/create`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                setMensaje('Libro creado con éxito.');
                setLibro({
                    titulo: '',
                    autor: '',
                    genero: '',
                    descripcion: '',
                    precio: 0,
                    disponible: true,
                    imagen_portada: null,
                });
            } else {
                const errorData = response.data;
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
            {mensaje && <div className="alert alert-success">{mensaje}</div>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formTitulo">
                    <Form.Label>Título <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="titulo" value={libro.titulo} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formAutor">
                    <Form.Label>Autor <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="autor" value={libro.autor} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGenero">
                    <Form.Label>Género <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="text" name="genero" value={libro.genero} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDescripcion">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control as="textarea" name="descripcion" value={libro.descripcion} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPrecio">
                    <Form.Label>Precio <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="number" name="precio" value={libro.precio} onChange={handleChange} step="0.01" required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formDisponible">
                    <Form.Check type="checkbox" name="disponible" label="Disponible" checked={libro.disponible} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formImagenPortada">
                    <Form.Label>Imagen de Portada <span className="text-danger">*</span></Form.Label>
                    <Form.Control type="file" accept="image/*" name="imagen_portada" onChange={handleImagenPortadaChange} required />
                </Form.Group>

                <Button variant="primary" type="submit">Crear Libro</Button>
                <Button variant="secondary" onClick={() => navigate('/admin/libros')}>Volver</Button>
            </Form>
        </div>
    );
}

export default CrearLibro;