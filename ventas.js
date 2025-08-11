const API_URL = 'https://api.sheetbest.com/sheets/b0bca9af-b167-43b6-b4b5-afbfcacf9013';

let productos = [];
let carrito = [];

function normalizarTexto(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    productos = data;
    document.getElementById('busqueda').disabled = false;
  });

function buscarProducto() {
  const input = document.getElementById('busqueda');
  const valor = normalizarTexto(String(input.value || ""));
  const sugerencias = document.getElementById('sugerencias');
  const detalle = document.getElementById('detalleProducto');

  sugerencias.innerHTML = '';
  detalle.classList.remove('mostrar');
  detalle.style.display = 'none';

  if (valor.length === 0) return;

  const resultados = productos
    .filter(p => {
      const nombre = normalizarTexto(String(p.nombre || ""));
      const codigo = normalizarTexto(String(p.codigo || ""));
      return nombre.includes(valor) || codigo.includes(valor);
    })
    .sort((a, b) => {
      const aNombre = normalizarTexto(String(a.nombre || ""));
      const bNombre = normalizarTexto(String(b.nombre || ""));
      const aStarts = aNombre.startsWith(valor) ? -1 : 1;
      const bStarts = bNombre.startsWith(valor) ? -1 : 1;
      return aStarts - bStarts;
    });

  if (resultados.length === 0) {
    sugerencias.innerHTML = '<div style="color: #ff5252; border: 1px solid #ff5252;">❗ No se encontraron coincidencias.</div>';
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

function mostrarPrecio(label, valor) {
  return valor && valor.trim() !== "" && valor.toLowerCase() !== "null"
    ? `<p><strong>${label}:</strong> ${valor}</p>`
    : "";
}

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

function agregarAlCarritoDesdeDetalle(productoStr) {
  const producto = JSON.parse(productoStr);
  const yaExiste = carrito.some(p => p.codigo === producto.codigo);
  if (!yaExiste) {
    carrito.push(producto);
    renderizarCarrito();
  }
}

function renderizarCarrito() {
  const carritoDiv = document.getElementById('carrito');
  if (carrito.length === 0) {
    carritoDiv.innerHTML = 'No hay productos aún.';
    return;
  }

  carritoDiv.innerHTML = '';
  let total = 0;

  carrito.forEach((item, index) => {
    const precio = parseFloat(String(item.contado)?.replace(/\./g, '').replace(',', '.')) || 0;
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

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  renderizarCarrito();
}

async function exportarCarritoPDF() {
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  const nombreArchivo = prompt("📄 Ingresá el nombre para el archivo PDF:", "carrito");
  if (!nombreArchivo) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Resumen de Carrito", 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  let y = 30;
  let total = 0;

  carrito.forEach((item, index) => {
    const precio = parseFloat(String(item.contado)?.replace(/\./g, '').replace(',', '.')) || 0;
    total += precio;
    doc.text(`${index + 1}. ${item.codigo} - ${item.nombre}`, 20, y);
    doc.text(`Contado: ₲ ${item.contado}`, 25, y + 7);

    let cuotas = ["3x", "6x", "13x", "25x", "30x"];
    let textoCuotas = cuotas
      .map(cuota => item[cuota] ? `${cuota}: ${item[cuota]}` : "")
      .filter(Boolean)
      .join("  |  ");

    if (textoCuotas) {
      doc.text(textoCuotas, 25, y + 14);
      y += 22;
    } else {
      y += 14;
    }

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.setFont("helvetica", "bold");
  doc.text(`Total contado: ₲ ${total.toLocaleString('es-PY')}`, 20, y + 10);

  doc.save(`${nombreArchivo}.pdf`);
}

function enviarCarritoWhatsApp() {
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  const numero = "595984784509";

  let mensaje = "*🛒 Cotización de productos:*\n\n";
  let total = 0;

  carrito.forEach((item, index) => {
    mensaje += `${index + 1}. ${item.codigo} - ${item.nombre}\n`;
    if (item.contado) mensaje += `   Contado: ₲ ${item.contado}\n`;

    let cuotas = ["3x", "6x", "13x", "25x", "30x"];
    cuotas.forEach(cuota => {
      if (item[cuota]) {
        mensaje += `   ${cuota}: ${item[cuota]}\n`;
      }
    });

    mensaje += "\n";

    const precio = parseFloat(String(item.contado)?.replace(/\./g, '').replace(',', '.')) || 0;
    total += precio;
  });

  mensaje += `*Total contado:* ₲ ${total.toLocaleString('es-PY')}\n`;

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}
