import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

function SubirImagenLibro() {
    const navigate = useNavigate();
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [libros, setLibros] = useState([]);
    const [libroId, setLibroId] = useState('');
    const [imagenFile, setImagenFile] = useState(null);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const fetchLibros = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${VITE_API_BASE_URL}/api/libros`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLibros(data);
            } catch (error) {
                console.error("Error fetching libros:", error);
                setError('Error al cargar la lista de libros');
            }
        };

        fetchLibros();
    }, []);

    const handleLibroChange = (e) => {
        setLibroId(e.target.value);
    };

    const handleImagenChange = (e) => {
        setImagenFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        if (!libroId) {
            setError('Por favor, selecciona un libro.');
            return;
        }

        if (!imagenFile) {
            setError('Por favor, selecciona un archivo de imagen.');
            return;
        }

        const formData = new FormData();
        formData.append('imagen', imagenFile);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${VITE_API_BASE_URL}/api/admin/libros/${libroId}/upload-image`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                setMensaje('Imagen subida con éxito.');
                setImagenFile(null);
            } else {
                console.error("Error al subir la imagen:", response.data);
                setError(response.data.message || 'Error al subir la imagen.');
            }
        } catch (error) {
            console.error("Error al conectar con la API:", error);
            setError('Error al conectar con la API.');
        }
    };

    return (
        <div className="container mt-4">
            <h2>Subir Imagen a Libro</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {mensaje && <div className="alert alert-success">{mensaje}</div>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formLibro">
                    <Form.Label>Seleccionar Libro</Form.Label>
                    <Form.Control as="select" onChange={handleLibroChange} value={libroId} required>
                        <option value="">Selecciona un libro</option>
                        {libros.map(libro => (
                            <option key={libro.id} value={libro.id}>{libro.titulo}</option>
                        ))}
                    </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formImagen">
                    <Form.Label>Archivo de Imagen</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImagenChange}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit">Subir Imagen</Button>
                <Button variant="secondary" onClick={() => navigate('/admin/imagenes')} className="ms-3">Volver</Button>
            </Form>
        </div>
    );
}

export default SubirImagenLibro;