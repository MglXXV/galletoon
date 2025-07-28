(() => {
  const Categories = {
    htmlElements: {
      categoriesContainer: null,
    },

    init() {
      this.htmlElements.categoriesContainer = document.getElementById(
        "categories-container",
      );
      if (!this.htmlElements.categoriesContainer) {
        console.error(
          "No se encontró el contenedor de categorías (#categories-container).",
        );
        return;
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

        this.htmlElements.categoriesContainer.appendChild(btn);
      });
    },

    showError(message) {
      if (this.htmlElements.categoriesContainer) {
        this.htmlElements.categoriesContainer.textContent = message;
        this.htmlElements.categoriesContainer.style.color = "#f87171"; // rojo claro
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
