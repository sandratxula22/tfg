import React, { useState, useEffect } from 'react';

function FetchData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/test')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la petición');
                }
                return response.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!data) return null;

    return (
        <div>
            {/* Muestra los datos */}
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}

export default FetchData;