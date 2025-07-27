(() => {
  const Auth = {
    htmlElements: {
      loginContainer: null,
      registerContainer: null,
      loginForm: null,
      registerForm: null,
      toRegisterLink: null,
      toLoginLink: null,
      // backToHomeBtn: null, // Eliminado
      logoLink: null,
      notificationsContainer: null,
      formInputs: {
        login: {
          email: null,
          password: null,
        },
        register: {
          username: null,
          email: null,
          password: null,
          confirmPassword: null,
        },
      },
    },

    init() {
      console.log("Inicializando Auth...");
      this.initializeElements();
      this.setupValidation();
      this.setupFormSubmissions();
      this.setupNavigation();
      this.setupFormToggling();
      this.setupPasswordConfirmation();
      this.addAnimationStyles();
      // Eliminar métodos de autenticación innecesarios

      // Mostrar el formulario correcto según la URL
      if (window.location.pathname === "/api/auth/register") {
        this.showRegister();
      } else if (window.location.pathname === "/api/auth/login") {
        this.showLogin();
      }
    },

    initializeElements() {
      this.htmlElements.loginContainer =
        document.getElementById("login-container");
      this.htmlElements.registerContainer =
        document.getElementById("register-container");
      this.htmlElements.loginForm = document.getElementById("login-form");
      this.htmlElements.registerForm = document.getElementById("register-form");
      this.htmlElements.toRegisterLink =
        document.getElementById("link-to-register");
      this.htmlElements.toLoginLink = document.getElementById("link-to-login");
      // this.htmlElements.backToHomeBtn = document.getElementById("back-to-home"); // Eliminado
      this.htmlElements.logoLink = document.querySelector('a[href="/"]');
      this.htmlElements.notificationsContainer = document.getElementById(
        "notifications-container",
      );

      // Inicializar elementos de formularios
      this.htmlElements.formInputs.login.email =
        document.getElementById("email");
      this.htmlElements.formInputs.login.password =
        document.getElementById("password");

      this.htmlElements.formInputs.register.username =
        document.getElementById("username");
      this.htmlElements.formInputs.register.email =
        document.getElementById("register-email");
      this.htmlElements.formInputs.register.password =
        document.getElementById("register-password");
      this.htmlElements.formInputs.register.confirmPassword =
        document.getElementById("confirm-password");

      // Ya no se manipula href porque ahora es un <button>
    },

    // Eliminar métodos de autenticación innecesarios

    setupNavigation() {
      // Funcionalidad del logo (ya existente)
      if (this.htmlElements.logoLink) {
        console.log("Logo encontrado, agregando event listener");
        this.htmlElements.logoLink.addEventListener("click", (e) => {
          console.log("Click en logo detectado");
          e.preventDefault();
          const logo = this.htmlElements.logoLink.querySelector("i");
          if (logo) logo.style.animation = "pulse 0.3s ease-in-out";
          setTimeout(() => {
            window.location.href = "/";
          }, 200);
        });
        this.htmlElements.logoLink.addEventListener("mouseenter", () => {
          const logo = this.htmlElements.logoLink.querySelector("i");
          if (logo) {
            logo.style.transform = "rotate(10deg) scale(1.1)";
            logo.style.transition = "transform 0.3s ease";
          }
        });
        this.htmlElements.logoLink.addEventListener("mouseleave", () => {
          const logo = this.htmlElements.logoLink.querySelector("i");
          if (logo) {
            logo.style.transform = "rotate(0deg) scale(1)";
          }
        });
      }
      // Botón flotante para volver al inicio
      const floatingBackBtn = document.getElementById("floating-back-home");
      if (floatingBackBtn) {
        floatingBackBtn.addEventListener("click", (e) => {
          e.preventDefault();
          floatingBackBtn.style.transform = "scale(0.95)";
          floatingBackBtn.style.opacity = "0.8";
          setTimeout(() => {
            window.location.href = "/";
          }, 200);
        });
      }
    },

    setupFormToggling() {
      // Toggle between login and register forms
      if (this.htmlElements.toRegisterLink) {
        this.htmlElements.toRegisterLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.showRegister();
        });
      }

      if (this.htmlElements.toLoginLink) {
        this.htmlElements.toLoginLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.showLogin();
        });
      }
    },

    showRegister() {
      if (
        this.htmlElements.loginContainer &&
        this.htmlElements.registerContainer
      ) {
        this.htmlElements.loginContainer.classList.add("hidden");
        this.htmlElements.registerContainer.classList.remove("hidden");
        this.htmlElements.registerContainer.classList.add("slide-in");
      }
      // Cambiar la URL sin recargar la página
      if (window.location.pathname !== "/api/auth/register") {
        window.history.pushState({}, "", "/api/auth/register");
      }
    },

    showLogin() {
      if (
        this.htmlElements.registerContainer &&
        this.htmlElements.loginContainer
      ) {
        this.htmlElements.registerContainer.classList.add("hidden");
        this.htmlElements.loginContainer.classList.remove("hidden");
        this.htmlElements.loginContainer.classList.add("slide-in");
      }
      // Cambiar la URL sin recargar la página
      if (window.location.pathname !== "/api/auth/login") {
        window.history.pushState({}, "", "/api/auth/login");
      }
    },

    setupPasswordConfirmation() {
      // Password confirmation validation
      if (
        this.htmlElements.registerForm &&
        this.htmlElements.formInputs.register.confirmPassword
      ) {
        this.htmlElements.registerForm.addEventListener("submit", (e) => {
          const password = this.htmlElements.formInputs.register.password.value;
          const confirmPassword =
            this.htmlElements.formInputs.register.confirmPassword.value;

          if (password !== confirmPassword) {
            e.preventDefault();
            this.htmlElements.formInputs.register.confirmPassword.setCustomValidity(
              "Las contraseñas no coinciden",
            );
            this.htmlElements.formInputs.register.confirmPassword.reportValidity();
            this.showNotification("Las contraseñas no coinciden", "error");
          } else {
            this.htmlElements.formInputs.register.confirmPassword.setCustomValidity(
              "",
            );
          }
        });

        this.htmlElements.formInputs.register.confirmPassword.addEventListener(
          "input",
          () => {
            const password =
              this.htmlElements.formInputs.register.password.value;
            const confirmPassword =
              this.htmlElements.formInputs.register.confirmPassword.value;

            if (password !== confirmPassword) {
              this.htmlElements.formInputs.register.confirmPassword.setCustomValidity(
                "Las contraseñas no coinciden",
              );
            } else {
              this.htmlElements.formInputs.register.confirmPassword.setCustomValidity(
                "",
              );
            }
          },
        );
      }
    },

    addAnimationStyles() {
      // Agregar animación de pulso para el logo si no existe
      if (!document.getElementById("auth-animations")) {
        const style = document.createElement("style");
        style.id = "auth-animations";
        style.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }

          .slide-in {
            animation: slideIn 0.5s ease-out;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(100px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `;
        document.head.appendChild(style);
      }
    },

    setupValidation() {
      // Validación para formulario de login
      if (this.htmlElements.formInputs.login.email) {
        this.htmlElements.formInputs.login.email.addEventListener(
          "input",
          (e) => this.validateField(e.target),
        );
        this.htmlElements.formInputs.login.email.addEventListener("blur", (e) =>
          this.validateField(e.target),
        );
      }

      if (this.htmlElements.formInputs.login.password) {
        this.htmlElements.formInputs.login.password.addEventListener(
          "input",
          (e) => this.validateField(e.target),
        );
        this.htmlElements.formInputs.login.password.addEventListener(
          "blur",
          (e) => this.validateField(e.target),
        );
      }

      // Validación para formulario de registro
      if (this.htmlElements.formInputs.register.username) {
        this.htmlElements.formInputs.register.username.addEventListener(
          "input",
          (e) => this.validateField(e.target),
        );
        this.htmlElements.formInputs.register.username.addEventListener(
          "blur",
          (e) => this.validateField(e.target),
        );
      }

      if (this.htmlElements.formInputs.register.email) {
        this.htmlElements.formInputs.register.email.addEventListener(
          "input",
          (e) => this.validateField(e.target),
        );
        this.htmlElements.formInputs.register.email.addEventListener(
          "blur",
          (e) => this.validateField(e.target),
        );
      }

      if (this.htmlElements.formInputs.register.password) {
        this.htmlElements.formInputs.register.password.addEventListener(
          "input",
          (e) => this.validateField(e.target),
        );
        this.htmlElements.formInputs.register.password.addEventListener(
          "blur",
          (e) => this.validateField(e.target),
        );
      }

      if (this.htmlElements.formInputs.register.confirmPassword) {
        this.htmlElements.formInputs.register.confirmPassword.addEventListener(
          "input",
          (e) => this.validateField(e.target),
        );
        this.htmlElements.formInputs.register.confirmPassword.addEventListener(
          "blur",
          (e) => this.validateField(e.target),
        );
      }
    },

    validateField(input) {
      if (!input) return false;

      // Remover estilos de error previos
      input.classList.remove("border-red-500");
      input.style.borderColor = "";

      if (!input.value.trim()) {
        this.showFieldError(input, "Este campo es requerido");
        return false;
      }

      // Validación de email
      if (input.type === "email" || input.id === "register-email") {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(input.value)) {
          this.showFieldError(input, "Por favor ingresa un email válido");
          return false;
        }
      }

      // Validación de username
      if (input.id === "username") {
        const usernameRegex = /^[A-Za-z0-9_]{3,30}$/;
        if (!usernameRegex.test(input.value)) {
          this.showFieldError(
            input,
            "El username debe tener entre 3 y 30 caracteres y solo puede contener letras, números y guiones bajos",
          );
          return false;
        }
      }

      // Validación de contraseña
      if (input.type === "password" && input.value.length < 8) {
        this.showFieldError(
          input,
          "La contraseña debe tener al menos 8 caracteres",
        );
        return false;
      }

      // Validación de confirmación de contraseña
      if (input.id === "confirm-password") {
        const password = this.htmlElements.formInputs.register.password.value;
        if (input.value !== password) {
          this.showFieldError(input, "Las contraseñas no coinciden");
          return false;
        }
      }

      return true;
    },

    showFieldError(input, message) {
      input.style.borderColor = "#ef4444";
      input.classList.add("border-red-500");

      // Mostrar tooltip de error temporal
      const tooltip = document.createElement("div");
      tooltip.className =
        "absolute z-50 bg-red-500 text-white text-xs px-2 py-1 rounded mt-1";
      tooltip.textContent = message;

      const rect = input.getBoundingClientRect();
      tooltip.style.position = "fixed";
      tooltip.style.top = rect.bottom + 5 + "px";
      tooltip.style.left = rect.left + "px";

      document.body.appendChild(tooltip);

      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.remove();
        }
      }, 3000);
    },

    showNotification(message, type = "success") {
      if (!message) return;

      const notification = document.createElement("div");
      notification.className = `fixed top-20 right-4 z-50 px-6 py-4 rounded-lg text-white shadow-xl transform transition-all duration-300 ${
        type === "success"
          ? "bg-gradient-to-r from-green-500 to-emerald-600"
          : "bg-gradient-to-r from-red-500 to-red-600"
      }`;

      notification.style.opacity = "0";
      notification.style.transform = "translateX(100px)";

      const iconClass =
        type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
      notification.innerHTML = `
        <div class="flex items-center">
          <i class="fas ${iconClass} mr-3"></i>
          <span>${message}</span>
        </div>
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translateX(0)";
      }, 10);

      setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateX(100px)";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }, 4000);
    },

    validateForm(formType) {
      let isValid = true;
      console.log("Validando formulario:", formType);

      if (formType === "login") {
        console.log(
          "Validando login - email:",
          this.htmlElements.formInputs.login.email?.value,
        );
        console.log(
          "Validando login - password:",
          this.htmlElements.formInputs.login.password?.value,
        );

        if (!this.validateField(this.htmlElements.formInputs.login.email))
          isValid = false;
        if (!this.validateField(this.htmlElements.formInputs.login.password))
          isValid = false;
      } else {
        console.log(
          "Validando register - username:",
          this.htmlElements.formInputs.register.username?.value,
        );
        console.log(
          "Validando register - email:",
          this.htmlElements.formInputs.register.email?.value,
        );
        console.log(
          "Validando register - password:",
          this.htmlElements.formInputs.register.password?.value,
        );
        console.log(
          "Validando register - confirmPassword:",
          this.htmlElements.formInputs.register.confirmPassword?.value,
        );

        if (!this.validateField(this.htmlElements.formInputs.register.username))
          isValid = false;
        if (!this.validateField(this.htmlElements.formInputs.register.email))
          isValid = false;
        if (!this.validateField(this.htmlElements.formInputs.register.password))
          isValid = false;
        if (
          !this.validateField(
            this.htmlElements.formInputs.register.confirmPassword,
          )
        )
          isValid = false;
      }

      console.log("Formulario válido:", isValid);
      return isValid;
    },

    setupFormSubmissions() {
      // Login form submission
      if (this.htmlElements.loginForm) {
        this.htmlElements.loginForm.addEventListener("submit", async (e) => {
          e.preventDefault();

          const email = this.htmlElements.formInputs.login.email.value.trim();
          const password = this.htmlElements.formInputs.login.password.value;

          if (!email || !password) {
            this.showNotification(
              "Por favor completa todos los campos correctamente",
              "error",
            );
            return;
          }

          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(email)) {
            this.showNotification(
              "Por favor ingresa un correo electrónico válido",
              "error",
            );
            return;
          }

          // Agregar estado de carga al botón
          const submitBtn = this.htmlElements.loginForm.querySelector(
            'button[type="submit"]',
          );
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin mr-2"></i>Iniciando sesión...';
          submitBtn.disabled = true;

          try {
            const response = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.message === "Login exitoso") {
              this.showNotification("¡Inicio de sesión exitoso!", "success");
              setTimeout(() => {
                window.location.href = "/";
              }, 1800);
            } else {
              const errorMessage =
                data.error ||
                "Credenciales inválidas. Por favor verifica tu correo y contraseña.";
              this.showNotification(errorMessage, "error");
            }
          } catch (error) {
            console.error("Login error:", error);
            this.showNotification("Error de conexión", "error");
          } finally {
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          }
        });
      }

      // Register form submission
      if (this.htmlElements.registerForm) {
        this.htmlElements.registerForm.addEventListener("submit", async (e) => {
          e.preventDefault();

          if (!this.validateForm("register")) {
            this.showNotification(
              "Por favor completa todos los campos correctamente",
              "error",
            );
            return;
          }

          // Agregar estado de carga al botón
          const submitBtn = this.htmlElements.registerForm.querySelector(
            'button[type="submit"]',
          );
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin mr-2"></i>Registrando...';
          submitBtn.disabled = true;

          try {
            const response = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: this.htmlElements.formInputs.register.username.value,
                email: this.htmlElements.formInputs.register.email.value,
                password: this.htmlElements.formInputs.register.password.value,
              }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
              this.showNotification(
                "¡Registro exitoso! Ahora puedes iniciar sesión.",
                "success",
              );
              setTimeout(() => {
                window.location.href = "/api/auth/login";
              }, 1800);
            } else {
              this.showNotification(
                data.error || "Error al registrarse",
                "error",
              );
            }
          } catch (error) {
            console.error("Register error:", error);
            this.showNotification("Error de conexión", "error");
          } finally {
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          }
        });
      }
    },
  };

  // Exponer Auth globalmente
  window.Auth = Auth;

  // Inicializar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      Auth.init();
    });
  } else {
    Auth.init();
  }

  // Manejar el evento popstate para navegación con el botón atrás/adelante
  window.addEventListener("popstate", () => {
    if (window.location.pathname === "/api/auth/register") {
      Auth.showRegister();
    } else if (window.location.pathname === "/api/auth/login") {
      Auth.showLogin();
    }
  });
})();
