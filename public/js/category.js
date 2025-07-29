(() => {
  const Categories = {
    htmlElements: {
      categoriesContainer: null,
      mangaContainer: null, // New: Container for displaying mangas
    },

    init() {
      this.htmlElements.categoriesContainer = document.getElementById(
        "categories-container",
      );
      this.htmlElements.mangaContainer =
        document.getElementById("manga-container"); // New: Get manga container

      if (!this.htmlElements.categoriesContainer) {
        console.error(
          "No se encontró el contenedor de categorías (#categories-container).",
        );
        return;
      }

      if (!this.htmlElements.mangaContainer) {
        console.warn(
          "No se encontró el contenedor de mangas (#manga-container). Los mangas no se mostrarán.",
        );
        // Do not return, as categories might still be useful
      }

      const container = this.htmlElements.categoriesContainer;
      container.style.display = "flex";
      container.style.justifyContent = "center";
      container.style.flexWrap = "wrap";
      container.style.gap = "0.5rem";

      this.fetchCategories();
    },

    async fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();

        if (response.ok && data.success) {
          this.renderCategories(data.data);
        } else {
          this.showError("Error al obtener las categorías");
        }
      } catch (error) {
        console.error("Error fetchCategories:", error);
        this.showError("Error de conexión al obtener categorías");
      }
    },

    renderCategories(categories) {
      // Limpiar contenedor
      this.htmlElements.categoriesContainer.innerHTML = "";

      if (!categories.length) {
        this.htmlElements.categoriesContainer.textContent =
          "No hay categorías disponibles.";
        return;
      }

      // Crear botones en fila
      categories.forEach((category) => {
        const btn = document.createElement("button");
        btn.textContent = category.categoryName;
        btn.className = "category-btn";
        btn.style.margin = "0 0.5rem 0.5rem 0";
        btn.style.padding = "0.5rem 1rem";
        btn.style.borderRadius = "9999px";
        btn.style.backgroundColor = "#db2777"; // rosa
        btn.style.color = "#fff";
        btn.style.fontWeight = "600";
        btn.style.cursor = "pointer";
        btn.style.border = "none";
        btn.style.transition = "background-color 0.3s ease";
        btn.onmouseenter = () => (btn.style.backgroundColor = "#be185d");
        btn.onmouseleave = () => (btn.style.backgroundColor = "#db2777");

        // Puedes agregar aquí evento click si quieres filtrar mangas por categoría
        btn.addEventListener("click", () => {
          console.log(
            "Categoría clicada:",
            category.categoryName,
            "ID:",
            category._id,
          );
          this.fetchMangasByCategory(category.categoryName);
        });

        this.htmlElements.categoriesContainer.appendChild(btn);
      });
    },

    showError(message) {
      if (this.htmlElements.categoriesContainer) {
        this.htmlElements.categoriesContainer.textContent = message;
        this.htmlElements.categoriesContainer.style.color = "#f87171"; // rojo claro
      }
    },

    async fetchMangasByCategory(categories) {
      if (!this.htmlElements.mangaContainer) {
        console.error(
          "No se encontró el contenedor de mangas (#manga-container).",
        );
        return;
      }

      this.htmlElements.mangaContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p class="text-gray-500">Cargando mangas...</p>
        </div>
      `;

      try {
        const response = await fetch(`/api/mangas/byCategory/${categories}`);
        const data = await response.json();

        console.log(
          "Respuesta de la API - response.ok:",
          response.ok,
          "data.success:",
          data.success,
          "data.data:",
          data.categoryName,
        );

        if (response.ok && data.success) {
          // Check if window.App and renderMangas are available from index.js
          if (window.App && typeof window.App.renderMangas === "function") {
            console.log(
              "window.App.renderMangas está disponible. Renderizando mangas...",
            );
            window.App.renderMangas(data.data);
          } else {
            console.error(
              "window.App.renderMangas no está disponible. Asegúrate de que index.js se carga correctamente.",
            );
            this.htmlElements.mangaContainer.innerHTML = `
              <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">⚠️</div>
                <h3 class="text-xl font-bold text-gray-600 mb-2">Error de configuración</h3>
                <p class="text-gray-500">No se pudo renderizar los mangas. Falta la función de renderizado.</p>
              </div>
            `;
          }
        } else {
          this.htmlElements.mangaContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
              <div class="text-6xl mb-4">😞</div>
              <h3 class="text-xl font-bold text-gray-600 mb-2">No se encontraron mangas</h3>
              <p class="text-gray-500">No hay mangas disponibles para esta categoría.</p>
            </div>
          `;
          console.error(
            "Error al obtener mangas por categoría:",
            data.message || response.statusText,
            "Respuesta completa:",
            data,
          );
        }
      } catch (error) {
        console.error("Error en fetchMangasByCategory (catch block):", error);
        this.htmlElements.mangaContainer.innerHTML = `
          <div class="col-span-full text-center py-12">
            <div class="text-6xl mb-4">🔌</div>
            <h3 class="text-xl font-bold text-gray-600 mb-2">Error de conexión</h3>
            <p class="text-gray-500">No se pudieron cargar los mangas de la categoría.</p>
          </div>
        `;
      }
    },
  };

  window.Categories = Categories;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => Categories.init());
  } else {
    Categories.init();
  }
})();
