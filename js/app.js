//Variables y selectores
const formulario = document.querySelector('#agregar-gasto');
const gatos_listado = document.querySelector('#gastos ul');

//Eventos
eventListeners();
function eventListeners(){
    document.addEventListener('DOMContentLoaded', preguntar_presupuesto);

    formulario.addEventListener('submit', agregar_gasto);
}

//Clases
class Presupuesto {
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto){
       this.gastos = [...this.gastos, gasto];
       this.calcularRestante();
    }

    calcularRestante(){
        const gastado = this.gastos.reduce( (total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id){
        this.gastos = this.gastos.filter( gasto => gasto.id !== id);
        this.calcularRestante();
    }
}

class UI {
    insertar_presupuesto(cantidad){
        const {presupuesto, restante} = cantidad;
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimir_alerta(mensaje, tipo){
        //crear div
        const div = document.createElement('div');
        div.classList.add('text-center', 'alert');

        if(tipo === 'error'){
            div.classList.add('alert-danger');
        }else{
            div.classList.add('alert-success');
        }
        div.textContent = mensaje;
        //insertar en HTML
        document.querySelector('.primario').insertBefore(div, formulario);

        setTimeout(()=>{
            div.remove();
        }, 2000)
    }

    mostrarGastos(gastos){
        this.limpiarHTML();
        
        gastos.forEach(gasto => {
            const {id, cantidad, nombre} = gasto;
            //li
            const nuevo_gasto = document.createElement('li');
            nuevo_gasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevo_gasto.setAttribute('data-id', id);//nuevo_gasto.dataset.id
            
            //agregar HTML del gasto
            nuevo_gasto.innerHTML = `${nombre}<span class="badge badge-primary badge-pill">$ ${cantidad}</span>`;

            //boton de borrar
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times';
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            nuevo_gasto.appendChild(btnBorrar);
            
            //agregar al html
            gatos_listado.appendChild(nuevo_gasto);
        })
    }

    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj){
        const {presupuesto, restante} = presupuestoObj;
        
        const divRestante = document.querySelector('.restante');

        //comprobar si ya gaste el 75%
        if(presupuesto/4 > restante){
            divRestante.classList.remove('alert-success', 'alert-warning');
            divRestante.classList.add('alert-danger');
        }else if(presupuesto/2 > restante){//comprobar si ya gaste el 50%
            divRestante.classList.remove('alert-success');
            divRestante.classList.add('alert-warning');
        }else{//si reembolso
            divRestante.classList.remove('alert-danger', 'alert-warning');
            divRestante.classList.add('alert-success');
        }

        //si el total es 0 o menor
        if(restante <= 0){
            ui.imprimir_alerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }else{
            formulario.querySelector('button[type="submit"]').disabled = false;
        }
    }

    limpiarHTML(){
        while(gatos_listado.firstChild){
            gatos_listado.removeChild(gatos_listado.firstChild);
        }
    }
}

//Instancias
const ui = new UI();
let presupuesto;

//Funciones
function preguntar_presupuesto(){
    const presupuesto_usuario = prompt('¿Cual es tu presupuesto?');

    if(presupuesto_usuario === '' || presupuesto_usuario === null || isNaN(presupuesto_usuario) || presupuesto_usuario <= 0){
        window.location.reload();
    }
    presupuesto = new Presupuesto(presupuesto_usuario);
    ui.insertar_presupuesto(presupuesto);
}

function eliminarGasto(id){
    //Elimina del objeto
    presupuesto.eliminarGasto(id);
    //Elimina los gastos del HTML
    const {gastos, restante} = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}

function agregar_gasto(e){
    e.preventDefault();
    //Leer los datos del formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);
    //validad
    if(nombre === '' || cantidad === ''){
        ui.imprimir_alerta('Ambos campos son obligatorios', 'error');
        return;
    }else if(cantidad <= 0 || isNaN(cantidad)){
        ui.imprimir_alerta('Cantidad no valida', 'error');
        return;
    }
    //Agregar Gasto
    const gasto = {
        id: Date.now(),
        nombre,
        cantidad,
    }
    presupuesto.nuevoGasto(gasto);
    //mensaje de que el gasto se agrego correctamente
    ui.imprimir_alerta('Gasto agregado correctamente');
    //imprimir los gastos
    const {gastos, restante} = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
    //resetear formulario
    formulario.reset();
}