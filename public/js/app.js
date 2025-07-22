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

      // Modales
      modalAgregarManga: document.getElementById("modal-agregar-manga"),
      modalEditarManga: document.getElementById("modal-editar-manga"),
      modalAgregarCapitulo: document.getElementById("modal-agregar-capitulo"),
      modalEditarCapitulo: document.getElementById("modal-editar-capitulo"),
      closeModalAgregarManga: document.getElementById(
        "close-modal-agregar-manga",
      ),
      closeModalEditarManga: document.getElementById("close-modal-manga"),
      closeModalAgregarCapitulo: document.getElementById(
        "close-modal-agregar-capitulo",
      ),
      closeModalEditarCapitulo: document.getElementById("close-modal-capitulo"),
      cancelarAgregarManga: document.getElementById("cancelar-agregar-manga"),
      cancelarEditarManga: document.getElementById("cancelar-editar-manga"),
      cancelarAgregarCapitulo: document.getElementById(
        "cancelar-agregar-capitulo",
      ),
      cancelarEditarCapitulo: document.getElementById(
        "cancelar-editar-capitulo",
      ),

      // Formularios
      formAgregarManga: document.getElementById("form-agregar-manga"),
      formEditarManga: document.getElementById("form-editar-manga"),
      formAgregarCapitulo: document.getElementById("form-agregar-capitulo"),
      formEditarCapitulo: document.getElementById("form-editar-capitulo"),
    },

    // Datos de ejemplo
    mangas: [
      {
        id: 1,
        nombre: "Dragon Ball Z",
        genero: "accion",
        sinopsis:
          "Goku y sus amigos protegen la Tierra de amenazas alienígenas",
        portada:
          "https://tse1.mm.bing.net/th/id/OIP.qv89cUB2sU6r26vAbYv_vwHaLu?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
        capitulos: [
          {
            id: 1,
            numero: 1,
            nombre: "El Regreso de Goku",
            precio: 15,
            sinopsis: "Goku regresa de Namek",
          },
          {
            id: 2,
            numero: 2,
            nombre: "La Llegada de Vegeta",
            precio: 10,
            sinopsis: "Vegeta llega a la Tierra",
          },
          {
            id: 3,
            numero: 3,
            nombre: "La Batalla Final",
            precio: 20,
            sinopsis: "La batalla decisiva",
          },
        ],
      },
      {
        id: 2,
        nombre: "Naruto",
        genero: "aventura",
        sinopsis: "Un ninja joven busca convertirse en Hokage",
        portada:
          "https://ramenparados.com/wp-content/uploads/2015/09/portada_naruto-n-70_masashi-kishimoto_2015082513321.jpg",
        capitulos: [
          {
            id: 1,
            numero: 1,
            nombre: "El Inicio del Viaje",
            precio: 50,
            sinopsis: "Naruto comienza su entrenamiento",
          },
          {
            id: 2,
            numero: 2,
            nombre: "El Examen Chunin",
            precio: 20,
            sinopsis: "Comienza el examen",
          },
        ],
      },
      {
        id: 3,
        nombre: "One Piece",
        genero: "aventura",
        sinopsis: "Luffy busca el tesoro más grande del mundo",
        portada:
          "https://www.anmosugoi.com/wp-content/uploads/2022/07/One-Piece-manga-vol-103-1200x1883.jpg",
        capitulos: [
          {
            id: 1,
            numero: 1,
            nombre: "El Sombrero de Paja",
            precio: 10,
            sinopsis: "Luffy obtiene su sombrero",
          },
          {
            id: 2,
            numero: 2,
            nombre: "La Búsqueda del Tesoro",
            precio: 15,
            sinopsis: "Comienza la aventura",
          },
        ],
      },
    ],

    init() {
      this.cargarMangas();
      this.cargarMangasCapitulos();
      this.bindEvents();
      this.iniciarReloj();
      this.configurarNavegacion();
    },

    bindEvents() {
      // Navegación
      if (this.htmlElements.btnMangaView) {
        this.htmlElements.btnMangaView.addEventListener("click", () =>
          this.mostrarVista("manga"),
        );
      }
      if (this.htmlElements.btnCapitulosView) {
        this.htmlElements.btnCapitulosView.addEventListener("click", () =>
          this.mostrarVista("capitulos"),
        );
      }

      // Botones de agregar
      if (this.htmlElements.btnAgregarManga) {
        this.htmlElements.btnAgregarManga.addEventListener("click", () =>
          this.abrirModal("agregar-manga"),
        );
      }
      if (this.htmlElements.btnAgregarCapitulo) {
        this.htmlElements.btnAgregarCapitulo.addEventListener("click", () =>
          this.abrirModal("agregar-capitulo"),
        );
      }

      // Cerrar modales
      if (this.htmlElements.closeModalAgregarManga) {
        this.htmlElements.closeModalAgregarManga.addEventListener("click", () =>
          this.cerrarModal("agregar-manga"),
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

      // Cancelar modales
      if (this.htmlElements.cancelarAgregarManga) {
        this.htmlElements.cancelarAgregarManga.addEventListener("click", () =>
          this.cerrarModal("agregar-manga"),
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

      // Formularios
      if (this.htmlElements.formAgregarManga) {
        this.htmlElements.formAgregarManga.addEventListener("submit", (e) =>
          this.agregarManga(e),
        );
      }
      if (this.htmlElements.formEditarManga) {
        this.htmlElements.formEditarManga.addEventListener("submit", (e) =>
          this.guardarManga(e),
        );
      }
      if (this.htmlElements.formAgregarCapitulo) {
        this.htmlElements.formAgregarCapitulo.addEventListener("submit", (e) =>
          this.agregarCapitulo(e),
        );
      }
      if (this.htmlElements.formEditarCapitulo) {
        this.htmlElements.formEditarCapitulo.addEventListener("submit", (e) =>
          this.guardarCapitulo(e),
        );
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
