(() => {
  // Datos de ejemplo de mangas
  const mangas = [
    {
      id: 'dragon-ball',
      titulo: 'Dragon Ball Z',
      categoria: 'Acción',
      descripcion: 'Goku y sus amigos protegen la Tierra de amenazas alienígenas',
      imagen: 'https://tse1.mm.bing.net/th/id/OIP.qv89cUB2sU6r26vAbYv_vwHaLu?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    },
    {
      id: 'one-piece',
      titulo: 'One Piece',
      categoria: 'Aventura',
      descripcion: 'Luffy busca el tesoro más grande del mundo',
      imagen: 'https://www.anmosugoi.com/wp-content/uploads/2022/07/One-Piece-manga-vol-103-1200x1883.jpg',
    },
    {
      id: 'naruto',
      titulo: 'Naruto',
      categoria: 'Aventura',
      descripcion: 'Un ninja joven busca convertirse en Hokage',
      imagen: 'https://ramenparados.com/wp-content/uploads/2015/09/portada_naruto-n-70_masashi-kishimoto_2015082513321.jpg',
    },
    {
      id: 'your-lie-in-april',
      titulo: 'Your Lie in April',
      categoria: 'Drama',
      descripcion: 'Un drama musical y emocional inolvidable',
      imagen: 'https://m.media-amazon.com/images/I/81QwQf8QKGL.jpg',
    },
    {
      id: 'kimi-ni-todoke',
      titulo: 'Kimi ni Todoke',
      categoria: 'Romance',
      descripcion: 'Una historia de amor y crecimiento personal',
      imagen: 'https://m.media-amazon.com/images/I/81wQwQf8QKGL._AC_UF1000,1000_QL80_.jpg',
    },
    {
      id: 'junji-ito',
      titulo: 'Junji Ito Collection',
      categoria: 'Terror',
      descripcion: 'Historias de horror y suspenso psicológico',
      imagen: 'https://m.media-amazon.com/images/I/81QwQf8QKGL.jpg',
    },
    {
      id: 'haikyuu',
      titulo: 'Haikyuu!!',
      categoria: 'Deportes',
      descripcion: 'Voleibol, trabajo en equipo y superación personal',
      imagen: 'https://m.media-amazon.com/images/I/81QwQf8QKGL.jpg',
    },
    {
      id: 'jujutsu-kaisen',
      titulo: 'Jujutsu Kaisen',
      categoria: 'Acción',
      descripcion: 'El mundo está en peligro',
      imagen: 'https://tse1.mm.bing.net/th/id/OIP.rl3gr4K8IjD51mde7mtN6QHaLh?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    },
    {
      id: 'shingeki',
      titulo: 'Shingeki No Kyojin',
      categoria: 'Acción',
      descripcion: 'La paz de la tierra está en peligro',
      imagen: 'https://www.anmosugoi.com/wp-content/uploads/2020/12/Shingeki-no-Kyojin-nueva-imagen-visual.jpg',
    },
  ];

  const categorias = [
    { nombre: 'Acción', color: 'bg-indigo-600', id: 'accion' },
    { nombre: 'Aventura', color: 'bg-pink-600', id: 'aventura' },
    { nombre: 'Drama', color: 'bg-yellow-500', id: 'drama' },
    { nombre: 'Romance', color: 'bg-red-500', id: 'romance' },
    { nombre: 'Deportes', color: 'bg-green-600', id: 'deportes' },
    { nombre: 'Terror', color: 'bg-gray-800', id: 'terror' },
  ];

  function renderMangas(filtroCategoria) {
    const contenedor = document.querySelector('.grid.grid-cols-2');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    const filtrados = filtroCategoria && filtroCategoria !== 'Todos'
      ? mangas.filter(m => m.categoria.toLowerCase() === filtroCategoria.toLowerCase())
      : mangas;
    filtrados.forEach(manga => {
      contenedor.innerHTML += `
        <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
          <a href="/manga/id-${manga.id}" class="nav-link">
            <img src="${manga.imagen}" alt="${manga.titulo}" class="w-full h-48 sm:h-56 md:h-64 object-cover">
            <div class="p-4">
              <h3 class="font-bold text-md truncate">${manga.titulo}</h3>
              <p class="text-gray-600 text-sm mt-1">${manga.descripcion}</p>
            </div>
          </a>
        </div>
      `;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Botones de categoría
    const botones = document.querySelectorAll('main .flex.flex-wrap button');
    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        renderMangas(btn.textContent.trim());
      });
    });
    // Mostrar todos al inicio
    renderMangas();
  });
})(); 