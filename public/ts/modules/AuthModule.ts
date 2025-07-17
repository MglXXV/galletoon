/**
 * Módulo de Autenticación - Maneja login y registro de usuarios
 * Extiende BaseModule para funcionalidades comunes
 */

import BaseModule from './BaseModule';

interface UserData {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type ViewType = 'login' | 'register';

class AuthModule extends BaseModule {
  private currentView: ViewType = 'login';

  protected onInit(): void {
    this.loadAuthContent().then(() => {
      this.showView('login');
    });
  }

  protected onDOMReady(): void {
    this.setupAuthEventListeners();
  }

  /**
   * Cargar contenido de autenticación dinámicamente
   */
  private async loadAuthContent(): Promise<void> {
    const authContent = document.getElementById('auth-content');
    if (!authContent) return;

    try {
      // Cargar el formulario de login por defecto
      const loginResponse = await fetch('/view/auth/login-form.html');
      const loginHtml = await loginResponse.text();
      
      authContent.innerHTML = loginHtml;
    } catch (error) {
      console.error('Error cargando contenido de autenticación:', error);
      authContent.innerHTML = '<div class="text-center text-red-600">Error cargando formulario de autenticación</div>';
    }
  }

  /**
   * Configurar event listeners específicos de autenticación
   */
  private setupAuthEventListeners(): void {
    // Botones de cambio de vista
    this.addEventListener('#btn-switch-register', 'click', () => {
      this.showView('register');
    });

    this.addEventListener('#btn-switch-login', 'click', () => {
      this.showView('login');
    });

    // Formularios
    this.addEventListener('#login-form', 'submit', (e: Event) => {
      e.preventDefault();
      this.handleLogin();
    });

    this.addEventListener('#register-form', 'submit', (e: Event) => {
      e.preventDefault();
      this.handleRegister();
    });
  }

  /**
   * Mostrar vista específica
   */
  private async showView(view: ViewType): Promise<void> {
    this.currentView = view;
    
    const authContent = document.getElementById('auth-content');
    if (!authContent) return;

    try {
      let htmlContent: string;
      
      if (view === 'login') {
        const response = await fetch('/view/auth/login-form.html');
        htmlContent = await response.text();
      } else if (view === 'register') {
        const response = await fetch('/view/auth/register-form.html');
        htmlContent = await response.text();
      } else {
        throw new Error('Vista no válida');
      }
      
      authContent.innerHTML = htmlContent;
      
      // Reconfigurar event listeners después de cargar el contenido
      this.setupAuthEventListeners();
      
    } catch (error) {
      console.error('Error cargando vista:', error);
      authContent.innerHTML = '<div class="text-center text-red-600">Error cargando formulario</div>';
    }
  }

  /**
   * Manejar login
   */
  private async handleLogin(): Promise<void> {
    const formData = this.getFormData('#login-form') as LoginData;
    
    const email = formData.email;
    const password = formData.password;
    
    // Validación básica
    if (!email || !password) {
      this.showNotification('Por favor, completa todos los campos', 'error');
      return;
    }

    try {
      this.showLoading('#login-form button[type="submit"]');
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aquí iría la lógica real de autenticación
      console.log('Login attempt:', { email, password });
      
      // Simular éxito
      this.showNotification('Inicio de sesión exitoso', 'success');
      
      // Simular redirección
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (error) {
      this.showNotification('Error al iniciar sesión', 'error');
    } finally {
      this.hideLoading('#login-form button[type="submit"]');
    }
  }

  /**
   * Manejar registro
   */
  private async handleRegister(): Promise<void> {
    const formData = this.getFormData('#register-form') as RegisterData;
    
    const nombre = formData.nombre;
    const apellido = formData.apellido;
    const email = formData.email;
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
    
    // Validación básica
    if (!nombre || !apellido || !email || !password || !confirmPassword) {
      this.showNotification('Por favor, completa todos los campos', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    if (password.length < 6) {
      this.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    try {
      this.showLoading('#register-form button[type="submit"]');
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aquí iría la lógica real de registro
      console.log('Register attempt:', { nombre, apellido, email, password });
      
      // Simular éxito
      this.showNotification('Cuenta creada exitosamente', 'success');
      
      // Cambiar a vista de login
      setTimeout(() => {
        this.showView('login');
        this.clearForm('#register-form');
      }, 1500);
      
    } catch (error) {
      this.showNotification('Error al crear la cuenta', 'error');
    } finally {
      this.hideLoading('#register-form button[type="submit"]');
    }
  }

  /**
   * Validar email
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar contraseña
   */
  private validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  /**
   * Validar formulario de login
   */
  private validateLoginForm(): boolean {
    const form = document.getElementById('login-form') as HTMLFormElement;
    if (!form) return false;

    const email = form.querySelector<HTMLInputElement>('[name="email"]')?.value || '';
    const password = form.querySelector<HTMLInputElement>('[name="password"]')?.value || '';

    if (!email || !password) {
      this.showNotification('Por favor, completa todos los campos', 'error');
      return false;
    }

    if (!this.validateEmail(email)) {
      this.showNotification('Por favor, ingresa un email válido', 'error');
      return false;
    }

    return true;
  }

  /**
   * Validar formulario de registro
   */
  private validateRegisterForm(): boolean {
    const form = document.getElementById('register-form') as HTMLFormElement;
    if (!form) return false;

    const nombre = form.querySelector<HTMLInputElement>('[name="nombre"]')?.value || '';
    const apellido = form.querySelector<HTMLInputElement>('[name="apellido"]')?.value || '';
    const email = form.querySelector<HTMLInputElement>('[name="email"]')?.value || '';
    const password = form.querySelector<HTMLInputElement>('[name="password"]')?.value || '';
    const confirmPassword = form.querySelector<HTMLInputElement>('[name="confirmPassword"]')?.value || '';

    if (!nombre || !apellido || !email || !password || !confirmPassword) {
      this.showNotification('Por favor, completa todos los campos', 'error');
      return false;
    }

    if (!this.validateEmail(email)) {
      this.showNotification('Por favor, ingresa un email válido', 'error');
      return false;
    }

    if (!this.validatePassword(password)) {
      this.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return false;
    }

    if (password !== confirmPassword) {
      this.showNotification('Las contraseñas no coinciden', 'error');
      return false;
    }

    return true;
  }

  /**
   * Limpiar formularios
   */
  public clearForms(): void {
    this.clearForm('#login-form');
    this.clearForm('#register-form');
  }

  /**
   * Obtener datos del usuario actual
   */
  public getCurrentUser(): UserData | null {
    const userData = localStorage.getItem('galletoon_user');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  public isAuthenticated(): boolean {
    const token = localStorage.getItem('galletoon_token');
    return !!token;
  }

  /**
   * Cerrar sesión
   */
  public logout(): void {
    localStorage.removeItem('galletoon_token');
    localStorage.removeItem('galletoon_user');
    window.location.href = '/auth';
  }

  /**
   * Guardar datos de sesión
   */
  public saveSession(token: string, userData: UserData): void {
    localStorage.setItem('galletoon_token', token);
    localStorage.setItem('galletoon_user', JSON.stringify(userData));
  }
}

// Exportar para uso en otros módulos
export default AuthModule; 