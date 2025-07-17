/**
 * Módulo Principal de la Aplicación - Orquesta todos los módulos
 * Implementa el patrón de módulos para una arquitectura limpia y mantenible
 */

import BaseModule from './BaseModule';
import RouterModule from './RouterModule';
import AdminModule from './AdminModule';
import AuthModule from './AuthModule';
import GalleCoinsModule from './GalleCoinsModule';

interface ModuleMap {
  [key: string]: BaseModule;
}

interface AppInfo {
  currentPage: string | null;
  modules: string[];
  userAgent: string;
  timestamp: string;
}

type PageType = 'main' | 'admin' | 'auth' | 'gallecoins';

class AppModule extends BaseModule {
  private modules: ModuleMap = {};
  private currentPage: PageType | null = null;

  protected onInit(): void {
    this.initializeModules();
    this.setupAppEventListeners();
    this.detectCurrentPage();
  }

  /**
   * Inicializar todos los módulos de la aplicación
   */
  private initializeModules(): void {
    // Módulo de Router (siempre disponible)
    this.modules['router'] = new RouterModule();

    // Módulo de Administración (solo en página de admin)
    if (this.isAdminPage()) {
      this.modules['admin'] = new AdminModule();
    }

    // Módulo de Autenticación (solo en página de auth)
    if (this.isAuthPage()) {
      this.modules['auth'] = new AuthModule();
    }

    // Módulo de GalleCoins (solo en página de gallecoins)
    if (this.isGalleCoinsPage()) {
      this.modules['gallecoins'] = new GalleCoinsModule();
    }

    console.log('Módulos inicializados:', Object.keys(this.modules));
  }

  /**
   * Configurar event listeners de la aplicación
   */
  private setupAppEventListeners(): void {
    // Event listeners globales de la aplicación
    this.addEventListener('body', 'keydown', (e: KeyboardEvent) => {
      this.handleGlobalKeydown(e);
    });

    // Interceptar enlaces para navegación SPA
    this.addEventListener('a[href^="/"]', 'click', (e: Event) => {
      this.handleInternalNavigation(e);
    });

    // Manejar errores globales
    window.addEventListener('error', (e: ErrorEvent) => {
      this.handleGlobalError(e);
    });

    // Manejar errores de promesas no manejadas
    window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
      this.handleUnhandledRejection(e);
    });
  }

  /**
   * Detectar la página actual
   */
  private detectCurrentPage(): void {
    const path = window.location.pathname;
    
    if (path === '/admin') {
      this.currentPage = 'admin';
    } else if (path === '/auth') {
      this.currentPage = 'auth';
    } else if (path === '/gallecoins') {
      this.currentPage = 'gallecoins';
    } else {
      this.currentPage = 'main';
    }

    console.log('Página actual detectada:', this.currentPage);
  }

  /**
   * Verificar si estamos en la página de administración
   */
  private isAdminPage(): boolean {
    return window.location.pathname === '/admin';
  }

  /**
   * Verificar si estamos en la página de autenticación
   */
  private isAuthPage(): boolean {
    return window.location.pathname === '/auth';
  }

  /**
   * Verificar si estamos en la página de GalleCoins
   */
  private isGalleCoinsPage(): boolean {
    return window.location.pathname === '/gallecoins';
  }

  /**
   * Manejar navegación interna
   */
  private handleInternalNavigation(e: Event): void {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:')) {
      return; // Permitir navegación externa
    }

    e.preventDefault();
    
    // Usar el router si está disponible
    const router = this.modules['router'] as RouterModule;
    if (router) {
      router.navigate(href);
    } else {
      // Fallback a navegación normal
      window.location.href = href;
    }
  }

  /**
   * Manejar teclas globales
   */
  private handleGlobalKeydown(e: KeyboardEvent): void {
    // Ctrl/Cmd + K para búsqueda
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.showSearch();
    }

    // Escape para cerrar modales
    if (e.key === 'Escape') {
      this.closeModals();
    }
  }

  /**
   * Manejar errores globales
   */
  private handleGlobalError(error: ErrorEvent): void {
    console.error('Error global:', error);
    this.showNotification('Ha ocurrido un error inesperado', 'error');
  }

  /**
   * Manejar promesas rechazadas no manejadas
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    console.error('Promesa rechazada no manejada:', event.reason);
    this.showNotification('Error en la operación', 'error');
  }

  /**
   * Mostrar búsqueda global
   */
  private showSearch(): void {
    // Implementar búsqueda global
    console.log('Mostrando búsqueda global');
  }

  /**
   * Cerrar todos los modales
   */
  private closeModals(): void {
    const modals = document.querySelectorAll('.modal, [id*="modal"]');
    modals.forEach(modal => {
      if (!modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
      }
    });
  }

  /**
   * Obtener un módulo específico
   */
  public getModule(name: string): BaseModule | undefined {
    return this.modules[name];
  }

  /**
   * Obtener todos los módulos
   */
  public getAllModules(): BaseModule[] {
    return Object.values(this.modules);
  }

  /**
   * Ejecutar método en todos los módulos
   */
  public executeOnAllModules(methodName: string, ...args: any[]): void {
    Object.values(this.modules).forEach(module => {
      if (typeof (module as any)[methodName] === 'function') {
        (module as any)[methodName](...args);
      }
    });
  }

  /**
   * Ejecutar método en módulos específicos
   */
  public executeOnModules(methodName: string, moduleNames: string[], ...args: any[]): void {
    moduleNames.forEach(name => {
      const module = this.modules[name];
      if (module && typeof (module as any)[methodName] === 'function') {
        (module as any)[methodName](...args);
      }
    });
  }

  /**
   * Agregar nuevo módulo dinámicamente
   */
  public addModule(name: string, moduleInstance: BaseModule): void {
    this.modules[name] = moduleInstance;
    console.log(`Módulo "${name}" agregado dinámicamente`);
  }

  /**
   * Remover módulo
   */
  public removeModule(name: string): void {
    const module = this.modules[name];
    if (module && typeof module.destroy === 'function') {
      module.destroy();
    }
    delete this.modules[name];
    console.log(`Módulo "${name}" removido`);
  }

  /**
   * Obtener información de la aplicación
   */
  public getAppInfo(): AppInfo {
    return {
      currentPage: this.currentPage,
      modules: Object.keys(this.modules),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Limpiar recursos de la aplicación
   */
  public cleanup(): void {
    this.executeOnAllModules('destroy');
    this.modules = {};
    this.removeEventListeners();
  }

  /**
   * Reinicializar la aplicación
   */
  public reinitialize(): void {
    this.cleanup();
    this.initializeModules();
    this.detectCurrentPage();
  }

  /**
   * Hook para destrucción específica de la aplicación
   */
  protected onDestroy(): void {
    this.cleanup();
  }
}

// Inicializar la aplicación cuando el DOM esté listo
let appModule: AppModule;
document.addEventListener('DOMContentLoaded', () => {
  appModule = new AppModule();
});

// Hacer disponible globalmente para debugging
declare global {
  interface Window {
    AppModule: typeof AppModule;
    appModule: AppModule;
  }
}

window.AppModule = AppModule;
window.appModule = appModule; 