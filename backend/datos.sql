-- Inserciones en la tabla 'libros' (sin la columna 'imagenes_adicionales')
INSERT INTO libros (titulo, autor, genero, precio, disponible, descripcion, imagen_portada, created_at, updated_at) VALUES
('Mujercitas', 'Louisa May Alcott', 'Ficción', 12.99, TRUE, 'La entrañable historia de las hermanas March: Meg, Jo, Beth y Amy, mientras crecen y buscan su lugar en el mundo.', 'portadas/mujercitas.jpg', NOW(), NOW()),
('La isla del tesoro', 'Robert Louis Stevenson', 'Aventura', 9.95, TRUE, 'Un joven llamado Jim Hawkins encuentra un mapa del tesoro y se embarca en una peligrosa aventura llena de piratas y motines.', 'portadas/la_isla_del_tesoro.jpg', NOW(), NOW()),
('El gran Gatsby', 'F. Scott Fitzgerald', 'Ficción', 10.50, TRUE, 'Ambientada en la era del jazz, esta novela explora temas de riqueza, amor, ilusión y el sueño americano a través de los ojos de Nick Carraway y el misterioso Jay Gatsby.', 'portadas/el_gran_gastby.jpg', NOW(), NOW()),
('Un mundo feliz', 'Aldous Huxley', 'Ciencia Ficción', 11.25, TRUE, 'Una distopía futurista que presenta una sociedad genéticamente modificada y controlada por el condicionamiento psicológico y las drogas.', 'portadas/un_mundo_feliz.jpg', NOW(), NOW()),
('Trilogía: Los juegos del hambre', 'Suzanne Collins', 'Ciencia Ficción', 25.00, TRUE, 'En una nación post-apocalíptica, adolescentes son elegidos anualmente como "tributos" para luchar a muerte en un evento televisado llamado Los Juegos del Hambre.', 'portadas/trilogia_ljdh.jpg', NOW(), NOW()),
('Carrie', 'Stephen King', 'Terror', 14.75, TRUE, 'Una joven marginada con poderes telequinéticos es llevada al límite por el constante acoso de sus compañeros, culminando en una noche de terror y venganza.', 'portadas/carrie.jpg', NOW(), NOW()),
('Balada de pájaros cantores y serpientes', 'Suzanne Collins', 'Ciencia Ficción', 16.00, TRUE, 'Precuela de Los Juegos del Hambre que sigue la historia de un joven Coriolanus Snow y su relación con la tributo del Distrito 12, Lucy Gray Baird.', 'portadas/balada_de_pajaros.jpg', NOW(), NOW()),
('Circe', 'Madeline Miller', 'Fantasía', 18.50, TRUE, 'Una fascinante novela que cuenta la historia de la hechicera Circe, hija del titán Helios, desde su exilio en una isla hasta sus encuentros con figuras míticas.', 'portadas/circe.jpg', NOW(), NOW()),
('Memorias de Idhún I: La resistencia', 'Laura Gallego', 'Fantasía', 15.20, TRUE, 'Comienza la épica saga de fantasía donde tres jóvenes luchan contra el malvado dios Ashran y sus letales sheks para salvar el mágico mundo de Idhún.', 'portadas/mdi1_1.jpg', NOW(), NOW()),
('Memorias de Idhún II: Tríada', 'Laura Gallego', 'Fantasía', 15.50, TRUE, 'La resistencia continúa mientras los protagonistas buscan aliados y desentrañan los secretos para derrotar a Ashran y liberar Idhún de su tiranía.', 'portadas/mdi2_1.jpg', NOW(), NOW()),
('Memorias de Idhún III: Panteón', 'Laura Gallego', 'Fantasía', 15.75, TRUE, 'La emocionante conclusión de la trilogía donde los destinos de los personajes se entrelazan en la batalla final por el futuro de Idhún.', 'portadas/mdi3_1.jpg', NOW(), NOW());

-- Inserciones en la tabla 'images'
INSERT INTO images (libro_id, url, created_at, updated_at) VALUES
((SELECT id FROM libros WHERE titulo = 'Mujercitas'), 'adicionales/mujercitas2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Mujercitas'), 'adicionales/mujercitas3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Mujercitas'), 'adicionales/mujercitas4.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'La isla del tesoro'), 'adicionales/la_isla_del_tesoro2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'La isla del tesoro'), 'adicionales/la_isla_del_tesoro3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'La isla del tesoro'), 'adicionales/la_isla_del_tesoro4.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'El gran Gatsby'), 'adicionales/el_gran_gastby2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'El gran Gatsby'), 'adicionales/el_gran_gastby3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Trilogía: Los juegos del hambre'), 'adicionales/trilogia_ljdh2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Trilogía: Los juegos del hambre'), 'adicionales/trilogia_ljdh3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Carrie'), 'adicionales/carrie2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Carrie'), 'adicionales/carrie3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Carrie'), 'adicionales/carrie4.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Balada de pájaros cantores y serpientes'), 'adicionales/balada_de_pajaros2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Balada de pájaros cantores y serpientes'), 'adicionales/balada_de_pajaros3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Circe'), 'adicionales/circe2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Circe'), 'adicionales/circe3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Circe'), 'adicionales/circe4.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Memorias de Idhún I: La resistencia'), 'adicionales/mdi1_2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Memorias de Idhún I: La resistencia'), 'adicionales/mdi1_3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Memorias de Idhún II: Tríada'), 'adicionales/mdi2_2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Memorias de Idhún II: Tríada'), 'adicionales/mdi2_3.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Memorias de Idhún III: Panteón'), 'adicionales/mdi3_2.jpg', NOW(), NOW()),
((SELECT id FROM libros WHERE titulo = 'Memorias de Idhún III: Panteón'), 'adicionales/mdi3_3.jpg', NOW(), NOW());

INSERT INTO usuarios (nombre, apellido, direccion, correo, contrasena, rol, created_at, updated_at) VALUES
('NombreAdmin', 'ApellidoAdmin', 'DirecciónAdmin', 'admin@example.com', '$2y$12$p.fEQLo9IWBunjaJEElAl.qchJU/y87PNHS690UhS0xQsmmY1pTMS', 'admin', NOW(), NOW());