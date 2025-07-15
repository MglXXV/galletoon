# galletoon

Galletoon es una pagina de lectura de mangas en base a monedas (Gallecoins), cada manga necesita canjear gallecoins para seguir la lectura, estas gallecoins se recargan en un cierto tiempo o se pueden pagar para tener una recarga de monedas al instante.

## Estructura del Proyecto

```
public/
├── index.html              # Página principal
├── auth.html               # Página de autenticación
├── admin.html              # Página de administración
├── profile.html            # Página de perfil
├── gallecoins.html         # Página de GalleCoins
├── js/
│   └── router.ts           # Sistema de routing principal
└── view/
    ├── home.html           # Contenido de la página de inicio
    ├── manga.html          # Página del lector de manga
    ├── auth/
    │   ├── login-form.html # Formulario de inicio de sesión
    │   └── register-form.html # Formulario de registro
    └── categories/
        ├── category.html   # Página principal de categorías
        ├── cards-manga-action.html    # Manga de acción
        ├── cards-manga-adventure.html # Manga de aventura
        ├── cards-manga-drama.html     # Manga de drama
        ├── cards-manga-romance.html   # Manga de romance
        └── cards-manga-sport.html     # Manga de deportes
```

## Sistema de Routing

### Características Principales

1. **SPA (Single Page Application)**: La aplicación no recarga la página al navegar
2. **Historial del navegador**: Soporte para botones atrás/adelante
3. **Carga dinámica de contenido**: Los componentes se cargan según la ruta
4. **Manejo de errores**: Páginas de error personalizadas
5. **Navegación programática**: API para cambiar rutas desde JavaScript

### Rutas Configuradas

| Ruta                    | Componente              | Descripción                    |
| ----------------------- | ----------------------- | ------------------------------ |
| `/`                     | `home`                  | Página de inicio               |
| `/auth`                 | `auth`                  | Página de autenticación        |
| `/login`                | `login-form`            | Formulario de inicio de sesión |
| `/register`             | `register-form`         | Formulario de registro         |
| `/profile`              | `profile`               | Página de perfil de usuario    |
| `/admin`                | `admin`                 | Panel de administración        |
| `/gallecoins`           | `gallecoins`            | Sistema de GalleCoins          |
| `/manga`                | `manga`                 | Lector de manga                |
| `/categorias`           | `category`              | Lista de categorías            |
| `/categorias/action`    | `cards-manga-action`    | Manga de acción                |
| `/categorias/adventure` | `cards-manga-adventure` | Manga de aventura              |
| `/categorias/drama`     | `cards-manga-drama`     | Manga de drama                 |
| `/categorias/romance`   | `cards-manga-romance`   | Manga de romance               |
| `/categorias/sport`     | `cards-manga-sport`     | Manga de deportes              |

### Cómo Funciona el Router

1. **Inicialización**: El router se inicializa cuando se carga la página
2. **Interceptación de clicks**: Captura clicks en enlaces con clase `nav-link`
3. **Navegación**: Actualiza la URL sin recargar la página
4. **Carga de componentes**: Busca y carga el archivo HTML correspondiente
5. **Renderizado**: Inyecta el contenido en el contenedor principal