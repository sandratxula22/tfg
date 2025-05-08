import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
    return (
        <footer className="bg-light py-3">
            <Container>
                <Row>
                    <Col className="text-center">
                        <p>&copy; {new Date().getFullYear()} Mi Tienda de Libros. Todos los derechos reservados.</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;