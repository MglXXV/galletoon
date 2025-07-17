# GalleToon

GalleToon es una aplicación web de lectura de mangas basada en monedas virtuales (GalleCoins). Cada manga requiere canjear GalleCoins para continuar la lectura. Las monedas se recargan automáticamente con el tiempo o se pueden comprar para recargas instantáneas.

## 🏗️ Arquitectura del Proyecto

El proyecto utiliza **TypeScript Vanilla** con un **patrón de módulos** para una arquitectura limpia, mantenible y escalable.

### Estructura del Proyecto

```
galletoon/
├── server.ts                    # Servidor Fastify (TypeScript)
├── package.json                 # Dependencias y scripts
├── tsconfig.json               # Configuración TypeScript
├── docker-compose.yml          # Configuración Docker
├── public/                     # Archivos estáticos
│   ├── index.html              # Página principal (SPA)
│   ├── auth.html               # Página de autenticación (SPA)
│   ├── admin.html              # Panel de administración (SPA)
│   ├── gallecoins.html         # Sistema de GalleCoins (SPA)
│   ├── ts/                     # Módulos TypeScript
│   │   └── modules/
│   │       ├── BaseModule.ts           # Módulo base con funcionalidades comunes
│   │       ├── RouterModule.ts         # Navegación SPA
│   │       ├── AdminModule.ts          # Gestión de mangas y capítulos
│   │       ├── AuthModule.ts           # Autenticación y registro
│   │       ├── GalleCoinsModule.ts     # Sistema de monedas virtuales
│   │       └── AppModule.ts            # Orquestador principal
│   ├── view/                   # Vistas dinámicas
│   │   ├── home.html           # Contenido de la página de inicio
│   │   ├── manga.html          # Página del lector de manga
│   │   ├── profile.html        # Página de perfil
│   │   ├── 44.html            # Página de error
│   │   ├── auth/
│   │   │   ├── login-form.html # Formulario de inicio de sesión
│   │   │   └── register-form.html # Formulario de registro
│   │   ├── categories/
│   │   │   ├── category.html   # Página principal de categorías
│   │   │   ├── cards-manga-action.html    # Manga de acción
│   │   │   ├── cards-manga-adventure.html # Manga de aventura
│   │   │   ├── cards-manga-drama.html     # Manga de drama
│   │   │   ├── cards-manga-romance.html   # Manga de romance
│   │   │   └── cards-manga-sport.html     # Manga de deportes
│   │   └── admin/
│   │       ├── mangas-view.html    # Vista de gestión de mangas
│   │       ├── capitulos-view.html # Vista de gestión de capítulos
│   │       ├── modal-manga.html    # Modal para agregar/editar manga
│   │       └── modal-capitulo.html # Modal para agregar/editar capítulo
│   └── assets/                 # Recursos estáticos
│       └── Hero.jpg            # Imagen de hero
└── docs/                       # Documentación
    └── MODULE_PATTERN_IMPLEMENTATION.md
```

## 🧩 Sistema de Módulos TypeScript

### Módulos Implementados

| Módulo | Propósito | Características |
|--------|-----------|-----------------|
| **BaseModule** | Funcionalidades comunes | Event listeners, notificaciones, formularios, utilidades |
| **RouterModule** | Navegación SPA | Enrutamiento, carga dinámica, historial del navegador |
| **AdminModule** | Panel de administración | CRUD de mangas y capítulos, modales, validación |
| **AuthModule** | Autenticación | Login, registro, validación, gestión de sesiones |
| **GalleCoinsModule** | Sistema de monedas | Balance, transacciones, historial, compras |
| **AppModule** | Orquestador principal | Inicialización, gestión de módulos, errores globales |

### Ventajas de la Arquitectura Modular

✅ **Separación de responsabilidades** - Cada módulo tiene una función específica
✅ **Reutilización de código** - BaseModule proporciona funcionalidades comunes
✅ **Mantenibilidad** - Código organizado y fácil de mantener
✅ **Escalabilidad** - Fácil agregar nuevos módulos
✅ **TypeScript** - Tipado estático para mayor robustez
✅ **Testing** - Módulos pueden probarse independientemente

## 🚀 Características Principales

### 1. Single Page Application (SPA)
- Navegación sin recarga de página
- Carga dinámica de contenido
- Soporte para historial del navegador
- Estados de carga visuales

###2 Sistema de Autenticación
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
- **Stripe** - Integración de pagos (preparado)

### Herramientas de Desarrollo
- **pnpm** - Gestor de paquetes rápido
- **tsx** - Ejecutor de TypeScript
- **Docker** - Containerización (opcional)

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
| `/categorias/*` | Categorías específicas | Mangas por categoría |

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (v18o superior)
- pnpm (recomendado) o npm

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd galletoon

# Instalar dependencias
pnpm install

# Iniciar el servidor de desarrollo
pnpm dev
```

### Estructura de Comandos
```bash
pnpm dev          # Iniciar servidor de desarrollo con hot reload
pnpm build        # Construir TypeScript para producción
pnpm start        # Iniciar servidor de producción
```

### Acceso a la Aplicación
- **Desarrollo**: http://localhost:30
- **Producción**: Configurar según el entorno

## 📚 Documentación

- **MODULE_PATTERN_IMPLEMENTATION.md** - Guía completa del patrón de módulos
- **README.md** - Este archivo con información general

## 🔧 Desarrollo

### Agregar Nuevo Módulo TypeScript
```typescript
// Crear nuevo módulo
class CustomModule extends BaseModule [object Object]private customData: string[] = ;

  constructor() {
    super();
  }

  protected onInit(): void {
    // Inicialización específica
  }

  public customMethod(): void {
    // Método específico del módulo
  }
}

// Agregar a la aplicación
appModule.addModule('custom', new CustomModule());
```

### Acceso a Módulos
```typescript
// Acceder a un módulo específico
const router = appModule.getModule('router) as RouterModule;
const admin = appModule.getModule('admin') as AdminModule;

// Ejecutar método en todos los módulos
appModule.executeOnAllModules('showNotification', 'Mensaje',success');
```

## 🐳 Docker (Opcional)

```bash
# Construir imagen
docker-compose build

# Ejecutar con Docker
docker-compose up
```

## 🤝 Contribución

1. Fork el proyecto2rear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -mAdd some AmazingFeature'`)4 Push a la rama (`git push origin feature/AmazingFeature`)
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