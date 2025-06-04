import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';
import '../AdminPanel.css';

function AdminLibros() {
    const [libros, setLibros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const [mensaje, setMensaje] = useState('');

    const fetchLibros = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${VITE_API_BASE_URL}/api/libros`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setLibros(data);
        } catch (err) {
            console.error("Error fetching libros:", err);
            setError(err.message || "Error al cargar los libros.");
            Swal.fire({
                icon: 'error',
                title: 'Error de carga',
                text: err.message || 'No se pudieron cargar los libros.',
            });
        } finally {
            setLoading(false);
        }
    }, [VITE_API_BASE_URL]);

    useEffect(() => {
        fetchLibros();

        const editSuccessMessage = localStorage.getItem('libroEditSuccess');
        if (editSuccessMessage) {
            setMensaje(editSuccessMessage);
            localStorage.removeItem('libroEditSuccess');
        }
    }, [VITE_API_BASE_URL, fetchLibros]);

    const handleEditar = (id) => {
        navigate(`/libros/edit/${id}`);
    };

    const handleBorrar = async (id) => {
        const result = await Swal.fire({
            title: `¿Estás seguro de que quieres borrar el libro con ID ${id}?`,
            text: "¡Esta acción no se puede deshacer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, borrarlo'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${VITE_API_BASE_URL}/api/admin/libros/delete/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    setLibros(libros.filter(libro => libro.id !== id));
                    Swal.fire(
                        '¡Borrado!',
                        'El libro ha sido borrado con éxito.',
                        'success'
                    );
                } else {
                    const errorData = await response.json();
                    console.error("Error al borrar el libro:", errorData);
                    Swal.fire(
                        'Error',
                        errorData.message || 'Error al borrar el libro.',
                        'error'
                    );
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    Swal.fire(
                        'Error',
                        error.response.data.message || 'Error al borrar el libro.',
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

    const handleCrearLibro = () => {
        navigate('/libros/create');
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando libros...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2>Gestión de Libros</h2>
            {mensaje && <div className="alert alert-success">{mensaje}</div>}
            <div className="mb-3">
                <Button variant="success" onClick={handleCrearLibro}>Crear nuevo libro</Button>
            </div>
            <Table hover responsive>
                <thead className="cabecera-dark">
                    <tr>
                        <th>Título</th>
                        <th>Autor</th>
                        <th>Género</th>
                        <th>Precio</th>
                        <th>Disponible</th>
                        <th>Editar</th>
                        <th>Borrar</th>
                    </tr>
                </thead>
                <tbody>
                    {libros.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="text-center">No hay libros para mostrar.</td>
                        </tr>
                    ) : (
                        libros.map(libro => (
                            <tr key={libro.id}>
                                <td>{libro.titulo}</td>
                                <td>{libro.autor}</td>
                                <td>{libro.genero}</td>
                                <td>{libro.precio}</td>
                                <td>{libro.disponible ? 'Sí' : 'No'}</td>
                                <td>
                                    <Button className="btn btn-primary btn-sm me-2" onClick={() => handleEditar(libro.id)}>Editar</Button>
                                </td>
                                <td>
                                    <Button className="btn btn-danger btn-sm" onClick={() => handleBorrar(libro.id)}>Borrar</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </div>
    );
}

export default AdminLibros;