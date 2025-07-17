/**
 * Módulo Base - Clase padre para todos los módulos
 * Proporciona funcionalidades comunes como notificaciones, loading states, etc.
 */

interface EventListener {
  element: Element;
  handler: EventListenerOrEventListenerObject;
}

interface NotificationOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface FormData {
  [key: string]: string | number | boolean;
}

class BaseModule {
  protected isInitialized: boolean = false;
  protected eventListeners: Map<string, EventListener[]> = new Map();

  constructor() {
    this.init();
  }

  /**
   * Inicialización del módulo
   */
  protected init(): void {
    if (this.isInitialized) return;
    
    this.setupEventListeners();
    this.onInit();
    this.isInitialized = true;
  }

  /**
   * Método hook para inicialización específica del módulo
   */
  protected onInit(): void {
    // Override en módulos hijos
  }

  /**
   * Configurar event listeners básicos
   */
  protected setupEventListeners(): void {
    // Event listeners comunes
    document.addEventListener('DOMContentLoaded', () => {
      this.onDOMReady();
    });
  }

  /**
   * Hook para cuando el DOM está listo
   */
  protected onDOMReady(): void {
    // Override en módulos hijos
  }

  /**
   * Agregar event listener con gestión automática
   */
  protected addEventListener(
    selector: string, 
    event: string, 
    handler: EventListenerOrEventListenerObject, 
    options: AddEventListenerOptions = {}
  ): void {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.addEventListener(event, handler, options);
      
      // Guardar referencia para limpieza
      const key = `${selector}-${event}`;
      if (!this.eventListeners.has(key)) {
        this.eventListeners.set(key, []);
      }
      this.eventListeners.get(key)!.push({ element, handler });
    });
  }

  /**
   * Remover event listeners
   */
  protected removeEventListeners(): void {
    this.eventListeners.forEach((listeners, key) => {
      const eventName = key.split('-')[1];
      listeners.forEach(({ element, handler }) => {
        element.removeEventListener(eventName, handler);
      });
    });
    this.eventListeners.clear();
  }

  /**
   * Mostrar notificación
   */
  protected showNotification(
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info', 
    duration: number = 3000
  ): void {
    const container = document.getElementById('notifications-container') || this.createNotificationContainer();
    const notification = document.createElement('div');
    
    const colors: Record<string, string> = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    notification.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg mb-2 transition-all duration-300 transform translate-x-full`;
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    container.appendChild(notification);

    // Animación de entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Auto-remover
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, duration);
  }

  /**
   * Crear contenedor de notificaciones si no existe
   */
  private createNotificationContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.id = 'notifications-container';
    container.className = 'fixed top-4 right-4 z-50';
    document.body.appendChild(container);
    return container;
  }

  /**
   * Mostrar estado de carga
   */
  protected showLoading(selector: string = 'button[type="submit"]'): void {
    const buttons = document.querySelectorAll<HTMLButtonElement>(selector);
    buttons.forEach(btn => {
      btn.disabled = true;
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...';
    });
  }

  /**
   * Ocultar estado de carga
   */
  protected hideLoading(selector: string = 'button[type="submit"]'): void {
    const buttons = document.querySelectorAll<HTMLButtonElement>(selector);
    buttons.forEach(btn => {
      btn.disabled = false;
      if (btn.dataset.originalText) {
        btn.innerHTML = btn.dataset.originalText;
        delete btn.dataset.originalText;
      }
    });
  }

  /**
   * Validar formulario
   */
  protected validateForm(form: HTMLFormElement): boolean {
    const inputs = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('border-red-500');
        isValid = false;
      } else {
        input.classList.remove('border-red-500');
      }
    });
    
    return isValid;
  }

  /**
   * Limpiar formulario
   */
  protected clearForm(formSelector: string): void {
    const form = document.querySelector<HTMLFormElement>(formSelector);
    if (form) {
      form.reset();
      const inputs = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea');
      inputs.forEach(input => {
        input.classList.remove('border-red-500');
      });
    }
  }

  /**
   * Obtener datos del formulario
   */
  protected getFormData(formSelector: string): FormData | null {
    const form = document.querySelector<HTMLFormElement>(formSelector);
    if (!form) return null;
    
    const formData = new FormData(form);
    const data: FormData = {};
    
    for (let [key, value] of formData.entries()) {
      data[key] = value as string;
    }
    
    return data;
  }

  /**
   * Llenar formulario con datos
   */
  protected fillForm(formSelector: string, data: FormData): void {
    const form = document.querySelector<HTMLFormElement>(formSelector);
    if (!form) return;
    
    Object.keys(data).forEach(key => {
      const input = form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${key}"]`);
      if (input) {
        input.value = data[key] as string;
      }
    });
  }

  /**
   * Hacer petición HTTP
   */
  protected async request(url: string, options: RequestOptions = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }

  /**
   * Mostrar/ocultar elementos
   */
  protected toggleElement(selector: string, show: boolean = true): void {
    const element = document.querySelector(selector);
    if (element) {
      if (show) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    }
  }

  /**
   * Actualizar contenido de elemento
   */
  protected updateElement(selector: string, content: string): void {
    const element = document.querySelector(selector);
    if (element) {
      element.innerHTML = content;
    }
  }

  /**
   * Agregar/remover clases CSS
   */
  protected toggleClass(selector: string, className: string, add: boolean = true): void {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (add) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
    });
  }

  /**
   * Destruir módulo
   */
  public destroy(): void {
    this.removeEventListeners();
    this.onDestroy();
  }

  /**
   * Hook para destrucción específica del módulo
   */
  protected onDestroy(): void {
    // Override en módulos hijos
  }
}

// Exportar para uso en otros módulos
export default BaseModule; 