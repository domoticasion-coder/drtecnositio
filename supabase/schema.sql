-- Schema SQL para Dr Tecno

-- Tabla de Usuarios Administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  collection VARCHAR(100),
  brand VARCHAR(100),
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  short_description TEXT,
  description TEXT,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  featured BOOLEAN DEFAULT FALSE,
  badge VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  shipping_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(30),
  delivery_method VARCHAR(100),
  notes TEXT,
  subtotal NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'En preparación' CHECK (status IN ('En preparación', 'Probado', 'Despachado', 'Entregado', 'Cancelado')),
  items_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Items de Pedidos
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Solicitudes de Servicio Técnico
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('Celular', 'PC de escritorio', 'Notebook')),
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('Reparación', 'Mantenimiento')),
  brand VARCHAR(100),
  model VARCHAR(100),
  customer_dni VARCHAR(50),
  problem_description TEXT NOT NULL,
  diagnosis TEXT,
  estimated_price NUMERIC(12,2),
  internal_notes TEXT,
  estimated_delivery_date DATE,
  delivered_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'En diagnóstico', 'Esperando aprobación', 'En proceso', 'Listo', 'Entregado', 'Cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Configuración de Pasarelas de Pago (Mercado Pago)
CREATE TABLE IF NOT EXISTS mercadopago_config (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  access_token TEXT,
  public_key TEXT,
  sandbox BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Configuraciones Generales de la Tienda
CREATE TABLE IF NOT EXISTS store_settings (
  id VARCHAR(50) PRIMARY KEY,
  key VARCHAR(100) UNIQUE,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_number ON service_requests(request_number);

-- Configuración RLS (Row Level Security)
-- Deshabilitamos RLS en las tablas por defecto para que la API del backend de nuestro ERP pueda gestionar los registros usando las credenciales anon sin bloqueos.
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE mercadopago_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings DISABLE ROW LEVEL SECURITY;

-- Políticas de Acceso Público Completo (Lectura, Inserción, Actualización y Eliminación)
-- En caso de que decidas mantener RLS habilitado en Supabase, estas políticas aseguran acceso libre completo sin restricciones:

DROP POLICY IF EXISTS select_public_products ON products;
CREATE POLICY select_all_products ON products FOR SELECT USING (TRUE);
CREATE POLICY insert_all_products ON products FOR INSERT WITH CHECK (TRUE);
CREATE POLICY update_all_products ON products FOR UPDATE USING (TRUE);
CREATE POLICY delete_all_products ON products FOR DELETE USING (TRUE);

DROP POLICY IF EXISTS select_public_admin_users ON admin_users;
CREATE POLICY select_all_admin_users ON admin_users FOR SELECT USING (TRUE);
CREATE POLICY insert_all_admin_users ON admin_users FOR INSERT WITH CHECK (TRUE);
CREATE POLICY update_all_admin_users ON admin_users FOR UPDATE USING (TRUE);
CREATE POLICY delete_all_admin_users ON admin_users FOR DELETE USING (TRUE);

DROP POLICY IF EXISTS select_public_customers ON customers;
DROP POLICY IF EXISTS insert_public_customers ON customers;
CREATE POLICY select_all_customers ON customers FOR SELECT USING (TRUE);
CREATE POLICY insert_all_customers ON customers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY update_all_customers ON customers FOR UPDATE USING (TRUE);
CREATE POLICY delete_all_customers ON customers FOR DELETE USING (TRUE);

DROP POLICY IF EXISTS select_public_orders ON orders;
DROP POLICY IF EXISTS insert_public_orders ON orders;
CREATE POLICY select_all_orders ON orders FOR SELECT USING (TRUE);
CREATE POLICY insert_all_orders ON orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY update_all_orders ON orders FOR UPDATE USING (TRUE);
CREATE POLICY delete_all_orders ON orders FOR DELETE USING (TRUE);

DROP POLICY IF EXISTS select_public_order_items ON order_items;
DROP POLICY IF EXISTS insert_public_order_items ON order_items;
CREATE POLICY select_all_order_items ON order_items FOR SELECT USING (TRUE);
CREATE POLICY insert_all_order_items ON order_items FOR INSERT WITH CHECK (TRUE);
CREATE POLICY update_all_order_items ON order_items FOR UPDATE USING (TRUE);
CREATE POLICY delete_all_order_items ON order_items FOR DELETE USING (TRUE);

DROP POLICY IF EXISTS insert_public_service_requests ON service_requests;
CREATE POLICY select_all_service_requests ON service_requests FOR SELECT USING (TRUE);
CREATE POLICY insert_all_service_requests ON service_requests FOR INSERT WITH CHECK (TRUE);
CREATE POLICY update_all_service_requests ON service_requests FOR UPDATE USING (TRUE);
CREATE POLICY delete_all_service_requests ON service_requests FOR DELETE USING (TRUE);

-- Políticas para Administradores (usando service role o autenticación)
-- Nota: La API del servidor usará la service role key o bypass RLS para operaciones administrativas.
-- Estas políticas permiten un control total al rol 'service_role'.
CREATE POLICY admin_all_products ON products
  FOR ALL TO service_role USING (TRUE);

CREATE POLICY admin_all_orders ON orders
  FOR ALL TO service_role USING (TRUE);

CREATE POLICY admin_all_customers ON customers
  FOR ALL TO service_role USING (TRUE);

CREATE POLICY admin_all_service_requests ON service_requests
  FOR ALL TO service_role USING (TRUE);

-- Datos iniciales: Admin por defecto (contraseña: admin123, hash SHA256)
-- admin123 SHA256: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
INSERT INTO admin_users (username, password_hash, email)
VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin@drtecno.com')
ON CONFLICT (username) DO NOTHING;

-- Datos de Ejemplo para Productos
INSERT INTO products (slug, name, category, collection, brand, price, short_description, description, image_url, specifications, stock, featured, badge) VALUES
('asus-rog-zephyrus-g14', 'ASUS ROG Zephyrus G14', 'Gaming', 'gaming', 'ASUS', 1899.99, 'Notebook Gamer compacta de 14" con Ryzen 9 y RTX 4060.', 'La laptop para videojuegos de 14 pulgadas más potente del mundo está de regreso. Equipada con el procesador AMD Ryzen 9 de última generación y gráficos NVIDIA GeForce RTX 4060, esta máquina ofrece una potencia sin precedentes en un chasis ultradelgado y ligero.', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=60', '{"Procesador": "AMD Ryzen 9", "Memoria": "32GB DDR5", "Almacenamiento": "1TB NVMe SSD", "Pantalla": "14\\" QHD+ 165Hz OLED", "Tarjeta Gráfica": "NVIDIA RTX 4060 8GB"}', 5, TRUE, 'Gamer Pro'),

('macbook-air-m3', 'Apple MacBook Air 13" M3', 'Laptops', 'computadoras', 'Apple', 1299.00, 'Laptop ultradelgada con chip M3 de Apple, ideal para productividad.', 'La MacBook Air es todo potencia y portabilidad. Cuenta con el avanzado chip M3 de Apple, una CPU de 8 núcleos y una GPU de 10 núcleos que ofrecen un rendimiento increíble para trabajar, estudiar o jugar, con hasta 18 horas de batería.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=60', '{"Procesador": "Chip M3 de Apple", "Memoria": "16GB unificada", "Almacenamiento": "512GB SSD", "Pantalla": "13.6\\" Liquid Retina", "Batería": "Hasta 18 horas"}', 12, TRUE, 'Best Seller'),

('iphone-15-pro-max', 'iPhone 15 Pro Max 256GB', 'Smartphones', 'movil', 'Apple', 1399.99, 'El smartphone insignia de Apple con diseño de titanio y chip A17 Pro.', 'Diseñado en titanio de calidad aeroespacial, ligero y superresistente. El chip A17 Pro ofrece un rendimiento gráfico revolucionario para juegos móviles. Cámara con zoom óptico de 5x y botón de acción personalizable.', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60', '{"Procesador": "Apple A17 Pro", "Pantalla": "6.7\\" Super Retina XDR", "Almacenamiento": "256GB", "Cámara": "Triple 48MP + 12MP + 12MP", "Material": "Titanio"}', 8, TRUE, 'Premium'),

('samsung-galaxy-s24-ultra', 'Samsung Galaxy S24 Ultra', 'Smartphones', 'movil', 'Samsung', 1299.99, 'Smartphone premium con cámara de 200MP, S-Pen e Inteligencia Artificial.', 'Bienvenido a la era de la IA móvil. Con el nuevo Galaxy S24 Ultra, podrás liberar nuevos niveles de creatividad y productividad. Equipado con una cámara trasera principal de 200MP, pantalla Dynamic AMOLED 2X y lápiz óptico S-Pen integrado.', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60', '{"Procesador": "Snapdragon 8 Gen 3", "Pantalla": "6.8\\" QHD+ 120Hz", "Memoria": "12GB RAM", "Almacenamiento": "512GB", "Cámara": "200MP + 50MP + 12MP + 10MP", "S-Pen": "Incluido"}', 10, TRUE, 'Galaxy AI'),

('sony-wh-1000xm5', 'Sony WH-1000XM5', 'Audio', 'audio', 'Sony', 399.00, 'Auriculares inalámbricos con cancelación de ruido líder en la industria.', 'Los auriculares WH-1000XM5 reescriben las reglas de la escucha sin distracciones. Con dos procesadores que controlan ocho micrófonos, cancelación de ruido optimizada automáticamente y un sonido excepcional de alta resolución, experimentarás la música como nunca antes.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60', '{"Conectividad": "Bluetooth 5.2", "Autonomía": "Hasta 30 horas", "Cancelación de Ruido": "Sí, adaptativa activa", "Carga rápida": "3 min para 3 horas", "Audio de alta resolución": "LDAC compatible"}', 15, TRUE, 'Recomendado'),

('jbl-flip-6', 'JBL Flip 6', 'Audio', 'audio', 'JBL', 129.99, 'Parlante portátil resistente al agua IP67 con sonido potente.', 'El JBL Flip 6 ofrece el potente sonido JBL Original Pro con una claridad excepcional gracias a su sistema de altavoces de 2 vías. Resistente al polvo y al agua conforme a la norma IP67, para que puedas llevar tu música a cualquier parte con hasta 12 horas de reproducción.', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=60', '{"Potencia": "30W RMS", "Autonomía": "Hasta 12 horas", "Resistencia": "Certificación IP67", "Conectividad": "Bluetooth 5.1", "Peso": "550g"}', 25, FALSE, 'Más vendido'),

('lg-ultragear-oled-27', 'LG UltraGear OLED 27" QHD', 'Monitors', 'gaming', 'LG', 799.99, 'Monitor gamer OLED con tiempo de respuesta de 0.03ms y 240Hz.', 'Experimenta una inmersión total en tus partidas con el monitor LG UltraGear OLED de 27 pulgadas. Ofrece una resolución QHD impresionante junto con una increíble tasa de refresco de 240Hz y un tiempo de respuesta ultra-rápido de 0.03ms (GtG) para una jugabilidad fluida.', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=60', '{"Pantalla": "27\\" OLED QHD", "Tasa de refresco": "240Hz", "Tiempo de Respuesta": "0.03ms GtG", "Soporte HDR": "HDR10", "Puertos": "DisplayPort 1.4, HDMI 2.1"}', 6, TRUE, 'Ultra Fast'),

('dell-ultrasharp-u2723qe', 'Dell UltraSharp 27" 4K USB-C Hub', 'Monitors', 'computadoras', 'Dell', 549.99, 'Monitor 4K premium con IPS Black, excelente para diseño y oficina.', 'Lleva tu productividad al siguiente nivel con este monitor 4K de 27 pulgadas con un concentrador USB-C integrado. Con tecnología IPS Black pionera en el sector, experimenta colores excepcionales y negros más profundos con una relación de contraste increíble.', 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&auto=format&fit=crop&q=60', '{"Pantalla": "27\\" IPS Black 4K", "Resolución": "3840 x 2160", "Puertos": "USB-C con 90W PD, DP, HDMI, RJ45", "Precisión": "98% DCI-P3 calibrado", "Ergonomía": "Ajuste completo"}', 8, FALSE, 'Diseño Pro'),

('ipad-air-m2', 'Apple iPad Air 11" M2 128GB', 'Tablets', 'movil', 'Apple', 599.00, 'Tablet potente con chip M2, pantalla Liquid Retina y compatibilidad con Apple Pencil Pro.', 'La iPad Air rediseñada viene con el superpotente chip M2 de Apple, una espectacular pantalla Liquid Retina de 11 pulgadas, cámara frontal horizontal perfecta para videollamadas y compatibilidad con el nuevo Apple Pencil Pro.', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60', '{"Procesador": "Chip M2 de Apple", "Pantalla": "11\\" Liquid Retina IPS", "Almacenamiento": "128GB", "Cámara": "12MP trasera, 12MP frontal", "Peso": "462g"}', 14, FALSE, 'Nuevo'),

('apple-watch-ultra-2', 'Apple Watch Ultra 2 GPS + Cellular', 'Wearables', 'movil', 'Apple', 799.00, 'Smartwatch deportivo extremo de titanio con pantalla de 3000 nits.', 'El reloj deportivo definitivo de Apple en su versión más avanzada. Hecho de titanio resistente a la corrosión, cuenta con una pantalla retina siempre encendida ultrabrillante de 3000 nits, GPS de doble frecuencia y una autonomía de hasta 36 horas.', 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=600&auto=format&fit=crop&q=60', '{"Caja": "Titanio 49mm", "Pantalla": "OLED 3000 nits", "Resistencia": "Resistente al agua hasta 100m", "Sensores": "GPS, Oxígeno en sangre, ECG, Temperatura", "Autonomía": "36 a 72 horas"}', 7, TRUE, 'Aventura'),

('keychron-k2-v2', 'Keychron K2 V2 Hot-swappable', 'Gaming', 'gaming', 'Keychron', 99.00, 'Teclado mecánico inalámbrico formato 75% con switches Gateron.', 'El Keychron K2 es un teclado mecánico inalámbrico con todas las teclas funcionales que necesitas en un diseño compacto. Con retroiluminación RGB, chasis de aluminio, switches intercambiables en caliente y una batería de larga duración de 4000 mAh.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=60', '{"Formato": "75%", "Switches": "Gateron Brown Hot-swap", "Conexión": "Bluetooth 5.1 / Cable USB-C", "Batería": "4000mAh", "Compatibilidad": "Mac / Windows / Android / iOS"}', 30, FALSE, 'Classic'),

('logitech-g-pro-x-superlight', 'Logitech G Pro X Superlight 2', 'Gaming', 'gaming', 'Logitech', 149.00, 'El mouse gamer inalámbrico más ligero para e-sports, solo 60 gramos.', 'Diseñado en colaboración con los mejores profesionales del mundo de los e-sports, el G Pro X Superlight 2 pesa menos de 60 gramos y cuenta con un sensor HERO 2 de última generación, interruptores híbridos LIGHTFORCE y tecnología inalámbrica LIGHTSPEED.', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=60', '{"Peso": "60g", "Sensor": "HERO 2 (32,000 DPI)", "Tasa de sondeo": "2000Hz inalámbrico", "Autonomía": "Hasta 95 horas", "Conexión": "Inalámbrico LIGHTSPEED"}', 20, TRUE, 'E-sports'),

('playstation-5-slim', 'Sony PlayStation 5 Slim 1TB', 'Gaming', 'gaming', 'Sony', 499.00, 'Consola de videojuegos PS5 en su versión Slim más compacta.', 'La consola PS5 Slim ofrece un rendimiento gaming sin precedentes con un diseño elegante y compacto. Disfruta de una velocidad de carga ultrarrápida gracias a su disco de estado sólido (SSD) personalizado, inmersión mejorada con respuesta háptica y gatillos adaptativos.', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=60', '{"CPU": "AMD Zen 2 de 8 núcleos", "GPU": "AMD RDNA 2 con Ray Tracing", "Almacenamiento": "1TB SSD personalizado", "Resolución": "Hasta 4K 120Hz / 8K", "Mando": "DualSense incluido"}', 9, TRUE, 'Popular'),

('xiaomi-redmi-note-13-pro', 'Xiaomi Redmi Note 13 Pro+ 5G', 'Smartphones', 'movil', 'Xiaomi', 379.00, 'Smartphone de gama media-alta con cámara de 200MP y carga de 120W.', 'El Redmi Note 13 Pro+ 5G redefine la gama media con especificaciones insignia. Cuenta con una cámara de 200MP con OIS, una pantalla curva AMOLED de 120Hz resistente al agua y al polvo IP68, y una asombrosa carga rápida HyperCharge de 120W (cargador incluido).', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60', '{"Procesador": "MediaTek Dimensity 7200-Ultra", "Pantalla": "6.67\\" AMOLED 120Hz", "Cámara": "200MP + 8MP + 2MP", "Batería": "5000mAh", "Carga rápida": "120W (0 a 100% en 19 min)"}', 18, FALSE, 'Value King'),

('lenovo-ideapad-slim-3', 'Lenovo IdeaPad Slim 3 15"', 'Laptops', 'computadoras', 'Lenovo', 499.00, 'Notebook accesible y confiable con Ryzen 5 y pantalla de 15.6".', 'Perfecta para el estudio y el teletrabajo. La Lenovo IdeaPad Slim 3 cuenta con un procesador AMD Ryzen 5, 16GB de memoria RAM y almacenamiento SSD rápido para que puedas ejecutar todas tus tareas diarias sin contratiempos con un chasis ligero y robusto.', 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=600&auto=format&fit=crop&q=60', '{"Procesador": "AMD Ryzen 5 7520U", "Memoria": "16GB LPDDR5", "Almacenamiento": "512GB SSD PCIe NVMe", "Pantalla": "15.6\\" FHD IPS Antirreflejos", "Sistema Operativo": "Windows 11 Home"}', 15, FALSE, 'Oferta'),

('samsung-galaxy-tab-s9', 'Samsung Galaxy Tab S9 FE 128GB', 'Tablets', 'movil', 'Samsung', 449.00, 'Tablet premium para estudio y diseño con pantalla fluida y S-Pen.', 'Impulsa tu creatividad con la Galaxy Tab S9 FE. Disfruta de una pantalla de 10.9 pulgadas fluida con tasa de refresco adaptativa, chasis de aluminio resistente al agua IP68 y el emblemático lápiz S-Pen incluido de fábrica para dibujar y tomar notas.', 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&auto=format&fit=crop&q=60', '{"Procesador": "Exynos 1380", "Pantalla": "10.9\\" IPS LCD 90Hz", "Almacenamiento": "128GB (Expandible)", "Resistencia": "Certificación IP68", "S-Pen": "Incluido en caja"}', 11, FALSE, 'S-Pen Ready');
