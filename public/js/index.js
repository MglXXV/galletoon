(() => {
  const GalleToon = {
    htmlElements: {
      loginLink: null,
      searchInput: null,
      navLinks: null,
      mangaCards: null,
      header: null,
      notificationsContainer: null,
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
    },

    initializeElements() {
      this.htmlElements.loginLink = document.querySelector(
        'a[href="/api/auth/login"]',
      );
      this.htmlElements.searchInput =
        document.querySelector('input[type="text"]');
      this.htmlElements.navLinks = document.querySelectorAll(".nav-link");
      this.htmlElements.mangaCards = document.querySelectorAll(
        ".bg-white.rounded-lg",
      );
      this.htmlElements.header = document.querySelector("header");

      if (!document.getElementById("notifications-container")) {
        const notificationsContainer = document.createElement("div");
        notificationsContainer.id = "notifications-container";
        notificationsContainer.className = "fixed top-4 right-4 z-50";
        document.body.appendChild(notificationsContainer);
        this.htmlElements.notificationsContainer = notificationsContainer;
      }
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

          if (
            data.hasSession &&
            data.sessionUser &&
            data.sessionUser.username
          ) {
            this.user.isAuthenticated = true;
            this.user.userData = data.sessionUser;

            if (this.user.userData.role === "admin") {
              window.location.href = "/api/admin";
              return;
            }

            const profileUsernameEl =
              document.getElementById("profile-username");
            if (profileUsernameEl && this.user.userData.username) {
              profileUsernameEl.textContent = this.user.userData.username;
            }

            const profileEmailEl = document.getElementById("profile-email");
            if (profileEmailEl && this.user.userData.email) {
              profileEmailEl.textContent = this.user.userData.email;
            }

            const profileGallecoinsEl =
              document.getElementById("profile-gallecoins");
            if (
              profileGallecoinsEl &&
              this.user.userData.gallecoins !== undefined
            ) {
              profileGallecoinsEl.textContent = `${this.user.userData.gallecoins} Gallecoins`;
            }

            console.log("Usuario autenticado:", data.sessionUser.username);
            this.updateNavigationForAuthenticatedUser();
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
        // No mostramos error en consola para evitar ruido si no hay sesión
        // console.error("Error al verificar autenticación:", error);
        this.user.isAuthenticated = false;
        this.updateNavigationForGuestUser();
      }
    },

    async refreshSessionUser() {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Sesión actualizada:", data.user);
        } else {
          // No mostramos error para evitar ruido si no se puede refrescar
          // console.error("No se pudo actualizar la sesión.");
        }
      } catch (err) {
        // No mostramos error para evitar ruido si no se puede refrescar
        // console.error("Error al refrescar la sesión:", err);
      }
    },

    updateNavigationForAuthenticatedUser() {
      if (this.htmlElements.loginLink) {
        this.htmlElements.loginLink.textContent = `${this.user.userData.username}`;
        this.htmlElements.loginLink.href = "/api/profile";
        this.htmlElements.loginLink.classList.add("authenticated-user");

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

        this.htmlElements.loginLink.replaceWith(
          this.htmlElements.loginLink.cloneNode(true),
        );
        this.htmlElements.loginLink = document.querySelector(
          'a[href="/api/auth/login"]',
        );
      }

      const existingDropdown = document.getElementById("user-dropdown");
      if (existingDropdown) {
        existingDropdown.remove();
      }
    },

    createUserDropdownMenu() {
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

      this.htmlElements.loginLink.parentNode.insertBefore(
        dropdownContainer,
        this.htmlElements.loginLink.nextSibling,
      );
      dropdownContainer.appendChild(dropdownMenu);

      this.htmlElements.loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        dropdownMenu.classList.toggle("hidden");
      });

      document.addEventListener("click", (e) => {
        if (!dropdownContainer.contains(e.target)) {
          dropdownMenu.classList.add("hidden");
        }
      });
    },

    logoutEvent() {
      const logoutBtn = document.querySelector("#logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          this.handleLogout();
        });
      }
    },

    navigateToProfile() {
      setTimeout(() => {
        window.location.href = "/api/profile";
      }, 500);
    },

    async handleLogout() {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.user.userData.sessionToken,
          },
          body: JSON.stringify({}),
        });

        if (response.ok) {
          this.user.isAuthenticated = false;
          this.user.userData = null;

          this.showNotification("¡Sesión cerrada exitosamente!", "success");

          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        } else {
          throw new Error("Error al cerrar sesión");
        }
      } catch (error) {
        // No mostrar error en consola para evitar ruido
        // console.error("Error durante logout:", error);
        this.showNotification("Error al cerrar sesión", "error");
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

        // Aquí iría la lógica real de búsqueda
      } catch (error) {
        // console.error("Error en búsqueda:", error);
        this.showNotification("Error al realizar la búsqueda", "error");
      }
    },

    setupMangaCardInteractions() {
      this.htmlElements.mangaCards.forEach((card) => {
        card.addEventListener("mouseenter", () => {
          card.style.transform = "translateY(-8px) scale(1.02)";
          card.style.boxShadow =
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
          card.style.transition = "all 0.3s ease";
        });

        card.addEventListener("mouseleave", () => {
          card.style.transform = "translateY(0) scale(1)";
          card.style.boxShadow =
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        });

        card.addEventListener("click", (e) => {
          const link = card.querySelector("a");
          if (link && !e.target.closest("button")) {
            card.style.transform = "scale(0.98)";
            setTimeout(() => {
              window.location.href = link.href;
            }, 150);
          }
        });
      });
    },

    setupNavigationEffects() {
      this.htmlElements.navLinks.forEach((link) => {
        link.addEventListener("mouseenter", () => {
          link.style.transform = "translateY(-2px)";
          link.style.transition = "all 0.2s ease";
        });

        link.addEventListener("mouseleave", () => {
          link.style.transform = "translateY(0)";
        });
      });

      if (this.htmlElements.header) {
        window.addEventListener("scroll", () => {
          const scrolled = window.pageYOffset;

          if (scrolled > 100) {
            this.htmlElements.header.style.backgroundColor =
              "rgba(190, 24, 93, 0.95)";
            this.htmlElements.header.style.backdropFilter = "blur(10px)";
          } else {
            this.htmlElements.header.style.backgroundColor = "rgb(190, 24, 93)";
            this.htmlElements.header.style.backdropFilter = "none";
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

      this.htmlElements.mangaCards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
      });
    },

    addGlobalStyles() {
      if (!document.getElementById("galletoon-styles")) {
        const style = document.createElement("style");
        style.id = "galletoon-styles";
        style.textContent = `
          .authenticated-user {
            background: linear-gradient(135deg, #f472b6, #fb7185); /* rosa vibrante */
            padding: 8px 16px;
            border-radius: 9999px; /* pill shape */
            color: white !important;
            font-weight: 600;
            box-shadow: 0 4px 10px rgba(251, 113, 133, 0.4);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
          }
          .authenticated-user:hover {
            background: linear-gradient(135deg, #f43f5e, #be185d); /* más profundo */
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
          // console.error("Error al manejar favorito:", error);
          this.showNotification("Error al actualizar favoritos", "error");
        }
      });
    },
  };

  window.GalleToon = GalleToon;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      GalleToon.init();
    });
  } else {
    GalleToon.init();
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && GalleToon.user.isAuthenticated) {
      GalleToon.checkAuthenticationStatus();
    }
  });

  window.addEventListener("popstate", () => {
    if (window.location.pathname === "/") {
      GalleToon.checkAuthenticationStatus();
    }
  });
})();
