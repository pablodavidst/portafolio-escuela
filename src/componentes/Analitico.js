import React, {useEffect, useState} from 'react';
import Main from './Main';
import {imprimir} from '../impresiones/analitico';
import Axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faDotCircle, faLongArrowAltLeft, faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';


export default function Analitico({alumno}){

const [anio, setAnio] = useState([]);
const [meses, setMeses] = useState([]);
const [dias,setDias] = useState([]);
const [diaSeleccionado,setDiaSeleccionado] = useState('01');
const [mesSeleccionado,setMesSeleccionado] = useState(1);
const [diaSeleccionadoGrad,setDiaSeleccionadoGrad] = useState('01');
const [mesSeleccionadoGrad,setMesSeleccionadoGrad] = useState(1);
const [anioSeleccionadoGrad,setAnioSeleccionadoGrad] = useState('2020');
const [anioSeleccionado,setAnioSeleccionado] = useState('2020');
const [lugar,setLugar] = useState("Ciudad Autónoma de Buenos Aires");
const [cuerpo,setCuerpo] = useState('');
const [tipoSeleccionado,setTipoSeleccionado] = useState("final");
const [cursosAnaliticoFinal,setCursosAnaliticoFinal] = useState([]);
const [cursosAnaliticoParcial,setCursosAnaliticoParcial] = useState([]);
const [buscandoCursos,setBuscandoCursos]= useState(false)

const textoDefault= 
`Habiendo aprobado los cursos indicados, ${alumno.apellido}, ${alumno.nombre} ha completado los requisitos para la Carrera de Músico Profesional.`

    useEffect(()=>{
        cargarVectorDias(setDias);
        cargarVectorMeses(setMeses);
        cargarVectorAnios(setAnio);
        setCuerpo(textoDefault)
        cargarCursosParaAnalitico()
        //inicializarFecha();
        //inicializarCuerpo();

    },[])

    useEffect(()=>{

        setearDiaHoy(setDiaSeleccionado,
                    setMesSeleccionado,
                    setDiaSeleccionadoGrad,
                    setMesSeleccionadoGrad,
                    setAnioSeleccionado,setAnioSeleccionadoGrad)
    
    },[dias,meses,anio])

    useEffect(()=>{
        console.log("el vector ha cambiadooooo")
    },[cursosAnaliticoFinal,cursosAnaliticoParcial])

    const cargarCursosParaAnalitico = async ()=>{
        try{
//            const {data} = await Axios.get(`/api/alumnos/analitico/parcial/${alumno.id_alumno}`)
//            console.log('historial para analitico', data)
                setBuscandoCursos(true);

                const vectorResultado = await Promise.all(
                    [Axios.get(`/api/alumnos/analitico/parcial/${alumno.id_alumno}`),
                     Axios.get(`/api/alumnos/analitico/final/${alumno.id_alumno}`)])

                const vectorParcialConCampoIncluir = agregarPropiedadIncluir(vectorResultado[0].data) 
                const vectorFinalConCampoIncluir = agregarPropiedadIncluir(vectorResultado[1].data)     
   
                setCursosAnaliticoParcial(vectorParcialConCampoIncluir); 
                setCursosAnaliticoFinal(vectorFinalConCampoIncluir);

                console.log('historial para analitico', vectorResultado)
                setBuscandoCursos(false);

        }catch(err){
            setBuscandoCursos(false);
            alert(err)
        }
    }

    const fechaString = () => {

        var fecha = `${diaSeleccionado} de ${meses[mesSeleccionado-1].mes} de ${anioSeleccionado} `
        return fecha
    }

    const fechaStringGrad = () => {

        var fecha = `${diaSeleccionadoGrad} de ${meses[mesSeleccionadoGrad-1].mes} de ${anioSeleccionadoGrad} `
        return fecha
    }

    const handleSubmit=(e)=>{
        e.preventDefault()
        
        const cursos = tipoSeleccionado==="final" ? cursosAnaliticoFinal : cursosAnaliticoParcial

        const cursosMapepados = cursos.map(item=>({cuatrimestre:item.nombre,materia:item.descripcion,incluir:item.incluir,notastring:item.columna}))
        
        imprimir(cursosMapepados,
                lugar,
                fechaString(),
                tipoSeleccionado,
                cuerpo,
                fechaStringGrad(),
                alumno)
    }

    function handleLugarChange(e){
        setLugar(e.target.value)
    }

    function handleCuerpoChange(e){
        setCuerpo(e.target.value)
    }

    function handleTipoChange(e){
        setTipoSeleccionado(e.target.value)
    }

    function handleDiaChange(e){
        setDiaSeleccionado(e.target.value)
    }

    function handleAnioChange(e){
        setAnioSeleccionado(e.target.value)
    }

    function handleAnioGradChange(e){
        setAnioSeleccionadoGrad(e.target.value)
    }

    function handleMesChange(e){
        setMesSeleccionado(e.target.value)
    }

    function handleDiaGradChange(e){
        setDiaSeleccionadoGrad(e.target.value)
    }

    function handleMesGradChange(e){
        setMesSeleccionadoGrad(e.target.value)
    }
    return ( // envuelvo un contenido X con un componente Main 
        <>  
            <div className="AnaliticoContainer relative">
                <div className="FormAnaliticoContainer">
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

                    <label className="Form__labels" htmlFor="fecha">Tipo de analítico</label>
                    <div className="flex f-row" id="fecha">
                        <select onChange={handleTipoChange} value={tipoSeleccionado} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            <option value="final" key="final">Final</option>
                            <option value="parcial" key="parcial">Parcial</option>
                        </select>                       
                    </div>

                    <label className="Form__labels" htmlFor="fecha">Fecha de emisión</label>
                    <div className="flex f-row" id="fecha">
                        <select onChange={handleDiaChange} value={diaSeleccionado} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {dias.map(item=><option value={item} key={item}>{item}</option> )}
                        </select>                       
                        <select onChange={handleMesChange} value={mesSeleccionado} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {meses.map(item=><option value={item.id} key={item.id}>{item.mes}</option> )}
                        </select>
                        <select onChange={handleAnioChange} value={anioSeleccionado} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {anio.map(item=><option value={item} key={item}>{item}</option> )}
                        </select>
                    </div>
                    <label className="Form__labels" htmlFor="fecha">Fecha de graduación</label>
                    <div className="flex f-row" id="fecha">
                        <select onChange={handleDiaGradChange} value={diaSeleccionadoGrad} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {dias.map(item=><option value={item} key={item}>{item}</option> )}
                        </select>                       
                        <select onChange={handleMesGradChange} value={mesSeleccionadoGrad} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {meses.map(item=><option value={item.id} key={item.id}>{item.mes}</option> )}
                        </select>
                        <select onChange={handleAnioGradChange} value={anioSeleccionadoGrad} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {anio.map(item=><option value={item} key={item}>{item}</option> )}
                        </select>
                    </div>                  
                        <label className="Form__labels" htmlFor="cuerpo">Comentarios finales</label>  
                        <textarea id="cuerpo" onChange={handleCuerpoChange} className="constancia-body Form__field" value={cuerpo} rows="6" cols="120"></textarea>
                        <button className="Form__submit" type="submit">Imprimir</button>
                    </form>
                </div>
                <div>

                    {tipoSeleccionado==="final" && <CursosParaAnalitico cursos={cursosAnaliticoFinal} modificar={setCursosAnaliticoFinal} buscandoCursos={buscandoCursos}/>}

                    {tipoSeleccionado==="parcial" && <CursosParaAnalitico cursos={cursosAnaliticoParcial} modificar={setCursosAnaliticoParcial} buscandoCursos={buscandoCursos}/>}

               </div>
            </div>
        </>
        )
}

function setearDiaHoy(setDiaSeleccionado,setMesSeleccionado,
                        setDiaSeleccionadoGrad,setMesSeleccionadoGrad,
                        setAnioSeleccionado,setAnioSeleccionadoGrad){
    const fechaActual = new Date();

    const mesActual = fechaActual.getMonth();
    const diaActual = fechaActual.getDate();
    const anioActual = fechaActual.getUTCFullYear();
    const diaActualString = diaActual < 10 ? `0${diaActual}` : diaActual;
    setMesSeleccionado(mesActual+1)
    setDiaSeleccionado(diaActualString)
    setMesSeleccionadoGrad(mesActual+1)
    setAnioSeleccionado(anioActual)
    setAnioSeleccionadoGrad(anioActual)
    setDiaSeleccionadoGrad(diaActualString)
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

/*function cargarVectorAnios(setAnio) {
    var anio=[];

    var fecha_actual = new Date();
    anio.push(fecha_actual.getFullYear());

    setAnio(anio)
}*/

function cargarVectorAnios(setAnios) {
    var anios = [];
    var anio;

    var fecha_actual = new Date();
    var anio_hasta = Number(fecha_actual.getFullYear() - 0);
    var anio_desde = anio_hasta - 15;

    for (var i = anio_hasta; i > anio_desde; i--) {
        anio = i.toString();
        anios.push(anio);
    }

  //  anios.push(1900); // agrego porque en la tabla hay fechas vacias que sql server los transforma a una fecha nula 1900-01-01 00:00:00.000
                      // para que tome las fechas 1900-01-01 00:00:00.000 y que el usuario vea que es un año invalido 

    setAnios(anios);
}

function CursosParaAnalitico({cursos,modificar,buscandoCursos}){

    const nuevo = [...cursos]

    const modificarVectorTodos = (marcar)=>{
        let nuevo_vector = []
        if (marcar){
            nuevo_vector = cursos.map(item=>{
                return {...item,incluir:true}
            })
        }else{
            nuevo_vector = cursos.map(item=>{
                return {...item,incluir:false}
            })
        }
        modificar(nuevo_vector)
    }


    const excluirDesaprobados = ()=>{

        const nuevo_vector = cursos.map(item=>{
            if (item.alerta<60)
                {return {...item,incluir:false}
            }else{
                return {...item,incluir:true}
            }                

        })

        modificar(nuevo_vector)
    }

    const modificarVector = (indice)=>{
        const nuevo_vector = [...cursos]
        if (nuevo[indice].incluir){
            nuevo[indice].incluir=false
        }else{
            nuevo[indice].incluir=true
        }
        modificar(nuevo)
    }

return(<>
   <CalcularPromedio cursos={cursos}/>
   { buscandoCursos && <div><Loading blanco={false}/><span className="cargando">Buscando alumnos...</span></div>}
   <div className="flex flex-wrap TodosAnalitico">
        <span className="cursor-pointer mr-2" title="Marcar todos" onClick={excluirDesaprobados}>
                        <FontAwesomeIcon className="dispo-11" icon={faThumbsUp}/>
                        <span title="Incluir solo las materias aprobadas" class="cursor-pointer texto-acciones-menu text-center ml-2 mt-2 mb-2">Solo aprobadas</span>
        </span>         
        <span className="cursor-pointer mr-4" title="Desmarcar todos" onClick={item=>modificarVectorTodos(false)}>
                        <FontAwesomeIcon className="dispo-0" icon={faLongArrowAltLeft}/>
                        <span title="Desmarcar todos" class="cursor-pointer texto-acciones-menu text-center ml-2 mt-2 mb-2">Excluir todos</span>
        </span>
        <span className="cursor-pointer mr-4" title="Marcar todos" onClick={item=>modificarVectorTodos(true)}>
                        <FontAwesomeIcon className="dispo-1" icon={faLongArrowAltRight}/>
                        <span title="Incluir todos" class="cursor-pointer texto-acciones-menu text-center ml-2 mt-2 mb-2">Incluir todos</span>
        </span>   
   </div>

   <div className="mt-4">
        {cursos.map(
            (item,index)=><div key={uuidv4()} className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
            <button title={item.incluir ? 'Excluir' : 'Incluir'} onClick={item=>modificarVector(index)}>
                <FontAwesomeIcon className={item.incluir ?  "dispo-0":"dispo-1"} icon={item.incluir ? faLongArrowAltLeft : faLongArrowAltRight }/>
            </button>
            <span className="listaCursadasAnalitico">{item.nombre}</span> 
            <span className="listaCursadasAnalitico recortar">{item.descripcion}</span> 
            <span className={item.incluir ?  "listaCursadasAnalitico incluido":"listaCursadasAnalitico excluido"}>{item.columna} </span> 
        </div>
        )}
    </div>
</>
)

}

function CalcularPromedio({cursos}){

    const totalNotas = cursos.reduce((acumulador,item)=>{
        return item.incluir ? acumulador + Number(item.alerta) : acumulador
    },0)

    const totalCursosIncluidos = cursos.reduce((acumulador,item)=>{
        return item.incluir ? acumulador + 1 : acumulador 
    },0)

    const totalCursos = cursos.length;

    const promedio = totalCursosIncluidos===0 ? 
                     '0' 
                     : Number(totalNotas/totalCursosIncluidos).toFixed(2)

    return(
        <div>
            <span className="text-small ml-4 mb-2 mt-2">{`${totalCursosIncluidos} cursos de ${totalCursos} Promedio:`}</span><span className="text-larger">{`  ${promedio}`}</span>
        </div>
    )
}

function agregarPropiedadIncluir(cursos){

    const nuevoVector = cursos.map(item=>({...item,incluir:true}))

    console.log('nuevoVector',nuevoVector)
    return nuevoVector
}

