import React from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import '../AdminPanel.css';
import { useState, useEffect } from 'react';

function AdminLibros() {
    const [libros, setLibros] = useState([]);
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

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
            }
        };

        fetchLibros();
    }, []);

    const handleEditar = (id) => {
        navigate(`/libros/edit/${id}`);
    };

    const handleSubirImagen = () => {
        navigate('/libros/images-upload');
    };

    const handleBorrar = async (id) => {
        if (window.confirm(`¿Estás seguro de que quieres borrar el libro con ID ${id}?`)) {
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
                } else {
                    const errorData = await response.json();
                    console.error("Error al borrar el libro:", errorData);
                    alert('Error al borrar el libro');
                }
            } catch (error) {
                console.error("Error al conectar con la API:", error);
                alert('Error al conectar con la API');
            }
        }
    };

    const handleCrearLibro = () => {
        navigate('/libros/create');
    };

    return (
        <div>
            <h2>Gestión de Libros</h2>
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
                    {libros.map(libro => (
                        <tr key={libro.id}>
                            <td>{libro.titulo}</td>
                            <td>{libro.autor}</td>
                            <td>{libro.genero}</td>
                            <td>{libro.precio}</td>
                            <td>{libro.disponible ? 'Sí' : 'No'}</td>
                            <td>
                                <Button className="btn btn-primary btn-sm mr-2" onClick={() => handleEditar(libro.id)}>Editar</Button>
                            </td>
                            <td>
                                <Button className="btn btn-danger btn-sm" onClick={() => handleBorrar(libro.id)}>Borrar</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Button variant="success" onClick={handleCrearLibro}>Crear Nuevo Libro</Button>
            <Button variant="info" onClick={handleSubirImagen}>Subir Imagen</Button>
        </div>
    );
}

export default AdminLibros;