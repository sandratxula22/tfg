import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

function EditarImagen() {
    const navigate = useNavigate();
    const { id } = useParams();
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [libros, setLibros] = useState([]);
    const [imagenData, setImagenData] = useState({
        libro_id: '',
        url: '',
    });
    const [imagenFile, setImagenFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

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

        const fetchImagen = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${VITE_API_BASE_URL}/api/admin/images/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setImagenData({ libro_id: data.libro_id, url: data.url });
            } catch (error) {
                console.error("Error fetching imagen:", error);
                setError('Error al cargar los detalles de la imagen');
            } finally {
                setLoading(false);
            }
        };

        fetchLibros();
        fetchImagen();
    }, [VITE_API_BASE_URL, id]);

    const handleLibroChange = (e) => {
        setImagenData({ ...imagenData, libro_id: e.target.value });
    };

    const handleImagenChange = (e) => {
        setImagenFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!imagenData.libro_id) {
            setError('Por favor, selecciona un libro.');
            return;
        }

        const formData = new FormData();
        formData.append('libro_id', imagenData.libro_id);
        if (imagenFile) {
            formData.append('imagen', imagenFile);
        } else {
            formData.append('url', imagenData.url);
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${VITE_API_BASE_URL}/api/admin/images/edit/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {                
                localStorage.setItem('imagenEditSuccess', 'Imagen actualizada con éxito.');
                navigate('/admin/imagenes');
            } else {
                console.error("Error al actualizar la imagen:", response.data);
                setError(response.data.message || 'Error al actualizar la imagen.');
            }
        } catch (error) {
            console.error("Error al conectar con la API:", error);
            setError('Error al conectar con la API.');
        }
    };

    if (loading) {
        return <div className="container mt-4">Cargando detalles de la imagen...</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Editar Imagen</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formLibro">
                    <Form.Label>Seleccionar Libro</Form.Label>
                    <Form.Control as="select" onChange={handleLibroChange} value={imagenData.libro_id} required>
                        <option value="">Selecciona un libro</option>
                        {libros.map(libro => (
                            <option key={libro.id} value={libro.id}>{libro.titulo}</option>
                        ))}
                    </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formImagen">
                    <Form.Label>Cambiar Archivo de Imagen</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImagenChange}
                    />
                    {imagenData.url && <p className="mt-2">Archivo actual: {imagenData.url}</p>}
                </Form.Group>

                <Button variant="primary" type="submit">Guardar Cambios</Button>
                <Button variant="secondary" onClick={() => navigate('/admin/imagenes')} className="ms-3">Volver</Button>
            </Form>
        </div>
    );
}

export default EditarImagen;