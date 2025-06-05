import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRobot, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Bot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.post(`${API_URL}/api/bot-recomienda`, { query: userMessage.text }, { headers });

            const botResponse = {
                sender: 'bot',
                text: response.data.raw_response,
                structured: response.data.structured_recommendations,
            };
            setMessages((prevMessages) => [...prevMessages, botResponse]);

        } catch (error) {
            console.error("Error al obtener recomendaciones del bot:", error);
            let errorMessage = 'Lo siento, no pude obtener recomendaciones en este momento.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'bot', text: errorMessage },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-lg mx-auto border border-gray-300 rounded-lg shadow-lg bg-white">
            <div className="p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg flex items-center">
                <FontAwesomeIcon icon={faRobot} className="mr-2" />
                <h2 className="text-lg font-semibold">Bot Recomendador de Libros</h2>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        ¡Hola! Pregúntame sobre cualquier tipo de libro, por ejemplo:
                        <br/>"Recomiéndame 3 libros de ciencia ficción"
                        <br/>"Libros de terror psicológico con buena trama"
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start max-w-[80%] p-3 rounded-lg ${
                            msg.sender === 'user'
                                ? 'bg-blue-500 text-white rounded-br-none'
                                : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}>
                            <FontAwesomeIcon icon={msg.sender === 'user' ? faUser : faRobot} className={`mr-2 ${msg.sender === 'user' ? 'text-white' : 'text-gray-600'}`} />
                            <div>
                                <p className="font-medium">{msg.sender === 'user' ? 'Tú' : 'Bot'}</p>
                                <p>{msg.text}</p>
                                {msg.structured && msg.structured.length > 0 && (
                                    <div className="mt-2 p-2 bg-gray-100 rounded-md text-gray-700">
                                        <p className="font-semibold">Nuestras recomendaciones:</p>
                                        {msg.structured.map((rec, recIndex) => (
                                            <p key={recIndex} className="text-sm mt-1">
                                                <strong>"{rec.titulo}"</strong> por {rec.autor}
                                                {rec.disponible_en_tienda && (
                                                    <span className="text-green-600 ml-2 font-semibold text-xs">(¡En tienda!)</span>
                                                )}
                                                {rec.url_local && (
                                                    <a
                                                        href={rec.url_local}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ml-2 text-blue-600 hover:underline text-xs"
                                                    >
                                                        Ver libro
                                                    </a>
                                                )}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex items-center max-w-[80%] p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
                            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                            <p>El bot está pensando...</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !loading) {
                            sendMessage();
                        }
                    }}
                    placeholder="Escribe tu pregunta aquí..."
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                />
                <button
                    onClick={sendMessage}
                    className="ml-3 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={loading}
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </div>
        </div>
    );
}

export default Bot;