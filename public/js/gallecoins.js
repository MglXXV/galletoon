(() => {
  const GalleCoins = {
    htmlElements: {
      container: null,
    },

    async init() {
      this.htmlElements.container = document.querySelector(".grid");

      if (!this.htmlElements.container) {
        console.error("No se encontró el contenedor .grid.");
        return;
      }

      await this.loadPackages();
    },

    async isUserLoggedIn() {
      try {
        const res = await fetch("/api/auth/refresh");
        const data = await res.json();
        return res.ok && data.success && data.user;
      } catch {
        return false;
      }
    },

    async loadPackages() {
      this.htmlElements.container.innerHTML = `
        <div class="text-center text-pink-300 text-xl col-span-full animate-pulse">
          Cargando paquetes...
        </div>
      `;

      try {
        const [packagesRes, isLoggedIn] = await Promise.all([
          fetch("/api/gallecoins/get"),
          this.isUserLoggedIn(),
        ]);

        const data = await packagesRes.json();

        if (!packagesRes.ok || !data.success) {
          throw new Error(data.message || "Error al cargar paquetes");
        }

        this.renderPackages(data.data, isLoggedIn);
      } catch (err) {
        this.htmlElements.container.innerHTML = `
          <div class="text-center text-red-400 font-semibold">
            ⚠️ No se pudieron cargar los paquetes de GalleCoins.
          </div>
        `;
        console.error(err);
      }
    },

    renderPackages(packages, isLoggedIn) {
      const container = this.htmlElements.container;
      container.innerHTML = "";

      if (!packages.length) {
        container.innerHTML = `
          <div class="text-center text-yellow-200">
            No hay paquetes disponibles en este momento.
          </div>
        `;
        return;
      }

      packages.forEach((pkg) => {
        const card = document.createElement("div");
        card.className = "package-card";
        card.innerHTML = `
          <div class="icon-circle">
            <i class="fas fa-coins"></i>
          </div>
          <h3 class="package-title">${pkg.amount} GalleCoins</h3>
          <div class="package-price">$${pkg.price}</div>
          ${
            isLoggedIn
              ? `
              <button class="buy-btn" data-amount="${pkg.amount}">
                Comprar ahora
              </button>
            `
              : `
              <button
                class="buy-btn cursor-not-allowed bg-gray-400 opacity-60"
                title="Inicia sesión para comprar GalleCoins"
                data-login-redirect
              >
                <span class="flex items-center gap-2 justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v3h8z" />
                  </svg>
                  Bloqueado
                </span>
              </button>
            `
          }
        `;

        const btn = card.querySelector(".buy-btn");

        if (isLoggedIn) {
          btn.addEventListener("click", () => {
            alert(`¡Compraste ${pkg.amount} GalleCoins por $${pkg.price}!`);
            // Aquí va el flujo real de compra con Stripe
          });
        } else {
          btn.addEventListener("click", () => {
            const alertBox = document.createElement("div");
            alertBox.className = `
              fixed top-6 right-6 z-50 max-w-xs w-[280px]
              bg-pink-100 border border-pink-300 text-pink-800
              px-4 py-2 rounded-lg shadow-lg flex items-start gap-2 animate-slide-in
              text-sm
            `;
            alertBox.innerHTML = `
              <svg class="w-5 h-5 mt-0.5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M12 9v2m0 4h.01M12 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9z" />
              </svg>
              <div>
                <p class="font-semibold">Inicia sesión</p>
                <p class="text-xs text-pink-600">Necesitas estar autenticado para comprar.</p>
              </div>
            `;

            document.body.appendChild(alertBox);

            setTimeout(() => {
              alertBox.classList.add("opacity-0", "translate-x-4");
              setTimeout(() => alertBox.remove(), 500);
            }, 3000);

            setTimeout(() => {
              window.location.href = "/api/auth/login";
            }, 2500);
          });
        }

        container.appendChild(card);
      });
    },
  };

  window.GalleCoins = GalleCoins;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => GalleCoins.init());
  } else {
    GalleCoins.init();
  }
})();
