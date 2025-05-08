-- Inserciones en la tabla 'libros' (sin la columna 'imagenes_adicionales')
INSERT INTO libros (titulo, autor, genero, precio, disponible, descripcion, imagen_portada, created_at, updated_at) VALUES
('Mujercitas', 'Louisa May Alcott', 'Ficción', 12.99, TRUE, 'La entrañable historia de las hermanas March: Meg, Jo, Beth y Amy, mientras crecen y buscan su lugar en el mundo.', 'mujercitas.jpg', NOW(), NOW()),
('La isla del tesoro', 'Robert Louis Stevenson', 'Aventura', 9.95, TRUE, 'Un joven llamado Jim Hawkins encuentra un mapa del tesoro y se embarca en una peligrosa aventura llena de piratas y motines.', 'la_isla_del_tesoro.jpg', NOW(), NOW()),
('El gran Gatsby', 'F. Scott Fitzgerald', 'Ficción', 10.50, TRUE, 'Ambientada en la era del jazz, esta novela explora temas de riqueza, amor, ilusión y el sueño americano a través de los ojos de Nick Carraway y el misterioso Jay Gatsby.', 'el_gran_gastby.jpg', NOW(), NOW()),
('Un mundo feliz', 'Aldous Huxley', 'Ciencia Ficción', 11.25, TRUE, 'Una distopía futurista que presenta una sociedad genéticamente modificada y controlada por el condicionamiento psicológico y las drogas.', 'un_mundo_feliz.jpg', NOW(), NOW()),
('Trilogía: Los juegos del hambre', 'Suzanne Collins', 'Ciencia Ficción', 25.00, TRUE, 'En una nación post-apocalíptica, adolescentes son elegidos anualmente como "tributos" para luchar a muerte en un evento televisado llamado Los Juegos del Hambre.', 'trilogia_ljdh.jpg', NOW(), NOW()),
('Carrie', 'Stephen King', 'Terror', 14.75, TRUE, 'Una joven marginada con poderes telequinéticos es llevada al límite por el constante acoso de sus compañeros, culminando en una noche de terror y venganza.', 'carrie.jpg', NOW(), NOW()),
('Balada de pájaros cantores y serpientes', 'Suzanne Collins', 'Ciencia Ficción', 16.00, TRUE, 'Precuela de Los Juegos del Hambre que sigue la historia de un joven Coriolanus Snow y su relación con la tributo del Distrito 12, Lucy Gray Baird.', 'balada_de_pajaros.jpg', NOW(), NOW()),
('Circe', 'Madeline Miller', 'Fantasía', 18.50, TRUE, 'Una fascinante novela que cuenta la historia de la hechicera Circe, hija del titán Helios, desde su exilio en una isla hasta sus encuentros con figuras míticas.', 'circe.jpg', NOW(), NOW()),
('Memorias de Idhún I: La resistencia', 'Laura Gallego', 'Fantasía', 15.20, TRUE, 'Comienza la épica saga de fantasía donde tres jóvenes luchan contra el malvado dios Ashran y sus letales sheks para salvar el mágico mundo de Idhún.', 'mdi1_1.jpg', NOW(), NOW()),
('Memorias de Idhún II: Tríada', 'Laura Gallego', 'Fantasía', 15.50, TRUE, 'La resistencia continúa mientras los protagonistas buscan aliados y desentrañan los secretos para derrotar a Ashran y liberar Idhún de su tiranía.', 'mdi2_1.jpg', NOW(), NOW()),
('Memorias de Idhún III: Panteón', 'Laura Gallego', 'Fantasía', 15.75, TRUE, 'La emocionante conclusión de la trilogía donde los destinos de los personajes se entrelazan en la batalla final por el futuro de Idhún.', 'mdi3_1.jpg', NOW(), NOW());

-- Inserciones en la tabla 'images'
INSERT INTO images (libro_id, url, created_at, updated_at) VALUES
((SELECT id FROM libros WHERE titulo = 'Mujercitas'), 'mujercitas2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Mujercitas'), 'mujercitas3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Mujercitas'), 'mujercitas4.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'La isla del tesoro'), 'la_isla_del_tesoro2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'La isla del tesoro'), 'la_isla_del_tesoro3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'La isla del tesoro'), 'la_isla_del_tesoro4.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'El gran Gatsby'), 'el_gran_gastby2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'El gran Gatsby'), 'el_gran_gastby3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Trilogía: Los juegos del hambre'), 'trilogia_ljdh2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Trilogía: Los juegos del hambre'), 'trilogia_ljdh3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Carrie'), 'carrie2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Carrie'), 'carrie3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Carrie'), 'carrie4.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Balada de pájaros cantores y serpientes'), 'balada_de_pajaros2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Balada de pájaros cantores y serpientes'), 'balada_de_pajaros3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Circe'), 'circe.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Circe'), 'circe2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Circe'), 'circe3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Circe'), 'circe4.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Memorias de Idhún I: La resistencia'), 'mdi1_2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Memorias de Idhún I: La resistencia'), 'mdi1_3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Memorias de Idhún II: Tríada'), 'mdi2_2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Memorias de Idhún II: Tríada'), 'mdi2_3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Memorias de Idhún III: Panteón'), 'mdi3_2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Memorias de Idhún III: Panteón'), 'mdi3_3.jpg', NOW(), NOW());

INSERT INTO usuarios (nombre, apellido, direccion, correo, contrasena, rol, created_at, updated_at) VALUES
('NombreAdmin', 'ApellidoAdmin', 'DirecciónAdmin', 'admin@example.com', '$2y$12$YhsNJQz7GEe22MWxLS3YHeH1B8b2wZ7U6fAm/tHqYnVE3DGf45L4q', 'admin', NOW(), NOW());