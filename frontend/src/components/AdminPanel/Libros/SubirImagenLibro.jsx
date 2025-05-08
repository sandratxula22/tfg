import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function SubirImagenLibro() {
    const navigate = useNavigate();
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [libros, setLibros] = useState([]);
    const [libroId, setLibroId] = useState('');
    const [urlImagen, setUrlImagen] = useState('');
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

    const handleUrlImagenChange = (e) => {
        setUrlImagen(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        if (!libroId) {
            setError('Por favor, selecciona un libro.');
            return;
        }

        if (!urlImagen) {
            setError('Por favor, introduce la URL de la imagen.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${VITE_API_BASE_URL}/api/admin/libros/${libroId}/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: urlImagen }),
            });

            if (response.ok) {
                setMensaje('Imagen subida exitosamente.');
                setUrlImagen('');
            } else {
                const errorData = await response.json();
                console.error("Error al subir la imagen:", errorData);
                setError(errorData.message || 'Error al subir la imagen.');
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

                <Form.Group className="mb-3" controlId="formUrlImagen">
                    <Form.Label>URL de la Imagen</Form.Label>
                    <Form.Control
                        type="text"
                        value={urlImagen}
                        onChange={handleUrlImagenChange}
                        placeholder="Introduce la URL de la imagen"
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit">Subir Imagen</Button>
                <Button variant="secondary" onClick={() => navigate('/admin/libros')}>Volver</Button>
            </Form>
        </div>
    );
}

export default SubirImagenLibro;