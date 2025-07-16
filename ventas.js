const API_URL = 'https://api.sheetbest.com/sheets/d2320623-59eb-42fb-88ff-5d9edce19c48';

let productos = [];
let carrito = [];

// Normaliza texto: minúsculas + sin acentos
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Carga inicial de productos
fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    productos = data;
    document.getElementById('busqueda').disabled = false;
  });

// Búsqueda inteligente y flexible
function buscarProducto() {
  const input = document.getElementById('busqueda');
  const valor = normalizarTexto(input.value);
  const sugerencias = document.getElementById('sugerencias');
  const detalle = document.getElementById('detalleProducto');

  sugerencias.innerHTML = '';
  detalle.classList.remove('mostrar');
  detalle.style.display = 'none';

  if (valor.length === 0) return;

  const resultados = productos
    .filter(p => {
      const nombre = normalizarTexto(p.nombre);
      const codigo = normalizarTexto(p.codigo);
      return nombre.includes(valor) || codigo.includes(valor);
    })
    .sort((a, b) => {
      const aNombre = normalizarTexto(a.nombre);
      const bNombre = normalizarTexto(b.nombre);
      const aStarts = aNombre.startsWith(valor) ? -1 : 1;
      const bStarts = bNombre.startsWith(valor) ? -1 : 1;
      return aStarts - bStarts;
    });

  if (resultados.length === 0) {
    sugerencias.innerHTML = `<div style="color: #ff5252; border: 1px solid #ff5252;">❗ No se encontraron coincidencias.</div>`;
    return;
  }

  resultados.forEach(producto => {
    const item = document.createElement('div');
    item.classList.add('sugerencia-item');

    const nombre = `${producto.codigo} - ${producto.nombre}`;
    item.innerHTML = `<span>${nombre}</span>`;

    item.querySelector('span').onclick = () => {
      sugerencias.innerHTML = '';
      mostrarDetalle(producto);
    };

    sugerencias.appendChild(item);
  });
}

// Muestra el detalle con precios (solo si existen)
function mostrarDetalle(producto) {
  const detalle = document.getElementById('detalleProducto');

  let html = `
    <h3>${producto.nombre}</h3>
    <p><strong>Código:</strong> ${producto.codigo}</p>
    ${mostrarPrecio("Contado", producto.contado)}
    ${mostrarPrecio("3x", producto["3x"])}
    ${mostrarPrecio("6x", producto["6x"])}
    ${mostrarPrecio("13x", producto["13x"])}
    ${mostrarPrecio("25x", producto["25x"])}
    ${mostrarPrecio("30x", producto["30x"])}
    <div class="btn-derecha">
      <button onclick='agregarAlCarritoDesdeDetalle(${JSON.stringify(JSON.stringify(producto))})'>🛒 Agregar al carrito</button>
    </div>
  `;

  detalle.innerHTML = html;
  detalle.style.display = 'block';
  detalle.classList.add('mostrar');
}

// Muestra línea solo si hay valor válido
function mostrarPrecio(label, valor) {
  return valor && valor.trim() !== "" && valor.toLowerCase() !== "null"
    ? `<p><strong>${label}:</strong> ${valor}</p>`
    : "";
}

// Agrega al carrito
function agregarAlCarritoDesdeDetalle(productoStr) {
  const producto = JSON.parse(productoStr);
  const yaExiste = carrito.some(p => p.codigo === producto.codigo);
  if (!yaExiste) {
    carrito.push(producto);
    renderizarCarrito();
  }
}

// Muestra el contenido del carrito
function renderizarCarrito() {
  const carritoDiv = document.getElementById('carrito');
  if (carrito.length === 0) {
    carritoDiv.innerHTML = 'No hay productos aún.';
    return;
  }

  carritoDiv.innerHTML = '';
  let total = 0;

  carrito.forEach((item, index) => {
    const precio = parseFloat(item.contado?.replace(/\./g, '').replace(',', '.')) || 0;
    total += precio;

    const div = document.createElement('div');
    div.className = 'carrito-item';
    div.innerHTML = `
      <span>${item.codigo} - ${item.nombre}</span>
      <button onclick="eliminarDelCarrito(${index})">❌</button>
    `;
    carritoDiv.appendChild(div);
  });

  const totalDiv = document.createElement('div');
  totalDiv.style.marginTop = '1rem';
  totalDiv.innerHTML = `<strong>Total contado:</strong> ₲ ${total.toLocaleString('es-PY')}`;
  carritoDiv.appendChild(totalDiv);
}

// Elimina producto del carrito
function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  renderizarCarrito();
}


