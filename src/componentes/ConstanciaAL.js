import React, {useEffect, useState} from 'react';
import Main from '../componentes/Main';
import {imprimir} from '../impresiones/constancia-ar'



export default function ConstanciaAL({alumno}){

const [anio, setAnio] = useState([]);
const [meses, setMeses] = useState([]);
const [dias,setDias] = useState([]);
const [diaSeleccionado,setDiaSeleccionado] = useState('01');
const [mesSeleccionado,setMesSeleccionado] = useState(1);
const [lugar,setLugar] = useState("Ciudad Autónoma de Buenos Aires")
const [cuerpo,setCuerpo] = useState('')


const textoDefault= 
`De mi mayor consideración,

Dejo constancia que el alumno ${alumno.nombre.toUpperCase()} ${alumno.apellido.toUpperCase()} con DNI ${alumno.documento} es Alumno Regular de nuestra institución.

Atentamente,`

    useEffect(()=>{
        cargarVectorDias(setDias);
        cargarVectorMeses(setMeses);
        cargarVectorAnios(setAnio);
        setCuerpo(textoDefault)
        //inicializarFecha();
        //inicializarCuerpo();

    },[])

    useEffect(()=>{

        setearDiaHoy(setDiaSeleccionado,setMesSeleccionado)
    
    },[dias,meses])

    const fechaString = () => {

        var fecha = `${diaSeleccionado} de ${meses[mesSeleccionado-1].mes} de ${anio} `
        return fecha
    }

    const handleSubmit=(e)=>{
        e.preventDefault()
        imprimir(cuerpo,lugar,fechaString(),alumno)
    }

    function handleLugarChange(e){
        setLugar(e.target.value)
    }

    function handleCuerpoChange(e){
        setCuerpo(e.target.value)
    }

    function handleDiaChange(e){
        setDiaSeleccionado(e.target.value)
    }

    function handleMesChange(e){
        setMesSeleccionado(e.target.value)
    }

    return ( // envuelvo un contenido X con un componente Main 
        <>  
            <div className="Signup">

                <div className="FormContainer">
                     <form onSubmit={handleSubmit}>
                        {/* Tengo conectado el input email con el estado usuario.email a través del atributo value y del evento onChange */}
                        <label className="Form__labels" htmlFor="lugar">Lugar de emisión</label>
                        <input value={lugar}
                            onChange={handleLugarChange} 
                            type="text" 
                            id="lugar"
                            name="lugar" 
                            placeholder="Lugar" 
                            className="Form__field" required/>

                    <label className="Form__labels" htmlFor="fecha">Fecha</label>
                    <div className="flex f-row" id="fecha">
                        <select onChange={handleDiaChange} value={diaSeleccionado} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {dias.map(item=><option value={item} key={item}>{item}</option> )}
                        </select>                       
                        <select onChange={handleMesChange} value={mesSeleccionado} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {meses.map(item=><option value={item.id} key={item.id}>{item.mes}</option> )}
                        </select>
                        <select disabled className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {anio.map(item=><option value={item} key={item}>{item}</option> )}
                        </select>
                    </div>
                        <textarea onChange={handleCuerpoChange} className="constancia-body Form__field" value={cuerpo} rows="10" cols="120"></textarea>
                        <button className="Form__submit" type="submit">Imprimir</button>
                    </form>
                </div>
            </div>
        </>
        )
}

function setearDiaHoy(setDiaSeleccionado,setMesSeleccionado){
    const fechaActual = new Date();

    const mesActual = fechaActual.getMonth();
    const diaActual = fechaActual.getDate();
    const diaActualString = diaActual < 10 ? `0${diaActual}` : diaActual;
    setMesSeleccionado(mesActual+1)
    setDiaSeleccionado(diaActualString)
}

function cargarVectorDias(setDias) {
    var dia;
    var vectoDiasAux=[];

    for (var i = 1; i < 32; i++) {
        if (i < 10) {
            dia = `0${i}`;
        } else {
            dia = `${i}`;
        }
        vectoDiasAux.push(dia);
    }

    setDias(vectoDiasAux)
}

function  cargarVectorMeses(setMeses) {
    var meses = [{ id: 1, mes: 'Enero' },
    { id: 2, mes: 'Febrero' },
    { id: 3, mes: 'Marzo' },
    { id: 4, mes: 'Abril' },
    { id: 5, mes: 'Mayo' },
    { id: 6, mes: 'Junio' },
    { id: 7, mes: 'Julio' },
    { id: 8, mes: 'Agosto' },
    { id: 9, mes: 'Septiembre' },
    { id: 10, mes: 'Octubre' },
    { id: 11, mes: 'Noviembre' },
    { id: 12, mes: 'Diciembre' }];
    setMeses(meses);
}

function  inicializarFecha() {
   /* var fecha_actual = new Date();

    this.anio_desde = fecha_actual.getFullYear();

    var mes = Number(fecha_actual.getMonth()) + 1

    this.mes_desde = mes;

    this.dia_desde = fecha_actual.getDate();*/
}

function cargarVectorAnios(setAnio) {
    var anio=[];

    var fecha_actual = new Date();
    anio.push(fecha_actual.getFullYear());

    setAnio(anio)
}