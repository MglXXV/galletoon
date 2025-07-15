/*interface Route {
	path: string;
	component: string;
	title: string;
}

class Router {
	private routes: Route[] = [
		{ path: "/", component: "home", title: "GalleToon - Inicio" },
		{ path: "/auth", component: "auth", title: "GalleToon - Autenticación" },
		{
			path: "/login",
			component: "login-form",
			title: "GalleToon - Iniciar Sesión",
		},
		{
			path: "/register",
			component: "register-form",
			title: "GalleToon - Registrarse",
		},
		{ path: "/profile", component: "profile", title: "GalleToon - Perfil" },
		{ path: "/admin", component: "admin", title: "GalleToon - Administración" },
		{
			path: "/gallecoins",
			component: "gallecoins",
			title: "GalleToon - GalleCoins",
		},
		{ path: "/manga", component: "manga", title: "GalleToon - Manga" },
		{
			path: "/categorias",
			component: "category",
			title: "GalleToon - Categorías",
		},
		{
			path: "/categorias/action",
			component: "cards-manga-action",
			title: "GalleToon - Manga de Acción",
		},
		{
			path: "/categorias/adventure",
			component: "cards-manga-adventure",
			title: "GalleToon - Manga de Aventura",
		},
		{
			path: "/categorias/drama",
			component: "cards-manga-drama",
			title: "GalleToon - Manga de Drama",
		},
		{
			path: "/categorias/romance",
			component: "cards-manga-romance",
			title: "GalleToon - Manga de Romance",
		},
		{
			path: "/categorias/sport",
			component: "cards-manga-sport",
			title: "GalleToon - Manga de Deportes",
		},
	];

	private currentRoute: Route | null = null;

	constructor() {
		this.init();
	}

	private init(): void {
		// Interceptar clicks en enlaces de navegación
		document.addEventListener("click", (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains("nav-link")) {
				e.preventDefault();
				const href = target.getAttribute("href");
				if (href) {
					this.navigate(href);
				}
			}
		});

		// Manejar navegación del navegador (botones atrás/adelante)
		window.addEventListener("popstate", () => {
			this.handleRoute();
		});

		// Interceptar navegación directa por URL
		window.addEventListener("load", () => {
			this.handleRoute();
		});

		// Cargar la ruta inicial si no hay una ruta específica
		if (window.location.pathname === "/") {
			this.handleRoute();
		}
	}

	private async navigate(path: string): Promise<void> {
		// Actualizar la URL sin recargar la página
		window.history.pushState({}, "", path);
		await this.handleRoute();
	}

	private async handleRoute(): Promise<void> {
		const path = window.location.pathname;
		const route = this.findRoute(path);

		if (!route) {
			this.showError("Página no encontrada");
			return;
		}

		this.currentRoute = route;
		document.title = route.title;

		try {
			await this.loadComponent(route.component);
		} catch (error) {
			console.error("Error cargando componente:", error);
			this.showError("Error cargando contenido");
		}
	}

	private findRoute(path: string): Route | undefined {
		return this.routes.find((route) => route.path === path);
	}

	private async loadComponent(componentName: string): Promise<void> {
		const appRoot =
			document.getElementById("app-root") ||
			document.getElementById("auth-root");

		if (!appRoot) {
			throw new Error("No se encontró el contenedor de la aplicación");
		}

		// Mostrar loading
		appRoot.innerHTML = '<div class="loading">Cargando...</div>';

		try {
			let componentPath: string;

			// Determinar la ruta del componente basado en su nombre
			if (componentName === "home") {
				componentPath = "view/home.html";
			} else if (componentName === "auth") {
				componentPath = "view/auth/auth.html";
			} else if (
				componentName.startsWith("login") ||
				componentName.startsWith("register")
			) {
				componentPath = `view/auth/${componentName}.html`;
			} else if (componentName.startsWith("cards-manga-")) {
				componentPath = `view/categories/${componentName}.html`;
			} else if (componentName === "category") {
				componentPath = "view/categories/category.html";
			} else {
				componentPath = `view/${componentName}.html`;
			}

			console.log(`Intentando cargar: ${componentPath}`);

			const response = await fetch(componentPath, {
				method: "GET",
				headers: {
					Accept: "text/html",
				},
			});

			if (!response.ok) {
				console.error(
					`Error HTTP: ${response.status} - ${response.statusText}`,
				);
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const content = await response.text();
			appRoot.innerHTML = content;

			// Ejecutar scripts si existen
			this.executeScripts(appRoot);
		} catch (error) {
			console.error("Error cargando componente:", error);
			appRoot.innerHTML = `
                <div class="error-container">
                    <h2>Error al cargar el contenido</h2>
                    <p>No se pudo cargar: ${componentName}</p>
                    <p>Error: ${error.message}</p>
                    <button onclick="window.location.reload()">Recargar página</button>
                    <a href="/" class="nav-link">Volver al inicio</a>
                </div>
            `;
		}
	}

	private executeScripts(container: HTMLElement): void {
		const scripts = container.querySelectorAll("script");
		scripts.forEach((script) => {
			const newScript = document.createElement("script");
			if (script.src) {
				newScript.src = script.src;
			} else {
				newScript.textContent = script.textContent || "";
			}
			document.head.appendChild(newScript);
		});
	}

	private showError(message: string): void {
		const appRoot =
			document.getElementById("app-root") ||
			document.getElementById("auth-root");
		if (appRoot) {
			appRoot.innerHTML = `
                <div class="error-container">
                    <h2>Error</h2>
                    <p>${message}</p>
                    <a href="/" class="nav-link">Volver al inicio</a>
                </div>
            `;
		}
	}
}

// Inicializar el router cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
	new Router();
});

// Exportar para uso global si es necesario
(window as any).Router = Router;
*/