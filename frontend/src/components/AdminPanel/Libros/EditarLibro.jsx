import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

function EditarLibro() {
    const { id } = useParams();
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
    const [imagenPortadaFile, setImagenPortadaFile] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLibro = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${VITE_API_BASE_URL}/api/libros/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLibro(data);
            } catch (error) {
                console.error("Error fetching libro:", error);
                setError('Error al cargar los datos del libro');
            }
        };

        fetchLibro();
    }, [VITE_API_BASE_URL, id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLibro(prevLibro => ({
            ...prevLibro,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImagenPortadaChange = (e) => {
        setImagenPortadaFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new FormData();
        formData.append('titulo', libro.titulo);
        formData.append('autor', libro.autor);
        formData.append('genero', libro.genero);
        formData.append('descripcion', libro.descripcion);
        formData.append('precio', libro.precio);
        formData.append('disponible', libro.disponible ? 1 : 0);
        if (imagenPortadaFile) {
            formData.append('imagen_portada', imagenPortadaFile);
        } else if (libro.imagen_portada) {
            formData.append('imagen_portada_actual', libro.imagen_portada);
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${VITE_API_BASE_URL}/api/admin/libros/edit/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                localStorage.setItem('libroEditSuccess', 'Libro actualizado con éxito.');
                navigate('/admin/libros');
            } else {
                const errorData = response.data;
                console.error("Error al actualizar el libro:", errorData);
                setError(errorData.message || 'Error al actualizar el libro');
            }
        } catch (error) {
            console.error("Error al conectar con la API:", error);
            setError('Error al conectar con la API');
        }
    };

    return (
        <div className="container mt-4">
            <h2>Editar Libro</h2>
            {error && <div className="alert alert-danger">{error}</div>}
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
                    <Form.Control type="file" accept="image/*" name="imagen_portada" onChange={handleImagenPortadaChange} />
                    {libro.imagen_portada && <p className="mt-2">Portada actual: {libro.imagen_portada}</p>}
                </Form.Group>

                <Button variant="primary" type="submit">Guardar Cambios</Button>
                <Button variant="secondary" onClick={() => navigate('/admin/libros')}>Volver</Button>
            </Form>
        </div>
    );
}

export default EditarLibro;