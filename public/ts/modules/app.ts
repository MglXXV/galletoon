// ========================================
// GALLETOON - APLICACIÓN PRINCIPAL
// ========================================

// Configuración global de la aplicación
interface AppConfig {
  apiBaseUrl: string;
  version: string;
  debug: boolean;
}

// Estado global de la aplicación
interface AppState {
  user: User | null;
  currentManga: Manga | null;
  currentChapter: Chapter | null;
  isLoading: boolean;
  error: string | null;
}

// ========================================
// MÓDULO DE CONFIGURACIÓN
// ========================================
class ConfigModule {
  private static instance: ConfigModule;
  private config: AppConfig;

  private constructor() {
    this.config = {
      apiBaseUrl: 'http://localhost:3000/api',
      version: '1.0.0',
      debug: true
    };
  }

  static getInstance(): ConfigModule {
    if (!ConfigModule.instance) {
      ConfigModule.instance = new ConfigModule();
    }
    return ConfigModule.instance;
  }

  getConfig(): AppConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<AppConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// ========================================
// MÓDULO DE ESTADO
// ========================================
class StateModule {
  private static instance: StateModule;
  private state: AppState;
  private listeners: ((state: AppState) => void)[] = [];

  private constructor() {
    this.state = {
      user: null,
      currentManga: null,
      currentChapter: null,
      isLoading: false,
      error: null
    };
  }

  static getInstance(): StateModule {
    if (!StateModule.instance) {
      StateModule.instance = new StateModule();
    }
    return StateModule.instance;
  }

  getState(): AppState {
    return this.state;
  }

  setState(newState: Partial<AppState>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// ========================================
// MÓDULO DE AUTENTICACIÓN
// ========================================
interface User {
  id: string;
  username: string;
  email: string;
  gallecoins: number;
  isAdmin: boolean;
}

class AuthModule {
  private static instance: AuthModule;
  private currentUser: User | null = null;

  private constructor() {}

  static getInstance(): AuthModule {
    if (!AuthModule.instance) {
      AuthModule.instance = new AuthModule();
    }
    return AuthModule.instance;
  }

  async login(email: string, password: string): Promise<User> {
    // TODO: Implementar lógica de login
    throw new Error('Método login no implementado');
  }

  async logout(): Promise<void> {
    // TODO: Implementar lógica de logout
    throw new Error('Método logout no implementado');
  }

  async register(userData: Partial<User>): Promise<User> {
    // TODO: Implementar lógica de registro
    throw new Error('Método register no implementado');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }
}

// ========================================
// MÓDULO DE MANGA
// ========================================
interface Manga {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  chapters: Chapter[];
  price: number;
}

interface Chapter {
  id: string;
  title: string;
  chapterNumber: number;
  pages: string[];
  price: number;
  isPurchased: boolean;
}

class MangaModule {
  private static instance: MangaModule;

  private constructor() {}

  static getInstance(): MangaModule {
    if (!MangaModule.instance) {
      MangaModule.instance = new MangaModule();
    }
    return MangaModule.instance;
  }

  async getMangaList(): Promise<Manga[]> {
    // TODO: Implementar obtención de lista de mangas
    throw new Error('Método getMangaList no implementado');
  }

  async getMangaById(id: string): Promise<Manga> {
    // TODO: Implementar obtención de manga por ID
    throw new Error('Método getMangaById no implementado');
  }

  async getChaptersByMangaId(mangaId: string): Promise<Chapter[]> {
    // TODO: Implementar obtención de capítulos por manga
    throw new Error('Método getChaptersByMangaId no implementado');
  }

  async purchaseChapter(chapterId: string): Promise<boolean> {
    // TODO: Implementar compra de capítulo
    throw new Error('Método purchaseChapter no implementado');
  }
}

// ========================================
// MÓDULO DE GALLECOINS
// ========================================
interface GallecoinTransaction {
  id: string;
  amount: number;
  type: 'purchase' | 'spend' | 'refund';
  description: string;
  timestamp: Date;
}

class GallecoinsModule {
  private static instance: GallecoinsModule;

  private constructor() {}

  static getInstance(): GallecoinsModule {
    if (!GallecoinsModule.instance) {
      GallecoinsModule.instance = new GallecoinsModule();
    }
    return GallecoinsModule.instance;
  }

  async getBalance(): Promise<number> {
    // TODO: Implementar obtención de balance
    throw new Error('Método getBalance no implementado');
  }

  async purchaseGallecoins(amount: number): Promise<boolean> {
    // TODO: Implementar compra de gallecoins
    throw new Error('Método purchaseGallecoins no implementado');
  }

  async getTransactionHistory(): Promise<GallecoinTransaction[]> {
    // TODO: Implementar historial de transacciones
    throw new Error('Método getTransactionHistory no implementado');
  }
}

// ========================================
// MÓDULO DE NAVEGACIÓN
// ========================================
class NavigationModule {
  private static instance: NavigationModule;

  private constructor() {}

  static getInstance(): NavigationModule {
    if (!NavigationModule.instance) {
      NavigationModule.instance = new NavigationModule();
    }
    return NavigationModule.instance;
  }

  navigateTo(path: string): void {
    // TODO: Implementar navegación
    window.location.href = path;
  }

  goBack(): void {
    window.history.back();
  }

  goForward(): void {
    window.history.forward();
  }
}

// ========================================
// MÓDULO DE UTILIDADES
// ========================================
class UtilsModule {
  private static instance: UtilsModule;

  private constructor() {}

  static getInstance(): UtilsModule {
    if (!UtilsModule.instance) {
      UtilsModule.instance = new UtilsModule();
    }
    return UtilsModule.instance;
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES');
  }

  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

// ========================================
// MÓDULO DE API
// ========================================
class ApiModule {
  private static instance: ApiModule;
  private baseUrl: string;

  private constructor() {
    const config = ConfigModule.getInstance().getConfig();
    this.baseUrl = config.apiBaseUrl;
  }

  static getInstance(): ApiModule {
    if (!ApiModule.instance) {
      ApiModule.instance = new ApiModule();
    }
    return ApiModule.instance;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// ========================================
// APLICACIÓN PRINCIPAL
// ========================================
class GalletoonApp {
  private static instance: GalletoonApp;
  
  // Módulos de la aplicación
  public config: ConfigModule;
  public state: StateModule;
  public auth: AuthModule;
  public manga: MangaModule;
  public gallecoins: GallecoinsModule;
  public navigation: NavigationModule;
  public utils: UtilsModule;
  public api: ApiModule;

  private constructor() {
    // Inicializar todos los módulos
    this.config = ConfigModule.getInstance();
    this.state = StateModule.getInstance();
    this.auth = AuthModule.getInstance();
    this.manga = MangaModule.getInstance();
    this.gallecoins = GallecoinsModule.getInstance();
    this.navigation = NavigationModule.getInstance();
    this.utils = UtilsModule.getInstance();
    this.api = ApiModule.getInstance();
  }

  static getInstance(): GalletoonApp {
    if (!GalletoonApp.instance) {
      GalletoonApp.instance = new GalletoonApp();
    }
    return GalletoonApp.instance;
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Inicializando Galletoon App...');
      
      // TODO: Implementar inicialización de la aplicación
      // - Verificar autenticación del usuario
      // - Cargar datos iniciales
      // - Configurar event listeners
      
      console.log('✅ Galletoon App inicializada correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar la aplicación:', error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      console.log('🔄 Destruyendo Galletoon App...');
      
      // TODO: Implementar limpieza de recursos
      // - Remover event listeners
      // - Limpiar timeouts/intervals
      // - Cerrar conexiones
      
      console.log('✅ Galletoon App destruida correctamente');
    } catch (error) {
      console.error('❌ Error al destruir la aplicación:', error);
      throw error;
    }
  }
}

// ========================================
// EXPORTACIÓN Y INICIALIZACIÓN
// ========================================

// Exportar la aplicación principal
export const app = GalletoonApp.getInstance();

// Exportar módulos individuales para uso directo
export {
  ConfigModule,
  StateModule,
  AuthModule,
  MangaModule,
  GallecoinsModule,
  NavigationModule,
  UtilsModule,
  ApiModule,
  GalletoonApp
};

// Exportar tipos
export type {
  AppConfig,
  AppState,
  User,
  Manga,
  Chapter,
  GallecoinTransaction
};

// Inicializar la aplicación cuando se cargue el módulo
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await app.initialize();
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
  }
});

// Manejar la limpieza cuando se cierre la página
window.addEventListener('beforeunload', async () => {
  try {
    await app.destroy();
  } catch (error) {
    console.error('Error al destruir la aplicación:', error);
  }
});
