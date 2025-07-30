# GalleToon 🎭

GalleToon es una aplicación web moderna de lectura de mangas basada en monedas virtuales (GalleCoins). Cada manga requiere canjear GalleCoins para continuar la lectura. Las monedas se recargan automáticamente con el tiempo o se pueden comprar para recargas instantáneas.

## 🏗️ Arquitectura del Proyecto

El proyecto utiliza **TypeScript** con **Fastify** como servidor backend y una **arquitectura modular** para una estructura limpia, mantenible y escalable.

### Estructura del Proyecto

```
galletoon/
├── server.ts                    # Servidor Fastify (TypeScript)
├── package.json                 # Dependencias y scripts
├── tsconfig.json               # Configuración TypeScript
├── docker-compose.yml          # Configuración Docker
├── .env                        # Variables de entorno
├── mongoSchema/                # Esquemas de MongoDB
│   ├── database.ts             # Conexión a MongoDB
│   ├── user/                   # Esquemas de usuario
│   │   ├── userSchema.ts       # Esquema de usuario
│   │   ├── gallecoinsSchema.ts # Esquema de GalleCoins
│   │   └── librarySchema.ts    # Esquema de biblioteca
│   ├── manga/                  # Esquemas de manga
│   │   ├── mangaSchema.ts      # Esquema de manga
│   │   ├── chapterSchema.ts    # Esquema de capítulos
│   │   └── categorySchema.ts   # Esquema de categorías
│   └── stripe/                 # Esquemas de pagos
│       ├── buyChaptersSchema.ts # Compras de capítulos
│       └── buyGallecoinsSchema.ts # Compras de GalleCoins
├── public/                     # Archivos estáticos
│   ├── index.html              # Página principal
│   ├── auth.html               # Página de autenticación
│   ├── admin.html              # Panel de administración
│   ├── gallecoins.html         # Sistema de GalleCoins
│   ├── profile.html            # Página de perfil
│   ├── category.html           # Página de categorías
│   ├── success.html            # Página de éxito de pago
│   ├── cancel.html             # Página de cancelación de pago
│   ├── js/                     # Scripts JavaScript
│   │   ├── index.js            # Script principal
│   │   ├── admin.js            # Script de administración
│   │   ├── auth.js             # Script de autenticación
│   │   ├── category.js         # Script de categorías
│   │   └── gallecoins.js       # Script de GalleCoins
│   └── utils.css               # Estilos globales
└── data/                       # Datos de MongoDB (Docker)
```

## 🚀 Características Principales

### 1. Sistema de Autenticación
- Login y registro de usuarios
- Validación de formularios
- Gestión de sesiones con JWT
- Protección de rutas
- Middleware de autenticación para usuarios y administradores

### 2. Panel de Administración
- Gestión completa de mangas (CRUD)
- Gestión de capítulos por manga
- Interfaz intuitiva con modales
- Validación de datos
- Subida de archivos PDF
- Conversión automática de PDF a imágenes

### 3. Sistema de GalleCoins
- Balance de monedas virtuales
- Historial de transacciones
- Compra de paquetes de monedas
- Estadísticas de uso
- Integración con Stripe para pagos

### 4. Lector de Manga
- Visualización de capítulos
- Sistema de paginación
- Interfaz responsive
- Integración con GalleCoins
- Conversión de PDF a imágenes

### 5. Base de Datos MongoDB
- Esquemas bien definidos
- Relaciones entre entidades
- Integración con Stripe para pagos
- Persistencia de datos
- Sesiones de usuario

### 6. Sistema de Pagos
- Integración completa con Stripe
- Procesamiento de pagos seguros
- Páginas de éxito y cancelación
- Historial de transacciones

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Fastify** - Framework web rápido y eficiente
- **TypeScript** - Tipado estático en el servidor
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Stripe** - Integración de pagos
- **JWT** - Autenticación con tokens
- **bcrypt** - Encriptación de contraseñas
- **multer** - Manejo de archivos
- **pdf-lib** - Procesamiento de PDFs

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos
- **JavaScript ES6+** - Funcionalidad del cliente
- **Font Awesome** - Iconografía

### Herramientas de Desarrollo
- **pnpm** - Gestor de paquetes rápido
- **tsx** - Ejecutor de TypeScript
- **Docker** - Containerización con MongoDB
- **Mongo Express** - Interfaz web para MongoDB

## 📋 Rutas Configuradas

### Rutas del Servidor
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/` | GET | Página principal |
| `/auth` | GET | Página de autenticación |
| `/admin` | GET | Panel de administración |
| `/gallecoins` | GET | Sistema de GalleCoins |
| `/profile` | GET | Página de perfil |
| `/category` | GET | Página de categorías |
| `/success` | GET | Página de éxito de pago |
| `/cancel` | GET | Página de cancelación |

### APIs del Servidor
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/auth/login` | POST | Login de usuario |
| `/api/auth/register` | POST | Registro de usuario |
| `/api/auth/logout` | POST | Cerrar sesión |
| `/api/manga` | GET | Listar mangas |
| `/api/manga/:id` | GET | Obtener manga específico |
| `/api/manga` | POST | Crear manga (admin) |
| `/api/manga/:id` | PUT | Actualizar manga (admin) |
| `/api/manga/:id` | DELETE | Eliminar manga (admin) |
| `/api/chapters` | GET | Listar capítulos |
| `/api/chapters/:mangaId` | GET | Capítulos de un manga |
| `/api/chapters` | POST | Crear capítulo (admin) |
| `/api/gallecoins/balance` | GET | Obtener balance |
| `/api/gallecoins/history` | GET | Historial de transacciones |
| `/api/stripe/create-payment-intent` | POST | Crear intención de pago |

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (v18 o superior)
- pnpm (recomendado) o npm
- Docker (para MongoDB)

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd galletoon

# Instalar dependencias
pnpm install

# Crear archivo .env
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar MongoDB con Docker
docker-compose up -d

# Iniciar el servidor de desarrollo
pnpm dev
```

### Variables de Entorno (.env)
```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/galletoon
MONGO_ROOT_USERNAME=root
MONGO_ROOT_PASSWORD=example

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
SESSION_KEY=your_session_secret_key_here
```

### Comandos Disponibles
```bash
pnpm dev          # Iniciar servidor de desarrollo con hot reload
```

### Acceso a la Aplicación
- **Desarrollo**: http://localhost:3000
- **Mongo Express**: http://localhost:8081
- **Producción**: Configurar según el entorno

## 🐳 Docker

### Servicios Disponibles
- **MongoDB**: Base de datos principal
- **Mongo Express**: Interfaz web para MongoDB

### Comandos Docker
```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs

# Parar servicios
docker-compose down

# Reiniciar servicios
docker-compose restart
```

## 🔧 Funcionalidades del Servidor

### Autenticación y Autorización
- Middleware `requireAuth` para rutas protegidas
- Middleware `requireAdmin` para rutas de administración
- Gestión de sesiones con cookies
- Tokens JWT para autenticación

### Gestión de Archivos
- Subida de archivos PDF
- Conversión automática de PDF a imágenes
- Almacenamiento de archivos en el servidor
- Validación de tipos de archivo

### Procesamiento de PDFs
- Extracción de páginas de PDF
- Conversión a formato de imagen
- Optimización de imágenes
- Manejo de errores en conversión

### Integración con Stripe
- Creación de intenciones de pago
- Procesamiento de pagos seguros
- Manejo de webhooks
- Historial de transacciones

## 📚 Documentación

- **README.md** - Este archivo con información general
- **server.ts** - Documentación inline del servidor
- **mongoSchema/** - Esquemas de base de datos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `package.json` para más detalles.

## 👥 Autores

- **Johan** - *Desarrollo Front End* - [Vellojiin]
- **Michael Gay** - *Desarrollo Back End* - [MglXXV]

## 🙏 Agradecimientos

- Fastify por el servidor web
- TypeScript por el sistema de tipos
- MongoDB por la base de datos
- Stripe por la integración de pagos
- Docker por la containerización
- Font Awesome por los iconos

## 🎯 Estado del Proyecto

### ✅ Completado
- [x] Servidor Fastify con TypeScript
- [x] Configuración de MongoDB con Docker
- [x] Sistema de autenticación completo
- [x] Panel de administración funcional
- [x] Sistema de GalleCoins
- [x] Integración con Stripe
- [x] Gestión de archivos PDF
- [x] Conversión de PDF a imágenes
- [x] Interfaz de usuario moderna
- [x] Sistema de sesiones

### 🚧 En Desarrollo
- [ ] Optimización de rendimiento
- [ ] Tests unitarios
- [ ] Documentación API completa
- [ ] Sistema de caché
- [ ] Analytics y métricas

### 📋 Pendiente
- [ ] Despliegue en producción
- [ ] Sistema de notificaciones
- [ ] Lector de manga avanzado
- [ ] Sistema de búsqueda
- [ ] Filtros avanzados
- [ ] Sistema de favoritos
- [ ] Recomendaciones personalizadas

## 🔍 Características Técnicas

### Seguridad
- Encriptación de contraseñas con bcrypt
- Tokens JWT para autenticación
- Validación de sesiones
- Protección CSRF
- Sanitización de datos

### Rendimiento
- Servidor Fastify optimizado
- Conexiones de base de datos eficientes
- Procesamiento asíncrono de archivos
- Compresión de respuestas

### Escalabilidad
- Arquitectura modular
- Separación de responsabilidades
- Base de datos NoSQL escalable
- Containerización con Docker