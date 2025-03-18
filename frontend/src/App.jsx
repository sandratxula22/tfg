import React from 'react';
import FetchData from './test/FetchData';
import AxiosData from './test/AxiosData';
import Container from 'react-bootstrap/Container';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <div>
                <h1>Datos con Fetch</h1>
                <FetchData />

                <h1>Datos con Axios</h1>
                <AxiosData />
            </div>
        </Container>
    );
}

export default App;