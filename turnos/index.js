import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword , onAuthStateChanged  } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js'
import {getFirestore, doc, onSnapshot, writeBatch} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
const firebaseConfig = {apiKey: "AIzaSyD512nxT_KLTs8rBzrlbT8Hbm3tBkbGuYk",authDomain: "consultorio-fea8a.firebaseapp.com",projectId: "consultorio-fea8a",storageBucket: "consultorio-fea8a.appspot.com",messagingSenderId: "660119556812",appId: "1:660119556812:web:cb8474d8fe2ee14b636869"};
const app = initializeApp(firebaseConfig);

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    console.log("onAuthStateChanged");
    if (user) {
        document.getElementById("loaderContainer").classList.add('visually-hidden');
        document.getElementById("loginContainer").classList.add('visually-hidden');
        document.getElementById("appContainer").classList.remove('visually-hidden');
        start();
    } else {
        document.getElementById("loaderContainer").classList.add('visually-hidden');
        document.getElementById("loginContainer").classList.remove('visually-hidden');
    }
});

document.getElementById("btnIngresar").addEventListener("click", function() {

    const caja_email = document.getElementById('caja_email').value;
    const caja_password = document.getElementById('caja_password').value;

    this.disabled = true;
    this.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Ingresar`;

    signInWithEmailAndPassword(auth, caja_email, caja_password)
        .then((userCredential) => {
            btnIngresar.disabled = false;
            btnIngresar.innerHTML = `Ingresar`;
            const user = userCredential.user;
            console.log(userCredential, user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            btnIngresar.disabled = false;
            btnIngresar.innerHTML = `Ingresar`;
            alert("Los datos ingresados son incorrectos");
        }
    );

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FIREBASE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const db = getFirestore();

let storeUpdates;
let turnosJSON;
let sendObjet = {};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// NOTIFICACION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Set global options
let globalOptions =  {};
//globalOptions.icons = {enabled: false};
globalOptions.position = "top-right";
globalOptions.labels = {success: "Listo!"}

let notifier = new AWN(globalOptions);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TIME
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let dateLive;
let dateCalendar;
let dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Dicimebre"];
let currentMinuto;
let currentHora;
let currentDia;
let currentMes;
let currentAno;

let intervalID;

function onTick() {

    dateLive.setSeconds(dateLive.getSeconds() + 1);

    if(currentAno != dateLive.getFullYear()){

        onAnoChange();

        currentAno = dateLive.getFullYear();
        currentMes = dateLive.getMonth();
        currentDia = dateLive.getDate();
        currentHora = dateLive.getHours();
        currentMinuto = dateLive.getMinutes();

    }else if(currentMes != dateLive.getMonth()){

        onMesChange();

        currentMes = dateLive.getMonth();
        currentDia = dateLive.getDate();
        currentHora = dateLive.getHours();
        currentMinuto = dateLive.getMinutes();

    }else if(currentDia != dateLive.getDate()){

        onDiaChange();

        currentDia = dateLive.getDate();
        currentHora = dateLive.getHours();
        currentMinuto = dateLive.getMinutes();

    }else if(currentHora != dateLive.getHours()){

        onHoraChange();

        currentHora = dateLive.getHours();
        currentMinuto = dateLive.getMinutes();

    }else if(currentMinuto != dateLive.getMinutes()){

        onMinutoChange();
        currentMinuto = dateLive.getMinutes();

    }

}

function onMinutoChange() {
    //console.log("onMinutoChange");
}

function onHoraChange() {
    //console.log("onHoraChange");
    fillTableHoras();
}

function onDiaChange() {

    //console.log("onDiaChange");

    if(dateCalendar.getFullYear() == dateLive.getFullYear() && dateCalendar.getMonth() == dateLive.getMonth()){
        fillTableDias(dateLive.getFullYear(), dateLive.getMonth());
    }
    
}

function onMesChange() {

    //console.log("onMesChange");

    if((dateCalendar.getFullYear() == dateLive.getFullYear() && dateCalendar.getMonth() == dateLive.getMonth()) || (dateCalendar.getFullYear() == dateLive.getFullYear() && dateCalendar.getMonth() == dateLive.getMonth()-1)){
        fillTableDias(dateLive.getFullYear(), dateLive.getMonth());
    }
}

function onAnoChange() {

    //console.log("onAnoChange");

    if((dateCalendar.getFullYear() == dateLive.getFullYear()-1 && dateCalendar.getMonth() == 11) || (dateCalendar.getFullYear() == dateLive.getFullYear() && dateCalendar.getMonth() == 0)){
        fillTableDias(dateLive.getFullYear(), dateLive.getMonth());
    }
}

function getDaysInMonth(p_year, p_month) {
    return new Date(p_year, p_month + 1, 0).getDate();
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LISTENERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function btnMesAnteriorClick() {

    if(dateCalendar.getFullYear() <= dateLive.getFullYear() && dateCalendar.getMonth() <= dateLive.getMonth()){

        return;

    }

    const tempDate = new Date(dateCalendar.getFullYear(), dateCalendar.getMonth());
    tempDate.setMonth(tempDate.getMonth() - 1);

    fillTableDias(tempDate.getFullYear(), tempDate.getMonth());

}

function btnMesSiguienteClick() {

    const tempDate = new Date(dateCalendar.getFullYear(), dateCalendar.getMonth());
    tempDate.setMonth(tempDate.getMonth() + 1);

    fillTableDias(tempDate.getFullYear(), tempDate.getMonth());

}

function btnVerDiasClick() {

    cardHorasDOM.classList.add('visually-hidden');
    cardDiasDOM.classList.remove('visually-hidden');

}

function btnReservarClick() {

    if(cajaNombreDOM.value == ""){

        cajaNombreDOM.classList.add('is-invalid');
        cajaNombreErrorDOM.innerHTML = "Ingresá tu nombre";
        return;

    }

    if(cajaApellidoDOM.value == ""){

        cajaApellidoDOM.classList.add('is-invalid');
        cajaApellidoErrorDOM.innerHTML = "Ingresá tu apellido";
        return;

    }

    if(cajaTelefonoDOM.value == ""){

        cajaTelefonoDOM.classList.add('is-invalid');
        cajaTelefonoErrorDOM.innerHTML = "Ingresá tu telefono";
        return;

    }

    btnReservar.disabled = true;
    btnReservar.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Reservar`;

    sendObjet.nombre = cajaNombreDOM.value;
    sendObjet.apellido = cajaApellidoDOM.value;
    sendObjet.telefono = cajaTelefonoDOM.value;

    //console.log(sendObjet);

    sendTurno();

}

function cajaNombreInput(){
    cajaNombreDOM.classList.remove('is-invalid');
}
function cajaApellidoInput(){
    cajaApellidoDOM.classList.remove('is-invalid');
}

btnMesAnterior.addEventListener("click", btnMesAnteriorClick);
btnMesSiguiente.addEventListener("click", btnMesSiguienteClick);
btnVerDias.addEventListener("click", btnVerDiasClick);
btnReservar.addEventListener("click", btnReservarClick);

cajaNombreDOM.addEventListener("input", cajaNombreInput);
cajaApellidoDOM.addEventListener("input", cajaApellidoInput);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TABLE EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

tbodyDiasDOM.addEventListener('click', function (e) {

    const cell = e.target.closest('td');

    if (!cell) {
        return;
    }

    if(!cell.innerHTML){
        return;
    }

    if(cell.cellIndex == 0 || cell.cellIndex == 6){
        return;
    }

    dateCalendar.setDate(cell.innerHTML);

    if(dateCalendar.getFullYear() <= dateLive.getFullYear() && dateCalendar.getMonth() <= dateLive.getMonth() && dateCalendar.getDate() < dateLive.getDate()){
        return;

    }

    //console.log(dateCalendar);

    fillTableHoras();

    cardDiasDOM.classList.add('visually-hidden');
    cardHorasDOM.classList.remove('visually-hidden');

});

tbodyHorasDOM.addEventListener('click', function (e) {

    const cell = e.target.closest('td');

    if (!cell) {
        return;
    }

    const row = cell.parentElement;

    //console.log(cell.innerHTML, row.rowIndex, cell.cellIndex);

    if(cell.innerHTML == "DISPONIBLE"){

        sendObjet.ano = dateCalendar.getFullYear();
        sendObjet.mes = addZero(dateCalendar.getMonth()+1);
        sendObjet.dia = addZero(dateCalendar.getDate());
        sendObjet.hora = addZero(row.rowIndex+7);

        cajaNombreDOM.value = "";
        cajaApellidoDOM.value = "";
        cajaTelefonoDOM.value = "";

        cajaNombreDOM.classList.remove('is-invalid');
        cajaApellidoDOM.classList.remove('is-invalid');
        cajaTelefonoDOM.classList.remove('is-invalid');

        cajaNombreErrorDOM.innerHTML = "";
        cajaApellidoErrorDOM.innerHTML = "";
        cajaTelefonoErrorDOM.innerHTML = "";

        cajaFechaDOM.value = dateCalendar.getDate()+" de "+meses[dateCalendar.getMonth()]+" del "+dateCalendar.getFullYear()+" - "+addZero(row.rowIndex+7)+":00 hs a "+addZero(row.rowIndex+8)+":00 hs";

        modalTurnoDOM.show();

    }

    

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function fillTableDias(p_year, p_month) {

    tituloDiasDOM.innerHTML = "Cargando turnos...";

    const dateInternalCurrent = new Date(dateLive.getFullYear(), dateLive.getMonth(), dateLive.getDate());
    const dateInternalCalendar = new Date(p_year, p_month, 1);

    const daysOfTheMonth = getDaysInMonth(p_year, p_month);
    const firstDayOfTheWeek = new Date(p_year, p_month).getDay();
    const lastDayOfTheWeek = new Date(p_year, p_month, daysOfTheMonth).getDay();

    const firtsEmptys = 7-(7-firstDayOfTheWeek); 
    const lastsEmptys = 7-(lastDayOfTheWeek+1); 

    const totalCells = firtsEmptys+daysOfTheMonth+lastsEmptys;

    tbodyDiasDOM.innerHTML = "";

    let currentCell = 0;

    for (let r = 0; r < totalCells/7; r++) {

        let row = document.createElement("tr");

        for (let c = 0; c < 7; c++) {
            
            currentCell++;

            if(currentCell <= firtsEmptys){

                let cell = document.createElement("td");
                let cellText = document.createTextNode("");
                cell.appendChild(cellText);
                row.appendChild(cell);

            }else if(currentCell > firtsEmptys && currentCell <= (totalCells-lastsEmptys)){

                let cell = document.createElement("td");
                let cellText = document.createTextNode(dateInternalCalendar.getDate());
                //let cellText2 = document.createTextNode("Quedan 4 turnos");
                if(dateInternalCalendar.getTime() < dateLive.getTime()){
                    cell.classList.add("textoDeshabilitado");
                }
                if(c == 0 || c == 6){
                    cell.classList.add("textoDeshabilitado");
                }
                if (dateInternalCalendar.getDate() == dateLive.getDate() && dateInternalCalendar.getMonth() == dateLive.getMonth() && dateInternalCalendar.getFullYear() == dateLive.getFullYear()) {
                    cell.classList.add("bg-primary");
                }
                if (dateInternalCalendar.getTime() >= dateInternalCurrent.getTime()) {
                    if(c != 0 && c != 6){
                        cell.classList.add("seleccionable");
                    }
                    
                }
                cell.setAttribute("id", "dia"+dateInternalCalendar.getDate());
                cell.appendChild(cellText);
                //cell.appendChild(cellText2);
                row.appendChild(cell);
                dateInternalCalendar.setDate(dateInternalCalendar.getDate() + 1);

            }else{

                let cell = document.createElement("td");
                let cellText = document.createTextNode("");
                cell.appendChild(cellText);
                row.appendChild(cell);
                
            }

        }

        tbodyDiasDOM.appendChild(row);
    }

    dateCalendar = new Date(p_year, p_month);

    startStoreUpdates(p_year, p_month);

}

function fillTableHoras() {

    tituloHorasDOM.innerHTML = dateCalendar.getDate() + " de " + meses[dateCalendar.getMonth()] + " " + dateCalendar.getFullYear();

    for (let i = 8; i <= 19; i++) {

        if(i == 13 || i == 14){

            continue;

        }

        const currentHoraDOM = document.getElementById("hora"+i);

        //si es hoy

        if(dateCalendar.getDate() == dateLive.getDate() && dateCalendar.getMonth() == dateLive.getMonth() && dateCalendar.getFullYear() == dateLive.getFullYear()){

            if(dateLive.getHours() >= i){

                currentHoraDOM.innerHTML = "TURNO PASADO";
                currentHoraDOM.classList.add("textoDeshabilitado");
                currentHoraDOM.classList.remove("seleccionable");
                
            }else{

                if(!turnosJSON){

                    currentHoraDOM.innerHTML = "DISPONIBLE";
                    currentHoraDOM.classList.remove("textoDeshabilitado");
                    currentHoraDOM.classList.add("seleccionable");
                    
                    continue;
    
                }

                if(turnosJSON.hasOwnProperty(addZero(dateCalendar.getDate()))){

                    if(turnosJSON[addZero(dateCalendar.getDate())].hasOwnProperty(addZero(i))){
    
                        currentHoraDOM.innerHTML = turnosJSON[addZero(dateCalendar.getDate())][addZero(i)]["paciente"]["nombre"].toUpperCase() + " " + turnosJSON[addZero(dateCalendar.getDate())][addZero(i)]["paciente"]["apellido"].toUpperCase() + " - TEL: " + turnosJSON[addZero(dateCalendar.getDate())][addZero(i)]["paciente"]["telefono"];
                        currentHoraDOM.classList.add("textoDeshabilitado");
                        currentHoraDOM.classList.remove("seleccionable");
    
                    }else{
    
                        currentHoraDOM.innerHTML = "DISPONIBLE";
                        currentHoraDOM.classList.remove("textoDeshabilitado");
                        currentHoraDOM.classList.add("seleccionable");
    
                    }
    
                }else{
    
                    currentHoraDOM.innerHTML = "DISPONIBLE";
                    currentHoraDOM.classList.remove("textoDeshabilitado");
                    currentHoraDOM.classList.add("seleccionable");
    
                }

            }

        // si es un dia posterior
        }else{

            if(!turnosJSON){

                currentHoraDOM.innerHTML = "DISPONIBLE";
                currentHoraDOM.classList.remove("textoDeshabilitado");
                currentHoraDOM.classList.add("seleccionable");

                continue;

            }

            if(turnosJSON.hasOwnProperty(addZero(dateCalendar.getDate()))){

                if(turnosJSON[addZero(dateCalendar.getDate())].hasOwnProperty(addZero(i))){

                    currentHoraDOM.innerHTML = turnosJSON[addZero(dateCalendar.getDate())][addZero(i)]["paciente"]["nombre"].toUpperCase() + " " + turnosJSON[addZero(dateCalendar.getDate())][addZero(i)]["paciente"]["apellido"].toUpperCase() + " - TEL: " + turnosJSON[addZero(dateCalendar.getDate())][addZero(i)]["paciente"]["telefono"];
                    currentHoraDOM.classList.add("textoDeshabilitado");
                    currentHoraDOM.classList.remove("seleccionable");

                }else{

                    currentHoraDOM.innerHTML = "DISPONIBLE";
                    currentHoraDOM.classList.remove("textoDeshabilitado");
                    currentHoraDOM.classList.add("seleccionable");

                }

            }else{

                currentHoraDOM.innerHTML = "DISPONIBLE";
                currentHoraDOM.classList.remove("textoDeshabilitado");
                currentHoraDOM.classList.add("seleccionable");

            }

        }

    }
}

function startStoreUpdates(p_year, p_month) {

    stopStoreUpdates();

    const idDoc = p_year+"-"+addZero(p_month+1);
    
    storeUpdates = onSnapshot(doc(db, "turnos", idDoc), (doc) => {

        turnosJSON = doc.data();
        //console.log("onSnapshot: ", turnosJSON);

        tituloDiasDOM.innerHTML = meses[p_month] + " " + p_year;

        fillTableHoras();

    });

}

function stopStoreUpdates() {
    
    if(storeUpdates){
        storeUpdates();
    }

}

function sendTurno(){

    const docData = {[sendObjet.dia]: {[sendObjet.hora]: {paciente:{nombre:sendObjet.nombre, apellido:sendObjet.apellido, telefono:sendObjet.telefono}}} };
    const docDataAdmin = {[sendObjet.dia]: {[sendObjet.hora]: {paciente:{nombre:sendObjet.nombre, apellido:sendObjet.apellido, telefono:sendObjet.telefono}}} };
    
    // Get a new write batch
    const batch = writeBatch(db);
    
    const ref = doc(db, "turnos", sendObjet.ano+"-"+sendObjet.mes);
    batch.set(ref, docData, { merge: true });
    
    const refAdmin = doc(db, "turnos_admin", sendObjet.ano+"-"+sendObjet.mes);
    batch.set(refAdmin, docDataAdmin, { merge: true });
    
    // Commit the batch
    batch.commit()
        .then(function() {
            modalTurnoDOM.hide();
            btnReservar.disabled = false;
            btnReservar.innerHTML = `Reservar`;
            notifier.success('Turno reservado');

        })
        .catch(function(error) {
            console.error("Error deleting field: ", error);
        }
    );

}

function start(){

    dateLive = new Date();

    currentMinuto = dateLive.getMinutes();
    currentHora = dateLive.getHours();
    currentDia = dateLive.getDate();
    currentMes = dateLive.getMonth();
    currentAno = dateLive.getFullYear();

    fillTableDias(currentAno, currentMes);

    intervalID = window.setInterval(onTick, 1000);

}