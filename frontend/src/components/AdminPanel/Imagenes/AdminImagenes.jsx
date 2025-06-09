import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';
import '../AdminPanel.css';
import axios from 'axios';

function AdminImagenes() {
    const [imagenes, setImagenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [mensaje, setMensaje] = useState('');

    const fetchImagenes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/admin/images`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setImagenes(data);
        } catch (err) {
            console.error("Error fetching imágenes:", err);
            setError(err.message || "Error al cargar las imágenes.");
            Swal.fire({
                icon: 'error',
                title: 'Error de carga',
                text: err.message || 'No se pudieron cargar las imágenes.',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImagenes();

        const editSuccessMessage = localStorage.getItem('imagenEditSuccess');
        if (editSuccessMessage) {
            setMensaje(editSuccessMessage);
            localStorage.removeItem('imagenEditSuccess');
        }
    }, [fetchImagenes]);

    const handleEditarImagen = (id) => {
        navigate(`/libros/images-edit/${id}`);
    };

    const handleBorrarImagen = async (id, titulo) => {
        const result = await Swal.fire({
            title: `¿Estás seguro de que quieres borrar la imagen del libro "${titulo}"?`,
            text: "¡Esta acción no se puede deshacer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, borrarla'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.delete(`/api/admin/images/delete/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setImagenes(imagenes.filter(imagen => imagen.id !== id));
                    Swal.fire(
                        '¡Borrada!',
                        'La imagen ha sido borrada con éxito.',
                        'success'
                    );
                } else {
                    const errorData = response.data;
                    console.error("Error al borrar la imagen:", errorData);
                    Swal.fire(
                        'Error',
                        errorData.message || 'Error al borrar la imagen.',
                        'error'
                    );
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    Swal.fire(
                        'Error',
                        error.response.data.message || 'Error al borrar la imagen.',
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

    const handleSubirImagen = () => {
        navigate('/libros/images-upload');
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando imágenes...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2>Gestión de imágenes adicionales</h2>
            {mensaje && <div className="alert alert-success">{mensaje}</div>}
            <div className="mb-3">
                <Button variant="success" onClick={handleSubirImagen}>Subir nueva imagen</Button>
            </div>
            <Table hover responsive>
                <thead className="cabecera-dark">
                    <tr>
                        <th>Libro</th>
                        <th>URL</th>
                        <th>Editar</th>
                        <th>Borrar</th>
                    </tr>
                </thead>
                <tbody>
                    {imagenes.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center">No hay imágenes para mostrar.</td>
                        </tr>
                    ) : (
                        imagenes.map(imagen => (
                            <tr key={imagen.id}>
                                <td>{imagen.titulo_libro}</td>
                                <td>{imagen.url}</td>
                                <td>
                                    <Button className="btn btn-primary btn-sm me-2" onClick={() => handleEditarImagen(imagen.id)}>Editar</Button>
                                </td>
                                <td>
                                    <Button className="btn btn-danger btn-sm" onClick={() => handleBorrarImagen(imagen.id, imagen.titulo_libro)}>Borrar</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
}

export default AdminImagenes;