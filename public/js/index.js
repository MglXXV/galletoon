(() => {
  const GalleToon = {
    htmlElements: {
      loginLink: null,
      searchInput: null,
      navLinks: null,
      mangaCards: null,
      header: null,
      notificationsContainer: null,
      profileElements: {
        username: null,
        email: null,
        gallecoins: null,
      },
    },

    user: {
      isAuthenticated: false,
      userData: null,
      sessionToken: null,
      library: [],
    },

    init() {
      console.log("Inicializando GalleToon...");
      this.initializeElements();
      this.checkAuthenticationStatus()
        .then(() => this.refreshSessionLibrary())
        .then(() => {
          if (["/", "/index.html"].includes(window.location.pathname)) {
            this.fetchAndRenderMangas();
          }
          // Si estamos en profile, renderizamos la biblioteca
          if (document.getElementById("favorite-mangas")) {
            this.renderLibrary();
          }
        });
      this.setupSearchFunctionality();
      this.setupMangaCardInteractions();
      this.setupNavigationEffects();
      this.addGlobalStyles();
      this.setupScrollEffects();
      this.refreshSessionUser();
      this.logoutEvent();
      if (["/", "/index.html"].includes(window.location.pathname)) {
        this.fetchAndRenderMangas();
      }
      this.setupSearchFunctionality();
    },

    initializeElements() {
      // Elemento del enlace de login/nombre de usuario
      this.htmlElements.loginLink = document.querySelector(
        'a[href="/api/auth/login"]',
      );

      // Botón de logout (si existe en la página)
      this.htmlElements.logoutBtn = document.getElementById("logout-btn");

      // Elementos del perfil (si estamos en profile.html)
      this.htmlElements.profileElements.username =
        document.getElementById("profile-username");
      this.htmlElements.profileElements.email =
        document.getElementById("profile-email");
      this.htmlElements.profileElements.gallecoins =
        document.getElementById("profile-gallecoins");

      // Inicializar elementos de navegación y manga cards
      this.htmlElements.navLinks = document.querySelectorAll(".nav-link") || [];
      this.htmlElements.mangaCards =
        document.querySelectorAll(".manga-card-container") || [];
      this.htmlElements.header =
        document.querySelector("header") || document.querySelector(".header");
      this.htmlElements.searchInput =
        document.querySelector("#search-input") ||
        document.querySelector('input[type="search"]');
    },

    async checkAuthenticationStatus() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (data.isAuthenticated && data.user) {
            this.user.isAuthenticated = true;
            this.user.userData = data.user;
            this.user.sessionToken = data.sessionToken;

            // Verificar si es admin y redirigir
            if (this.user.userData.role === "admin") {
              window.location.href = "/api/admin";
              return;
            }

            // Actualizar elementos del perfil si existen
            this.updateProfileElements();

            console.log("Usuario autenticado:", this.user.userData.username);
            this.updateNavigationForAuthenticatedUser();

            // Mostrar notificación de bienvenida solo una vez por sesión
            if (!sessionStorage.getItem("welcomeShown")) {
              this.showNotification(
                `¡Bienvenido de vuelta, ${this.user.userData.username}!`,
                "success",
              );
              sessionStorage.setItem("welcomeShown", "true");
            }
          } else {
            this.user.isAuthenticated = false;
            this.updateNavigationForGuestUser();
          }
        } else {
          // Respuesta no OK significa no autenticado
          this.user.isAuthenticated = false;
          this.updateNavigationForGuestUser();
        }
      } catch (error) {
        console.log("No hay sesión activa");
        this.user.isAuthenticated = false;
        this.updateNavigationForGuestUser();
      }
    },

    async refreshSessionLibrary() {
      if (!this.user.isAuthenticated) return;
      try {
        // Traer la librería de capítulos comprados
        const res = await fetch("/api/library", { credentials: "include" });
        const json = await res.json();
        this.user.library = json.success ? json.data : [];
      } catch (err) {
        console.error("Error cargando librería:", err);
        this.user.library = [];
      }

      this.updateProfileElements();
      this.renderLibrary();
    },

    setupSearchFunctionality() {
      if (!this.htmlElements.searchInput) return;
      let searchTimeout;

      this.htmlElements.searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length > 0) {
          // Espera 500 ms para no spamear la API
          searchTimeout = setTimeout(() => {
            this.performSearch(query);
          }, 500);
        } else {
          // Si borro todo, recargo el listado original
          this.fetchAndRenderMangas();
        }
      });

      this.htmlElements.searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const query = e.target.value.trim();
          if (query.length > 0) {
            this.performSearch(query);
          } else {
            this.fetchAndRenderMangas();
          }
        }
      });
    },

    renderLibrary() {
      const container = document.getElementById("favorite-mangas");
      if (!container) return;

      if (!this.user.library.length) {
        container.innerHTML = `
          <div class="col-span-full text-center py-12 text-gray-400">
            <i class="fas fa-book-open text-4xl mb-4"></i>
            <p class="text-lg">Aún no has comprado ningún capítulo.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = "";

      const grouped = {};
      this.user.library.forEach((chap) => {
        const key = chap.mangaId || chap.mangaTitle || "Sin nombre";
        if (!grouped[key]) grouped[key] = { manga: chap, chapters: [] };
        grouped[key].chapters.push(chap);
      });

      Object.entries(grouped).forEach(([mangaId, { manga, chapters }]) => {
        const section = document.createElement("div");
        section.className =
          "mb-10 p-4 bg-white rounded-2xl shadow-xl border border-pink-200";

        const header = document.createElement("div");
        header.className = "flex items-center gap-5 mb-6";

        const cover = document.createElement("img");
        cover.src = manga.mangaCover || "/default-manga.jpg";
        cover.alt = manga.mangaTitle;
        cover.className =
          "w-24 h-32 rounded-xl shadow-md object-cover border border-pink-400";

        const titleWrap = document.createElement("div");
        titleWrap.innerHTML = `
          <h3 class="text-3xl font-extrabold text-pink-800">${manga.mangaTitle}</h3>
          <p class="text-sm text-gray-500 mt-1">${chapters.length} capítulo${chapters.length > 1 ? "s" : ""}</p>
        `;

        header.appendChild(cover);
        header.appendChild(titleWrap);

        const grid = document.createElement("div");
        grid.className =
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";

        chapters.forEach((chap) => {
          const card = document.createElement("div");
          card.className = `
            chapter-card bg-gradient-to-br from-pink-50 to-white border border-pink-100
            rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300
            overflow-hidden flex flex-col justify-between
          `;

          card.innerHTML = `
            <div class="p-4">
              <div class="flex items-center justify-between mb-2">
                <div class="text-pink-600 text-xl font-bold flex items-center gap-1">
                  <i class="fas fa-book-open"></i>
                  ${chap.chapterNumber ? `#${chap.chapterNumber}` : "Capítulo"}
                </div>
                <span class="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-semibold">Leído</span>
              </div>
              <div class="text-gray-700 mb-3 text-sm line-clamp-2">
                ${chap.chapterTitle || "Capítulo desbloqueado"}
              </div>
              <button
                data-url="${chap.chapterURL}"
                class="read-btn w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-all"
              >
                <i class="fas fa-eye mr-1"></i> Leer ahora
              </button>
            </div>
          `;
          grid.appendChild(card);
        });

        section.appendChild(header);
        section.appendChild(grid);
        container.appendChild(section);

        grid.querySelectorAll(".read-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const url = btn.dataset.url;
            const chap = chapters.find((c) => c.chapterURL === url);
            const existing = document.getElementById("chapter-viewer");
            if (existing) existing.remove();
            this.openChapterViewer(url, chap);
          });
        });
      });
    },

    openChapterViewer(url, chap = {}) {
      if (!url) {
        this.showNotification("No se pudo abrir el capítulo", "error");
        return;
      }

      // Eliminar visor anterior si existe
      const existing = document.getElementById("chapter-viewer");
      if (existing) existing.remove();

      const viewer = document.createElement("div");
      viewer.id = "chapter-viewer";
      viewer.className = `
        fixed inset-0 z-[9999] bg-black bg-opacity-90 backdrop-blur-sm
        flex items-center justify-center px-0 py-0
      `;

      viewer.innerHTML = `
        <div class="relative w-full h-full">
          <div class="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-gradient-to-r from-pink-600 to-pink-400 text-white shadow-lg">
            <div>
              <h2 class="text-xl font-bold">${chap.mangaTitle || "Lectura de capítulo"}</h2>
              <p class="text-sm">${chap.chapterNumber ? `Capítulo ${chap.chapterNumber}: ` : ""}${chap.chapterTitle || ""}</p>
            </div>
            <button
              id="close-viewer"
              class="text-white text-3xl hover:text-pink-200 transition-all"
              aria-label="Cerrar"
            >&times;</button>
          </div>
          <iframe
            src="${url}"
            class="absolute top-0 left-0 w-full h-full"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
      `;

      document.body.appendChild(viewer);

      document.getElementById("close-viewer").addEventListener("click", () => {
        viewer.remove();
      });
    },

    updateProfileElements() {
      // Actualizar username
      const profileUsernameEl = document.getElementById("profile-username");
      if (profileUsernameEl && this.user.userData.username) {
        profileUsernameEl.textContent = this.user.userData.username;
      }

      // Actualizar email
      const profileEmailEl = document.getElementById("profile-email");
      if (profileEmailEl && this.user.userData.email) {
        profileEmailEl.textContent = this.user.userData.email;
      }

      // Actualizar gallecoins
      const profileGallecoinsEl = document.getElementById("profile-gallecoins");
      if (profileGallecoinsEl && this.user.userData.gallecoins !== undefined) {
        profileGallecoinsEl.textContent = `${this.user.userData.gallecoins} Gallecoins`;
      }

      // Actualizar otros elementos del perfil si existen
      const profileRoleEl = document.getElementById("profile-role");
      if (profileRoleEl && this.user.userData.role) {
        profileRoleEl.textContent = this.user.userData.role;
      }

      const profileJoinDateEl = document.getElementById("profile-join-date");
      if (profileJoinDateEl && this.user.userData.createdAt) {
        const joinDate = new Date(
          this.user.userData.createdAt,
        ).toLocaleDateString("es-ES");
        profileJoinDateEl.textContent = `Miembro desde ${joinDate}`;
      }
    },

    async refreshSessionUser() {
      if (!this.user.isAuthenticated || !this.user.sessionToken) {
        return;
      }

      try {
        const response = await fetch("/api/auth/refresh", {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${this.user.sessionToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            this.user.userData = data.user;
            this.updateProfileElements();
            console.log("Sesión actualizada:", data.user);
          }
        }
      } catch (err) {
        console.log("No se pudo refrescar la sesión");
      }
    },

    updateNavigationForAuthenticatedUser() {
      if (this.htmlElements.loginLink) {
        this.htmlElements.loginLink.textContent = `${this.user.userData.username}`;
        this.htmlElements.loginLink.href = "/api/profile";
        this.htmlElements.loginLink.classList.add("authenticated-user");

        // Remover listeners anteriores clonando el elemento
        const newLoginLink = this.htmlElements.loginLink.cloneNode(true);
        this.htmlElements.loginLink.parentNode.replaceChild(
          newLoginLink,
          this.htmlElements.loginLink,
        );
        this.htmlElements.loginLink = newLoginLink;

        this.htmlElements.loginLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.navigateToProfile();
        });

        this.createUserDropdownMenu();
      }
    },

    updateNavigationForGuestUser() {
      if (this.htmlElements.loginLink) {
        this.htmlElements.loginLink.textContent = "Iniciar Sesión";
        this.htmlElements.loginLink.href = "/api/auth/login";
        this.htmlElements.loginLink.classList.remove("authenticated-user");

        // Remover listeners anteriores clonando el elemento
        const newLoginLink = this.htmlElements.loginLink.cloneNode(true);
        this.htmlElements.loginLink.parentNode.replaceChild(
          newLoginLink,
          this.htmlElements.loginLink,
        );
        this.htmlElements.loginLink = newLoginLink;
      }

      const existingDropdown = document.getElementById("user-dropdown");
      if (existingDropdown) {
        existingDropdown.remove();
      }
    },

    createUserDropdownMenu() {
      // Remover dropdown existente
      const existingDropdown = document.getElementById("user-dropdown");
      if (existingDropdown) {
        existingDropdown.remove();
      }

      const dropdownContainer = document.createElement("div");
      dropdownContainer.className = "relative inline-block";
      dropdownContainer.id = "user-dropdown";

      const dropdownMenu = document.createElement("div");
      dropdownMenu.className =
        "absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 hidden z-50";
      dropdownMenu.innerHTML = `
        <div class="px-4 py-2 border-b border-gray-200">
          <p class="text-sm font-medium text-gray-800">${this.user.userData.username}</p>
          <p class="text-xs text-gray-500">${this.user.userData.role || "Usuario"}</p>
        </div>
        <a href="/api/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700 nav-link">
          <i class="fas fa-user mr-2"></i>Mi Perfil
        </a>
        <a href="/api/gallecoins" class="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700 nav-link">
          <i class="fas fa-coins mr-2"></i>Mis GalleCoins
        </a>
        <a href="/favorites" class="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700 nav-link">
          <i class="fas fa-heart mr-2"></i>Favoritos
        </a>
        <div class="border-t border-gray-200 mt-2 pt-2">
          <button id="logout-btn" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            <i class="fas fa-sign-out-alt mr-2"></i>Cerrar Sesión
          </button>
        </div>
      `;

      // Insertar después del loginLink
      this.htmlElements.loginLink.parentNode.insertBefore(
        dropdownContainer,
        this.htmlElements.loginLink.nextSibling,
      );
      dropdownContainer.appendChild(dropdownMenu);

      // Event listener para toggle del dropdown
      this.htmlElements.loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        dropdownMenu.classList.toggle("hidden");
      });

      // Cerrar dropdown cuando se hace clic fuera
      document.addEventListener("click", (e) => {
        if (!dropdownContainer.contains(e.target)) {
          dropdownMenu.classList.add("hidden");
        }
      });
    },

    logoutEvent() {
      // Esperar a que el DOM esté listo y el botón exista
      const attachLogout = () => {
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
          // Eliminar listeners previos
          const newLogoutBtn = logoutBtn.cloneNode(true);
          logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
          newLogoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleLogout();
          });
        } else {
          // Intentar de nuevo si el menú se renderiza después
          setTimeout(attachLogout, 200);
        }
      };
      attachLogout();
    },

    navigateToProfile() {
      window.location.href = "/api/profile";
    },

    async handleLogout() {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          Authorization: `Bearer ${this.user.sessionToken}`,
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Logout exitoso:", data);

          // Clear user state
          this.user.isAuthenticated = false;
          this.user.userData = null;
          this.user.sessionToken = null;

          // Clear sessionStorage
          sessionStorage.removeItem("welcomeShown");

          this.showNotification("¡Sesión cerrada exitosamente!", "success");

          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        } else {
          console.error("Error al cerrar sesión:", data);
          this.showNotification(
            data.error || "Error al cerrar sesión",
            "error",
          );
        }
      } catch (error) {
        console.error("Error de red:", error);
        this.showNotification(
          "Error de red al intentar cerrar sesión",
          "error",
        );
      }
    },

    setupSearchFunctionality() {
      if (this.htmlElements.searchInput) {
        let searchTimeout;

        this.htmlElements.searchInput.addEventListener("input", (e) => {
          clearTimeout(searchTimeout);
          const query = e.target.value.trim();

          if (query.length > 0) {
            searchTimeout = setTimeout(() => {
              this.performSearch(query);
            }, 500);
          }
        });

        this.htmlElements.searchInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const query = e.target.value.trim();
            if (query.length > 0) {
              this.performSearch(query);
            }
          }
        });
      }
    },

    async performSearch(query) {
      console.log("Realizando búsqueda:", query);

      try {
        this.showNotification(`Buscando: "${query}"...`, "info");

        // Aquí implementarías la lógica real de búsqueda
        const response = await fetch(
          `/api/mangas/search?q=${encodeURIComponent(query)}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (response.ok) {
          const data = await response.json();
          // Procesar resultados de búsqueda
          this.renderSearchResults(data.mangas || []);
        }
      } catch (error) {
        console.error("Error en búsqueda:", error);
        this.showNotification("Error al realizar la búsqueda", "error");
      }
    },

    renderSearchResults(mangas) {
      const container = document.getElementById("manga-container");
      if (!container) return;

      if (mangas.length === 0) {
        container.innerHTML = `
          <div class="col-span-full text-center py-12">
            <div class="text-6xl mb-4">🔍</div>
            <h3 class="text-xl font-bold text-gray-600 mb-2">No se encontraron resultados</h3>
            <p class="text-gray-500">Intenta con otros términos de búsqueda</p>
          </div>
        `;
        return;
      }

      // Renderizar los mangas encontrados
      this.renderMangas(mangas);
    },

    setupMangaCardInteractions() {
      // Se configura después de renderizar los mangas
      console.log(
        "Configuración de interacciones se hará después del renderizado",
      );
    },

    handleCardMouseEnter(e) {
      const card = e.currentTarget;
      card.style.transform = "translateY(-8px) scale(1.02)";
      card.style.boxShadow = "0 20px 40px rgba(251, 113, 133, 0.4)";
    },

    handleCardMouseLeave(e) {
      const card = e.currentTarget;
      card.style.transform = "translateY(0) scale(1)";
      card.style.boxShadow = "0 8px 20px rgba(251, 113, 133, 0.25)";
    },

    handleCardClick(e) {
      // El click se maneja en fetchAndRenderMangas para mostrar capítulos
    },

    setupNavigationEffects() {
      const navLinks = document.querySelectorAll(".nav-link");
      navLinks.forEach((link) => {
        link.addEventListener("mouseenter", () => {
          link.style.transform = "translateY(-2px)";
          link.style.transition = "all 0.2s ease";
        });

        link.addEventListener("mouseleave", () => {
          link.style.transform = "translateY(0)";
        });
      });

      const header =
        document.querySelector("header") || document.querySelector(".header");
      if (header) {
        window.addEventListener("scroll", () => {
          const scrolled = window.pageYOffset;

          if (scrolled > 100) {
            header.style.backgroundColor = "rgba(190, 24, 93, 0.95)";
            header.style.backdropFilter = "blur(10px)";
          } else {
            header.style.backgroundColor = "rgb(190, 24, 93)";
            header.style.backdropFilter = "none";
          }
        });
      }
    },

    setupScrollEffects() {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      }, observerOptions);

      // Se aplicará después de renderizar los mangas
      setTimeout(() => {
        const mangaCards = document.querySelectorAll(".manga-card-container");
        mangaCards.forEach((card, index) => {
          card.style.opacity = "0";
          card.style.transform = "translateY(30px)";
          card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
          observer.observe(card);
        });
      }, 500);
    },

    addGlobalStyles() {
      if (!document.getElementById("galletoon-styles")) {
        const style = document.createElement("style");
        style.id = "galletoon-styles";
        style.textContent = `
          .authenticated-user {
            background: linear-gradient(135deg, #f472b6, #fb7185);
            padding: 8px 16px;
            border-radius: 9999px;
            color: white !important;
            font-weight: 600;
            box-shadow: 0 4px 10px rgba(251, 113, 133, 0.4);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
          }
          .authenticated-user:hover {
            background: linear-gradient(135deg, #f43f5e, #be185d);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(244, 63, 94, 0.5);
          }
          .nav-link {
            transition: all 0.3s ease;
            position: relative;
          }
          .nav-link:hover {
            color: #fbbf24;
            text-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
          }
          .manga-card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .search-focus {
            box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3);
            border-color: #fbbf24;
          }
          .notification-enter {
            animation: slideInNotification 0.5s ease-out;
          }
          @keyframes slideInNotification {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .scroll-shadow {
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .manga-card-container {
            background:#db2777;
            border-radius: 1rem;
            box-shadow: 0 8px 20px rgba(251, 113, 133, 0.25);
            padding: 1rem;
            margin-bottom: 1.5rem; /* Added spacing */
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
            display: block;
            gap: 1.5rem;
            align-items: center;
            flex-direction: column;
          }

          .manga-card-container:hover {
            transform: translateY(-6px);
            box-shadow: 0 20px 40px rgba(251, 113, 133, 0.5);
          }

          .manga-card-container img {
            border-radius: 0.75rem;
            box-shadow: 0 4px 12px rgba(251, 113, 133, 0.3);
            flex-shrink: 0;
          }

          .manga-card-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 160px;
          }

          .manga-card-title {
            font-weight: 800;
            font-size: 1.375rem;
            color: #c3f7f1;
            margin-bottom: 0.25rem;
            line-height: 1.2;
          }

          .manga-card-description {
            color: #c3f7f1;
            font-size: 0.9rem;
            line-height: 1.3;
          }

          .manga-card-meta {
            font-size: 0.75rem;
            color: #c3f7f1;
            font-weight: 600;
            text-transform: uppercase;
            display: flex;
            justify-content: space-between;
          }

          .manga-card-status {
            background: #fce7f3;
            color: #be185d;
            padding: 0.15rem 0.75rem;
            border-radius: 9999px;
          }

          @media (min-width: 768px) {
            .manga-card-container {
              flex-direction: row;
            }
          }
          #chapter-viewer iframe {
            border: none;
            width: 100%;
            height: 100%;
          }

        `;
        document.head.appendChild(style);
      }
    },

    showNotification(message, type = "success") {
      if (!message) return;

      const notification = document.createElement("div");
      notification.className = `fixed top-20 right-4 z-50 px-6 py-4 rounded-lg text-white shadow-xl transform transition-all duration-500 notification-enter ${
        type === "success"
          ? "bg-gradient-to-r from-green-500 to-emerald-600"
          : type === "error"
            ? "bg-gradient-to-r from-red-500 to-red-600"
            : "bg-gradient-to-r from-blue-500 to-blue-600"
      }`;

      const iconClass =
        type === "success"
          ? "fa-check-circle"
          : type === "error"
            ? "fa-exclamation-circle"
            : "fa-info-circle";

      notification.innerHTML = `
        <div class="flex items-center">
          <i class="fas ${iconClass} mr-3"></i>
          <span>${message}</span>
        </div>
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.transform = "translateX(100%)";
        notification.style.opacity = "0";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 500);
      }, 4000);
    },

    requireAuth(callback) {
      if (this.user.isAuthenticated) {
        callback();
      } else {
        this.showNotification(
          "Debes iniciar sesión para acceder a esta función",
          "error",
        );
        setTimeout(() => {
          window.location.href = "/api/auth/login";
        }, 2000);
      }
    },

    toggleFavorite(mangaId) {
      this.requireAuth(async () => {
        try {
          const response = await fetch("/api/favorites/toggle", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(this.user.sessionToken && {
                Authorization: `Bearer ${this.user.sessionToken}`,
              }),
            },
            credentials: "include",
            body: JSON.stringify({ mangaId }),
          });

          if (response.ok) {
            const data = await response.json();
            this.showNotification(
              data.isFavorite
                ? "Añadido a favoritos"
                : "Eliminado de favoritos",
              "success",
            );
          }
        } catch (error) {
          console.error("Error al manejar favorito:", error);
          this.showNotification("Error al actualizar favoritos", "error");
        }
      });
    },

    async fetchAndRenderMangas() {
      try {
        const loadingContainer = document.getElementById("manga-container");
        if (loadingContainer) {
          loadingContainer.innerHTML = `
            <div class="col-span-full flex justify-center items-center py-12">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                <p class="text-pink-600 font-medium">Cargando mangas...</p>
              </div>
            </div>
          `;
        }

        const response = await fetch("/api/mangas", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Error al obtener mangas");
        }

        const mangas = result.data || result.mangas || [];
        this.renderMangas(mangas);
      } catch (err) {
        console.error("Error al cargar mangas:", err);
        this.showNotification("Error al cargar mangas", "error");

        const container = document.getElementById("manga-container");
        if (container) {
          container.innerHTML = `
            <div class="col-span-full text-center py-12">
              <div class="text-6xl mb-4">😵</div>
              <h3 class="text-xl font-bold text-red-600 mb-2">Error al cargar mangas</h3>
              <p class="text-gray-500 mb-4">Hubo un problema al cargar el contenido</p>
              <button onclick="GalleToon.fetchAndRenderMangas()" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg">
                Reintentar
              </button>
            </div>
          `;
        }
      }
    },

    renderMangas(mangas) {
      const container = document.getElementById("manga-container");
      if (!container) {
        console.error("No se encontró el contenedor de mangas");
        return;
      }

      if (!mangas || mangas.length === 0) {
        container.innerHTML = `
          <div class="col-span-full text-center py-12">
            <div class="text-6xl mb-4">📚</div>
            <h3 class="text-xl font-bold text-gray-600 mb-2">No hay mangas disponibles</h3>
            <p class="text-gray-500">Vuelve pronto para ver nuevo contenido</p>
          </div>
        `;
        return;
      }

      // Aplicar grid
      container.className = "grid-mangas mt-6 grid gap-4";
      container.innerHTML = "";

      mangas.forEach((manga) => {
        const mangaCard = document.createElement("div");
        mangaCard.className = "manga-card";
        mangaCard.innerHTML = `
          <img src="${manga.imageURL || manga.image || "/default-manga.jpg"}" alt="${manga.title}" onerror="this.src='/default-manga.jpg'">
          <div class="info">
            <h3>${manga.title}</h3>
            <div class="text-xs text-pink-300 mb-1">${manga.author ? `Autor: ${manga.author}` : ""}</div>
            <p>${manga.description || "Sin descripción disponible."}</p>
            <div class="flex justify-between items-center mt-2">
              <span class="text-xs text-pink-200">${manga.genre || manga.category || "Género desconocido"}</span>
              <span class="text-xs bg-pink-200 text-pink-800 rounded-full px-2 py-1">${manga.status || "Estado desconocido"}</span>
            </div>
          </div>
        `;
        mangaCard.addEventListener("click", () => {
          App.showChaptersDialog(manga);
        });
        container.appendChild(mangaCard);
      });
    },

    setupCardHoverEffects() {
      const mangaCards = document.querySelectorAll(".manga-card-container");
      mangaCards.forEach((card) => {
        card.addEventListener(
          "mouseenter",
          this.handleCardMouseEnter.bind(this),
        );
        card.addEventListener(
          "mouseleave",
          this.handleCardMouseLeave.bind(this),
        );
      });
    },

    renderChapters(container, chapters, ownedIds = []) {
      container.innerHTML = `
            <div class="mb-4 text-center">
              <h4 class="text-xl font-bold text-pink-800">📖 Capítulos Disponibles</h4>
              <div class="w-20 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mx-auto"></div>
            </div>
          `;
      chapters.forEach((ch) => {
        const id = (ch._id || ch.id).toString();
        const isOwned = ownedIds.includes(id);
        let btnHtml;
        if (!this.user.isAuthenticated) {
          btnHtml = `
                <button class="locked-btn px-4 py-2 bg-gray-500 text-white rounded-lg flex items-center">
                  <i class="fas fa-lock mr-2"></i>Inicia sesión
                </button>
              `;
        } else if (isOwned) {
          btnHtml = `
                <button disabled class="px-4 py-2 bg-green-600 text-white rounded-lg">
                  Leído
                </button>
              `;
        } else {
          btnHtml = `
                <button data-id="${id}" class="buy-btn px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center transition">
                  <i class="fas fa-coins mr-2"></i>${ch.price} GC – Comprar
                </button>
              `;
        }
        const row = document.createElement("div");
        row.className =
          "flex justify-between items-center mb-3 p-4 bg-white rounded-lg shadow-lg";
        row.innerHTML = `
              <div>
                <h5 class="font-bold text-pink-700">Episodio ${ch.chapterNumber}</h5>
                <p class="text-sm text-gray-600">${ch.chapterTitle}</p>
              </div>
              <div>${btnHtml}</div>
            `;
        container.appendChild(row);
      });

      // listeners de compra
      container.querySelectorAll(".buy-btn").forEach((b) => {
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          this.purchaseChapter(b.dataset.id);
        });
      });
      // listeners de candado → login
      container.querySelectorAll(".locked-btn").forEach((b) => {
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          this.showNotification(
            "Debes iniciar sesión para comprar capítulos",
            "info",
          );
          setTimeout(() => (window.location.href = "/api/auth/login"), 800);
        });
      });
    },

    async purchaseChapter(chapterId) {
      this.showNotification("Procesando compra…", "info");
      try {
        const res = await fetch("/api/chapters/checkout", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chapterId }),
        });
        const data = await res.json();
        if (!data.success)
          throw new Error(data.error || "Error al comprar capítulo");

        // 1) Actualizar saldo en UI
        if (typeof data.newBalance === "number") {
          this.user.userData.gallecoins = data.newBalance;
          this.updateProfileElements();
        }

        // 2) Añadir el capítulo comprado a la librería local
        this.user.library.push(chapterId);

        // 3) Mostrar éxito
        this.showNotification("¡Compra exitosa!", "success");

        this.renderLibrary();
        const btn = document.querySelector(
          `button.buy-btn[data-id="${chapterId}"]`,
        );
        if (btn) {
          btn.disabled = true;
          btn.classList.remove("bg-pink-600", "hover:bg-pink-700");
          btn.classList.add("bg-green-600");
          btn.innerHTML = `<i class="fas fa-check mr-2"></i>Comprado`;
        }

        // — QUITADO: redirección a PDF —
      } catch (err) {
        console.error("Error al comprar capítulo:", err);
        this.showNotification(err.message || "Error de red", "error");
      }
    },

    showBeautifulNotification(message, type = "info") {
      const notification = document.createElement("div");
      const colors = {
        success: "from-green-400 to-emerald-400",
        error: "from-red-400 to-rose-400",
        info: "from-blue-400 to-indigo-400",
        warning: "from-yellow-400 to-orange-400",
      };

      const icons = {
        success: "✅",
        error: "❌",
        info: "ℹ️",
        warning: "⚠️",
      };

      notification.className = `
        fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg transform translate-x-full
        transition-all duration-300 ease-out bg-gradient-to-r ${colors[type]} text-white
        max-w-sm
      `;

      notification.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-xl">${icons[type]}</span>
          <span class="font-medium">${message}</span>
        </div>
      `;

      document.body.appendChild(notification);

      // Animar entrada
      setTimeout(() => {
        notification.style.transform = "translateX(0)";
      }, 100);

      // Animar salida
      setTimeout(() => {
        notification.style.transform = "translateX(100%)";
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 3000);
    },

    async fetchChapters(mangaId) {
      if (!mangaId) {
        console.error("ID de manga no proporcionado");
        return [];
      }

      try {
        const response = await fetch(`/api/mangas/${mangaId}/chapters`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(this.user.sessionToken && {
              Authorization: `Bearer ${this.user.sessionToken}`,
            }),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Error al obtener capítulos");
        }

        return result.data || result.chapters || [];
      } catch (err) {
        console.error("Error al cargar capítulos:", err);
        this.showNotification("Error al cargar capítulos", "error");
        return [];
      }
    },

    async showChaptersDialog(manga) {
      this.refreshSessionLibrary();
      const dialog = document.getElementById("chapter-dialog");
      const dialogTitle = document.getElementById("dialog-title");
      const dialogBody = document.createElement("div");
      dialogBody.className = "mt-2";

      dialogTitle.textContent = manga.title;
      dialogTitle.after(dialogBody);
      dialog.classList.remove("hidden");
      dialogBody.innerHTML = `<div class="text-center text-pink-600">Cargando capítulos…</div>`;

      try {
        // 1.1) carga capítulos
        const chapters = await this.fetchChapters(manga._id || manga.id);
        // 1.2) obtiene array de capítulos ya comprados (ids)
        const owned = this.user.library;
        // 1.3) renderiza
        this.renderChapters(dialogBody, chapters, owned);
      } catch (err) {
        console.error(err);
        dialogBody.innerHTML = `<p class="text-center text-red-600">Error de red al cargar capítulos</p>`;
      }

      // cerrar diálogo
      document.getElementById("close-dialog").onclick = () => {
        dialog.classList.add("hidden");
        dialogBody.remove();
      };
    },
  };

  // Exponer GalleToon globalmente
  window.GalleToon = GalleToon;

  // Inicializar cuando el DOM esté listo
  window.App = GalleToon; // Expose GalleToon object globally as window.App

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      GalleToon.init();
    });
  } else {
    GalleToon.init();
  }

  // Manejar cambios de visibilidad para refrescar sesión
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && GalleToon.user.isAuthenticated) {
      GalleToon.checkAuthenticationStatus();
    }
  });

  // Manejar navegación del historial
  window.addEventListener("popstate", () => {
    if (window.location.pathname === "/") {
      GalleToon.checkAuthenticationStatus();
      GalleToon.fetchAndRenderMangas();
    }
  });
})();
