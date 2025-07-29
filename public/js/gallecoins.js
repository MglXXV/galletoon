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
              <button class="buy-btn" data-amount="${pkg.amount}" data-price="${pkg.price}" data-package-id="${pkg._id}">
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
          btn.addEventListener("click", async () => {
            const amount = parseInt(btn.dataset.amount);
            const price = parseFloat(btn.dataset.price);
            const packageId = btn.dataset.packageId;

            if (isNaN(amount) || isNaN(price) || !packageId) {
              this.showAlert("Datos del paquete inválidos.", "error");
              return;
            }

            try {
              btn.disabled = true;
              btn.textContent = "Procesando...";
              btn.classList.add("opacity-60", "cursor-wait");

              const res = await fetch("/api/gallecoins/checkout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount, price, packageId }),
              });

              const data = await res.json();

              if (res.ok && data.success && data.url) {
                window.location.href = data.url;
              } else {
                this.showAlert(
                  data.error || "Error al iniciar compra",
                  "error",
                );
              }
            } catch (err) {
              console.error(err);
              this.showAlert("Error de red. Intenta de nuevo.", "error");
            } finally {
              btn.disabled = false;
              btn.textContent = "Comprar ahora";
              btn.classList.remove("opacity-60", "cursor-wait");
            }
          });
        } else {
          btn.addEventListener("click", () => {
            this.showAlert(
              "Necesitas estar autenticado para comprar.",
              "info",
              "/api/auth/login",
            );
          });
        }

        container.appendChild(card);
      });
    },

    showAlert(message, type = "info", redirectUrl = null) {
      const alertBox = document.createElement("div");
      let bgColor, borderColor, textColor;

      if (type === "success") {
        bgColor = "bg-green-100";
        borderColor = "border-green-300";
        textColor = "text-green-800";
      } else if (type === "error") {
        bgColor = "bg-red-100";
        borderColor = "border-red-300";
        textColor = "text-red-800";
      } else {
        bgColor = "bg-pink-100";
        borderColor = "border-pink-300";
        textColor = "text-pink-800";
      }

      alertBox.className = `
        fixed top-6 right-6 z-50 max-w-xs w-[280px]
        ${bgColor} ${borderColor} ${textColor}
        px-4 py-2 rounded-lg shadow-lg flex items-start gap-2 animate-slide-in
        text-sm
      `;

      alertBox.innerHTML = `
        <div>
          <p class="font-semibold">${message}</p>
        </div>
      `;

      document.body.appendChild(alertBox);

      setTimeout(() => {
        alertBox.classList.add("opacity-0", "translate-x-4");
        setTimeout(() => {
          alertBox.remove();
          if (redirectUrl) {
            window.location.href = redirectUrl;
          }
        }, 500);
      }, 3000);
    },
  };

  window.GalleCoins = GalleCoins;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => GalleCoins.init());
  } else {
    GalleCoins.init();
  }
})();
