import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Product, Customer, Order, OrderItem, ServiceRequest, Collection, MercadoPagoConfigData } from "../src/types.js";

// Load environment variables before doing anything else
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

// 14 Initial high-fidelity technological products for mobile repair, supplies, training & merch
const INITIAL_PRODUCTS: Omit<Product, "id">[] = [
  // HERRAMIENTAS
  {
    slug: "estacion-soldado-sugon-t26",
    name: "Estación de Soldado Sugon T26",
    category: "Herramientas",
    collection: "herramientas",
    brand: "Sugon",
    price: 299.99,
    short_description: "Estación de soldado de precisión para micro-electrónica celular.",
    description: "La Sugon T26 es una estación de soldado profesional diseñada específicamente para reparaciones de placas de celulares. Cuenta con control inteligente de temperatura, calentamiento ultra-rápido en tan solo 2 segundos y calibración digital precisa de temperatura.",
    image_url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Voltaje": "220V", "Rango de Temperatura": "200°C - 500°C", "Tiempo de Calentamiento": "2 segundos", "Puntas compatibles": "C210 de precisión", "Garantía": "12 meses" },
    stock: 8,
    featured: true,
    badge: "Laboratorio Pro",
    active: true
  },
  {
    slug: "microscopio-triocular-relife-rl-m3t",
    name: "Microscopio Triocular Relife RL-M3T",
    category: "Herramientas",
    collection: "herramientas",
    brand: "Relife",
    price: 450.00,
    short_description: "Microscopio estereofónico con zoom continuo 7X-45X para microsoldadura.",
    description: "Herramienta indispensable para el diagnóstico de placas lógicas, reballing y reparación de circuitos integrados. Cuenta con brazo articulado, luz LED regulable de alta intensidad y puerto triocular para conectar cámaras externas HDMI/USB.",
    image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Zoom": "7X a 45X continuo", "Distancia de Trabajo": "100mm", "Oculares": "WF10X/20mm", "Iluminador": "Luz LED regulable de 56 focos", "Puerto Cámara": "0.5X CTV adaptador" },
    stock: 4,
    featured: true,
    badge: "Esencial Placa",
    active: true
  },
  {
    slug: "kit-destornilladores-ifixit-pro",
    name: "Kit de Destornilladores iFixit Pro Tech",
    category: "Herramientas",
    collection: "herramientas",
    brand: "iFixit",
    price: 69.99,
    short_description: "El kit de herramientas de apertura y reparación más completo del mercado.",
    description: "Diseñado por técnicos de reparación, este kit incluye 64 puntas de destornillador de alta resistencia de 4mm, ventosa, púas de apertura, pinzas antiestáticas ESD y espátulas metálicas y de nylon para abrir smartphones sin dañarlos.",
    image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Puntas": "64 de precisión (Torx, Pentalobe, Tri-wing, etc.)", "Material Puntas": "Acero de alta resistencia S2", "Pinzas": "3x ESD antiestáticas", "Estuche": "Magnético con clasificador de tornillos", "Garantía": "De por vida" },
    stock: 25,
    featured: true,
    badge: "Best Seller",
    active: true
  },
  {
    slug: "manta-silicona-antiestatica-s160",
    name: "Manta de Silicona Antiestática S160",
    category: "Herramientas",
    collection: "herramientas",
    brand: "Dr Tecno",
    price: 24.99,
    short_description: "Manta magnética de silicona resistente a alta temperatura (500°C).",
    description: "Manta organizadora perfecta para laboratorios de servicio técnico. Posee áreas imantadas para evitar que se pierdan los tornillos milimétricos del celular, espacios numerados para clasificar partes y alta resistencia para soldar directo encima.",
    image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Dimensiones": "450mm x 300mm", "Material": "Silicona ecológica flexible", "Resistencia Térmica": "Hasta 500°C", "Secciones imantadas": "3 áreas activas", "Resistencia": "Antideslizante y antiestática" },
    stock: 45,
    featured: false,
    badge: "Organizador",
    active: true
  },
  {
    slug: "multimetro-digital-fluke-107",
    name: "Multímetro Digital de Bolsillo Fluke 107",
    category: "Herramientas",
    collection: "herramientas",
    brand: "Fluke",
    price: 135.00,
    short_description: "Multímetro de precisión para pruebas eléctricas de componentes y cortos.",
    description: "El Fluke 107 es un multímetro confiable y robusto ideal para medir voltajes en placas lógicas de celulares, testear continuidad en componentes SMD y buscar fugas de corriente o cortocircuitos que impiden el encendido.",
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Parámetros": "Tensión, Resistencia, Continuidad, Capacitancia", "Seguridad": "CAT III 600 V", "Pantalla": "Retroiluminada LCD", "Alimentación": "2x Pilas AAA", "Peso": "200g" },
    stock: 12,
    featured: false,
    badge: "Calidad Fluke",
    active: true
  },

  // INSUMOS
  {
    slug: "modulo-display-oled-iphone-13-pro",
    name: "Módulo de Pantalla OLED para iPhone 13 Pro",
    category: "Insumos",
    collection: "insumos",
    brand: "Apple OEM",
    price: 189.99,
    short_description: "Repuesto de pantalla OLED premium compatible con TrueTone.",
    description: "Módulo de pantalla completo de calidad original para iPhone 13 Pro. Ofrece la misma fidelidad de color, respuesta táctil de 120Hz fluida y compatibilidad perfecta para la reprogramación de TrueTone mediante herramientas de servicio técnico.",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Tecnología": "Super Retina XDR OLED", "Tasa de refresco": "120Hz ProMotion", "Brillo Máximo": "1000 nits", "Compatibilidad": "iPhone 13 Pro únicamente", "Calidad": "Original OEM" },
    stock: 15,
    featured: true,
    badge: "Premium OEM",
    active: true
  },
  {
    slug: "bateria-premium-samsung-s22-ultra",
    name: "Batería de Repuesto Premium Samsung S22 Ultra",
    category: "Insumos",
    collection: "insumos",
    brand: "Samsung OEM",
    price: 34.50,
    short_description: "Batería interna de litio de alta densidad 5000mAh para restauración.",
    description: "Batería de reemplazo de alta calidad para solucionar problemas de degradación, apagados súbitos o falta de autonomía en el Samsung Galaxy S22 Ultra. Cuenta con certificación de seguridad de carga y protección contra sobrecalentamiento.",
    image_url: "https://images.unsplash.com/photo-1584438784894-089d6a128f3e?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Capacidad": "5000 mAh", "Tensión": "3.85V", "Tecnología": "Polímero de Litio", "Ciclos de carga": "0 ciclos de uso", "Compatibilidad": "Samsung Galaxy S22 Ultra" },
    stock: 30,
    featured: false,
    badge: "0 Ciclos",
    active: true
  },
  {
    slug: "pegamento-pantallas-b7000-110ml",
    name: "Pegamento B-7000 Zhanlida 110ml",
    category: "Insumos",
    collection: "insumos",
    brand: "Zhanlida",
    price: 9.99,
    short_description: "Pegamento transparente elástico ideal para tapas traseras y pantallas.",
    description: "El adhesivo B-7000 es la herramienta estándar mundial en reparación de celulares. Es de secado medio, elástico y permite sellar y pegar de manera perfecta los marcos, pantallas LCD y tapas traseras de vidrio sin dejar manchas opacas.",
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Color": "Transparente", "Capacidad": "110ml", "Tiempo de curado inicial": "3-6 minutos", "Curado completo": "24-48 horas", "Boquilla": "Puntero metálico de precisión integrado" },
    stock: 120,
    featured: true,
    badge: "Insumo Líder",
    active: true
  },
  {
    slug: "estano-pasta-mechanic-183c",
    name: "Estaño en Pasta Mechanic 183°C (35g)",
    category: "Insumos",
    collection: "insumos",
    brand: "Mechanic",
    price: 14.99,
    short_description: "Aleación Sn63/Pb37 ideal para reballing de circuitos integrados.",
    description: "Pasta de estaño premium con punto de fusión exacto de 183°C. Perfecta para reconstrucción de esferas (reballing) utilizando plantillas stencil en chips de memoria, procesadores y circuitos lógicos de celulares Apple y Android.",
    image_url: "https://images.unsplash.com/photo-1581092162384-8987c1794ed9?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Aleación": "Sn63/Pb37 (Con plomo)", "Fusión": "183°C", "Peso": "35g", "Tamaño de partículas": "25-45um (Tipo 3)", "Conservación": "Requiere refrigeración (2°C - 10°C)" },
    stock: 50,
    featured: false,
    badge: "Soldadura Pro",
    active: true
  },

  // CAPACITACIONES
  {
    slug: "curso-reparacion-nivel-inicial",
    name: "Curso de Reparación de Celulares - Nivel Inicial",
    category: "Capacitaciones",
    collection: "capacitaciones",
    brand: "Dr Tecno",
    price: 150.00,
    short_description: "Aprende desde cero la estructura de hardware, ensamblado y cambio de módulos.",
    description: "Este curso práctico e interactivo está pensado para quienes no tienen experiencia previa. Aprenderás a desarmar y armar cualquier modelo de celular, técnicas seguras de apertura, reemplazo de puertos de carga básicos, cambio de pantallas, diagnóstico con multímetro y gestión de tu propio taller.",
    image_url: "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Nivel": "Inicial (Sin requisitos)", "Duración": "40 horas académicas", "Modalidad": "Híbrida (Prácticas en taller + Clases Online)", "Incluye": "Kit de herramientas básico + Certificación oficial Dr Tecno", "Salida Laboral": "Inmediata" },
    stock: 20,
    featured: true,
    badge: "Cupos Limitados",
    active: true
  },
  {
    slug: "curso-reparacion-nivel-intermedio",
    name: "Curso de Reparación de Celulares - Nivel Intermedio",
    category: "Capacitaciones",
    collection: "capacitaciones",
    brand: "Dr Tecno",
    price: 250.00,
    short_description: "Domina micro-soldadura, reconstrucción de pistas y lectura de esquemáticos.",
    description: "Paso siguiente en tu formación profesional. En este nivel profundizaremos en soldadura avanzada SMD con aire caliente y cautín, cambio de pines de carga tipo C y soldados, micrófonos digitales, lectura e interpretación de diagramas esquemáticos (ZXW/Schematics) para diagnosticar fallas de encendido comunes.",
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Nivel": "Intermedio (Requiere nivel inicial o conocimientos previos)", "Duración": "60 horas académicas", "Modalidad": "Presencial intensivo en laboratorios equipados", "Incluye": "Prácticas guiadas con placas reales + Licencia temporal de software esquemático", "Evaluación": "Práctica en vivo" },
    stock: 15,
    featured: true,
    badge: "Más Solicitado",
    active: true
  },
  {
    slug: "curso-reparacion-nivel-avanzado",
    name: "Curso de Reparación de Celulares - Nivel Avanzado",
    category: "Capacitaciones",
    collection: "capacitaciones",
    brand: "Dr Tecno",
    price: 399.00,
    short_description: "Especialización en micro-electrónica, reballing avanzado y reparación de placas.",
    description: "Conviértete en un cirujano de celulares. El nivel avanzado te entrena en el diagnóstico y solución de cortocircuitos complejos, reconstrucción de líneas de cobre microscópicas, extracción y reballing de Circuitos Integrados (ICs de carga, Wi-Fi, audio Tristar, etc.), micro-reconstrucción de pistas y bypass de seguridad de placas base.",
    image_url: "https://images.unsplash.com/photo-1631553127988-34863f640e74?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Nivel": "Avanzado profesional", "Duración": "80 horas académicas", "Modalidad": "100% presencial práctico en laboratorio individual con microscopio triocular", "Docentes": "Ingenieros electrónicos certificados", "Beneficio adicional": "Acceso al club de técnicos privado Dr Tecno" },
    stock: 10,
    featured: true,
    badge: "Especialización",
    active: true
  },

  // MERCHANDISING
  {
    slug: "remera-dr-tecno-lab-edition",
    name: "Remera Dr Tecno Lab Edition",
    category: "Merchandising",
    collection: "merchandising",
    brand: "Dr Tecno",
    price: 29.99,
    short_description: "Remera oficial 100% algodón peinado con diseño esquemático.",
    description: "Lleva la pasión por la electrónica con estilo. Esta remera premium presenta un estampado duradero en serigrafía con un diseño artístico del esquemático de un circuito integrado y la leyenda 'Keep Calm and Soldier On' de Dr Tecno.",
    image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Material": "100% Algodón peinado premium", "Estampado": "Serigrafía de alta duración al lavado", "Talles": "S, M, L, XL, XXL", "Corte": "Unisex regular fit", "Color": "Negro mate" },
    stock: 40,
    featured: false,
    badge: "Merch Oficial",
    active: true
  },
  {
    slug: "gorra-trucker-dr-tecno",
    name: "Gorra Trucker Dr Tecno Solder",
    category: "Merchandising",
    collection: "merchandising",
    brand: "Dr Tecno",
    price: 19.99,
    short_description: "Gorra estilo trucker regulable con el logo bordado oficial.",
    description: "Protegete en el taller con la gorra trucker oficial de Dr Tecno. Confeccionada con frente acolchado de espuma y red trasera transpirable de poliéster para mantenerte fresco durante las largas jornadas de reballing frente al microscopio.",
    image_url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Tipo": "Gorra Trucker regulable", "Material": "Algodón y red de poliéster", "Ajuste": "Hebilla plástica ajustable", "Bordado": "Logo 3D Dr Tecno", "Color": "Negro con detalles gris espacial" },
    stock: 35,
    featured: false,
    badge: "Estilo Técnico",
    active: true
  },
  {
    slug: "taza-ceramica-dr-tecno-ic",
    name: "Taza de Cerámica Dr Tecno",
    category: "Merchandising",
    collection: "merchandising",
    brand: "Dr Tecno",
    price: 14.99,
    short_description: "Taza de cerámica apta para microondas con diseño de circuito integrado.",
    description: "La taza ideal para acompañar tus mañanas y tardes de diagnóstico en el laboratorio. Fabricada en cerámica de alta calidad con un diseño impreso que imita las trazas de una placa madre moderna.",
    image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60",
    images: [],
    specifications: { "Material": "Cerámica esmaltada", "Capacidad": "350ml", "Apta Microondas": "Sí", "Apta Lavavajillas": "Sí", "Diseño": "Placa integrada y logo Dr Tecno" },
    stock: 60,
    featured: false,
    badge: "Accesorios",
    active: true
  }
];

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: "herramientas",
    name: "Herramientas de Precisión",
    subtitle: "Estaciones, Lupas & Soldadores",
    description: "Equipamiento profesional para laboratorios de microelectrónica. Desde estaciones de soldado de alta precisión hasta microscopios bi/trioculares, stencils, pinzas cerámicas y herramientas para la apertura segura de dispositivos.",
    bg_url: "/images/banner_herramientas.png",
    items_list: ["Estaciones de Soldado & Aire Caliente", "Microscopios de Laboratorio", "Herramientas de Apertura de Precisión", "Multímetros & Fuentes de Alimentación"]
  },
  {
    id: "insumos",
    name: "Insumos & Repuestos",
    subtitle: "Módulos, Baterías & Pegamentos",
    description: "Los mejores insumos para reparaciones exitosas. Contamos con módulos de repuesto certificados (pantallas OLED/LCD), baterías de alta capacidad con ciclo cero, pegamentos UV y B7000/T7000, flux de resina orgánica y aleaciones de estaño en pasta premium.",
    bg_url: "/images/banner_insumos.png",
    items_list: ["Módulos de Pantalla (Original / Premium)", "Baterías de Ciclo Cero", "Flux & Estaño en Pasta", "Adhesivos & Limpiadores de Placa"]
  },
  {
    id: "capacitaciones",
    name: "Capacitaciones Profesionales",
    subtitle: "Cursos Inicial, Intermedio y Avanzado",
    description: "Aprende el oficio con mayor demanda y rentabilidad. Ofrecemos cursos presenciales y online con laboratorios individuales equipados para que te conviertas en un experto, desde cambio de módulos hasta diagnóstico de placas complejas por microelectrónica.",
    bg_url: "/images/banner_capacitaciones.png",
    items_list: ["Curso de Reparación Nivel Inicial", "Curso de Reparación Nivel Intermedio", "Curso de Microelectrónica Avanzado", "Certificaciones Oficiales de Dr Tecno"]
  },
  {
    id: "merchandising",
    name: "Merchandising Dr Tecno",
    subtitle: "Remeras & Accesorios de Taller",
    description: "Lleva tu pasión por la electrónica y el taller con orgullo. Nuestra línea de indumentaria y accesorios oficiales de Dr Tecno está diseñada para técnicos entusiastas: remeras de algodón premium, gorras trucker y tazas de colección.",
    bg_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    items_list: ["Remera Oficial Lab Edition", "Gorra Trucker Dr Tecno", "Taza de Cerámica Integrated Circuit", "Accesorios & Stickers para tu taller"]
  }
];

export interface DbInterface {
  isSupabase: boolean;
  init(): Promise<void>;
  
  // Collections
  getCollections(): Promise<Collection[]>;
  getCollectionById(id: string): Promise<Collection | null>;
  updateCollection(id: string, data: Partial<Collection>): Promise<Collection>;
  createCollection(data: Omit<Collection, "id"> & { id?: string }): Promise<Collection>;
  deleteCollection(id: string): Promise<boolean>;

  // Products
  getProducts(filters?: {
    search?: string;
    category?: string;
    collection?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    sort?: string;
  }): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  createProduct(product: Omit<Product, "id">): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  getOrderByNumber(orderNumber: string): Promise<Order | null>;
  createOrder(order: Omit<Order, "id" | "order_number" | "created_at">, items: { product_id: string; quantity: number; unit_price: number }[]): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  updateCustomer(id: string, data: Partial<Customer>): Promise<Customer>;

  // Service Requests
  getServiceRequests(): Promise<ServiceRequest[]>;
  getServiceRequestByNumber(requestNumber: string): Promise<ServiceRequest | null>;
  createServiceRequest(request: Omit<ServiceRequest, "id" | "request_number" | "created_at" | "status">): Promise<ServiceRequest>;
  updateServiceRequest(id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest>;
  deleteServiceRequest(id: string): Promise<boolean>;
  
  // Auth
  verifyAdmin(username: string, passwordHash: string): Promise<boolean>;

  // Mercado Pago Configuration
  getMercadoPagoConfig(): Promise<MercadoPagoConfigData>;
  saveMercadoPagoConfig(config: { accessToken?: string; publicKey?: string; sandbox?: boolean }): Promise<MercadoPagoConfigData>;
}

// ==================== LOCAL JSON DATABASE FALLBACK ====================
class LocalJsonDb implements DbInterface {
  isSupabase = false;
  private filePath = path.resolve(process.cwd(), "db.json");
  private data: {
    products: Product[];
    collections: Collection[];
    customers: Customer[];
    orders: Order[];
    order_items: OrderItem[];
    service_requests: ServiceRequest[];
    admin_users: { id: string; username: string; password_hash: string; email: string }[];
    mercadopago_config?: MercadoPagoConfigData;
  } = {
    products: [],
    collections: [],
    customers: [],
    orders: [],
    order_items: [],
    service_requests: [],
    admin_users: [
      {
        id: "default-admin-uuid",
        username: "admin@dr-tecno.com.ar",
        // SHA-256 for 'Drtecno2026.'
        password_hash: "6f927a9644c350de2389b9e1383b18016b22fcc4e62e5aafdb8fba8baa6fafec",
        email: "admin@dr-tecno.com.ar"
      }
    ],
    mercadopago_config: {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
      publicKey: process.env.VITE_MERCADOPAGO_PUBLIC_KEY || "",
      sandbox: false,
      configured: !!process.env.MERCADOPAGO_ACCESS_TOKEN
    }
  };

  private write() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf8");
    } catch (err) {
      console.error("Error writing to local JSON db:", err);
    }
  }

  async init(): Promise<void> {
    if (fs.existsSync(this.filePath)) {
      try {
        const fileContent = fs.readFileSync(this.filePath, "utf8");
        this.data = JSON.parse(fileContent);
        // Ensure properties exist
        if (!this.data.products) this.data.products = [];
        if (!this.data.collections || this.data.collections.length === 0) {
          this.data.collections = [...INITIAL_COLLECTIONS];
        }
        if (!this.data.customers) this.data.customers = [];
        if (!this.data.orders) this.data.orders = [];
        if (!this.data.order_items) this.data.order_items = [];
        if (!this.data.service_requests) this.data.service_requests = [];
        
        const containsLegacy = this.data.products.some((p: any) => ["Gaming", "Laptops", "Smartphones", "Audio", "Tablets"].includes(p.category));
        if (containsLegacy) {
          console.log("Local JSON database contains legacy categories. Re-seeding with cell repair tools and courses...");
          this.data.orders = [];
          this.data.order_items = [];
          this.seedInitial();
        }

        if (!this.data.admin_users) {
          this.data.admin_users = [{
            id: "default-admin-uuid",
            username: "admin@dr-tecno.com.ar",
            password_hash: "6f927a9644c350de2389b9e1383b18016b22fcc4e62e5aafdb8fba8baa6fafec",
            email: "admin@dr-tecno.com.ar"
          }];
        }
      } catch (err) {
        console.error("Error reading local JSON db, starting fresh:", err);
        this.seedInitial();
      }
    } else {
      this.seedInitial();
    }
  }

  private seedInitial() {
    this.data.products = INITIAL_PRODUCTS.map((p, idx) => ({
      ...p,
      id: `prod-${idx + 1}`
    }));

    this.data.collections = [...INITIAL_COLLECTIONS];

    // Seed 2 sample customers
    this.data.customers = [
      {
        id: "cust-1",
        name: "Carlos Mendoza",
        email: "carlos@gmail.com",
        phone: "+54 11 5555 1234",
        address: "Av. Corrientes 1234",
        city: "CABA",
        state: "Buenos Aires",
        country: "Argentina",
        postal_code: "1043"
      },
      {
        id: "cust-2",
        name: "Sofía Rodríguez",
        email: "sofia.rod@yahoo.com",
        phone: "+54 341 444 9876",
        address: "Pellegrini 1500",
        city: "Rosario",
        state: "Santa Fe",
        country: "Argentina",
        postal_code: "2000"
      }
    ];

    // Seed 2 sample orders
    this.data.orders = [
      {
        id: "order-1",
        order_number: "ORD-98741",
        customer_id: "cust-1",
        customer_name: "Carlos Mendoza",
        customer_email: "carlos@gmail.com",
        customer_phone: "+54 11 5555 1234",
        shipping_address: "Av. Corrientes 1234",
        city: "CABA",
        state: "Buenos Aires",
        country: "Argentina",
        postal_code: "1043",
        delivery_method: "Envío Express",
        notes: "Por favor entregar después de las 14hs.",
        subtotal: 1399.99,
        total: 1399.99,
        status: "Despachado",
        items_count: 1,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        id: "order-2",
        order_number: "ORD-54129",
        customer_id: "cust-2",
        customer_name: "Sofía Rodríguez",
        customer_email: "sofia.rod@yahoo.com",
        customer_phone: "+54 341 444 9876",
        shipping_address: "Pellegrini 1500",
        city: "Rosario",
        state: "Santa Fe",
        country: "Argentina",
        postal_code: "2000",
        delivery_method: "Retiro en local",
        notes: "",
        subtotal: 399.00,
        total: 399.00,
        status: "En preparación",
        items_count: 1,
        created_at: new Date().toISOString()
      }
    ];

    // Seed order items
    this.data.order_items = [
      {
        id: "item-1",
        order_id: "order-1",
        product_id: "prod-3", // iPhone 15 Pro Max
        product_name: "iPhone 15 Pro Max 256GB",
        quantity: 1,
        unit_price: 1399.99,
        subtotal: 1399.99
      },
      {
        id: "item-2",
        order_id: "order-2",
        product_id: "prod-5", // Sony WH-1000XM5
        product_name: "Sony WH-1000XM5",
        quantity: 1,
        unit_price: 399.00,
        subtotal: 399.00
      }
    ];

    // Seed 2 sample service requests
    this.data.service_requests = [
      {
        id: "req-1",
        request_number: "TEC-84201",
        customer_name: "Andrés Gomez",
        phone: "+54 11 6666 4321",
        email: "andres.g@gmail.com",
        device_type: "Notebook",
        service_type: "Mantenimiento",
        brand: "Lenovo",
        model: "ThinkPad T490",
        problem_description: "La notebook calienta mucho y hace ruido el ventilador. Necesita limpieza y cambio de pasta térmica.",
        diagnosis: "Limpieza interna profunda y reemplazo de pasta térmica secada por Artic MX-4. Ventilador lubricado.",
        estimated_price: 65.00,
        internal_notes: "Listo para entregar. Se probó temperatura, bajó 15 grados en carga alta.",
        estimated_delivery_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        delivered_at: null,
        status: "Listo",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "req-2",
        request_number: "TEC-10594",
        customer_name: "Martina Paz",
        phone: "+54 11 3333 9988",
        email: "martina.paz@outlook.com",
        device_type: "Celular",
        service_type: "Reparación",
        brand: "Samsung",
        model: "Galaxy S21",
        problem_description: "Se cayó y se astilló la pantalla táctil. El display prende pero la mitad táctil no responde.",
        diagnosis: "Cambio de módulo de pantalla AMOLED original requerido.",
        estimated_price: 180.00,
        internal_notes: "Esperando confirmación del cliente para comprar el repuesto original.",
        estimated_delivery_date: null,
        delivered_at: null,
        status: "Esperando aprobación",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    this.write();
    console.log("Seeded default JSON database with 16 high-fidelity tech products!");
  }

  async getProducts(filters?: {
    search?: string;
    category?: string;
    collection?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    sort?: string;
  }): Promise<Product[]> {
    let result = [...this.data.products];

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.description && p.description.toLowerCase().includes(q))
        );
      }
      if (filters.category && filters.category !== "all" && filters.category !== "Todos") {
        const catLower = filters.category.toLowerCase();
        result = result.filter((p) => {
          const pCatLower = p.category.toLowerCase();
          if (catLower === "repuestos" || catLower === "insumos") {
            return pCatLower === "repuestos" || pCatLower === "insumos";
          }
          return pCatLower === catLower;
        });
      }
      if (filters.collection && filters.collection !== "all") {
        const colLower = filters.collection.toLowerCase();
        result = result.filter((p) => {
          const pColLower = (p.collection || "").toLowerCase();
          if (colLower === "repuestos" || colLower === "insumos") {
            return pColLower === "repuestos" || pColLower === "insumos" || p.category.toLowerCase() === "repuestos" || p.category.toLowerCase() === "insumos";
          }
          return pColLower === colLower;
        });
      }
      if (filters.minPrice !== undefined) {
        result = result.filter((p) => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        result = result.filter((p) => p.price <= filters.maxPrice!);
      }
      if (filters.featured !== undefined) {
        result = result.filter((p) => p.featured === filters.featured);
      }
      if (filters.sort) {
        if (filters.sort === "price_asc") {
          result.sort((a, b) => a.price - b.price);
        } else if (filters.sort === "price_desc") {
          result.sort((a, b) => b.price - a.price);
        } else if (filters.sort === "newest") {
          // Keep active order
        }
      }
    }

    return result;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const product = this.data.products.find((p) => p.slug === slug);
    return product || null;
  }

  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`
    };
    this.data.products.push(newProduct);
    this.write();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Producto no encontrado");
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...product,
      updated_at: new Date().toISOString()
    };
    this.write();
    return this.data.products[idx];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const originalLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length < originalLen) {
      this.write();
      return true;
    }
    return false;
  }

  async getOrders(): Promise<Order[]> {
    return this.data.orders.map(order => {
      const items = this.data.order_items.filter(item => item.order_id === order.id);
      return { ...order, items };
    });
  }

  async getOrderById(id: string): Promise<Order | null> {
    const order = this.data.orders.find((o) => o.id === id);
    if (!order) return null;
    const items = this.data.order_items.filter((item) => item.order_id === order.id);
    return { ...order, items };
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const order = this.data.orders.find((o) => o.order_number === orderNumber);
    if (!order) return null;
    const items = this.data.order_items.filter((item) => item.order_id === order.id);
    return { ...order, items };
  }

  async createOrder(
    order: Omit<Order, "id" | "order_number" | "created_at">,
    items: { product_id: string; quantity: number; unit_price: number }[]
  ): Promise<Order> {
    // 1. Check or Create customer
    let customer = this.data.customers.find((c) => c.email.toLowerCase() === order.customer_email.toLowerCase());
    if (!customer) {
      customer = {
        id: `cust-${Date.now()}`,
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        address: order.shipping_address,
        city: order.city,
        state: order.state,
        country: order.country,
        postal_code: order.postal_code,
        created_at: new Date().toISOString()
      };
      this.data.customers.push(customer);
    }

    const orderId = `order-${Date.now()}`;
    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: customer.id,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      shipping_address: order.shipping_address,
      city: order.city,
      state: order.state,
      country: order.country,
      postal_code: order.postal_code,
      delivery_method: order.delivery_method,
      notes: order.notes,
      subtotal: order.subtotal,
      total: order.total,
      status: "En preparación",
      items_count: items.reduce((acc, i) => acc + i.quantity, 0),
      created_at: new Date().toISOString()
    };

    // Create order items and adjust stocks
    const orderItems: OrderItem[] = [];
    for (const item of items) {
      const product = this.data.products.find((p) => p.id === item.product_id);
      if (product) {
        // Decrease stock
        product.stock = Math.max(0, product.stock - item.quantity);
      }
      const newItem: OrderItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        order_id: orderId,
        product_id: item.product_id,
        product_name: product ? product.name : "Producto Desconocido",
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.unit_price * item.quantity
      };
      orderItems.push(newItem);
      this.data.order_items.push(newItem);
    }

    this.data.orders.push(newOrder);
    this.write();

    return { ...newOrder, items: orderItems };
  }

  async updateOrderStatus(id: string, status: 'En preparación' | 'Probado' | 'Despachado' | 'Entregado' | 'Cancelado'): Promise<Order> {
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error("Pedido no encontrado");
    this.data.orders[idx] = {
      ...this.data.orders[idx],
      status,
      updated_at: new Date().toISOString()
    };
    this.write();
    return this.data.orders[idx];
  }

  async getCustomers(): Promise<Customer[]> {
    return this.data.customers;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const idx = this.data.customers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Cliente no encontrado");
    this.data.customers[idx] = {
      ...this.data.customers[idx],
      ...data
    };
    this.write();
    return this.data.customers[idx];
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    return this.data.service_requests;
  }

  async getServiceRequestByNumber(requestNumber: string): Promise<ServiceRequest | null> {
    const req = this.data.service_requests.find((r) => r.request_number === requestNumber);
    return req || null;
  }

  async createServiceRequest(request: Omit<ServiceRequest, "id" | "request_number" | "created_at" | "status">): Promise<ServiceRequest> {
    const reqNumber = `TEC-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRequest: ServiceRequest = {
      ...request,
      id: `req-${Date.now()}`,
      request_number: reqNumber,
      status: "Pendiente",
      created_at: new Date().toISOString()
    };
    this.data.service_requests.push(newRequest);
    this.write();
    return newRequest;
  }

  async updateServiceRequest(id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const idx = this.data.service_requests.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Solicitud no encontrada");
    this.data.service_requests[idx] = {
      ...this.data.service_requests[idx],
      ...data,
      updated_at: new Date().toISOString()
    } as ServiceRequest;
    this.write();
    return this.data.service_requests[idx];
  }

  async deleteServiceRequest(id: string): Promise<boolean> {
    const originalLen = this.data.service_requests.length;
    this.data.service_requests = this.data.service_requests.filter((r) => r.id !== id);
    if (this.data.service_requests.length < originalLen) {
      this.write();
      return true;
    }
    return false;
  }

  async getCollections(): Promise<Collection[]> {
    return this.data.collections || [];
  }

  async getCollectionById(id: string): Promise<Collection | null> {
    const col = (this.data.collections || []).find((c) => c.id === id);
    return col || null;
  }

  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection> {
    if (!this.data.collections) this.data.collections = [...INITIAL_COLLECTIONS];
    const idx = this.data.collections.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Colección no encontrada");
    
    const payload = { ...data };
    delete payload.id;
    delete (payload as any).created_at;
    delete (payload as any).updated_at;

    this.data.collections[idx] = {
      ...this.data.collections[idx],
      ...payload,
      updated_at: new Date().toISOString()
    } as Collection;
    this.write();
    return this.data.collections[idx];
  }

  async createCollection(data: Omit<Collection, "id"> & { id?: string }): Promise<Collection> {
    if (!this.data.collections) this.data.collections = [...INITIAL_COLLECTIONS];
    const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const existing = this.data.collections.find(c => c.id === id);
    if (existing) throw new Error("Ya existe una colección con ese ID");
    
    const newCol: Collection = {
      id,
      name: data.name,
      subtitle: data.subtitle || "",
      description: data.description || "",
      bg_url: data.bg_url || "",
      items_list: data.items_list || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.collections.push(newCol);
    this.write();
    return newCol;
  }

  async deleteCollection(id: string): Promise<boolean> {
    if (!this.data.collections) this.data.collections = [...INITIAL_COLLECTIONS];
    const idx = this.data.collections.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.collections.splice(idx, 1);
    this.write();
    return true;
  }

  async verifyAdmin(username: string, passwordHash: string): Promise<boolean> {
    const normalizedUser = username.toLowerCase().trim();
    const DEFAULT_USERNAMES = ["admin@dr-tecno.com.ar", "admin"];
    const DEFAULT_HASH = "6f927a9644c350de2389b9e1383b18016b22fcc4e62e5aafdb8fba8baa6fafec"; // SHA256 of Drtecno2026.

    if (DEFAULT_USERNAMES.includes(normalizedUser) && passwordHash === DEFAULT_HASH) {
      return true;
    }

    const admin = this.data.admin_users.find(
      (a) => a.username.toLowerCase() === normalizedUser && a.password_hash === passwordHash
    );
    return !!admin;
  }

  async getMercadoPagoConfig(): Promise<MercadoPagoConfigData> {
    const stored = this.data.mercadopago_config || {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
      publicKey: process.env.VITE_MERCADOPAGO_PUBLIC_KEY || "",
      sandbox: false,
      configured: !!process.env.MERCADOPAGO_ACCESS_TOKEN
    };
    const accessToken = stored.accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN || "";
    const publicKey = stored.publicKey || process.env.VITE_MERCADOPAGO_PUBLIC_KEY || "";
    const sandbox = stored.sandbox !== undefined ? stored.sandbox : false;
    return {
      accessToken,
      publicKey,
      sandbox,
      configured: !!accessToken,
      updated_at: stored.updated_at
    };
  }

  async saveMercadoPagoConfig(config: { accessToken?: string; publicKey?: string; sandbox?: boolean }): Promise<MercadoPagoConfigData> {
    const current = this.data.mercadopago_config || {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
      publicKey: process.env.VITE_MERCADOPAGO_PUBLIC_KEY || "",
      sandbox: false,
      configured: !!process.env.MERCADOPAGO_ACCESS_TOKEN
    };

    const accessToken = config.accessToken !== undefined ? config.accessToken.trim() : current.accessToken;
    const publicKey = config.publicKey !== undefined ? config.publicKey.trim() : current.publicKey;
    const sandbox = config.sandbox !== undefined ? Boolean(config.sandbox) : Boolean(current.sandbox);

    const updated: MercadoPagoConfigData = {
      accessToken,
      publicKey,
      sandbox,
      configured: !!accessToken,
      updated_at: new Date().toISOString()
    };

    this.data.mercadopago_config = updated;
    this.write();
    return updated;
  }
}

// ==================== SUPABASE DATABASE DRIVER ====================
const CATEGORY_MAP_TO_DB: Record<string, string> = {
  "Repuestos": "Repuestos",
  "Herramientas": "Herramientas",
  "Insumos": "Insumos",
  "Capacitaciones": "Capacitaciones",
  "Merchandising": "Merchandising"
};

const CATEGORY_MAP_TO_UI: Record<string, string> = {
  "Repuestos": "Repuestos",
  "Herramientas": "Herramientas",
  "Insumos": "Insumos",
  "Capacitaciones": "Capacitaciones",
  "Merchandising": "Merchandising"
};

const COLLECTION_MAP_TO_DB: Record<string, string> = {
  "herramientas": "gaming",
  "insumos": "computadoras",
  "capacitaciones": "movil",
  "merchandising": "audio"
};

const COLLECTION_MAP_TO_UI: Record<string, string> = {
  "gaming": "herramientas",
  "computadoras": "insumos",
  "movil": "capacitaciones",
  "audio": "merchandising"
};

class SupabaseDb implements DbInterface {
  isSupabase = true;
  private client: any;
  private fallbackCollections: Collection[] = [...INITIAL_COLLECTIONS];
  private localDb = new LocalJsonDb();

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                        process.env.SUPABASE_SECRET_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
                        process.env.SUPABASE_PUBLISHABLE_KEY || 
                        process.env.VITE_SUPABASE_ANON_KEY;
    if (url && serviceKey) {
      this.client = createClient(url, serviceKey);
    }
  }

  async getCollections(): Promise<Collection[]> {
    try {
      const { data, error } = await this.client.from("collections").select("*").order("name", { ascending: true });
      if (error) throw error;
      
      if (data && data.length === 0) {
        console.log("Supabase collections table is empty. Auto-seeding initial collections...");
        const formatted = INITIAL_COLLECTIONS.map(col => ({
          ...col,
          items_list: col.items_list || []
        }));
        const { error: seedErr } = await this.client.from("collections").insert(formatted);
        if (!seedErr) {
          return INITIAL_COLLECTIONS;
        }
      }

      return (data || []).map((col: any) => ({
        ...col,
        items_list: typeof col.items_list === "string" ? JSON.parse(col.items_list) : col.items_list
      }));
    } catch (err: any) {
      console.warn("⚠️ 'collections' table might not exist in Supabase, falling back to local memory collections:", err.message);
      return this.fallbackCollections;
    }
  }

  async getCollectionById(id: string): Promise<Collection | null> {
    try {
      const { data, error } = await this.client.from("collections").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        items_list: typeof data.items_list === "string" ? JSON.parse(data.items_list) : data.items_list
      };
    } catch (err: any) {
      console.warn("⚠️ 'collections' table fallback in getCollectionById:", err.message);
      const found = this.fallbackCollections.find(c => c.id === id);
      return found || null;
    }
  }

  async updateCollection(id: string, data: Partial<Collection>): Promise<Collection> {
    const payload = { ...data };
    delete payload.id;
    delete (payload as any).created_at;
    delete (payload as any).updated_at;

    if (payload.items_list) {
      payload.items_list = JSON.stringify(payload.items_list) as any;
    }

    try {
      const { data: updated, error } = await this.client
        .from("collections")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return {
        ...updated,
        items_list: typeof updated.items_list === "string" ? JSON.parse(updated.items_list) : updated.items_list
      };
    } catch (err: any) {
      console.warn("⚠️ 'collections' table update fallback:", err.message);
      const idx = this.fallbackCollections.findIndex(c => c.id === id);
      if (idx === -1) throw new Error("Colección no encontrada");
      this.fallbackCollections[idx] = {
        ...this.fallbackCollections[idx],
        ...data,
        updated_at: new Date().toISOString()
      } as Collection;
      return this.fallbackCollections[idx];
    }
  }

  async createCollection(data: Omit<Collection, "id"> & { id?: string }): Promise<Collection> {
    const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newCol: Collection = {
      id,
      name: data.name,
      subtitle: data.subtitle || "",
      description: data.description || "",
      bg_url: data.bg_url || "",
      items_list: data.items_list || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const payload = {
        ...newCol,
        items_list: JSON.stringify(newCol.items_list) as any
      };
      const { data: inserted, error } = await this.client
        .from("collections")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return {
        ...inserted,
        items_list: typeof inserted.items_list === "string" ? JSON.parse(inserted.items_list) : inserted.items_list
      };
    } catch (err: any) {
      console.warn("⚠️ 'collections' table insert fallback:", err.message);
      const existing = this.fallbackCollections.find(c => c.id === id);
      if (existing) throw new Error("Ya existe una colección con ese ID");
      this.fallbackCollections.push(newCol);
      return newCol;
    }
  }

  async deleteCollection(id: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from("collections")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.warn("⚠️ 'collections' table delete fallback:", err.message);
      const idx = this.fallbackCollections.findIndex(c => c.id === id);
      if (idx === -1) return false;
      this.fallbackCollections.splice(idx, 1);
      return true;
    }
  }

  async init(): Promise<void> {
    await this.localDb.init().catch(() => {});
    if (!this.client) {
      throw new Error("Supabase client is not configured");
    }
    
    try {
      // Test the connection by selecting 1 product limit 1
      const { data, error } = await this.client.from("products").select("id").limit(1);
      if (error) throw error;
      
      // If products table is empty, auto-seed it!
      const { count } = await this.client.from("products").select("id", { count: "exact", head: true });
      if (count === 0) {
        console.log("Supabase products table is empty. Auto-seeding initial products...");
        const formattedProducts = INITIAL_PRODUCTS.map(p => ({
          ...p,
          category: CATEGORY_MAP_TO_DB[p.category] || p.category,
          collection: p.collection ? (COLLECTION_MAP_TO_DB[p.collection] || p.collection) : null,
          images: p.images || [],
          specifications: p.specifications || {}
        }));
        const { error: seedError } = await this.client.from("products").insert(formattedProducts);
        if (seedError) console.error("Could not seed Supabase initial products:", seedError);
        else console.log(`Successfully seeded ${INITIAL_PRODUCTS.length} products to Supabase!`);
      }

      // Ensure default admin user exists if admin_users is empty
      try {
        const { count: adminCount, error: adminCountError } = await this.client.from("admin_users").select("id", { count: "exact", head: true });
        if (!adminCountError && (adminCount === 0 || adminCount === null)) {
          console.log("Supabase admin_users table is empty. Auto-seeding default admin...");
          const { error: adminSeedError } = await this.client.from("admin_users").insert({
            username: "admin@dr-tecno.com.ar",
            password_hash: "6f927a9644c350de2389b9e1383b18016b22fcc4e62e5aafdb8fba8baa6fafec",
            email: "admin@dr-tecno.com.ar"
          });
          if (adminSeedError) console.error("Could not seed Supabase default admin user:", adminSeedError);
          else console.log("Successfully seeded default admin user to Supabase!");
        }
      } catch (adminErr) {
        console.error("Failed to check/seed admin_users table in Supabase:", adminErr);
      }
    } catch (err: any) {
      console.warn("Supabase connectivity test failed, using local database fallback:", err.message);
      throw err;
    }
  }

  async getProducts(filters?: {
    search?: string;
    category?: string;
    collection?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    sort?: string;
  }): Promise<Product[]> {
    let query = this.client.from("products").select("*");

    if (filters) {
      if (filters.category && filters.category !== "all" && filters.category !== "Todos") {
        const catSearch = filters.category.trim();
        const dbCat = CATEGORY_MAP_TO_DB[catSearch] || catSearch;
        query = query.ilike("category", `%${dbCat}%`);
      }
      if (filters.collection && filters.collection !== "all") {
        const colKey = filters.collection.toLowerCase();
        if (colKey === "repuestos" || colKey === "insumos") {
          query = query.or("category.ilike.%Repuestos%,category.ilike.%Insumos%,collection.ilike.%repuestos%,collection.ilike.%insumos%");
        } else if (colKey === "herramientas") {
          query = query.or("category.ilike.%Herramientas%,collection.ilike.%herramientas%");
        } else if (colKey === "capacitaciones") {
          query = query.or("category.ilike.%Capacitaciones%,collection.ilike.%capacitaciones%");
        } else if (colKey === "merchandising") {
          query = query.or("category.ilike.%Merchandising%,collection.ilike.%merchandising%");
        } else {
          const dbCol = COLLECTION_MAP_TO_DB[filters.collection] || filters.collection;
          query = query.or(`collection.ilike.%${dbCol}%,category.ilike.%${filters.collection}%`);
        }
      }
      if (filters.featured !== undefined) {
        query = query.eq("featured", filters.featured);
      }
      if (filters.search && filters.search.trim()) {
        const term = filters.search.trim();
        query = query.or(`name.ilike.%${term}%,short_description.ilike.%${term}%,brand.ilike.%${term}%,category.ilike.%${term}%`);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching products from Supabase:", error);
      throw error;
    }

    let result = (data || []).map((p: any) => this.mapProduct(p));

    if (filters) {
      if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
        result = result.filter((p) => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
        result = result.filter((p) => p.price <= filters.maxPrice!);
      }
      if (filters.sort) {
        if (filters.sort === "price_asc") {
          result.sort((a, b) => a.price - b.price);
        } else if (filters.sort === "price_desc") {
          result.sort((a, b) => b.price - a.price);
        } else if (filters.sort === "newest") {
          result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        }
      }
    }

    return result;
  }

  private mapProduct(p: any): Product {
    const categoryUI = CATEGORY_MAP_TO_UI[p.category] || p.category;
    const collectionUI = p.collection ? (COLLECTION_MAP_TO_UI[p.collection] || p.collection) : p.collection;
    
    const rawPrice = p.price ? parseFloat(p.price) : 0;
    const minorista = p.price_minorista ? parseFloat(p.price_minorista) : 0;
    const mayorista = p.price_mayorista ? parseFloat(p.price_mayorista) : 0;
    const effectivePrice = rawPrice > 0 ? rawPrice : (minorista > 0 ? minorista : (mayorista > 0 ? mayorista : 0));

    return {
      ...p,
      category: categoryUI,
      collection: collectionUI,
      price: effectivePrice,
      price_minorista: minorista || effectivePrice,
      price_mayorista: mayorista || effectivePrice,
      images: typeof p.images === "string" ? JSON.parse(p.images) : p.images || [],
      specifications: typeof p.specifications === "string" ? JSON.parse(p.specifications) : p.specifications || {}
    };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await this.client.from("products").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data ? this.mapProduct(data) : null;
  }

  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    const dbCategory = CATEGORY_MAP_TO_DB[product.category] || product.category;
    const dbCollection = product.collection && product.collection !== "" 
      ? (COLLECTION_MAP_TO_DB[product.collection] || product.collection) 
      : null;
    
    const payload = {
      ...product,
      category: dbCategory,
      collection: dbCollection,
      images: product.images || [],
      specifications: product.specifications || {}
    };

    const { data, error } = await this.client
      .from("products")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return this.mapProduct(data);
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const payload: any = { ...product };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;

    if (product.category) {
      payload.category = CATEGORY_MAP_TO_DB[product.category] || product.category;
    }
    
    if (product.collection !== undefined) {
      payload.collection = product.collection && product.collection !== "" 
        ? (COLLECTION_MAP_TO_DB[product.collection] || product.collection) 
        : null;
    } else {
      delete payload.collection;
    }

    if (product.images) payload.images = product.images;
    if (product.specifications) payload.specifications = product.specifications;

    const { data, error } = await this.client
      .from("products")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return this.mapProduct(data);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await this.client.from("products").delete().eq("id", id);
    return !error;
  }

  async getOrders(): Promise<Order[]> {
    try {
      const { data: orders, error: oError } = await this.client.from("orders").select("*").order("created_at", { ascending: false });
      if (oError) {
        console.warn("Supabase getOrders warning:", oError.message);
        return [];
      }

      // Get all order items
      const { data: items } = await this.client.from("order_items").select("*");

      return (orders || []).map((order: any) => {
        const orderItems = (items || [])
          .filter((item: any) => item.order_id === order.id)
          .map((item: any) => ({ ...item, unit_price: parseFloat(item.unit_price || 0), subtotal: parseFloat(item.subtotal || 0) }));
        return {
          ...order,
          subtotal: parseFloat(order.subtotal || 0),
          total: parseFloat(order.total || 0),
          items: orderItems
        };
      });
    } catch (err) {
      console.warn("getOrders error:", err);
      return [];
    }
  }

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data: order, error } = await this.client.from("orders").select("*").eq("id", id).maybeSingle();
      if (!error && order) {
        const { data: items } = await this.client.from("order_items").select("*").eq("order_id", id);
        return {
          ...order,
          subtotal: parseFloat(order.subtotal || 0),
          total: parseFloat(order.total || 0),
          items: (items || []).map((i: any) => ({ ...i, unit_price: parseFloat(i.unit_price || 0), subtotal: parseFloat(i.subtotal || 0) }))
        };
      }
    } catch (err) {
      console.warn("Supabase getOrderById notice:", err);
    }
    return await this.localDb.getOrderById(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const { data: order, error } = await this.client.from("orders").select("*").eq("order_number", orderNumber).maybeSingle();
      if (!error && order) {
        const { data: items } = await this.client.from("order_items").select("*").eq("order_id", order.id);
        return {
          ...order,
          subtotal: parseFloat(order.subtotal || 0),
          total: parseFloat(order.total || 0),
          items: (items || []).map((i: any) => ({ ...i, unit_price: parseFloat(i.unit_price || 0), subtotal: parseFloat(i.subtotal || 0) }))
        };
      }
    } catch (err) {
      console.warn("Supabase getOrderByNumber notice:", err);
    }
    return await this.localDb.getOrderByNumber(orderNumber);
  }

  async createOrder(
    order: Omit<Order, "id" | "order_number" | "created_at">,
    items: { product_id: string; quantity: number; unit_price: number }[]
  ): Promise<Order> {
    try {
      // 1. Get or Create Customer (non-fatal if RLS/permissions block customer insert)
      let customerId: string | null = null;
      try {
        const { data: customer } = await this.client
          .from("customers")
          .select("id")
          .eq("email", order.customer_email)
          .maybeSingle();

        if (customer) {
          customerId = customer.id;
        } else {
          const { data: newCustomer } = await this.client
            .from("customers")
            .insert({
              email: order.customer_email,
              name: order.customer_name,
              phone: order.customer_phone,
              address: order.shipping_address,
              city: order.city,
              state: order.state,
              country: order.country,
              postal_code: order.postal_code
            })
            .select()
            .single();
          if (newCustomer) customerId = newCustomer.id;
        }
      } catch (custErr) {
        console.warn("Customer creation in Supabase bypassed:", custErr);
      }

      const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

      // 2. Create Order
      const { data: newOrder, error: oError } = await this.client
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_id: customerId,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          shipping_address: order.shipping_address,
          city: order.city,
          state: order.state,
          country: order.country,
          postal_code: order.postal_code,
          delivery_method: order.delivery_method,
          notes: order.notes,
          subtotal: order.subtotal,
          total: order.total,
          status: "En preparación",
          items_count: items.reduce((acc, i) => acc + i.quantity, 0)
        })
        .select()
        .single();

      if (oError) throw oError;

      // 3. Create items & reduce stocks
      const orderItemsToInsert: any[] = [];
      for (const item of items) {
        let prodName = "Producto Desconocido";
        try {
          const { data: prod } = await this.client.from("products").select("name,stock").eq("id", item.product_id).maybeSingle();
          if (prod) {
            prodName = prod.name;
            await this.client.from("products").update({ stock: Math.max(0, prod.stock - item.quantity) }).eq("id", item.product_id);
          }
        } catch (_) {}

        orderItemsToInsert.push({
          order_id: newOrder.id,
          product_id: item.product_id,
          product_name: prodName,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.unit_price * item.quantity
        });
      }

      let insertedItems: any[] = [];
      try {
        const { data } = await this.client
          .from("order_items")
          .insert(orderItemsToInsert)
          .select();
        if (data) insertedItems = data;
      } catch (_) {}

      return {
        ...newOrder,
        subtotal: parseFloat(newOrder.subtotal),
        total: parseFloat(newOrder.total),
        items: (insertedItems.length > 0 ? insertedItems : orderItemsToInsert).map((i: any) => ({ ...i, unit_price: parseFloat(i.unit_price), subtotal: parseFloat(i.subtotal) }))
      };
    } catch (err: any) {
      console.warn("⚠️ Supabase createOrder failed, falling back to local file db:", err?.message || err);
      return await this.localDb.createOrder(order, items);
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const { data, error } = await this.client
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return {
      ...data,
      subtotal: parseFloat(data.subtotal),
      total: parseFloat(data.total)
    };
  }

  private fallbackOrders: Order[] = [];
  private fallbackCustomers: Customer[] = [];
  private fallbackServiceRequests: ServiceRequest[] = [];

  async getCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await this.client.from("customers").select("*").order("created_at", { ascending: false });
      if (error) {
        console.warn("Supabase getCustomers warning:", error.message);
        return this.fallbackCustomers;
      }
      return data || [];
    } catch (err) {
      console.warn("getCustomers error:", err);
      return this.fallbackCustomers;
    }
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const payload = { ...data };
    delete payload.id;
    delete (payload as any).created_at;
    delete (payload as any).updated_at;
    try {
      const { data: updated, error } = await this.client.from("customers").update(payload).eq("id", id).select().single();
      if (!error && updated) return updated;
    } catch (err) {
      console.warn("updateCustomer Supabase error:", err);
    }
    const idx = this.fallbackCustomers.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.fallbackCustomers[idx] = { ...this.fallbackCustomers[idx], ...payload };
      return this.fallbackCustomers[idx];
    }
    const newCust = { id, ...payload, created_at: new Date().toISOString() } as Customer;
    this.fallbackCustomers.push(newCust);
    return newCust;
  }

  async getServiceRequests(): Promise<ServiceRequest[]> {
    try {
      const { data, error } = await this.client.from("service_requests").select("*").order("created_at", { ascending: false });
      if (error) {
        console.warn("Supabase getServiceRequests warning:", error.message);
        return this.fallbackServiceRequests;
      }
      return data || [];
    } catch (err) {
      console.warn("getServiceRequests error:", err);
      return this.fallbackServiceRequests;
    }
  }

  async getServiceRequestByNumber(requestNumber: string): Promise<ServiceRequest | null> {
    try {
      const { data, error } = await this.client.from("service_requests").select("*").eq("request_number", requestNumber).maybeSingle();
      if (!error && data) return data;
    } catch (err) {
      console.warn("getServiceRequestByNumber error:", err);
    }
    return this.fallbackServiceRequests.find(s => s.request_number === requestNumber) || null;
  }

  async createServiceRequest(request: Omit<ServiceRequest, "id" | "request_number" | "created_at" | "status">): Promise<ServiceRequest> {
    const reqNumber = `TEC-${Math.floor(10000 + Math.random() * 90000)}`;
    try {
      const { data, error } = await this.client
        .from("service_requests")
        .insert({
          ...request,
          request_number: reqNumber,
          status: "Pendiente"
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (dbError: any) {
      console.warn("Retrying database insert without customer_dni column:", dbError.message);
      const fallbackRequest = { ...request };
      if (fallbackRequest.customer_dni) {
        fallbackRequest.problem_description = `[DNI: ${fallbackRequest.customer_dni}] ${fallbackRequest.problem_description}`;
        delete fallbackRequest.customer_dni;
      }
      const { data, error } = await this.client
        .from("service_requests")
        .insert({
          ...fallbackRequest,
          request_number: reqNumber,
          status: "Pendiente"
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  async updateServiceRequest(id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const payload = { ...data };
    delete payload.id;
    delete (payload as any).created_at;
    delete (payload as any).updated_at;
    try {
      const { data: updated, error } = await this.client
        .from("service_requests")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    } catch (dbError: any) {
      console.warn("Retrying database update without customer_dni column:", dbError.message);
      delete payload.customer_dni;
      const { data: updated, error } = await this.client
        .from("service_requests")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    }
  }

  async deleteServiceRequest(id: string): Promise<boolean> {
    const { error } = await this.client.from("service_requests").delete().eq("id", id);
    return !error;
  }

  async verifyAdmin(username: string, passwordHash: string): Promise<boolean> {
    const normalizedUser = username.toLowerCase().trim();
    const DEFAULT_USERNAMES = ["admin@dr-tecno.com.ar", "admin"];
    const DEFAULT_HASH = "6f927a9644c350de2389b9e1383b18016b22fcc4e62e5aafdb8fba8baa6fafec"; // SHA256 of Drtecno2026.

    if (DEFAULT_USERNAMES.includes(normalizedUser) && passwordHash === DEFAULT_HASH) {
      return true;
    }

    try {
      const { data, error } = await this.client
        .from("admin_users")
        .select("id")
        .eq("username", username)
        .eq("password_hash", passwordHash)
        .maybeSingle();
      if (!error && data) return true;
    } catch (err) {
      console.warn("Supabase verifyAdmin query failed:", err);
    }
    return false;
  }

  async getMercadoPagoConfig(): Promise<MercadoPagoConfigData> {
    // 1. Try reading from dedicated mercadopago_config table in Supabase
    try {
      const { data, error } = await this.client
        .from("mercadopago_config")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const accessToken = data.access_token || "";
        const publicKey = data.public_key || "";
        const sandbox = !!data.sandbox;
        return {
          accessToken,
          publicKey,
          sandbox,
          configured: !!accessToken,
          updated_at: data.updated_at || data.created_at
        };
      }
    } catch (err) {
      console.warn("Supabase mercadopago_config table read notice:", err);
    }

    // 2. Try reading from store_settings or settings table in Supabase
    try {
      const { data, error } = await this.client
        .from("store_settings")
        .select("value, updated_at")
        .eq("key", "mercadopago")
        .maybeSingle();

      if (!error && data && data.value) {
        const val = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        const accessToken = val.accessToken || val.access_token || "";
        const publicKey = val.publicKey || val.public_key || "";
        return {
          accessToken,
          publicKey,
          sandbox: !!val.sandbox,
          configured: !!accessToken,
          updated_at: data.updated_at
        };
      }
    } catch (err) {
      // ignore
    }

    try {
      const { data, error } = await this.client
        .from("settings")
        .select("value, updated_at")
        .eq("key", "mercadopago")
        .maybeSingle();

      if (!error && data && data.value) {
        const val = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        const accessToken = val.accessToken || val.access_token || "";
        const publicKey = val.publicKey || val.public_key || "";
        return {
          accessToken,
          publicKey,
          sandbox: !!val.sandbox,
          configured: !!accessToken,
          updated_at: data.updated_at
        };
      }
    } catch (err) {
      // ignore
    }

    // 3. Fallback to Local JSON DB (persisted on disk in db.json)
    return await this.localDb.getMercadoPagoConfig();
  }

  async saveMercadoPagoConfig(config: { accessToken?: string; publicKey?: string; sandbox?: boolean }): Promise<MercadoPagoConfigData> {
    // 1. Always persist to local DB for guaranteed immediate disk backup
    const localResult = await this.localDb.saveMercadoPagoConfig(config);

    const accessToken = localResult.accessToken;
    const publicKey = localResult.publicKey;
    const sandbox = localResult.sandbox;
    const now = new Date().toISOString();

    // 2. Persist to Supabase mercadopago_config table
    let savedInSupabase = false;
    try {
      const { error } = await this.client
        .from("mercadopago_config")
        .upsert({
          id: "default",
          access_token: accessToken,
          public_key: publicKey,
          sandbox: sandbox ?? false,
          updated_at: now
        }, { onConflict: "id" });

      if (!error) {
        savedInSupabase = true;
        console.log("✅ Mercado Pago config successfully persisted in Supabase 'mercadopago_config' table");
      } else {
        console.warn("Notice: could not upsert to mercadopago_config in Supabase:", error.message);
      }
    } catch (err: any) {
      console.warn("Notice on mercadopago_config table write:", err?.message);
    }

    // 3. Also try backup upsert into store_settings table if needed
    try {
      const { error: setErr } = await this.client
        .from("store_settings")
        .upsert({
          id: "mercadopago",
          key: "mercadopago",
          value: {
            accessToken,
            publicKey,
            sandbox: sandbox ?? false
          },
          updated_at: now
        }, { onConflict: "id" });

      if (!setErr) {
        savedInSupabase = true;
      }
    } catch (err) {
      // ignore
    }

    return {
      accessToken,
      publicKey,
      sandbox,
      configured: !!accessToken,
      updated_at: now
    };
  }
}

// Instantiate and export active database service
export let db: DbInterface;

const initializeDatabase = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 
              process.env.SUPABASE_SECRET_KEY || 
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
              process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
              process.env.SUPABASE_PUBLISHABLE_KEY || 
              process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key && url !== "" && key !== "") {
    try {
      console.log("Attempting to connect to Supabase at:", url);
      const sdb = new SupabaseDb();
      await sdb.init();
      db = sdb;
      console.log("✅ Supabase integration active!");
      return;
    } catch (err: any) {
      console.error("❌ Failed to activate Supabase, falling back to local file db:", err.message);
    }
  } else {
    console.warn("⚠️ Supabase credentials missing from .env, falling back to local file db!");
  }

  const localDb = new LocalJsonDb();
  await localDb.init();
  db = localDb;
  console.log("✅ Local JSON Database active!");
};

// Start initialization immediately
initializeDatabase();
