(() => {
  const App = {
    htmlElements: {
      btnMangaView: document.getElementById("btn-manga-view"),
      btnCapitulosView: document.getElementById("btn-capitulos-view"),
      btnAgregarManga: document.getElementById("btn-agregar-manga"),
      btnAgregarCapitulo: document.getElementById("btn-agregar-capitulo"),
      mangaView: document.getElementById("manga-view"),
      capitulosView: document.getElementById("capitulos-view"),
      mangaListBody: document.getElementById("manga-list-body"),
      mangasCapitulosList: document.getElementById("mangas-capitulos-list"),
      capitulosTable: document.getElementById("capitulos-table"),
      capitulosList: document.getElementById("capitulos-list"),
      mangaSeleccionado: document.getElementById("manga-seleccionado"),

      // Elementos de mangas mejorados
      listaMangas: document.getElementById("lista-mangas"),
      loadingMangas: document.getElementById("loading-mangas"),
      noMangas: document.getElementById("no-mangas"),
      modalMangaContent: document.getElementById("modal-manga-content"),
      modalMangaTitle: document.getElementById("modal-manga-title"),
      btnGuardarManga: document.getElementById("btn-guardar-manga"),

      // Elementos de categorías
      categoriasView: document.getElementById("categorias-view"),
      btnAgregarCategoria: document.getElementById("btn-agregar-categoria"),
      listaCategorias: document.getElementById("lista-categorias"),
      loadingCategorias: document.getElementById("loading-categorias"),
      noCategorias: document.getElementById("no-categorias"),

      // Modales
      modalAgregarManga: document.getElementById("modal-agregar-manga"),
      modalEditarManga: document.getElementById("modal-editar-manga"),
      modalAgregarCapitulo: document.getElementById("modal-agregar-capitulo"),
      modalEditarCapitulo: document.getElementById("modal-editar-capitulo"),
      modalCategoria: document.getElementById("modal-categoria"),
      modalCategoriaContent: document.getElementById("modal-categoria-content"),
      closeModalAgregarManga: document.getElementById(
        "close-modal-agregar-manga",
      ),
      closeModalEditarManga: document.getElementById("close-modal-manga"),
      closeModalAgregarCapitulo: document.getElementById(
        "close-modal-agregar-capitulo",
      ),
      closeModalEditarCapitulo: document.getElementById("close-modal-capitulo"),
      closeModalCategoria: document.getElementById("close-modal-categoria"),
      cancelarAgregarManga: document.getElementById("cancelar-agregar-manga"),
      cancelarEditarManga: document.getElementById("cancelar-editar-manga"),
      cancelarAgregarCapitulo: document.getElementById(
        "cancelar-agregar-capitulo",
      ),
      cancelarEditarCapitulo: document.getElementById(
        "cancelar-editar-capitulo",
      ),
      cancelarCategoria: document.getElementById("cancelar-categoria"),

      // Formularios
      formAgregarManga: document.getElementById("form-agregar-manga"),
      formEditarManga: document.getElementById("form-editar-manga"),
      formAgregarCapitulo: document.getElementById("form-agregar-capitulo"),
      formEditarCapitulo: document.getElementById("form-editar-capitulo"),
      formCategoria: document.getElementById("form-categoria"),
      modalCategoriaTitle: document.getElementById("modal-categoria-title"),
      btnGuardarCategoria: document.getElementById("btn-guardar-categoria"),
    },

    init() {
      this.cargarMangasModerno();
      // this.cargarMangasCapitulos(); // OBSOLETO - Ya no se necesita
      this.cargarCategorias();
      this.cargarCategoriasEnSelect();
      this.bindEvents();
      this.iniciarReloj();
      this.configurarNavegacion();
      this.configurarPreviewImagen();
      this.configurarPreviewPDF();
    },

    bindEvents() {
      // Navegación
      if (this.htmlElements.btnMangaView) {
        this.htmlElements.btnMangaView.addEventListener("click", () => {
          this.mostrarVista("manga");
          this.cargarMangasModerno();
        });
      }
      if (this.htmlElements.btnCapitulosView) {
        this.htmlElements.btnCapitulosView.addEventListener("click", () => {
          this.mostrarVista("capitulos");
          this.cargarMangasParaCapitulos();
        });
      }

      // Botones de agregar
      if (this.htmlElements.btnAgregarManga) {
        this.htmlElements.btnAgregarManga.addEventListener("click", () =>
          this.abrirModalManga(),
        );
      }
      if (this.htmlElements.cancelarAgregarCapitulo) {
        this.htmlElements.cancelarAgregarCapitulo.addEventListener(
          "click",
          () => this.cerrarModalCapitulo(),
        );
      }
      if (this.htmlElements.btnAgregarCategoria) {
        this.htmlElements.btnAgregarCategoria.addEventListener("click", () =>
          this.abrirModalCategoria(),
        );
      }

      // Cerrar modales
      if (this.htmlElements.closeModalAgregarManga) {
        this.htmlElements.closeModalAgregarManga.addEventListener("click", () =>
          this.cerrarModalManga(),
        );
      }
      if (this.htmlElements.closeModalEditarManga) {
        this.htmlElements.closeModalEditarManga.addEventListener("click", () =>
          this.cerrarModal("editar-manga"),
        );
      }
      if (this.htmlElements.closeModalAgregarCapitulo) {
        this.htmlElements.closeModalAgregarCapitulo.addEventListener(
          "click",
          () => this.cerrarModal("agregar-capitulo"),
        );
      }
      if (this.htmlElements.closeModalEditarCapitulo) {
        this.htmlElements.closeModalEditarCapitulo.addEventListener(
          "click",
          () => this.cerrarModal("editar-capitulo"),
        );
      }
      if (this.htmlElements.closeModalCategoria) {
        this.htmlElements.closeModalCategoria.addEventListener("click", () =>
          this.cerrarModalCategoria(),
        );
      }

      // Cancelar modales
      if (this.htmlElements.cancelarAgregarManga) {
        this.htmlElements.cancelarAgregarManga.addEventListener("click", () =>
          this.cerrarModalManga(),
        );
      }
      if (this.htmlElements.cancelarEditarManga) {
        this.htmlElements.cancelarEditarManga.addEventListener("click", () =>
          this.cerrarModal("editar-manga"),
        );
      }
      if (this.htmlElements.cancelarAgregarCapitulo) {
        this.htmlElements.cancelarAgregarCapitulo.addEventListener(
          "click",
          () => this.cerrarModal("agregar-capitulo"),
        );
      }
      if (this.htmlElements.cancelarEditarCapitulo) {
        this.htmlElements.cancelarEditarCapitulo.addEventListener("click", () =>
          this.cerrarModal("editar-capitulo"),
        );
      }
      if (this.htmlElements.cancelarCategoria) {
        this.htmlElements.cancelarCategoria.addEventListener("click", () =>
          this.cerrarModalCategoria(),
        );
      }

      // Formularios
      if (this.htmlElements.formAgregarManga) {
        this.htmlElements.formAgregarManga.addEventListener("submit", (e) =>
          this.guardarMangaModerno(e),
        );
      }
      if (this.htmlElements.formEditarManga) {
        this.htmlElements.formEditarManga.addEventListener("submit", (e) =>
          this.guardarManga(e),
        );
      }
      if (this.htmlElements.formAgregarCapitulo) {
        this.htmlElements.formAgregarCapitulo.addEventListener("submit", (e) =>
          this.guardarCapituloModerno(e),
        );
      }
      if (this.htmlElements.formEditarCapitulo) {
        this.htmlElements.formEditarCapitulo.addEventListener("submit", (e) =>
          this.guardarCapitulo(e),
        );
      }
      if (this.htmlElements.formCategoria) {
        this.htmlElements.formCategoria.addEventListener("submit", (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          this.guardarCategoria(formData);
        });
      }
    },

    mostrarVista(vista) {
      // Ocultar todas las vistas
      const todasLasVistas = [
        "dashboard-view",
        "manga-view",
        "capitulos-view",
        "usuarios-view",
        "transacciones-view",
        "categorias-view",
      ];

      todasLasVistas.forEach((vistaId) => {
        const elemento = document.getElementById(vistaId);
        if (elemento) elemento.classList.add("hidden");
      });

      // Mostrar la vista seleccionada
      let vistaId;
      if (vista === "manga") {
        vistaId = "manga-view";
      } else if (vista === "capitulos") {
        vistaId = "capitulos-view";
      } else {
        vistaId = vista + "-view";
      }

      const vistaSeleccionada = document.getElementById(vistaId);
      if (vistaSeleccionada) {
        vistaSeleccionada.classList.remove("hidden");
      }
    },

    cargarMangas() {
      const tbody = this.htmlElements.mangaListBody;
      if (!tbody) return;

      tbody.innerHTML = "";

      this.mangas.forEach((manga) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50";
        row.innerHTML = `
          <td class="px-6 py-4">
            <img src="${manga.portada}" alt="${manga.nombre}" class="w-12 h-16 object-cover rounded">
          </td>
          <td class="px-6 py-4 font-lilita">${manga.nombre}</td>
          <td class="px-6 py-4">${manga.genero}</td>
          <td class="px-6 py-4 max-w-xs truncate">${manga.sinopsis}</td>
          <td class="px-6 py-4 text-center">${manga.capitulos.length}</td>
          <td class="px-6 py-4">
            <div class="flex space-x-2">
              <button onclick="App.editarManga(${manga.id})" class="bg-principal hover:bg-secundario text-white px-3 py-1 rounded font-lilita text-sm transition-colors duration-300">
                Editar
              </button>
              <button onclick="App.eliminarManga(${manga.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-lilita text-sm transition-colors duration-300">
                Eliminar
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    },

    cargarMangasCapitulos() {
      const tbody = this.htmlElements.mangasCapitulosList;
      if (!tbody) return;

      tbody.innerHTML = "";

      this.mangas.forEach((manga) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50";
        row.innerHTML = `
          <td class="px-6 py-4 font-lilita">${manga.nombre}</td>
          <td class="px-6 py-4">
            <button onclick="App.verCapitulos(${manga.id})" class="bg-principal hover:bg-secundario text-white px-4 py-2 rounded font-lilita transition-colors duration-300">
              Ver Capítulos
            </button>
          </td>
        `;
        tbody.appendChild(row);
      });
    },

    verCapitulos(mangaId) {
      const manga = this.mangas.find((m) => m.id === mangaId);
      if (!manga) return;

      if (this.htmlElements.mangaSeleccionado) {
        this.htmlElements.mangaSeleccionado.textContent = manga.nombre;
      }
      if (this.htmlElements.capitulosTable) {
        this.htmlElements.capitulosTable.classList.remove("hidden");
      }

      const tbody = this.htmlElements.capitulosList;
      if (!tbody) return;

      tbody.innerHTML = "";

      manga.capitulos.forEach((capitulo) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50";
        row.innerHTML = `
          <td class="px-6 py-4 text-center">${capitulo.numero}</td>
          <td class="px-6 py-4 font-lilita">${capitulo.nombre}</td>
          <td class="px-6 py-4">${capitulo.precio}</td>
          <td class="px-6 py-4 max-w-xs truncate">${capitulo.sinopsis}</td>
          <td class="px-6 py-4">
            <div class="flex space-x-2">
              <button onclick="App.editarCapitulo(${manga.id}, ${capitulo.id})" class="bg-principal hover:bg-secundario text-white px-3 py-1 rounded font-lilita text-sm transition-colors duration-300">
                Editar Capítulo
              </button>
              <button onclick="App.eliminarCapitulo(${manga.id}, ${capitulo.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-lilita text-sm transition-colors duration-300">
                Eliminar Capítulo
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    },

    editarManga(mangaId) {
      const manga = this.mangas.find((m) => m.id === mangaId);
      if (!manga) return;

      const nombreInput = document.getElementById("edit-manga-nombre");
      const generoInput = document.getElementById("edit-manga-genero");
      const sinopsisInput = document.getElementById("edit-manga-sinopsis");
      const portadaInput = document.getElementById("edit-manga-portada");

      if (nombreInput) nombreInput.value = manga.nombre;
      if (generoInput) generoInput.value = manga.genero;
      if (sinopsisInput) sinopsisInput.value = manga.sinopsis;
      if (portadaInput) portadaInput.value = manga.portada;

      if (this.htmlElements.modalEditarManga) {
        this.htmlElements.modalEditarManga.classList.remove("hidden");
        this.htmlElements.modalEditarManga.classList.add("flex");
      }
    },

    editarCapitulo(mangaId, capituloId) {
      const manga = this.mangas.find((m) => m.id === mangaId);
      const capitulo = manga?.capitulos.find((c) => c.id === capituloId);
      if (!capitulo) return;

      const numeroInput = document.getElementById("edit-capitulo-numero");
      const nombreInput = document.getElementById("edit-capitulo-nombre");
      const precioInput = document.getElementById("edit-capitulo-precio");
      const sinopsisInput = document.getElementById("edit-capitulo-sinopsis");

      if (numeroInput) numeroInput.value = capitulo.numero.toString();
      if (nombreInput) nombreInput.value = capitulo.nombre;
      if (precioInput) precioInput.value = capitulo.precio.toString();
      if (sinopsisInput) sinopsisInput.value = capitulo.sinopsis;

      if (this.htmlElements.modalEditarCapitulo) {
        this.htmlElements.modalEditarCapitulo.classList.remove("hidden");
        this.htmlElements.modalEditarCapitulo.classList.add("flex");
      }
    },

    abrirModal(tipo) {
      if (tipo === "agregar-manga") {
        if (this.htmlElements.modalAgregarManga) {
          this.htmlElements.modalAgregarManga.classList.remove("hidden");
          this.htmlElements.modalAgregarManga.classList.add("flex");
        }
      } else if (tipo === "agregar-capitulo") {
        if (this.htmlElements.modalAgregarCapitulo) {
          this.htmlElements.modalAgregarCapitulo.classList.remove("hidden");
          this.htmlElements.modalAgregarCapitulo.classList.add("flex");
        }
      }
    },

    agregarManga(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const nuevoManga = {
        id: this.mangas.length + 1,
        nombre: formData.get("nombre"),
        genero: formData.get("genero"),
        sinopsis: formData.get("sinopsis"),
        portada: formData.get("portada"),
        capitulos: [],
      };

      this.mangas.push(nuevoManga);
      this.cargarMangas();
      this.cargarMangasCapitulos();
      this.cerrarModal("agregar-manga");
      e.target.reset();
      alert("Manga agregado correctamente");
    },

    agregarCapitulo(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const mangaSeleccionado = this.mangas.find(
        (m) => m.nombre === this.htmlElements.mangaSeleccionado.textContent,
      );

      if (!mangaSeleccionado) {
        alert("Por favor selecciona un manga primero");
        return;
      }

      const nuevoCapitulo = {
        id: mangaSeleccionado.capitulos.length + 1,
        numero: parseInt(formData.get("numero")),
        nombre: formData.get("nombre"),
        precio: parseFloat(formData.get("precio")),
        sinopsis: formData.get("sinopsis"),
      };

      mangaSeleccionado.capitulos.push(nuevoCapitulo);
      this.verCapitulos(mangaSeleccionado.id);
      this.cerrarModal("agregar-capitulo");
      e.target.reset();
      alert("Capítulo agregado correctamente");
    },

    cerrarModal(tipo) {
      if (tipo === "agregar-manga") {
        if (this.htmlElements.modalAgregarManga) {
          this.htmlElements.modalAgregarManga.classList.add("hidden");
          this.htmlElements.modalAgregarManga.classList.remove("flex");
        }
      } else if (tipo === "editar-manga") {
        if (this.htmlElements.modalEditarManga) {
          this.htmlElements.modalEditarManga.classList.add("hidden");
          this.htmlElements.modalEditarManga.classList.remove("flex");
        }
      } else if (tipo === "agregar-capitulo") {
        if (this.htmlElements.modalAgregarCapitulo) {
          this.htmlElements.modalAgregarCapitulo.classList.add("hidden");
          this.htmlElements.modalAgregarCapitulo.classList.remove("flex");
        }
      } else if (tipo === "editar-capitulo") {
        if (this.htmlElements.modalEditarCapitulo) {
          this.htmlElements.modalEditarCapitulo.classList.add("hidden");
          this.htmlElements.modalEditarCapitulo.classList.remove("flex");
        }
      }
    },

    guardarManga(e) {
      e.preventDefault();
      alert("Manga actualizado correctamente");
      this.cerrarModal("editar-manga");
    },

    guardarCapitulo(e) {
      e.preventDefault();
      alert("Capítulo actualizado correctamente");
      this.cerrarModal("editar-capitulo");
    },

    eliminarManga(mangaId) {
      if (confirm("¿Estás seguro de que quieres eliminar este manga?")) {
        this.mangas = this.mangas.filter((m) => m.id !== mangaId);
        this.cargarMangas();
        this.cargarMangasCapitulos();
        alert("Manga eliminado correctamente");
      }
    },

    eliminarCapitulo(mangaId, capituloId) {
      if (confirm("¿Estás seguro de que quieres eliminar este capítulo?")) {
        const manga = this.mangas.find((m) => m.id === mangaId);
        if (manga) {
          manga.capitulos = manga.capitulos.filter((c) => c.id !== capituloId);
          this.verCapitulos(mangaId);
          alert("Capítulo eliminado correctamente");
        }
      }
    },

    // Función para actualizar la hora
    actualizarHora() {
      const ahora = new Date();
      const hora = ahora.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const fecha = ahora.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const horaElement = document.getElementById("hora-actual");
      const fechaElement = document.getElementById("fecha-actual");

      if (horaElement) horaElement.textContent = hora;
      if (fechaElement) fechaElement.textContent = fecha;
    },

    // Iniciar el reloj
    iniciarReloj() {
      this.actualizarHora();
      setInterval(() => this.actualizarHora(), 1000);
    },

    // === MÉTODOS PARA MANGAS MODERNOS ===

    // Configurar preview de imagen
    configurarPreviewImagen() {
      const inputImagen = document.getElementById("manga-imagen");
      const previewContainer = document.getElementById("preview-imagen");
      const imagenPreview = document.getElementById("imagen-preview");
      const placeholder = document.getElementById("imagen-placeholder");

      if (inputImagen) {
        inputImagen.addEventListener("change", function (e) {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
              if (imagenPreview && previewContainer && placeholder) {
                imagenPreview.src = e.target.result;
                imagenPreview.style.display = "block";
                placeholder.style.display = "none";
                previewContainer.classList.remove("hidden");
              }
            };
            reader.readAsDataURL(file);
          } else {
            if (previewContainer) previewContainer.classList.add("hidden");
            if (imagenPreview) imagenPreview.style.display = "none";
            if (placeholder) placeholder.style.display = "block";
          }
        });
      }
    },

    // Configurar preview de PDF para capítulos
    configurarPreviewPDF() {
      const inputPDF = document.getElementById("capitulo-pdf");
      const pdfInfo = document.getElementById("pdf-info");
      const pdfPages = document.getElementById("pdf-pages");
      const pdfSize = document.getElementById("pdf-size");

      if (inputPDF) {
        inputPDF.addEventListener(
          "change",
          async function (e) {
            const file = e.target.files[0];

            if (file) {
              // Validar que sea un PDF
              if (file.type !== "application/pdf") {
                this.mostrarError("Solo se permiten archivos PDF");
                e.target.value = "";
                if (pdfInfo) pdfInfo.classList.add("hidden");
                return;
              }

              // Validar tamaño (50MB máximo)
              const maxSize = 50 * 1024 * 1024; // 50MB en bytes
              if (file.size > maxSize) {
                this.mostrarError(
                  "El archivo PDF es demasiado grande. Máximo 50MB",
                );
                e.target.value = "";
                if (pdfInfo) pdfInfo.classList.add("hidden");
                return;
              }

              // Mostrar información del archivo
              if (pdfInfo && pdfPages && pdfSize) {
                const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                pdfSize.textContent = `${fileSizeMB} MB`;

                // Cambiar color según el tamaño
                if (file.size > 20 * 1024 * 1024) {
                  // > 20MB
                  pdfSize.className = "text-xs text-orange-600";
                } else if (file.size > 10 * 1024 * 1024) {
                  // > 10MB
                  pdfSize.className = "text-xs text-yellow-600";
                } else {
                  pdfSize.className = "text-xs text-green-600";
                }

                pdfInfo.classList.remove("hidden");
                pdfPages.textContent = "Validando...";

                // Simular validación de PDF
                setTimeout(() => {
                  pdfPages.textContent = "PDF válido";
                  pdfPages.className = "text-sm font-lilita text-green-700";
                }, 500);
              }
            } else {
              if (pdfInfo) pdfInfo.classList.add("hidden");
            }
          }.bind(this),
        );
      }
    },

    // Abrir modal para agregar/editar manga
    abrirModalManga(manga = null) {
      const modal = this.htmlElements.modalAgregarManga;
      const modalContent = this.htmlElements.modalMangaContent;
      const title = this.htmlElements.modalMangaTitle;
      const form = this.htmlElements.formAgregarManga;
      const btnGuardar = this.htmlElements.btnGuardarManga;

      if (!modal || !modalContent || !form) return;

      // Resetear formulario
      form.reset();

      // Cargar categorías en el select
      this.cargarCategoriasEnSelect();

      // Configurar preview de PDF si es modal de capítulo
      this.configurarPreviewPDF();

      // Limpiar preview de imagen
      const previewContainer = document.getElementById("preview-imagen");
      const imagenPreview = document.getElementById("imagen-preview");
      const placeholder = document.getElementById("imagen-placeholder");

      if (previewContainer) previewContainer.classList.add("hidden");
      if (imagenPreview) imagenPreview.style.display = "none";
      if (placeholder) placeholder.style.display = "block";

      if (manga) {
        // Modo edición
        document.getElementById("manga-id").value = manga._id;
        document.getElementById("manga-titulo").value = manga.title;
        document.getElementById("manga-autor").value = manga.author || "";
        document.getElementById("manga-estado").value =
          manga.status || "ongoing";
        document.getElementById("manga-descripcion").value = manga.description;

        // Cargar categorías primero, luego seleccionar la del manga
        this.cargarCategoriasEnSelect().then(() => {
          const generoSelect = document.getElementById("manga-genero");
          if (generoSelect) {
            generoSelect.value = manga.genre || manga.categories?.[0] || "";
          }
        });

        // Mostrar imagen actual si existe
        if (
          manga.imageURL &&
          imagenPreview &&
          previewContainer &&
          placeholder
        ) {
          imagenPreview.src = manga.imageURL;
          imagenPreview.style.display = "block";
          placeholder.style.display = "none";
          previewContainer.classList.remove("hidden");
        }

        if (title) {
          title.innerHTML =
            '<i class="fas fa-edit mr-3"></i><span>Editar Manga</span>';
        }
        if (btnGuardar) {
          btnGuardar.innerHTML =
            '<i class="fas fa-save mr-2"></i><span>Actualizar Manga</span>';
        }
      } else {
        // Modo agregar
        document.getElementById("manga-id").value = "";

        if (title) {
          title.innerHTML =
            '<i class="fas fa-plus mr-3"></i><span>Nuevo Manga</span>';
        }
        if (btnGuardar) {
          btnGuardar.innerHTML =
            '<i class="fas fa-save mr-2"></i><span>Guardar Manga</span>';
        }
      }

      // Mostrar modal con animación
      modal.classList.remove("hidden");
      modal.classList.add("flex");

      setTimeout(() => {
        modalContent.classList.remove("scale-95", "opacity-0");
        modalContent.classList.add("scale-100", "opacity-100");
      }, 10);

      // Focus en el primer campo
      const tituloInput = document.getElementById("manga-titulo");
      if (tituloInput) {
        setTimeout(() => tituloInput.focus(), 100);
      }
    },

    // Cerrar modal de manga
    cerrarModalManga() {
      const modal = this.htmlElements.modalAgregarManga;
      const modalContent = this.htmlElements.modalMangaContent;

      if (!modal || !modalContent) return;

      // Animación de salida
      modalContent.classList.remove("scale-100", "opacity-100");
      modalContent.classList.add("scale-95", "opacity-0");

      setTimeout(() => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      }, 200);
    },

    // Guardar manga (crear o actualizar)
    async guardarMangaModerno(e) {
      e.preventDefault();

      const formData = new FormData(e.target);
      const id =
        formData.get("id") || document.getElementById("manga-id").value;

      try {
        let response;
        if (id) {
          // Actualizar
          response = await fetch(`/api/mangas/${id}`, {
            method: "PUT",
            body: formData,
          });
        } else {
          // Crear
          response = await fetch("/api/mangas", {
            method: "POST",
            body: formData,
          });
        }

        const result = await response.json();

        if (result.success) {
          this.mostrarExito(
            id
              ? "Manga actualizado correctamente"
              : "Manga creado correctamente",
          );
          this.cerrarModalManga();
          this.cargarMangasModerno(); // Recargar lista
        } else {
          this.mostrarError(result.error || "Error al guardar manga");
        }
      } catch (error) {
        console.error("Error al guardar manga:", error);
        this.mostrarError("Error de conexión al guardar manga");
      }
    },

    // Editar manga
    async editarMangaModerno(id) {
      try {
        const response = await fetch(`/api/mangas/${id}`);
        const result = await response.json();

        if (result.success) {
          this.abrirModalManga(result.data);
        } else {
          this.mostrarError("Error al cargar datos del manga");
        }
      } catch (error) {
        console.error("Error al editar manga:", error);
        this.mostrarError("Error de conexión");
      }
    },

    // Eliminar manga
    async eliminarMangaModerno(id, titulo) {
      if (
        !confirm(
          `¿Estás seguro de que quieres eliminar el manga "${titulo}"?\n\nEsta acción eliminará también todos sus capítulos y no se puede deshacer.`,
        )
      ) {
        return;
      }

      try {
        const response = await fetch(`/api/mangas/${id}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          this.mostrarExito("Manga eliminado correctamente");
          this.cargarMangasModerno(); // Recargar lista
        } else {
          this.mostrarError(result.error || "Error al eliminar manga");
        }
      } catch (error) {
        console.error("Error al eliminar manga:", error);
        this.mostrarError("Error de conexión al eliminar manga");
      }
    },

    // Cargar mangas para la sección de capítulos
    async cargarMangasParaCapitulos() {
      const tbody = this.htmlElements.mangasCapitulosList;
      const loadingElement = document.getElementById(
        "loading-mangas-capitulos",
      );

      if (!tbody) return;

      // Mostrar loading
      if (loadingElement) loadingElement.style.display = "block";

      try {
        const response = await fetch("/api/mangas");
        const result = await response.json();

        if (result.success) {
          this.mostrarMangasParaCapitulos(result.data);
        } else {
          tbody.innerHTML = `
            <tr>
              <td colspan="2" class="px-6 py-8 text-center text-red-500 font-lilita">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p>Error al cargar mangas</p>
              </td>
            </tr>
          `;
        }
      } catch (error) {
        console.error("Error al cargar mangas:", error);
        tbody.innerHTML = `
          <tr>
            <td colspan="2" class="px-6 py-8 text-center text-red-500 font-lilita">
              <i class="fas fa-wifi text-2xl mb-2"></i>
              <p>Error de conexión</p>
            </td>
          </tr>
        `;
      }

      // Ocultar loading
      if (loadingElement) loadingElement.style.display = "none";
    },

    // Mostrar mangas en la tabla de capítulos
    mostrarMangasParaCapitulos(mangas) {
      const tbody = this.htmlElements.mangasCapitulosList;
      if (!tbody) return;

      if (mangas.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="2" class="px-6 py-8 text-center text-gray-500 font-lilita">
              <div class="flex flex-col items-center">
                <i class="fas fa-book-open text-4xl mb-2"></i>
                <p>No hay mangas disponibles</p>
                <p class="text-sm">Agrega mangas desde la gestión de mangas</p>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = mangas
        .map(
          (manga) => `
          <tr class="hover:bg-gray-50 transition-colors duration-200">
            <td class="px-6 py-4 font-lilita text-gray-800">${manga.title}</td>
            <td class="px-6 py-4">
              <button
                onclick="App.verCapitulosManga('${manga._id}', '${manga.title.replace(/'/g, "\\'")}')"
                class="bg-gradient-to-r from-principal to-secundario hover:from-secundario hover:to-principal text-white px-4 py-2 rounded-lg font-lilita transition-all duration-300 hover:transform hover:scale-105 shadow-lg flex items-center"
              >
                <i class="fas fa-list mr-2"></i>
                Ver Capítulos (${manga.chapterCount || 0})
              </button>
            </td>
          </tr>
        `,
        )
        .join("");
    },

    // Ver capítulos de un manga
    async verCapitulosManga(mangaId, titulo) {
      // Cambiar a la vista de capítulos
      this.mostrarVista("capitulos");

      // Actualizar la información del manga seleccionado
      const mangaSeleccionado = document.getElementById("manga-seleccionado");
      if (mangaSeleccionado) {
        mangaSeleccionado.textContent = titulo;
      }

      // Mostrar la tabla de capítulos
      const capitulosTable = document.getElementById("capitulos-table");
      if (capitulosTable) {
        capitulosTable.classList.remove("hidden");
      }

      // Mostrar loading de capítulos
      const loadingCapitulos = document.getElementById("loading-capitulos");
      if (loadingCapitulos) {
        loadingCapitulos.classList.remove("hidden");
      }

      // Cargar capítulos del manga específico
      await this.cargarCapitulosPorManga(mangaId);

      // Ocultar loading de capítulos
      if (loadingCapitulos) {
        loadingCapitulos.classList.add("hidden");
      }

      // Configurar el botón de agregar capítulo para este manga
      const btnAgregarCapitulo = document.getElementById(
        "btn-agregar-capitulo",
      );
      if (btnAgregarCapitulo) {
        btnAgregarCapitulo.onclick = () => this.abrirModalCapitulo(mangaId);
      }
    },

    // Cargar capítulos de un manga específico
    async cargarCapitulosPorManga(mangaId) {
      try {
        const response = await fetch(`/api/mangas/${mangaId}/chapters`);
        const result = await response.json();

        if (result.success) {
          this.mostrarCapitulos(result.data, mangaId);
        } else {
          console.error("Error al cargar capítulos:", result.error);
          this.mostrarError("Error al cargar capítulos");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        this.mostrarError("Error de conexión al cargar capítulos");
      }
    },

    // Mostrar capítulos en la tabla
    mostrarCapitulos(capitulos, mangaId) {
      const capitulosList = document.getElementById("capitulos-list");
      if (!capitulosList) return;

      if (capitulos.length === 0) {
        capitulosList.innerHTML = `
          <tr>
            <td colspan="5" class="px-6 py-8 text-center text-gray-500 font-lilita">
              <div class="flex flex-col items-center">
                <i class="fas fa-book-open text-4xl mb-2"></i>
                <p>No hay capítulos disponibles</p>
                <p class="text-sm">Agrega el primer capítulo para este manga</p>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      capitulosList.innerHTML = capitulos
        .map(
          (capitulo, index) => `
          <tr class="${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition-colors duration-200">
            <td class="px-6 py-4 font-lilita text-gray-800">${capitulo.chapterNumber}</td>
            <td class="px-6 py-4 font-lilita text-gray-800">
              ${capitulo.chapterTitle}
              ${
                capitulo.pages && capitulo.pages.length > 0
                  ? `<br><small class="text-xs text-gray-500"><i class="fas fa-file-pdf mr-1"></i>PDF disponible</small>`
                  : '<br><small class="text-xs text-red-500"><i class="fas fa-exclamation-triangle mr-1"></i>Sin PDF</small>'
              }
            </td>
            <td class="px-6 py-4 font-lilita text-gray-600">
              ${capitulo.pageCount || capitulo.pages?.length || 0}
              <small class="text-xs block">páginas</small>
            </td>
            <td class="px-6 py-4 font-lilita text-green-600">${capitulo.price} <small class="text-xs block">GalleCoins</small></td>
            <td class="px-6 py-4">
              <div class="flex space-x-2">
                <button
                  onclick="App.editarCapituloModerno('${capitulo._id}', '${mangaId}')"
                  class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg font-lilita transition-all duration-300 hover:transform hover:scale-105 shadow-lg flex items-center text-sm"
                >
                  <i class="fas fa-edit mr-1"></i>
                  Editar
                </button>
                <button
                  onclick="App.eliminarCapituloModerno('${capitulo._id}', '${capitulo.chapterTitle.replace(/'/g, "\\'")}', '${mangaId}')"
                  class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1 rounded-lg font-lilita transition-all duration-300 hover:transform hover:scale-105 shadow-lg flex items-center text-sm"
                >
                  <i class="fas fa-trash mr-1"></i>
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        `,
        )
        .join("");
    },

    // Abrir modal para agregar capítulo
    abrirModalCapitulo(mangaId, capitulo = null) {
      const modal = document.getElementById("modal-agregar-capitulo");
      const modalContent = document.getElementById("modal-capitulo-content");
      const form = document.getElementById("form-agregar-capitulo");
      const title = document.getElementById("modal-capitulo-title");
      const btnGuardar = document.getElementById("btn-guardar-capitulo");

      if (!modal || !form) return;

      // Resetear formulario
      form.reset();

      // Limpiar preview de PDF
      const pdfInfo = document.getElementById("pdf-info");
      if (pdfInfo) pdfInfo.classList.add("hidden");

      // Guardar el ID del manga
      form.dataset.mangaId = mangaId;

      if (capitulo) {
        // Modo edición
        document.getElementById("capitulo-id").value = capitulo._id;
        document.getElementById("agregar-capitulo-numero").value =
          capitulo.chapterNumber;
        document.getElementById("agregar-capitulo-nombre").value =
          capitulo.chapterTitle;
        document.getElementById("agregar-capitulo-precio").value =
          capitulo.price;
        document.getElementById("agregar-capitulo-sinopsis").value =
          capitulo.description || "";
        form.dataset.capituloId = capitulo._id;

        // Actualizar título del modal
        if (title) {
          title.innerHTML =
            '<i class="fas fa-edit mr-3"></i><span>Editar Capítulo</span>';
        }
        if (btnGuardar) {
          btnGuardar.innerHTML =
            '<i class="fas fa-save mr-2"></i><span>Actualizar Capítulo</span>';
        }

        // El PDF no es requerido en modo edición
        const pdfInput = document.getElementById("capitulo-pdf");
        if (pdfInput) {
          pdfInput.required = false;
          // Mostrar mensaje informativo sobre PDF existente
          const existingPdfInfo = document.createElement("div");
          existingPdfInfo.className =
            "mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700";
          existingPdfInfo.innerHTML =
            '<i class="fas fa-info-circle mr-1"></i>PDF actual se mantendrá si no seleccionas uno nuevo';
          pdfInput.parentNode.appendChild(existingPdfInfo);
        }
      } else {
        // Modo agregar - obtener siguiente número
        document.getElementById("capitulo-id").value = "";
        delete form.dataset.capituloId;
        this.obtenerSiguienteNumeroCapitulo(mangaId);

        // Actualizar título del modal
        if (title) {
          title.innerHTML =
            '<i class="fas fa-plus mr-3"></i><span>Nuevo Capítulo</span>';
        }
        if (btnGuardar) {
          btnGuardar.innerHTML =
            '<i class="fas fa-save mr-2"></i><span>Guardar Capítulo</span>';
        }

        // El PDF es requerido en modo agregar
        const pdfInput = document.getElementById("capitulo-pdf");
        if (pdfInput) {
          pdfInput.required = true;
          // Limpiar cualquier mensaje informativo previo
          const existingInfo = pdfInput.parentNode.querySelector(".bg-blue-50");
          if (existingInfo) existingInfo.remove();
        }
      }

      // Mostrar modal con animación
      modal.classList.remove("hidden");
      modal.classList.add("flex");

      if (modalContent) {
        setTimeout(() => {
          modalContent.classList.remove("scale-95", "opacity-0");
          modalContent.classList.add("scale-100", "opacity-100");
        }, 10);
      }

      // Focus en el primer campo
      const numeroInput = document.getElementById("agregar-capitulo-numero");
      if (numeroInput) {
        setTimeout(() => numeroInput.focus(), 100);
      }
    },

    // Obtener el siguiente número de capítulo
    async obtenerSiguienteNumeroCapitulo(mangaId) {
      try {
        const response = await fetch(`/api/mangas/${mangaId}/chapters`);
        const result = await response.json();

        if (result.success) {
          const ultimoNumero =
            result.data.length > 0
              ? Math.max(...result.data.map((cap) => cap.chapterNumber))
              : 0;

          const numeroInput = document.getElementById(
            "agregar-capitulo-numero",
          );
          if (numeroInput) {
            numeroInput.value = ultimoNumero + 1;
          }
        }
      } catch (error) {
        console.error("Error al obtener número de capítulo:", error);
      }
    },

    // Guardar capítulo (crear o actualizar)
    async guardarCapituloModerno(e) {
      e.preventDefault();

      const form = e.target;
      const mangaId = form.dataset.mangaId;
      const capituloId = form.dataset.capituloId;

      // Crear FormData para subir archivos
      const formData = new FormData(form);

      try {
        let response;
        if (capituloId) {
          // Actualizar
          response = await fetch(`/api/chapters/${capituloId}`, {
            method: "PUT",
            body: formData,
          });
        } else {
          // Crear
          response = await fetch(`/api/mangas/${mangaId}/chapters`, {
            method: "POST",
            body: formData,
          });
        }

        const result = await response.json();

        if (result.success) {
          this.mostrarExito(
            capituloId
              ? "Capítulo actualizado correctamente"
              : `Capítulo creado correctamente con ${result.data.pageCount || 0} páginas`,
          );

          // Cerrar modal con animación
          this.cerrarModalCapitulo();

          // Recargar capítulos y actualizar contador en mangas
          await this.cargarCapitulosPorManga(mangaId);
          this.cargarMangasModerno(); // Actualizar contador de capítulos
        } else {
          this.mostrarError(result.error || "Error al guardar capítulo");
        }
      } catch (error) {
        console.error("Error al guardar capítulo:", error);
        this.mostrarError("Error de conexión al guardar capítulo");
      }
    },

    // Cerrar modal de capítulo con animación
    cerrarModalCapitulo() {
      const modal = document.getElementById("modal-agregar-capitulo");
      const modalContent = document.getElementById("modal-capitulo-content");

      if (!modal) return;

      if (modalContent) {
        // Animación de salida
        modalContent.classList.remove("scale-100", "opacity-100");
        modalContent.classList.add("scale-95", "opacity-0");

        setTimeout(() => {
          modal.classList.add("hidden");
          modal.classList.remove("flex");
        }, 200);
      } else {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      }
    },

    // Editar capítulo
    async editarCapituloModerno(capituloId, mangaId) {
      try {
        const response = await fetch(`/api/mangas/${mangaId}/chapters`);
        const result = await response.json();

        if (result.success) {
          const capitulo = result.data.find((cap) => cap._id === capituloId);
          if (capitulo) {
            this.abrirModalCapitulo(mangaId, capitulo);
          } else {
            this.mostrarError("Capítulo no encontrado");
          }
        } else {
          this.mostrarError("Error al cargar datos del capítulo");
        }
      } catch (error) {
        console.error("Error al editar capítulo:", error);
        this.mostrarError("Error de conexión");
      }
    },

    // Eliminar capítulo
    async eliminarCapituloModerno(capituloId, titulo, mangaId) {
      if (
        !confirm(
          `¿Estás seguro de que quieres eliminar el capítulo "${titulo}"?\n\nEsta acción no se puede deshacer.`,
        )
      ) {
        return;
      }

      try {
        const response = await fetch(`/api/chapters/${capituloId}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          this.mostrarExito("Capítulo eliminado correctamente");
          // Recargar capítulos y actualizar contador
          await this.cargarCapitulosPorManga(mangaId);
          this.cargarMangasModerno(); // Actualizar contador de capítulos
        } else {
          this.mostrarError(result.error || "Error al eliminar capítulo");
        }
      } catch (error) {
        console.error("Error al eliminar capítulo:", error);
        this.mostrarError("Error de conexión al eliminar capítulo");
      }
    },

    // Cargar mangas desde el servidor (versión moderna)
    async cargarMangasModerno() {
      const loadingElement = this.htmlElements.loadingMangas;
      const listaElement = this.htmlElements.listaMangas;
      const noMangasElement = this.htmlElements.noMangas;

      // Mostrar loading
      if (loadingElement) loadingElement.classList.remove("hidden");
      if (listaElement) listaElement.classList.add("hidden");
      if (noMangasElement) noMangasElement.classList.add("hidden");

      try {
        const response = await fetch("/api/mangas");
        const result = await response.json();

        if (result.success) {
          this.mostrarMangasModerno(result.data);
        } else {
          console.error("Error al cargar mangas:", result.error);
          this.mostrarError("Error al cargar mangas");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        this.mostrarError("Error de conexión al cargar mangas");
      }

      // Ocultar loading
      if (loadingElement) loadingElement.classList.add("hidden");
    },

    // Mostrar mangas en la interfaz moderna
    mostrarMangasModerno(mangas) {
      const listaElement = this.htmlElements.listaMangas;
      const noMangasElement = this.htmlElements.noMangas;

      if (!listaElement) return;

      if (mangas.length === 0) {
        listaElement.classList.add("hidden");
        if (noMangasElement) noMangasElement.classList.remove("hidden");
        return;
      }

      // Ocultar mensaje de "no mangas"
      if (noMangasElement) noMangasElement.classList.add("hidden");

      // Generar HTML para los mangas
      listaElement.innerHTML = mangas
        .map(
          (manga) => `
        <div class="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
          <div class="p-6 flex items-start space-x-6">
            <!-- Portada -->
            <div class="flex-shrink-0">
              <div class="w-20 h-28 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                ${
                  manga.imageURL
                    ? `<img src="${manga.imageURL}" alt="${manga.title}" class="w-full h-full object-cover">`
                    : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                         <i class="fas fa-book text-gray-500 text-2xl"></i>
                       </div>`
                }
              </div>
            </div>

            <!-- Información del manga -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 mr-4">
                  <h3 class="text-xl font-lilita text-gray-800 mb-1">${manga.title}</h3>
                  <div class="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span class="flex items-center">
                      <i class="fas fa-tag mr-1 text-principal"></i>
                      ${manga.genre || manga.categories?.[0] || "Sin categoría"}
                    </span>
                    ${
                      manga.author
                        ? `<span class="flex items-center">
                             <i class="fas fa-user mr-1 text-principal"></i>
                             ${manga.author}
                           </span>`
                        : ""
                    }
                    <span class="flex items-center">
                      <i class="fas fa-book-open mr-1 text-principal"></i>
                      ${manga.chapterCount || 0} capítulos
                    </span>
                  </div>
                  <div class="flex items-center mb-3">
                    <span class="px-3 py-1 text-xs font-lilita rounded-full ${
                      manga.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : manga.status === "hiatus"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                    }">
                      ${
                        manga.status === "completed"
                          ? "Completado"
                          : manga.status === "hiatus"
                            ? "En pausa"
                            : "En emisión"
                      }
                    </span>
                  </div>
                </div>
              </div>

              <p class="text-gray-600 font-lilita text-sm line-clamp-3 mb-4">
                ${manga.description}
              </p>

              <!-- Botones de acción -->
              <div class="flex flex-wrap gap-2">
                <button
                  onclick="App.verCapitulosManga('${manga._id}', '${manga.title.replace(/'/g, "\\'")}')"
                  class="bg-gradient-to-r from-terciario to-cuarto hover:from-cuarto hover:to-quinto text-white px-4 py-2 rounded-lg font-lilita transition-all duration-300 hover:transform hover:scale-105 shadow-lg flex items-center text-sm"
                >
                  <i class="fas fa-list mr-1"></i>
                  Ver Capítulos (${manga.chapterCount || 0})
                </button>
                <button
                  onclick="App.editarMangaModerno('${manga._id}')"
                  class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-lilita transition-all duration-300 hover:transform hover:scale-105 shadow-lg flex items-center text-sm"
                >
                  <i class="fas fa-edit mr-1"></i>
                  Editar
                </button>
                <button
                  onclick="App.eliminarMangaModerno('${manga._id}', '${manga.title.replace(/'/g, "\\'")}')"
                  class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-lilita transition-all duration-300 hover:transform hover:scale-105 shadow-lg flex items-center text-sm"
                >
                  <i class="fas fa-trash mr-1"></i>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      `,
        )
        .join("");

      listaElement.classList.remove("hidden");
    },

    // Cargar categorías en el select del modal de manga
    async cargarCategoriasEnSelect() {
      const selectGenero = document.getElementById("manga-genero");
      if (!selectGenero) return;

      try {
        const response = await fetch("/api/categories");
        const result = await response.json();

        if (result.success) {
          // Limpiar opciones existentes (excepto la primera)
          selectGenero.innerHTML =
            '<option value="">Selecciona una categoría</option>';

          // Agregar categorías desde la base de datos
          result.data.forEach((categoria) => {
            const option = document.createElement("option");
            option.value = categoria.categoryName;
            option.textContent = categoria.categoryName;
            selectGenero.appendChild(option);
          });

          // Si no hay categorías, mostrar mensaje
          if (result.data.length === 0) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent =
              "No hay categorías disponibles - Crea una primero";
            option.disabled = true;
            selectGenero.appendChild(option);
          }
        } else {
          console.error(
            "Error al cargar categorías para select:",
            result.error,
          );
        }
      } catch (error) {
        console.error("Error de conexión al cargar categorías:", error);
        // En caso de error, mantener algunas opciones básicas
        selectGenero.innerHTML = `
          <option value="">Selecciona una categoría</option>
          <option value="Acción">Acción</option>
          <option value="Aventura">Aventura</option>
          <option value="Drama">Drama</option>
          <option value="Romance">Romance</option>
        `;
      }
    },

    // Recargar categorías en select cuando se cree una nueva
    async recargarCategoriasEnSelect() {
      await this.cargarCategoriasEnSelect();
    },

    // === MÉTODOS PARA CATEGORÍAS ===

    // Cargar categorías del servidor
    async cargarCategorias() {
      const loadingElement = this.htmlElements.loadingCategorias;
      const listaElement = this.htmlElements.listaCategorias;
      const noCategoriasElement = this.htmlElements.noCategorias;

      // Mostrar loading
      if (loadingElement) loadingElement.classList.remove("hidden");
      if (listaElement) listaElement.classList.add("hidden");
      if (noCategoriasElement) noCategoriasElement.classList.add("hidden");

      try {
        const response = await fetch("/api/categories");
        const result = await response.json();

        if (result.success) {
          this.mostrarCategorias(result.data);
        } else {
          console.error("Error al cargar categorías:", result.error);
          this.mostrarError("Error al cargar categorías");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        this.mostrarError("Error de conexión al cargar categorías");
      }

      // Ocultar loading
      if (loadingElement) loadingElement.classList.add("hidden");
    },

    // Mostrar categorías en la interfaz
    mostrarCategorias(categorias) {
      const listaElement = this.htmlElements.listaCategorias;
      const noCategoriasElement = this.htmlElements.noCategorias;

      if (!listaElement) return;

      if (categorias.length === 0) {
        listaElement.classList.add("hidden");
        if (noCategoriasElement) noCategoriasElement.classList.remove("hidden");
        return;
      }

      // Ocultar mensaje de "no categorías"
      if (noCategoriasElement) noCategoriasElement.classList.add("hidden");

      // Generar HTML para las categorías
      listaElement.innerHTML = categorias
        .map(
          (categoria) => `
        <div class="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
          <div class="p-6 flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <div class="w-3 h-3 bg-gradient-to-r from-principal to-secundario rounded-full mr-3"></div>
                <h4 class="text-lg font-lilita text-gray-800">${categoria.categoryName}</h4>
              </div>
              <p class="text-gray-600 font-lilita text-sm ml-6">${categoria.description}</p>
            </div>
            <div class="flex space-x-2 ml-4">
              <button
                onclick="App.editarCategoria('${categoria._id}')"
                class="bg-gradient-to-r from-terciario to-cuarto hover:from-cuarto hover:to-quinto text-white px-4 py-2 rounded-lg font-lilita transition-all duration-300 hover:transform hover:scale-105 shadow-lg flex items-center"
              >
                <i class="fas fa-edit mr-1"></i>
                Editar
              </button>
              <button
                onclick="App.eliminarCategoria('${categoria._id}', '${categoria.categoryName}')"
                class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-lilita transition-all duration-300 hover:transform hover:scale-105 shadow-lg flex items-center"
              >
                <i class="fas fa-trash mr-1"></i>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `,
        )
        .join("");

      listaElement.classList.remove("hidden");
    },

    // Abrir modal para agregar/editar categoría
    abrirModalCategoria(categoria = null) {
      const modal = this.htmlElements.modalCategoria;
      const modalContent = this.htmlElements.modalCategoriaContent;
      const title = this.htmlElements.modalCategoriaTitle;
      const form = this.htmlElements.formCategoria;
      const btnGuardar = this.htmlElements.btnGuardarCategoria;

      if (!modal || !modalContent || !form) return;

      // Resetear formulario
      form.reset();

      if (categoria) {
        // Modo edición
        document.getElementById("categoria-id").value = categoria._id;
        document.getElementById("categoria-nombre").value =
          categoria.categoryName;
        document.getElementById("categoria-descripcion").value =
          categoria.description;

        if (title) {
          title.innerHTML =
            '<i class="fas fa-edit mr-3"></i><span>Editar Categoría</span>';
        }
        if (btnGuardar) {
          btnGuardar.innerHTML =
            '<i class="fas fa-save mr-2"></i><span>Actualizar</span>';
        }
      } else {
        // Modo agregar
        document.getElementById("categoria-id").value = "";

        if (title) {
          title.innerHTML =
            '<i class="fas fa-plus mr-3"></i><span>Nueva Categoría</span>';
        }
        if (btnGuardar) {
          btnGuardar.innerHTML =
            '<i class="fas fa-save mr-2"></i><span>Guardar</span>';
        }
      }

      // Mostrar modal con animación
      modal.classList.remove("hidden");
      modal.classList.add("flex");

      setTimeout(() => {
        modalContent.classList.remove("scale-95", "opacity-0");
        modalContent.classList.add("scale-100", "opacity-100");
      }, 10);

      // Focus en el primer campo
      const nombreInput = document.getElementById("categoria-nombre");
      if (nombreInput) {
        setTimeout(() => nombreInput.focus(), 100);
      }
    },

    // Cerrar modal de categoría
    cerrarModalCategoria() {
      const modal = this.htmlElements.modalCategoria;
      const modalContent = this.htmlElements.modalCategoriaContent;

      if (!modal || !modalContent) return;

      // Animación de salida
      modalContent.classList.remove("scale-100", "opacity-100");
      modalContent.classList.add("scale-95", "opacity-0");

      setTimeout(() => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      }, 200);
    },

    // Editar categoría
    async editarCategoria(id) {
      try {
        const response = await fetch("/api/categories");
        const result = await response.json();

        if (result.success) {
          const categoria = result.data.find((cat) => cat._id === id);
          if (categoria) {
            this.abrirModalCategoria(categoria);
          } else {
            this.mostrarError("Categoría no encontrada");
          }
        } else {
          this.mostrarError("Error al cargar datos de la categoría");
        }
      } catch (error) {
        console.error("Error al editar categoría:", error);
        this.mostrarError("Error de conexión");
      }
    },

    // Eliminar categoría
    async eliminarCategoria(id, nombre) {
      if (
        !confirm(
          `¿Estás seguro de que quieres eliminar la categoría "${nombre}"?\n\nEsta acción no se puede deshacer.`,
        )
      ) {
        return;
      }

      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: "DELETE",
        });
        const result = await response.json();

        if (result.success) {
          this.mostrarExito("Categoría eliminada correctamente");
          this.cargarCategorias(); // Recargar lista
          this.recargarCategoriasEnSelect(); // Recargar select de categorías en modal de manga
        } else {
          this.mostrarError(result.error || "Error al eliminar categoría");
        }
      } catch (error) {
        console.error("Error al eliminar categoría:", error);
        this.mostrarError("Error de conexión al eliminar categoría");
      }
    },

    // Guardar categoría (crear o actualizar)
    async guardarCategoria(formData) {
      const id =
        formData.get("categoria-id") ||
        document.getElementById("categoria-id").value;
      const categoryName = formData.get("categoryName");
      const description = formData.get("description");

      if (!categoryName || !description) {
        this.mostrarError("Todos los campos son requeridos");
        return;
      }

      const data = { categoryName, description };

      try {
        let response;
        if (id) {
          // Actualizar
          response = await fetch(`/api/categories/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
        } else {
          // Crear
          response = await fetch("/api/categories", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
        }

        const result = await response.json();

        if (result.success) {
          this.mostrarExito(
            id
              ? "Categoría actualizada correctamente"
              : "Categoría creada correctamente",
          );
          this.cerrarModalCategoria();
          this.cargarCategorias(); // Recargar lista
          this.recargarCategoriasEnSelect(); // Recargar select de categorías en modal de manga
        } else {
          this.mostrarError(result.error || "Error al guardar categoría");
        }
      } catch (error) {
        console.error("Error al guardar categoría:", error);
        this.mostrarError("Error de conexión al guardar categoría");
      }
    },

    // Mostrar mensaje de éxito
    mostrarExito(mensaje) {
      // Crear elemento de notificación
      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-lilita transform translate-x-full transition-transform duration-300";
      notification.innerHTML = `
        <div class="flex items-center">
          <i class="fas fa-check-circle mr-2"></i>
          ${mensaje}
        </div>
      `;

      document.body.appendChild(notification);

      // Animación de entrada
      setTimeout(() => {
        notification.classList.remove("translate-x-full");
      }, 100);

      // Remover después de 3 segundos
      setTimeout(() => {
        notification.classList.add("translate-x-full");
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    },

    // Mostrar mensaje de error
    mostrarError(mensaje) {
      // Crear elemento de notificación
      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-lilita transform translate-x-full transition-transform duration-300";
      notification.innerHTML = `
        <div class="flex items-center">
          <i class="fas fa-exclamation-circle mr-2"></i>
          ${mensaje}
        </div>
      `;

      document.body.appendChild(notification);

      // Animación de entrada
      setTimeout(() => {
        notification.classList.remove("translate-x-full");
      }, 100);

      // Remover después de 4 segundos (más tiempo para errores)
      setTimeout(() => {
        notification.classList.add("translate-x-full");
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 4000);
    },

    // Configurar navegación entre vistas
    configurarNavegacion() {
      const inicioBtn = document.querySelector('a[href="/"]');
      const usuariosBtn = document.getElementById("btn-usuarios-view");
      const transaccionesBtn = document.getElementById(
        "btn-transacciones-view",
      );
      const categoriasBtn = document.getElementById("btn-categorias-view");
      const logoutBtn = document.getElementById("btn-logout");

      // Event listeners para navegación
      if (inicioBtn) {
        inicioBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.mostrarVista("dashboard");
        });
      }

      if (usuariosBtn) {
        usuariosBtn.addEventListener("click", () => {
          this.mostrarVista("usuarios");
        });
      }

      if (transaccionesBtn) {
        transaccionesBtn.addEventListener("click", () => {
          this.mostrarVista("transacciones");
        });
      }

      if (categoriasBtn) {
        categoriasBtn.addEventListener("click", () => {
          this.mostrarVista("categorias");
          this.cargarCategorias();
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
            window.location.href = "/";
          }
        });
      }
    },
  };

  // Hacer los métodos accesibles globalmente
  window.App = App;

  App.init();
})();
