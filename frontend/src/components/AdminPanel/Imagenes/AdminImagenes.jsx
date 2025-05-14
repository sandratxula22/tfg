import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import '../AdminPanel.css';
import axios from 'axios';

function AdminImagenes() {
    const [imagenes, setImagenes] = useState([]);
    const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const fetchImagenes = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`${VITE_API_BASE_URL}/api/admin/images`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setImagenes(data);
            } catch (error) {
                console.error("Error fetching imágenes:", error);
            }
        };

        fetchImagenes();

        const editSuccessMessage = localStorage.getItem('imagenEditSuccess');
        if (editSuccessMessage) {
            setMensaje(editSuccessMessage);
            localStorage.removeItem('imagenEditSuccess');
        }
    }, [VITE_API_BASE_URL]);

    const handleEditarImagen = (id) => {
        navigate(`/libros/images-edit/${id}`);
    };

    const handleBorrarImagen = async (id) => {
        if (window.confirm(`¿Estás seguro de que quieres borrar la imagen con ID ${id}?`)) {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.delete(`${VITE_API_BASE_URL}/api/admin/images/delete/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setImagenes(imagenes.filter(imagen => imagen.id !== id));
                    setMensaje('Imagen borrada con éxito.');
                } else {
                    console.error("Error al borrar la imagen:", response.data);
                    alert('Error al borrar la imagen');
                }
            } catch (error) {
                console.error("Error al conectar con la API:", error);
                alert('Error al conectar con la API');
            }
        }
    };

    const handleSubirImagen = () => {
        navigate('/libros/images-upload');
    };

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
                    {imagenes.map(imagen => (
                        <tr key={imagen.id}>
                            <td>{imagen.titulo_libro}</td>
                            <td>{imagen.url}</td>
                            <td>
                                <Button className="btn btn-primary btn-sm mr-2" onClick={() => handleEditarImagen(imagen.id)}>Editar</Button>
                            </td>
                            <td>
                                <Button className="btn btn-danger btn-sm" onClick={() => handleBorrarImagen(imagen.id)}>Borrar</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default AdminImagenes;