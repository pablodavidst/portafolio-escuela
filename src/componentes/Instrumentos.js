import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faCircle, faEdit,faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import AbmInstrumento from '../abms/Abm-Instrumento'
import { v4 as uuidv4 } from 'uuid';

export default function Instrumentos({finalizarSeleccion}){

    const [instrumentos,setInstrumentos]=useState([]);
    const [buscando,setBuscando]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [idSeleccionado, setIdSeleccionado]=useState(null)
    const [contadorOperaciones,setContadorOperaciones]=useState(0,);
    const [ejecutarAlta, setEjecutarAlta]=useState(false)

    const referencia1 = React.useRef();

    useEffect(()=>{
       
        setBuscando(true)

        const buscarInstrumentos = async ()=>{

           try{
                const {data}= await Axios.get('/api/tablasgenerales/instrumentos')
        
                setInstrumentos(data)
                setBuscando(false)
            }catch(err){
                console.log(err.response.data)
                setBuscando(false)
                setHuboError(true)
            }
        }
        
        buscarInstrumentos()
    },[contadorOperaciones])

    useEffect(()=>{
        console.log('cambio el id ', idSeleccionado )
    },[idSeleccionado])

    const iniciarALta=()=>{
        setEjecutarAlta(true)
    }

    const finalizarAltaOcopia= (valor)=>{

       // setIdSeleccionado(null)
       // setEjecutarAlta(false)

       if (valor){
           /* setTimeout(() => {      // AVERIGUAR PORQUE SIN UN SETTIMEOUT NO ACTUALIZA EL ESTADO DE IdSeleccionado
                setIdSeleccionado(null)
                setContadorOperaciones(contadorOperaciones+1)
                setEjecutarAlta(false)
            }, 100); */
            setIdSeleccionado(null)
            setEjecutarAlta(false)
            setContadorOperaciones(contadorOperaciones+1)

        }else{ // AVERIGUAR PORQUE SIN UN SETTIMEOUT NO ACTUALIZA EL ESTADO DE IdSeleccionado
           /* setTimeout(() => {
                setIdSeleccionado(null)
                setEjecutarAlta(false)
            }, 100); */

            setIdSeleccionado(null)
            setEjecutarAlta(false)
       }
    }

    const seleccionar=(e,item)=>{
        setIdSeleccionado(item.id_instrumento)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando instrumentos...</span></div></Main>
    };

    return(
        <> 
        {!ejecutarAlta && <span onClick={iniciarALta} className="cursor-pointer texto-acciones-menu botonNc inline-block-1 mb-4 mt-2" >
            <FontAwesomeIcon className="cursor-pointer ic-abm" icon={faPlusSquare}/> Crear un instrumento
        </span>}
        { ejecutarAlta && 
                    <AbmInstrumento id_instrumento={null} 
                                    finalizarAltaOcopia={finalizarAltaOcopia}/>
              }    
        { !ejecutarAlta && <Listado tabla={instrumentos} 
            seleccionar={seleccionar} 
            textoBusqueda={''} 
            idSeleccionado={idSeleccionado}
            finalizarAltaOcopia={finalizarAltaOcopia}/> 
        }    
        </>
    )
}

function Listado({tabla,seleccionar,textoBusqueda, idSeleccionado,finalizarAltaOcopia}){

    return (
    <div>
        {tabla
            .filter(
                item=>item.nombre.toUpperCase().includes(textoBusqueda.toUpperCase()))
            .map(item=><div key={uuidv4()}>
            <div title="Seleccione éste instrumento para editarlo" onClick={(e)=>{seleccionar(e,item)}} 
                className="listado-al" >
                <FontAwesomeIcon className="mr-2 ic-abm text-xxsmall" icon={faCircle}/>
                <span className="lis-col1">{item.nombre}</span>
                <span>{item.abreviatura}</span>
            </div> 
              {idSeleccionado == item.id_instrumento && 
                    <AbmInstrumento id_instrumento={item.id_instrumento} 
                                    finalizarAltaOcopia={finalizarAltaOcopia}/>
              }            
            </div>)
        }
    </div>
    )
}

