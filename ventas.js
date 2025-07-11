let productos = [];

// Cargar datos desde la API de Sheetbest
async function cargarProductos() {
  try {
    const response = await fetch('https://api.sheetbest.com/sheets/d2320623-59eb-42fb-88ff-5d9edce19c48');
    productos = await response.json();
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

cargarProductos();

// Buscar productos por nombre o código
function buscarProducto() {
  const input = document.getElementById('busqueda').value.toLowerCase();
  const sugerencias = document.getElementById('sugerencias');
  const detalle = document.getElementById('detalleProducto');

  sugerencias.innerHTML = '';
  detalle.style.display = 'none';

  if (!input) return;

  const resultados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(input) ||
    producto.codigo.includes(input)
  );

  if (resultados.length === 0) {
    sugerencias.innerHTML = '<div class="no-result">❗ No se encontraron coincidencias.</div>';
    return;
  }

  resultados.forEach(producto => {
    const item = document.createElement('div');
    item.className = 'item-sugerencia';
    item.textContent = `${producto.codigo} - ${producto.nombre}`;
    item.onclick = () => mostrarDetalle(producto);
    sugerencias.appendChild(item);
  });
}

// Mostrar los precios del producto seleccionado
function mostrarDetalle(producto) {
  const detalle = document.getElementById('detalleProducto');
  detalle.style.display = 'block';
  detalle.innerHTML = `
    <h2>🛒 ${producto.nombre}</h2>
    <p><strong>Código:</strong> ${producto.codigo}</p>
    <p><strong>Contado:</strong> ${producto.contado}</p>
    <p><strong>3x:</strong> ${producto['3x']}</p>
    <p><strong>6x:</strong> ${producto['6x']}</p>
    <p><strong>13x:</strong> ${producto['13x']}</p>
    <p><strong>25x:</strong> ${producto['25x']}</p>
  `;

  // Limpiar sugerencias
  document.getElementById('sugerencias').innerHTML = '';
}
