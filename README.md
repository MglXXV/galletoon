# GalleToon 🎭

GalleToon es una aplicación web moderna de lectura de mangas basada en monedas virtuales (GalleCoins). Cada manga requiere canjear GalleCoins para continuar la lectura. Las monedas se recargan automáticamente con el tiempo o se pueden comprar para recargas instantáneas.

## 🏗️ Arquitectura del Proyecto

El proyecto utiliza **TypeScript Vanilla** con una **arquitectura modular avanzada** para una estructura limpia, mantenible y escalable.

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
│   ├── index.html              # Página principal (SPA)
│   ├── auth.html               # Página de autenticación (SPA)
│   ├── admin.html              # Panel de administración (SPA)
│   ├── gallecoins.html         # Sistema de GalleCoins (SPA)
│   ├── profile.html            # Página de perfil
│   ├── category.html           # Página principal de categorías
│   ├── categories/             # Páginas de categorías individuales
│   │   ├── category-action.html
│   │   ├── category-adventure.html
│   │   ├── category-drama.html
│   │   ├── category-romance.html
│   │   ├── category-horror.html
│   │   └── category-sport.html
│   ├── js/                     # Scripts JavaScript
│   │   ├── admin.js
│   │   ├── auth.js
│   │   └── category.js
│   └── utils.css               # Estilos globales
└── data/                       # Datos de MongoDB (Docker)
```

## 🧩 Sistema de Módulos TypeScript Avanzado

### Arquitectura Modular Implementada

El proyecto utiliza un **sistema de módulos singleton** con las siguientes características:

| Módulo | Propósito | Características |
|--------|-----------|-----------------|
| **ConfigModule** | Configuración global | Variables de entorno, configuración de la app |
| **StateModule** | Estado global | Gestión de estado con suscripciones |
| **AuthModule** | Autenticación | Login, registro, gestión de usuarios |
| **MangaModule** | Gestión de mangas | CRUD de mangas y capítulos |
| **GallecoinsModule** | Sistema de monedas | Balance, transacciones, compras |
| **NavigationModule** | Navegación | Rutas, historial, navegación SPA |
| **UtilsModule** | Utilidades | Formateo, debounce, throttle |
| **ApiModule** | Cliente HTTP | Requests, manejo de errores |

### Ventajas de la Nueva Arquitectura

✅ **Patrón Singleton** - Instancia única por módulo
✅ **Separación de responsabilidades** - Cada módulo tiene función específica
✅ **Sistema de eventos** - StateModule con suscripciones
✅ **TypeScript completo** - Tipado estático en toda la aplicación
✅ **Manejo de errores** - Try-catch en operaciones críticas
✅ **Inicialización automática** - Se inicializa al cargar el DOM
✅ **Limpieza de recursos** - Método destroy para cleanup

## 🚀 Características Principales

### 1. Single Page Application (SPA)
- Navegación sin recarga de página
- Carga dinámica de contenido
- Soporte para historial del navegador
- Estados de carga visuales

### 2. Sistema de Autenticación
- Login y registro de usuarios
- Validación de formularios
- Gestión de sesiones
- Protección de rutas

### 3. Panel de Administración
- Gestión completa de mangas (CRUD)
- Gestión de capítulos por manga
- Interfaz intuitiva con modales
- Validación de datos

### 4. Sistema de GalleCoins
- Balance de monedas virtuales
- Historial de transacciones
- Compra de paquetes de monedas
- Estadísticas de uso

### 5. Lector de Manga
- Visualización de capítulos
- Sistema de paginación
- Interfaz responsive
- Integración con GalleCoins

### 6. Base de Datos MongoDB
- Esquemas bien definidos
- Relaciones entre entidades
- Integración con Stripe para pagos
- Persistencia de datos

## 🛠️ Tecnologías Utilizadas

### Frontend
- **TypeScript** - Lenguaje principal con tipado estático
- **HTML5** - Estructura semántica
- **Tailwind CSS** - Framework de estilos utility-first
- **Font Awesome** - Iconografía
- **ES6+ Modules** - Sistema de módulos nativo

### Backend
- **Node.js** - Runtime de JavaScript
- **Fastify** - Framework web rápido y eficiente
- **TypeScript** - Tipado estático en el servidor
- **MongoDB** - Base de datos NoSQL
- **Stripe** - Integración de pagos (preparado)

### Herramientas de Desarrollo
- **pnpm** - Gestor de paquetes rápido
- **tsx** - Ejecutor de TypeScript
- **Docker** - Containerización con MongoDB
- **Mongo Express** - Interfaz web para MongoDB

## 📋 Rutas Configuradas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Principal | Página de inicio con navegación SPA |
| `/auth` | Autenticación | Login y registro independiente |
| `/admin` | Administración | Panel de gestión de mangas |
| `/gallecoins` | GalleCoins | Sistema de monedas virtuales |
| `/home` | Inicio | Página principal del sitio |
| `/login` | Login | Formulario de inicio de sesión |
| `/register` | Registro | Formulario de registro |
| `/profile` | Perfil | Página de perfil de usuario |
| `/manga` | Lector | Lector de manga |
| `/categorias` | Categorías | Lista de categorías |
| `/categorias/category-action` | Categoría Acción | Mangas de acción |
| `/categorias/category-adventure` | Categoría Aventura | Mangas de aventura |
| `/categorias/category-drama` | Categoría Drama | Mangas de drama |
| `/categorias/category-romance` | Categoría Romance | Mangas de romance |
| `/categorias/category-horror` | Categoría Terror | Mangas de terror |
| `/categorias/category-sport` | Categoría Deportes | Mangas de deportes |

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
```

### Estructura de Comandos
```bash
pnpm dev          # Iniciar servidor de desarrollo con hot reload
pnpm build        # Construir TypeScript para producción
pnpm start        # Iniciar servidor de producción
```

### Acceso a la Aplicación
- **Desarrollo**: http://localhost:3000
- **Mongo Express**: http://localhost:8081
- **Producción**: Configurar según el entorno

## 🧩 Uso de Módulos

### Importar la Aplicación
```typescript
import { app } from './modules/app';

// Usar módulos específicos
const mangaList = await app.manga.getMangaList();
const userBalance = await app.gallecoins.getBalance();
app.navigation.navigateTo('/manga/123');
```

### Acceso Directo a Módulos
```typescript
import { AuthModule, MangaModule, GallecoinsModule } from './modules/app';

const auth = AuthModule.getInstance();
const manga = MangaModule.getInstance();
const gallecoins = GallecoinsModule.getInstance();
```

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

## 🔧 Desarrollo

### Agregar Nuevo Módulo
```typescript
class CustomModule {
  private static instance: CustomModule;
  
  static getInstance(): CustomModule {
    if (!CustomModule.instance) {
      CustomModule.instance = new CustomModule();
    }
    return CustomModule.instance;
  }
  
  // Métodos del módulo
}
```

### Implementar Métodos
```typescript
// En cualquier módulo
async customMethod(): Promise<void> {
  // TODO: Implementar lógica específica
  throw new Error('Método no implementado');
}
```

## 📚 Documentación

- **README.md** - Este archivo con información general
- **app.ts** - Documentación inline de la arquitectura modular

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Johan** - *Desarrollo inicial* - [TuUsuario]

## 🙏 Agradecimientos

- Tailwind CSS por el framework de estilos
- Font Awesome por los iconos
- Fastify por el servidor web
- TypeScript por el sistema de tipos
- MongoDB por la base de datos
- Docker por la containerización

## 🎯 Estado del Proyecto

### ✅ Completado
- [x] Arquitectura modular TypeScript
- [x] Configuración de MongoDB con Docker
- [x] Sistema de autenticación básico
- [x] Panel de administración
- [x] Sistema de GalleCoins
- [x] Interfaz de usuario moderna
- [x] Navegación SPA

### 🚧 En Desarrollo
- [ ] Integración completa con Stripe
- [ ] Sistema de pagos
- [ ] Lector de manga avanzado
- [ ] Sistema de notificaciones
- [ ] Optimización de rendimiento

### 📋 Pendiente
- [ ] Tests unitarios
- [ ] Documentación API
- [ ] Despliegue en producción
- [ ] Sistema de caché
- [ ] Analytics y métricas