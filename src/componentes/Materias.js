import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faUser, faCircle, faEdit,faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import Loading from '../componentes/Loading';
import AbmMateria from '../abms/Abm-materia'
import { v4 as uuidv4 } from 'uuid';

export default function Materias({finalizarSeleccion}){

    const [materias,setMaterias]=useState([]);
    const [buscando,setBuscando]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [idSeleccionado, setIdSeleccionado]=useState(null)
    const [contadorOperaciones,setContadorOperaciones]=useState(0,);
    const [ejecutarAlta, setEjecutarAlta]=useState(false)

    const referencia1 = React.useRef();

    useEffect(()=>{
       
        setBuscando(true)

        const buscarMaterias = async ()=>{

           try{
                const {data}= await Axios.get('/api/tablasgenerales/materias')
        
                setMaterias(data)
                setBuscando(false)
            }catch(err){
                console.log(err.response.data)
                setBuscando(false)
                setHuboError(true)
            }
        }
        
        buscarMaterias()
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
        setIdSeleccionado(item.id_materia)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscando){
        return <Main center><div><Loading/><span className="cargando">Buscando materias...</span></div></Main>
    };

    return(
        <> 
        {!ejecutarAlta && <span onClick={iniciarALta} className="cursor-pointer texto-acciones-menu botonNc inline-block-1 mb-4 mt-2" >
            <FontAwesomeIcon className="cursor-pointer ic-abm" icon={faPlusSquare}/> Crear una materia
        </span>}
        { ejecutarAlta && 
                    <AbmMateria id_instrumento={null} 
                                    finalizarAltaOcopia={finalizarAltaOcopia}/>
              }    
        { !ejecutarAlta && <Listado tabla={materias} 
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
                item=>item.descripcion.toUpperCase().includes(textoBusqueda.toUpperCase()))
            .map(item=><div key={uuidv4()}>
            <div onClick={(e)=>{seleccionar(e,item)}} className="listado-al" >
                <FontAwesomeIcon className="mr-2 ic-abm text-xxsmall" icon={faCircle}/>
                <span className="lis-col1-lg">{item.descripcion}</span>
                <span className="w-100 inline-block-1">{item.cod_materia}</span>
                <span className={item.activa ? "inline-block ml-4 text-small fw-700" : "inline-block ml-4 text-small fw-700"}>{item.activa ? 'Activa' : 'Inactiva'}</span>
                {item.activa && <FontAwesomeIcon className="ml-2 color-green text-small" icon={faCheckCircle}/>}
                {!item.activa && <FontAwesomeIcon className="ml-2 text-red-dark text-small" icon={faTimesCircle}/>}
            </div> 
              {idSeleccionado == item.id_materia && 
                    <AbmMateria id_materia={item.id_materia} 
                                    finalizarAltaOcopia={finalizarAltaOcopia}/>
              }            
            </div>)
        }
    </div>
    )
}

