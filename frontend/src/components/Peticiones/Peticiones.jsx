import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import FloatingBotButton from '../Bot/FloatingBotButton';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import './Peticiones.css';

function Peticiones() {
    const [formData, setFormData] = useState({
        titulo: '',
        autor: '',
        mensaje: '',
        email_remitente: ''
    });
    const [sending, setSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (isAuthenticated && user?.correo) {
            setFormData(prevData => ({
                ...prevData,
                email_remitente: user.correo
            }));
        }
    }, [isAuthenticated, user]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setSuccessMessage('');

        try {
            const response = await fetch(`/api/peticiones/enviar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar la petición.');
            }

            Swal.fire({
                icon: 'success',
                title: '¡Petición enviada!',
                text: 'Gracias por tu petición. La revisaremos pronto.',
                showConfirmButton: false,
                timer: 3000
            });
            setFormData({
                titulo: '',
                autor: '',
                mensaje: '',
                email_remitente: isAuthenticated && user?.correo ? user.correo : ''
            });
            setSuccessMessage('Tu petición ha sido enviada con éxito.');

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `No se pudo enviar la petición: ${error.message}`,
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <Container className="py-5">
            <h1 className="mb-4 text-center">Página de peticiones</h1>
            <p className="text-center lead mb-4">
                ¿No encuentras el libro único que buscas? ¡Haz una petición del libro que deseas y nos pondremos en contacto!
            </p>

            <div className="row justify-content-center">
                <div className="col-md-11 col-lg-10"> 
                    <div className="card shadow-sm">
                        <div className="card-body">
                            {successMessage && <Alert variant="success">{successMessage}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formTitulo">
                                    <Form.Label>Título del Libro</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        placeholder="Cien años de soledad"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formAutor">
                                    <Form.Label>Autor</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="autor"
                                        value={formData.autor}
                                        onChange={handleChange}
                                        placeholder="Gabriel García Márquez"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formMensaje">
                                    <Form.Label>Mensaje Adicional (opcional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="mensaje"
                                        value={formData.mensaje}
                                        onChange={handleChange}
                                        placeholder="Información adicional sobre el libro"
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3" controlId="formEmailRemitente">
                                    <Form.Label>Tu Correo Electrónico</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email_remitente"
                                        value={formData.email_remitente}
                                        onChange={handleChange}
                                        placeholder="tu.correo@ejemplo.com"
                                        required
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" disabled={sending}>
                                    {sending ? 'Enviando...' : 'Enviar petición'}
                                </Button>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
            
            <Alert variant="info" className="mt-5 mb-5 text-center">
                <Alert.Heading>¿Necesitas ayuda para elegir?</Alert.Heading>
                <p className="mb-0">
                    Nuestro bot inteligente también puede recomendarte libros basados en tus preferencias. ¡Haz clic en el icono flotante para chatear con él!
                </p>
            </Alert>

            <FloatingBotButton />
        </Container>
    );
}

export default Peticiones;