let cliente = {
    mesa: '',
    hora: '',
    pedido: []
}

const categorias = {
    1: 'comida',
    2: 'bebidas',
    3: 'postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente(e) {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    //validar
    const camposVacios = [mesa,hora].some(campo => campo === '' );

    if(camposVacios) {
        const modal = document.querySelector('.modal-body form');
        const existeAlerta = document.querySelector('.invalid-feedback');

        if(!existeAlerta){
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            modal.appendChild(alerta);
            setTimeout(() => {
                modal.removeChild(alerta);
            }, 3000);   
        }
        return;
    } 

    //Asignar datos del formulario al objeto cliente
    cliente = {...cliente, mesa, hora};
    console.log(cliente);

    //Ocultar modal
    const modalForm = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalForm);
    modalBootstrap.hide();

    //Mostrar las secciones
    mostrarSecciones();

    //Obtener platillos de la api de json server
    obtenerPlatillos();

}

function mostrarSecciones() {
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));
}

function obtenerPlatillos() {
    const url = 'http://localhost:4000/platillos';

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarPlatillos(resultado))
        .catch(error => console.log(error));
}

function mostrarPlatillos(platillos){
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach(platillo => {
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        const nombre = document.createElement('DIV');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('DIV');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `$${platillo.precio}`;

        const categoria = document.createElement('DIV');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[platillo.categoria];

        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = "number";
        inputCantidad.min = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');
        inputCantidad.value = 0;

        //Función que detecta la cantidad y platillo que se agrega
        inputCantidad.onchange = function(){
            const cantidad = parseInt(inputCantidad.value);
            agregarPlatillo({...platillo, cantidad});
        };

        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);

        contenido.appendChild(row);
    });
}

function agregarPlatillo(platillo){
    let {pedido} = cliente;
    //Revisar cantidad
    if(platillo.cantidad > 0){

        //Comprueba si ya existe el elemento en el array
        if(pedido.some(articulo => articulo.id === platillo.id)){
            //Si existe, modificamos el existente
            const pedidoActualizado = pedido.map(articulo => {
                if(articulo.id === platillo.id){
                    articulo.cantidad = platillo.cantidad;
                }
                return articulo;
            });
            cliente.pedido = [...pedidoActualizado];
        } else{
            //Si no existe, lo agregamos
            cliente.pedido = [...pedido, platillo];
        }
        
    }else {
        //Si la cantidad es 0, hay que eliminar el platillo del pedido
        const resultado = pedido.filter( articulo => articulo.id !== platillo.id);
        cliente.pedido = [...resultado];
    }
    console.log(cliente.pedido);

    //Limpiar HTML previo
    limpiarHtml();

    if(cliente.pedido.length){
        //mostrar el resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    
}

function actualizarResumen(){
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

    //Info mesa
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    //Info hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    //AGregar elementos a su contenedor
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    //Titulo de la seccion
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos consumidos';
    heading.classList.add('my-4', 'text-center');

    //agregar platillos
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const {pedido} = cliente;
    pedido.forEach(articulo => {
        const {nombre, cantidad, precio, id} = articulo;
        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('H4');
        nombreEl.classList.add('my-4');
        nombreEl.textContent = nombre;

        //Cantidad
        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'x ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-bold');
        cantidadValor.textContent = cantidad;

        //precio
        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: $';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-bold');
        precioValor.textContent = precio;

        //Subtotal
        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: $';

        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-bold');
        subtotalValor.textContent = precio * cantidad;

        //Boton para eliminar
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del Pedido';

        //Funcion eliminar del pedido
        btnEliminar.onclick = function(){
            eliminarProducto(id);
        };

        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);
        
        //Agregar elementos a la lista
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        grupo.appendChild(lista);
    });

    //Agregar al contenido
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(heading);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    //Mostrar formulario de propinas

    formularioPropinas();
}

function limpiarHtml(){
    const contenido = document.querySelector('#resumen .contenido');
    while(contenido.firstChild){
        contenido.firstChild.remove();
    }
}

function eliminarProducto(id){
    const {pedido} = cliente;
    const resultado = pedido.filter( articulo => articulo.id !== id);
    cliente.pedido = [...resultado];
    limpiarHtml();
    if(cliente.pedido.length){
        //mostrar el resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    const productoEliminado = `#producto-${id}`;
    const inputElim = document.querySelector(productoEliminado);
    inputElim.value = 0;
}

function mensajePedidoVacio(){
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(texto);
}

function formularioPropinas(){
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario');

    const divformulario = document.createElement('DIV');
    divformulario.classList.add('card', 'py-5', 'px-3', 'shadow');

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);


    const radio15 = document.createElement('INPUT');
    radio15.type = 'radio';
    radio15.name = 'propina';
    radio15.value = '15';
    radio15.classList.add('form-check-input');
    radio15.onclick = calcularPropina;

    const radio15Label = document.createElement('LABEL');
    radio15Label.textContent = '15%';
    radio15Label.classList.add('form-check-label');

    const radio15Div = document.createElement('DIV');
    radio15Div.classList.add('form-check');

    radio15Div.appendChild(radio15);
    radio15Div.appendChild(radio15Label);

    const radio20 = document.createElement('INPUT');
    radio20.type = 'radio';
    radio20.name = 'propina';
    radio20.value = '20';
    radio20.classList.add('form-check-input');
    radio20.onclick = calcularPropina;

    const radio20Label = document.createElement('LABEL');
    radio20Label.textContent = '20%';
    radio20Label.classList.add('form-check-label');

    const radio20Div = document.createElement('DIV');
    radio20Div.classList.add('form-check');

    radio20Div.appendChild(radio20);
    radio20Div.appendChild(radio20Label);

    formulario.appendChild(divformulario);

    divformulario.appendChild(heading);
    divformulario.appendChild(radio10Div);
    divformulario.appendChild(radio15Div);
    divformulario.appendChild(radio20Div);

    contenido.appendChild(formulario);
}

function calcularPropina(){
    const {pedido} = cliente;
    let subtotal = 0;
    let propina = 0;
    let total = 0;
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    pedido.forEach(articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });

    propina = subtotal * propinaSeleccionada * 0.01;
    total = subtotal + propina;
    
    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar');

    // Subtotal
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-3', 'fw-bold', 'mt-5');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;
    subtotalParrafo.appendChild(subtotalSpan);

    // Propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-3', 'fw-bold');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;
    propinaParrafo.appendChild(propinaSpan);

    // Total
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-3', 'fw-bold');
    totalParrafo.textContent = 'Total a Pagar: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParrafo.appendChild(totalSpan);

    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv) {
        totalPagarDiv.remove();
    }
   


    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formulario = document.querySelector('.formulario');
    formulario.appendChild(divTotales);
}