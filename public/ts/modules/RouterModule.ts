/**
 * Módulo Router - Maneja la navegación SPA
 * Extiende BaseModule para funcionalidades comunes
 */

import BaseModule from './BaseModule';

interface RouteConfig {
  component: string;
  title: string;
  requiresAuth: boolean;
}

interface RouteState {
  path: string;
}

class RouterModule extends BaseModule {
  private routes: Map<string, RouteConfig> = new Map();
  private currentRoute: string = '/';
  private appRoot: HTMLElement | null = null;
  private isLoading: boolean = false;

  protected onInit(): void {
    this.initializeRoutes();
    this.setupRouterEventListeners();
    this.handleInitialRoute();
  }

  /**
   * Inicializar rutas del router
   */
  private initializeRoutes(): void {
    // Rutas principales
    this.addRoute('/', '/view/home.html', 'Inicio');
    this.addRoute('/home', '/view/home.html', 'Inicio');
    this.addRoute('/login', '/view/auth/login-form.html', 'Iniciar Sesión');
    this.addRoute('/register', '/view/auth/register-form.html', 'Registrarse');
    this.addRoute('/profile', '/view/profile.html', 'Perfil', true);
    this.addRoute('/manga', '/view/manga.html', 'Lector de Manga');
    this.addRoute('/categorias', '/view/categories/category.html', 'Categorías');
    
    // Rutas de categorías
    this.addRoute('/categorias/action', '/view/categories/cards-manga-action.html', 'Manga de Acción');
    this.addRoute('/categorias/adventure', '/view/categories/cards-manga-adventure.html', 'Manga de Aventura');
    this.addRoute('/categorias/drama', '/view/categories/cards-manga-drama.html', 'Manga de Drama');
    this.addRoute('/categorias/romance', '/view/categories/cards-manga-romance.html', 'Manga de Romance');
    this.addRoute('/categorias/sport', '/view/categories/cards-manga-sport.html', 'Manga de Deportes');
  }

  /**
   * Agregar ruta al router
   */
  public addRoute(path: string, component: string, title: string, requiresAuth: boolean = false): void {
    this.routes.set(path, {
      component,
      title,
      requiresAuth
    });
  }

  /**
   * Configurar event listeners del router
   */
  private setupRouterEventListeners(): void {
    // Interceptar clicks en enlaces con clase nav-link
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.classList.contains('nav-link')) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          this.navigate(href);
        }
      }
    });

    // Manejar navegación del navegador (botones atrás/adelante)
    window.addEventListener('popstate', (e: PopStateEvent) => {
      const path = (e.state as RouteState)?.path || '/';
      this.loadContent(path, false);
    });
  }

  /**
   * Manejar ruta inicial
   */
  private handleInitialRoute(): void {
    const path = window.location.pathname;
    this.loadContent(path, false);
  }

  /**
   * Navegar a una ruta
   */
  public navigate(path: string): void {
    this.loadContent(path, true);
  }

  /**
   * Cargar contenido de una ruta
   */
  private async loadContent(path: string, updateHistory: boolean = true): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoadingState();
    
    const routeConfig = this.routes.get(path);
    
    if (!routeConfig) {
      await this.loadErrorPage();
      this.hideLoadingState();
      return;
    }
    
    // Verificar autenticación si es necesario
    if (routeConfig.requiresAuth) {
      const isAuthenticated = this.checkAuthentication();
      if (!isAuthenticated) {
        this.hideLoadingState();
        this.navigate('/login');
        return;
      }
    }

    try {
      const response = await fetch(routeConfig.component);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      
      // Extraer solo el contenido del body si es una página completa
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const bodyContent = doc.querySelector('body')?.innerHTML || content;
      
      // Actualizar el contenido
      this.appRoot = document.getElementById('app-root');
      if (this.appRoot) {
        this.appRoot.innerHTML = bodyContent;
      }

      // Actualizar título de la página
      document.title = `${routeConfig.title} - GalleToon`;

      // Actualizar historial si es necesario
      if (updateHistory) {
        window.history.pushState({ path } as RouteState, '', path);
      }

      this.currentRoute = path;
      
      // Ejecutar scripts en el contenido cargado
      this.executeScripts();
      
      // Actualizar enlaces activos
      this.updateActiveLinks();
      
    } catch (error) {
      console.error('Error loading content:', error);
      await this.loadErrorPage();
    } finally {
      this.hideLoadingState();
      this.isLoading = false;
    }
  }

  /**
   * Cargar página de error
   */
  private async loadErrorPage(): Promise<void> {
    try {
      const response = await fetch('/view/404.html');
      const content = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const bodyContent = doc.querySelector('body')?.innerHTML || content;
      
      if (this.appRoot) {
        this.appRoot.innerHTML = bodyContent;
      }
    } catch (error) {
      console.error('Error loading 404 page:', error);
      if (this.appRoot) {
        this.appRoot.innerHTML = `
          <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
              <h1 class="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p class="text-gray-600 mb-4">Página no encontrada</p>
              <a href="/" class="nav-link text-pink-700 hover:text-pink-900">Volver al inicio</a>
            </div>
          </div>
        `;
      }
    }
  }

  /**
   * Ejecutar scripts en el contenido cargado
   */
  private executeScripts(): void {
    const scripts = this.appRoot?.querySelectorAll('script');
    if (scripts) {
      scripts.forEach(script => {
        if (script.src) {
          // Script externo
          const newScript = document.createElement('script');
          newScript.src = script.src;
          newScript.type = script.type || 'text/javascript';
          document.head.appendChild(newScript);
        } else {
          // Script inline
          eval(script.innerHTML);
        }
      });
    }
  }

  /**
   * Mostrar estado de carga
   */
  private showLoadingState(): void {
    let loader = document.getElementById('app-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'app-loader';
      loader.className = 'fixed top-0 left-0 w-full h-1 bg-pink-600 z-50';
      loader.innerHTML = '<div class="h-full bg-pink-400 animate-pulse"></div>';
      document.body.appendChild(loader);
    }
    loader.style.display = 'block';
  }

  /**
   * Ocultar estado de carga
   */
  private hideLoadingState(): void {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }

  /**
   * Verificar autenticación
   */
  private checkAuthentication(): boolean {
    const token = localStorage.getItem('galletoon_token');
    return !!token;
  }

  /**
   * Actualizar enlaces activos
   */
  private updateActiveLinks(): void {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === this.currentRoute) {
        link.classList.add('active', 'text-yellow-300');
      } else {
        link.classList.remove('active', 'text-yellow-300');
      }
    });
  }

  /**
   * Obtener ruta actual
   */
  public getCurrentRoute(): string {
    return this.currentRoute;
  }

  /**
   * Verificar si estamos en una ruta específica
   */
  public isCurrentRoute(path: string): boolean {
    return this.currentRoute === path;
  }

  /**
   * API pública para navegación programática
   */
  public goTo(path: string): void {
    this.navigate(path);
  }
}

// Exportar para uso en otros módulos
export default RouterModule; 