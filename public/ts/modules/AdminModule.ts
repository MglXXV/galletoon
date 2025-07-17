/**
 * Módulo de Administración - Maneja la gestión de mangas y capítulos
 * Extiende BaseModule para funcionalidades comunes
 */

import BaseModule from './BaseModule';

interface Manga {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  portada: string;
  capitulos: number;
}

interface Capitulo {
  id: number;
  numero: number;
  titulo: string;
  descripcion: string;
  archivo: string;
}

type ViewType = 'mangas' | 'capitulos';

class AdminModule extends BaseModule {
  private currentView: ViewType = 'mangas';
  private selectedManga: Manga | null = null;
  private mangas: Manga[] = [];
  private capitulos: Capitulo[] = [];

  protected onInit(): void {
    this.loadAdminContent().then(() => {
      this.loadMangas();
      this.showView('mangas');
    });
  }

  protected onDOMReady(): void {
    this.setupAdminEventListeners();
  }

  /**
   * Cargar contenido de administración dinámicamente
   */
  private async loadAdminContent(): Promise<void> {
    const adminContent = document.getElementById('admin-content');
    if (!adminContent) return;

    try {
      // Cargar la vista de mangas por defecto
      const mangasResponse = await fetch('/view/admin/mangas-view.html');
      const mangasHtml = await mangasResponse.text();
      
      adminContent.innerHTML = mangasHtml;
    } catch (error) {
      console.error('Error cargando contenido de administración:', error);
      adminContent.innerHTML = '<div class="text-center text-red-600">Error cargando panel de administración</div>';
    }
  }

  /**
   * Configurar event listeners específicos de administración
   */
  private setupAdminEventListeners(): void {
    // Navegación entre vistas
    this.addEventListener('#btn-mangas', 'click', () => {
      this.showView('mangas');
    });

    this.addEventListener('#btn-capitulos', 'click', () => {
      this.showView('capitulos');
    });

    // Botones de acción
    this.addEventListener('#btn-agregar-manga', 'click', () => {
      this.showModalManga();
    });

    this.addEventListener('#btn-agregar-capitulo', 'click', () => {
      if (this.selectedManga) {
        this.showModalCapitulo();
      } else {
        this.showNotification('Primero selecciona un manga', 'error');
      }
    });

    this.addEventListener('#btn-volver-mangas', 'click', () => {
      this.showView('mangas');
    });

    // Event listeners para botones de acción de mangas
    this.addEventListener('[data-action="edit"]', 'click', (e: Event) => {
      const button = e.target as HTMLElement;
      const mangaId = parseInt(button.getAttribute('data-manga-id') || '0');
      if (mangaId) this.editManga(mangaId);
    });

    this.addEventListener('[data-action="capitulos"]', 'click', (e: Event) => {
      const button = e.target as HTMLElement;
      const mangaId = parseInt(button.getAttribute('data-manga-id') || '0');
      if (mangaId) this.manageCapitulos(mangaId);
    });

    this.addEventListener('[data-action="delete"]', 'click', (e: Event) => {
      const button = e.target as HTMLElement;
      const mangaId = parseInt(button.getAttribute('data-manga-id') || '0');
      if (mangaId) this.deleteManga(mangaId);
    });

    // Event listeners para botones de acción de capítulos
    this.addEventListener('[data-action="edit-capitulo"]', 'click', (e: Event) => {
      const button = e.target as HTMLElement;
      const capituloId = parseInt(button.getAttribute('data-capitulo-id') || '0');
      if (capituloId) this.editCapitulo(capituloId);
    });

    this.addEventListener('[data-action="delete-capitulo"]', 'click', (e: Event) => {
      const button = e.target as HTMLElement;
      const capituloId = parseInt(button.getAttribute('data-capitulo-id') || '0');
      if (capituloId) this.deleteCapitulo(capituloId);
    });

    // Modales
    this.setupModalEventListeners();
    
    // Formularios
    this.setupFormEventListeners();
  }

  /**
   * Configurar event listeners de modales
   */
  private setupModalEventListeners(): void {
    // Modal de Manga
    this.addEventListener('#btn-cerrar-modal-manga', 'click', () => {
      this.hideModalManga();
    });

    this.addEventListener('#btn-cancelar-manga', 'click', () => {
      this.hideModalManga();
    });

    // Modal de Capítulo
    this.addEventListener('#btn-cerrar-modal-capitulo', 'click', () => {
      this.hideModalCapitulo();
    });

    this.addEventListener('#btn-cancelar-capitulo', 'click', () => {
      this.hideModalCapitulo();
    });

    // Cerrar modales al hacer clic fuera
    this.addEventListener('#modal-manga', 'click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.id === 'modal-manga') {
        this.hideModalManga();
      }
    });

    this.addEventListener('#modal-capitulo', 'click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.id === 'modal-capitulo') {
        this.hideModalCapitulo();
      }
    });
  }

  /**
   * Configurar event listeners de formularios
   */
  private setupFormEventListeners(): void {
    // Formulario de Manga
    this.addEventListener('#form-manga', 'submit', (e: Event) => {
      e.preventDefault();
      this.handleMangaSubmit();
    });

    // Formulario de Capítulo
    this.addEventListener('#form-capitulo', 'submit', (e: Event) => {
      e.preventDefault();
      this.handleCapituloSubmit();
    });
  }

  /**
   * Mostrar vista específica
   */
  private async showView(view: ViewType): Promise<void> {
    this.currentView = view;
    
    const adminContent = document.getElementById('admin-content');
    if (!adminContent) return;

    try {
      let htmlContent: string;
      
      if (view === 'mangas') {
        const response = await fetch('/view/admin/mangas-view.html');
        htmlContent = await response.text();
      } else if (view === 'capitulos') {
        const response = await fetch('/view/admin/capitulos-view.html');
        htmlContent = await response.text();
      } else {
        throw new Error('Vista no válida');
      }
      
      adminContent.innerHTML = htmlContent;
      
      // Reconfigurar event listeners después de cargar el contenido
      this.setupAdminEventListeners();
      
      // Actualizar navegación
      this.updateNavButtons(view);
      
    } catch (error) {
      console.error('Error cargando vista:', error);
      adminContent.innerHTML = '<div class="text-center text-red-600">Error cargando vista</div>';
    }
  }

  /**
   * Actualizar botones de navegación
   */
  private updateNavButtons(activeView: ViewType): void {
    this.toggleClass('.nav-link-admin', 'bg-gray-700', false);
    
    if (activeView === 'mangas') {
      this.toggleClass('#btn-mangas', 'bg-gray-700', true);
    } else if (activeView === 'capitulos') {
      this.toggleClass('#btn-capitulos', 'bg-gray-700', true);
    }
  }

  /**
   * Cargar mangas (simulado)
   */
  private async loadMangas(): Promise<void> {
    try {
      // Simular carga de datos (aquí iría la llamada a la API)
      this.mangas = [
        {
          id: 1,
          nombre: 'Jujutsu Kaisen',
          categoria: 'action',
          precio: 50,
          descripcion: 'Un estudiante de secundaria se une a una organización secreta de exorcistas.',
          portada: 'https://www.anmosugoi.com/wp-content/uploads/2021/02/Jujutsu-Kaisen-Fanbook-3-1-987x1536.jpg',
          capitulos: 12
        },
        {
          id: 2,
          nombre: 'Banana Fish',
          categoria: 'drama',
          precio: 30,
          descripcion: 'Una historia de crimen y venganza en Nueva York.',
          portada: 'https://th.bing.com/th/id/R.9fa123b225d35f7902cbf655fe394c49?rik=wLSektVZH8jbbg&pid=ImgRaw&r=0',
          capitulos: 8
        },
        {
          id: 3,
          nombre: 'After School Lesson',
          categoria: 'romance',
          precio: 25,
          descripcion: 'Una historia de amor en la escuela secundaria.',
          portada: 'https://ayatoon.com/wp-content/uploads/2023/02/cover.jpg',
          capitulos: 15
        }
      ];
      
      this.renderMangasTable();
    } catch (error) {
      this.showNotification('Error al cargar los mangas', 'error');
    }
  }

  /**
   * Renderizar tabla de mangas
   */
  private renderMangasTable(): void {
    const tbody = document.getElementById('mangas-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    this.mangas.forEach(manga => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50';
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
          <img src="${manga.portada}" alt="${manga.nombre}" class="h-16 w-12 object-cover rounded">
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${manga.nombre}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            ${this.getCategoriaLabel(manga.categoria)}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${manga.precio} GC
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${manga.capitulos} capítulos
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button class="text-blue-600 hover:text-blue-900 mr-3" data-manga-id="${manga.id}" data-action="edit">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="text-green-600 hover:text-green-900 mr-3" data-manga-id="${manga.id}" data-action="capitulos">
            <i class="fas fa-list"></i> Capítulos
          </button>
          <button class="text-red-600 hover:text-red-900" data-manga-id="${manga.id}" data-action="delete">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  /**
   * Obtener etiqueta de categoría
   */
  private getCategoriaLabel(categoria: string): string {
    const labels: Record<string, string> = {
      'action': 'Acción',
      'adventure': 'Aventura',
      'drama': 'Drama',
      'romance': 'Romance',
      'sport': 'Deportes'
    };
    return labels[categoria] || categoria;
  }

  /**
   * Editar manga
   */
  public editManga(mangaId: number): void {
    const manga = this.mangas.find(m => m.id === mangaId);
    if (manga) {
      this.fillMangaForm(manga);
      this.showModalManga('edit');
    }
  }

  /**
   * Eliminar manga
   */
  public deleteManga(mangaId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este manga?')) {
      this.mangas = this.mangas.filter(m => m.id !== mangaId);
      this.renderMangasTable();
      this.showNotification('Manga eliminado correctamente', 'success');
    }
  }

  /**
   * Gestionar capítulos de un manga
   */
  public manageCapitulos(mangaId: number): void {
    this.selectedManga = this.mangas.find(m => m.id === mangaId) || null;
    if (this.selectedManga) {
      this.showView('capitulos');
      this.loadCapitulos(mangaId);
    }
  }

  /**
   * Cargar capítulos de un manga
   */
  private async loadCapitulos(mangaId: number): Promise<void> {
    try {
      // Simular carga de capítulos
      this.capitulos = [
        { id: 1, numero: 1, titulo: 'El comienzo', descripcion: 'Primer capítulo', archivo: 'cap1.pdf' },
        { id: 2, numero: 2, titulo: 'La batalla', descripcion: 'Segundo capítulo', archivo: 'cap2.pdf' },
        { id: 3, numero: 3, titulo: 'La revelación', descripcion: 'Tercer capítulo', archivo: 'cap3.pdf' }
      ];
      
      this.renderCapitulosList();
    } catch (error) {
      this.showNotification('Error al cargar los capítulos', 'error');
    }
  }

  /**
   * Renderizar lista de capítulos
   */
  private renderCapitulosList(): void {
    const container = document.getElementById('capitulos-table-container');
    const noManga = document.getElementById('no-manga-seleccionado');
    const capitulosList = document.getElementById('capitulos-list');
    const mangaNombre = document.getElementById('manga-nombre');

    if (this.selectedManga) {
      this.toggleElement('#no-manga-seleccionado', false);
      this.toggleElement('#capitulos-list', true);
      if (mangaNombre) mangaNombre.textContent = this.selectedManga.nombre;

      if (container) {
        container.innerHTML = `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${this.capitulos.map(capitulo => `
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${capitulo.numero}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${capitulo.titulo}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">
                      ${capitulo.descripcion}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${capitulo.archivo}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button class="text-blue-600 hover:text-blue-900 mr-3" data-capitulo-id="${capitulo.id}" data-action="edit-capitulo">
                        <i class="fas fa-edit"></i> Editar
                      </button>
                      <button class="text-red-600 hover:text-red-900" data-capitulo-id="${capitulo.id}" data-action="delete-capitulo">
                        <i class="fas fa-trash"></i> Eliminar
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    } else {
      this.toggleElement('#no-manga-seleccionado', true);
      this.toggleElement('#capitulos-list', false);
    }
  }

  /**
   * Editar capítulo
   */
  public editCapitulo(capituloId: number): void {
    const capitulo = this.capitulos.find(c => c.id === capituloId);
    if (capitulo) {
      this.fillCapituloForm(capitulo);
      this.showModalCapitulo('edit');
    }
  }

  /**
   * Eliminar capítulo
   */
  public deleteCapitulo(capituloId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este capítulo?')) {
      this.capitulos = this.capitulos.filter(c => c.id !== capituloId);
      this.renderCapitulosList();
      this.showNotification('Capítulo eliminado correctamente', 'success');
    }
  }

  /**
   * Mostrar modal de manga
   */
  private async showModalManga(mode: 'add' | 'edit' = 'add'): Promise<void> {
    try {
      const response = await fetch('/view/admin/modal-manga.html');
      const modalHtml = await response.text();
      
      // Crear elemento temporal para insertar el modal
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = modalHtml;
      const modal = tempDiv.firstElementChild as HTMLElement;
      
      // Insertar el modal al final del body
      document.body.appendChild(modal);
      
      // Configurar el modal
      const title = document.getElementById('modal-manga-title');
      const form = document.getElementById('form-manga') as HTMLFormElement;

      if (mode === 'edit') {
        title!.textContent = 'Editar Manga';
        form.dataset.mode = 'edit';
      } else {
        title!.textContent = 'Agregar Nuevo Manga';
        form.dataset.mode = 'add';
        this.clearMangaForm();
      }

      this.toggleElement('#modal-manga', true);
      
      // Configurar event listeners del modal
      this.setupModalEventListeners();
      
    } catch (error) {
      console.error('Error cargando modal de manga:', error);
      this.showNotification('Error cargando modal', 'error');
    }
  }

  /**
   * Ocultar modal de manga
   */
  private hideModalManga(): void {
    const modal = document.getElementById('modal-manga');
    if (modal) {
      modal.remove();
    }
    this.clearMangaForm();
  }

  /**
   * Mostrar modal de capítulo
   */
  private async showModalCapitulo(mode: 'add' | 'edit' = 'add'): Promise<void> {
    try {
      const response = await fetch('/view/admin/modal-capitulo.html');
      const modalHtml = await response.text();
      
      // Crear elemento temporal para insertar el modal
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = modalHtml;
      const modal = tempDiv.firstElementChild as HTMLElement;
      
      // Insertar el modal al final del body
      document.body.appendChild(modal);
      
      // Configurar el modal
      const title = document.getElementById('modal-capitulo-title');
      const form = document.getElementById('form-capitulo') as HTMLFormElement;

      if (mode === 'edit') {
        title!.textContent = 'Editar Capítulo';
        form.dataset.mode = 'edit';
      } else {
        title!.textContent = 'Agregar Nuevo Capítulo';
        form.dataset.mode = 'add';
        this.clearCapituloForm();
      }

      this.toggleElement('#modal-capitulo', true);
      
      // Configurar event listeners del modal
      this.setupModalEventListeners();
      
    } catch (error) {
      console.error('Error cargando modal de capítulo:', error);
      this.showNotification('Error cargando modal', 'error');
    }
  }

  /**
   * Ocultar modal de capítulo
   */
  private hideModalCapitulo(): void {
    const modal = document.getElementById('modal-capitulo');
    if (modal) {
      modal.remove();
    }
    this.clearCapituloForm();
  }

  /**
   * Llenar formulario de manga
   */
  private fillMangaForm(manga: Manga): void {
    this.fillForm('#form-manga', manga);
  }

  /**
   * Limpiar formulario de manga
   */
  private clearMangaForm(): void {
    this.clearForm('#form-manga');
    const form = document.getElementById('form-manga') as HTMLFormElement;
    if (form) form.dataset.mode = 'add';
  }

  /**
   * Llenar formulario de capítulo
   */
  private fillCapituloForm(capitulo: Capitulo): void {
    this.fillForm('#form-capitulo', capitulo);
  }

  /**
   * Limpiar formulario de capítulo
   */
  private clearCapituloForm(): void {
    this.clearForm('#form-capitulo');
    const form = document.getElementById('form-capitulo') as HTMLFormElement;
    if (form) form.dataset.mode = 'add';
  }

  /**
   * Manejar envío de formulario de manga
   */
  private async handleMangaSubmit(): Promise<void> {
    const form = document.getElementById('form-manga') as HTMLFormElement;
    const formData = this.getFormData('#form-manga');
    const mode = form.dataset.mode;

    if (!this.validateForm(form)) {
      this.showNotification('Por favor, completa todos los campos requeridos', 'error');
      return;
    }

    try {
      this.showLoading('#form-manga button[type="submit"]');
      
      if (mode === 'edit') {
        this.showNotification('Manga actualizado correctamente', 'success');
      } else {
        const newManga: Manga = {
          id: this.mangas.length + 1,
          ...formData as any,
          capitulos: 0
        };
        this.mangas.push(newManga);
        this.renderMangasTable();
        this.showNotification('Manga agregado correctamente', 'success');
      }

      this.hideModalManga();
    } catch (error) {
      this.showNotification('Error al procesar el manga', 'error');
    } finally {
      this.hideLoading('#form-manga button[type="submit"]');
    }
  }

  /**
   * Manejar envío de formulario de capítulo
   */
  private async handleCapituloSubmit(): Promise<void> {
    const form = document.getElementById('form-capitulo') as HTMLFormElement;
    const formData = this.getFormData('#form-capitulo');
    const mode = form.dataset.mode;

    if (!this.validateForm(form)) {
      this.showNotification('Por favor, completa todos los campos requeridos', 'error');
      return;
    }

    try {
      this.showLoading('#form-capitulo button[type="submit"]');
      
      if (mode === 'edit') {
        this.showNotification('Capítulo actualizado correctamente', 'success');
      } else {
        const newCapitulo: Capitulo = {
          id: this.capitulos.length + 1,
          ...formData as any
        };
        this.capitulos.push(newCapitulo);
        this.renderCapitulosList();
        this.showNotification('Capítulo agregado correctamente', 'success');
      }

      this.hideModalCapitulo();
    } catch (error) {
      this.showNotification('Error al procesar el capítulo', 'error');
    } finally {
      this.hideLoading('#form-capitulo button[type="submit"]');
    }
  }
}

// Exportar para uso en otros módulos
export default AdminModule; 