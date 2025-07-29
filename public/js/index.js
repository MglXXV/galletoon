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
    },

    init() {
      console.log("Inicializando GalleToon...");
      this.initializeElements();
      this.checkAuthenticationStatus();
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

      // Re-inicializar el evento de logout
      this.logoutEvent();
    },

    logoutEvent() {
      const logoutBtn = document.getElementById("logout-btn");
      if (!logoutBtn)
        return console.warn("❌ No se encontró el botón de logout");

      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("🚪 Logout clickeado");
        this.handleLogout();
      });
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
            background: #ffe4ec;
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
            color: #be185d;
            margin-bottom: 0.25rem;
            line-height: 1.2;
          }

          .manga-card-description {
            color: #9d174d;
            font-size: 0.9rem;
            line-height: 1.3;
          }

          .manga-card-meta {
            font-size: 0.75rem;
            color: #831843;
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

      container.innerHTML = "";
      let openDropdown = null;

      mangas.forEach((manga, index) => {
        const mangaCard = document.createElement("div");
        mangaCard.className = "manga-card-container";

        mangaCard.innerHTML = `
          <div class="flex w-full gap-6 items-center flex-col md:flex-row">
            <img src="${manga.imageURL || manga.image || "/default-manga.jpg"}"
                 alt="${manga.title}"
                 class="w-28 h-40 object-cover rounded-lg shadow-md flex-shrink-0"
                 onerror="this.src='/default-manga.jpg'">
            <div class="manga-card-info">
              <div>
                <h3 class="manga-card-title">${manga.title}</h3>
                <p class="manga-card-description">${manga.description || "Sin descripción disponible."}</p>
              </div>
              <div class="manga-card-meta">
                <span>${manga.genre || manga.category || "Género desconocido"}</span>
                <span class="manga-card-status">${manga.status || "Estado desconocido"}</span>
              </div>
            </div>
          </div>
        `;

        // Contenedor dropdown para capítulos
        const dropdown = document.createElement("div");
        dropdown.className =
          "hidden mt-4 w-full bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-xl shadow-lg p-6 max-h-80 overflow-y-auto text-gray-800";
        mangaCard.appendChild(dropdown);

        // Event listener para mostrar/ocultar capítulos
        mangaCard.addEventListener("click", async (e) => {
          // Evitar que se active si se hace clic en un botón
          if (e.target.closest("button")) return;

          // Cerrar otros dropdowns
          if (openDropdown && openDropdown !== dropdown) {
            openDropdown.classList.add("hidden");
          }

          if (!dropdown.classList.contains("hidden")) {
            dropdown.classList.add("hidden");
            openDropdown = null;
            return;
          }

          // Mostrar loading
          dropdown.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-3 border-pink-500 border-t-transparent mb-4"></div>
              <p class="text-pink-700 font-medium">Cargando capítulos...</p>
            </div>
          `;
          dropdown.classList.remove("hidden");
          openDropdown = dropdown;

          // Cargar y mostrar capítulos
          const chapters = await this.fetchChapters(manga._id || manga.id);
          this.renderChapters(dropdown, chapters);
        });

        container.appendChild(mangaCard);
      });

      // Configurar efectos después del renderizado
      setTimeout(() => {
        this.setupScrollEffects();
        this.setupCardHoverEffects();
      }, 100);
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

    renderChapters(dropdown, chapters) {
      if (!chapters || chapters.length === 0) {
        dropdown.innerHTML = `
                <div class="flex flex-col items-center justify-center py-8">
                  <div class="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"></path>
                    </svg>
                  </div>
                  <p class="text-pink-600 font-semibold text-lg">No hay capítulos disponibles</p>
                  <p class="text-pink-500 text-sm mt-1">Vuelve pronto para ver nuevo contenido</p>
                </div>
              `;
        return;
      }

      dropdown.innerHTML = "";

      // Header de capítulos
      const headerElement = document.createElement("div");
      headerElement.className = "mb-6 text-center";
      headerElement.innerHTML = `
              <h4 class="text-xl font-bold text-pink-800 mb-2">📖 Capítulos Disponibles</h4>
              <div class="w-20 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mx-auto"></div>
            `;
      dropdown.appendChild(headerElement);

      // Renderizar cada capítulo
      chapters.forEach((chapter, index) => {
        const chapterElement = document.createElement("div");
        chapterElement.className = `
                group relative mb-4 p-4 bg-white rounded-xl shadow-sm border border-pink-100
                hover:shadow-md hover:border-pink-200 transition-all duration-300 cursor-pointer
                hover:transform hover:scale-[1.02] hover:bg-gradient-to-r hover:from-white hover:to-pink-50
              `;

        const accentColors = [
          "from-pink-400 to-rose-400",
          "from-purple-400 to-pink-400",
          "from-rose-400 to-orange-400",
          "from-indigo-400 to-purple-400",
          "from-teal-400 to-blue-400",
          "from-emerald-400 to-teal-400",
        ];
        const accentColor = accentColors[index % accentColors.length];

        chapterElement.innerHTML = `
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4 flex-1">
                    <div class="relative">
                      <div class="w-16 h-16 bg-gradient-to-br ${accentColor} rounded-xl shadow-lg flex items-center justify-center transform group-hover:rotate-3 transition-transform duration-300">
                        <span class="text-white font-bold text-lg">${chapter.chapterNumber || chapter.number || index + 1}</span>
                      </div>
                      <div class="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                        <span class="text-yellow-800 text-xs font-bold">📑</span>
                      </div>
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <h5 class="text-lg font-bold text-gray-800 group-hover:text-pink-700 transition-colors">
                          Episodio ${chapter.chapterNumber || chapter.number || index + 1}
                        </h5>
                        ${chapter.isNew ? '<span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">NUEVO</span>' : ""}
                      </div>

                      <p class="text-pink-600 font-medium mb-2 group-hover:text-pink-700 transition-colors">
                        ${chapter.chapterTitle || chapter.title || "Capítulo sin título"}
                      </p>

                      <div class="flex items-center gap-4 text-sm text-gray-500">
                        ${
                          chapter.publishDate || chapter.createdAt
                            ? `
                          <div class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span>${new Date(chapter.publishDate || chapter.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
                          </div>
                        `
                            : ""
                        }

                        ${
                          chapter.readTime
                            ? `
                          <div class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>${chapter.readTime} min</span>
                          </div>
                        `
                            : ""
                        }

                        ${
                          chapter.pagesCount || chapter.pages
                            ? `
                          <div class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>${
                              Array.isArray(chapter.pagesCount || chapter.pages)
                                ? (chapter.pagesCount || chapter.pages).length
                                : chapter.pagesCount || chapter.pages || 0
                            } páginas</span>
                          </div>
                        `
                            : ""
                        }
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col items-end gap-3 ml-4">
                    ${
                      this.user.isAuthenticated
                        ? `
                      <div class="text-right">
                        <div class="flex items-center gap-1 justify-end mb-1">
                          <span class="text-yellow-500 text-lg">🪙</span>
                          <span class="text-lg font-bold text-pink-700">${chapter.price ?? 0}</span>
                        </div>
                        <span class="text-xs text-gray-500">Gallecoins</span>
                      </div>

                      <button class="buy-btn relative px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 group" data-id="${chapter._id || chapter.id}">
                        <span class="flex items-center gap-2">
                          <svg class="w-4 h-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0h8"></path>
                          </svg>
                          ${chapter.price === 0 ? "Leer Gratis" : "Comprar"}
                        </span>
                        <div class="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 bg-gradient-to-r from-white to-transparent transition-opacity duration-300"></div>
                      </button>
                    `
                        : `
                      <div class="text-right">
                        <div class="flex items-center gap-1 justify-end mb-1">
                          <span class="text-yellow-500 text-lg">🪙</span>
                          <span class="text-lg font-bold text-gray-400">${chapter.price ?? 0}</span>
                        </div>
                        <span class="text-xs text-gray-500">Gallecoins</span>
                      </div>

                      <button class="locked-btn relative px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg shadow-md cursor-not-allowed group" title="Inicia sesión para leer este capítulo">
                        <span class="flex items-center gap-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v3h8z"></path>
                          </svg>
                          Bloqueado
                        </span>
                      </button>
                    `
                    }
                  </div>
                </div>

                ${
                  chapter.readProgress
                    ? `
                  <div class="mt-3 pt-3 border-t border-pink-100">
                    <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progreso de lectura</span>
                      <span>${chapter.readProgress}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-500" style="width: ${chapter.readProgress}%"></div>
                    </div>
                  </div>
                `
                    : ""
                }
              `;

        dropdown.appendChild(chapterElement);
      });

      // Configurar botones de compra (solo si el usuario está autenticado)
      if (this.user.isAuthenticated) {
        dropdown.querySelectorAll(".buy-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();

            // Efecto visual de clic
            btn.style.transform = "scale(0.95)";
            setTimeout(() => {
              btn.style.transform = "scale(1.05)";
              setTimeout(() => {
                btn.style.transform = "";
              }, 100);
            }, 100);

            this.requireAuth(() => {
              // This will always be true here, but good for consistency
              const chapterId = btn.getAttribute("data-id");
              this.purchaseChapter(chapterId);
            });
          });
        });
      } else {
        // Configurar botones bloqueados
        dropdown.querySelectorAll(".locked-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.showNotification(
              "Por favor, inicia sesión para acceder a los capítulos.",
              "info",
            );
            setTimeout(() => {
              window.location.href = "/api/auth/login";
            }, 1500); // Redirect to login page after a short delay
          });
        });
      }
    },

    async purchaseChapter(chapterId) {
      try {
        this.showNotification("Procesando compra...", "info");

        const response = await fetch("/api/chapters/purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.user.sessionToken && {
              Authorization: `Bearer ${this.user.sessionToken}`,
            }),
          },
          credentials: "include",
          body: JSON.stringify({ chapterId }),
        });

        if (response.ok) {
          const data = await response.json();
          this.showNotification("¡Capítulo comprado exitosamente!", "success");

          // Actualizar gallecoins del usuario
          if (data.newBalance !== undefined) {
            this.user.userData.gallecoins = data.newBalance;
            this.updateProfileElements();
          }

          // Redirigir al capítulo o actualizar UI
          if (data.chapterUrl) {
            setTimeout(() => {
              window.location.href = data.chapterUrl;
            }, 1500);
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al comprar capítulo");
        }
      } catch (error) {
        console.error("Error al comprar capítulo:", error);
        this.showNotification(
          error.message || "Error al procesar la compra",
          "error",
        );
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
