(() => {
  const Auth = {
    htmlElements: {
      loginFormContainer: document.querySelector('#auth-content > div'),
      registerFormContainer: document.querySelector('#auth-content > .bg-white.rounded-lg.shadow-md.p-8.w-full.max-w-md.mt-8'),
      toRegisterLink: null,
      toLoginLink: null,
    },

    init() {
      // Usar los nuevos ids únicos para los enlaces
      this.htmlElements.toRegisterLink = document.getElementById('link-to-register');
      this.htmlElements.toLoginLink = document.getElementById('link-to-login');
      this.bindEvents();
    },

    bindEvents() {
      // Alternar a formulario de registro
      this.htmlElements.toRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.htmlElements.loginFormContainer.classList.add('hidden');
        this.htmlElements.registerFormContainer.classList.remove('hidden');
      });
      // Alternar a formulario de inicio de sesión
      this.htmlElements.toLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.htmlElements.registerFormContainer.classList.add('hidden');
        this.htmlElements.loginFormContainer.classList.remove('hidden');
      });
    },

    // Aquí se puede agregar la lógica de envío de formularios
  };

  window.Auth = Auth;
  document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
  });
})();
