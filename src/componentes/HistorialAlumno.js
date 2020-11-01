import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faPlusSquare, faEdit, faEyeSlash, faFileCode, faMinusSquare } from '@fortawesome/free-regular-svg-icons';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';
import {scrollTop, hacerScroll,scrollBottom} from '../Helpers/utilidades-globales';
import {v4 as uuid} from 'uuid'
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';

export default function HistorialAlumno({id_alumno,actual,cambiarAmpliado}){

    const [historialAlumno,setHistorialAlumno]=useState([]);
    const [buscandoHistorial,setBuscandoHistorial]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    const [periodos,setPeriodos]=useState([])
    const [orden,setOrden]=useState(1)
    const [ampliar,setAmpliar]=useState(false)
    const {toggle, isShowing } = useModal();

    useEffect(()=>{
       
        setBuscandoHistorial(true)

        let mounted = true;

        const buscarHistorialAlumno = async ()=>{

           try{
                const {data}= await Axios.get(`/api/alumnos/historial/${id_alumno}/${actual}`)
        
                setHistorialAlumno(data)
                setBuscandoHistorial(false)

                return data
            }catch(err){
                console.log(err.response.data)
                setBuscandoHistorial(false)
                setHuboError(true)
            }
        }
        
        if (mounted){
            buscarHistorialAlumno()
            .then(historial=>{
                crearVectorDePeriodos(historial)
            })
        }


        return () => mounted = false;
    },[])

    useEffect(()=>{
        console.log('ssss')
        cambiarAmpliado(ampliar) // le aviso al componente padre si estamos mostrando un historial ampliado o reducido
    },[ampliar])

    const crearVectorDePeriodos = (historial)=>{
        const periodos = historial.map(item=>{return {id:item.id_cuatrimestre,nombre:item.periodo, anio:item.anio}}).sort((a,b)=>a.id-b.id).filter((item,index,vector)=>{
            return index>0 ? item.id!=vector[index-1].id : item
        })
        setPeriodos(periodos)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar el historial del alumno</span></Main>
    }

    if (buscandoHistorial){
        return <Main center><div><Loading/><span className="cargando">Buscando historial del alumno...</span></div></Main>
    };

    return(
        <>  
        <Listado historial={historialAlumno} 
                 periodos={periodos} 
                 orden={orden} 
                 setorden={setOrden}
                 ampliar={ampliar}
                 setAmpliar={setAmpliar}
                />
        </>
    )
}

function Listado({historial, periodos, orden, setorden, ampliar,setAmpliar}){
    let tipo = 1;

    const materias = historial.map(item=>{return {id:item.id_materia,nombre:item.mensaje,descripcion:item.descripcion}}).sort((a,b)=>a.id-b.id).filter((item,index,vector)=>{
        return index>0 ? item.id!=vector[index-1].id : item
    }).sort((a,b)=>a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0 )

    const prueba = (tipo)=>{
        tipo = tipo
    }

    const resumen = crearResumen(materias,periodos)

    const switchOrden = ()=>{
        if (orden===1){
            setorden(2)
            scrollTop();
        }else{
            setorden(1)
            scrollTop();
        }
    }

    const switchAmpliar=()=>{

        const existe_modal = document.getElementById("titulo-modal")

        console.log('existe_modal',existe_modal)
        if (ampliar){
            setAmpliar(false)
            setTimeout(() => {
              hacerScroll("histo-al");
              window.scrollBy({
                top: -100,
                behaviour: 'smooth'
              })
            }, 200);
        }else{
            setAmpliar(true)
            setTimeout(() => {
                hacerScroll("histo-al");
                    window.scrollBy({
                        top: 500,
                        behaviour: 'smooth'
                      })

            }, 200);
            
        }
        
    }

    return (
    <div> 
       {/*<button title={ orden===1 ? 'Ordenar por materia' : 'Ordenar por cuatrimestre'}>
            <FontAwesomeIcon className={ orden===1 ? 'dispo-0' : ''} icon={faEyeSlash} onClick={switchOrden}/>
        </button>*/}
        { historial.length > 0 && 
        <div>
            <p className="text-small color-63 mb-2">{resumen}</p>
            {/*<span onClick={switchOrden} className="orden_historial cursor-pointer bu-accion-abm">{orden===1 ? 'Ver por materia' : 'Ver por cuatrimestre '}</span>*/}
            <button title={ampliar ? 'Reducir' : 'Ampliar'} onClick={switchAmpliar}>
                <FontAwesomeIcon className="ic-abm" icon={ampliar ? faMinusSquare : faPlusCircle}/> 
                <span className="texto-acciones-menu bu-accion-abm">{ ampliar ? 'Reducir':'Ampliar'}</span>
            </button>
        </div>
        }
        { orden===1 && <div>
            {periodos.map(periodo=><div key={`per-${periodo.id}`}><p className="font-w-500 color-63 border-bottom-solid-light mt-2 mb-2">{periodo.nombre}</p>
{/*                    {historial.filter(item=>item.id_cuatrimestre==periodo.id).map(item=><p key={`hs-${item.nro_curso}`} title={item.descripcion} className="listaCursadasHistorial recortar-150">{item.mensaje}</p>)}*/}
                    {historial.filter(item=>item.id_cuatrimestre==periodo.id)
                    .sort((a,b)=> a.nro_curso < b.nro_curso ? -1 : a.nro_curso > b.nro_curso ? 1 : 0)
                    .map(item=>
                        {
                            if (ampliar){
                                return (<div key={uuid()}><FormatoPeriodoAmpliado item={item}/></div>)
                            }else{
                                return (<div key={uuid()}><FormatoPeriodoSimple item={item}/></div>)
                            }

                        })}
            </div>)}
        </div>}
        { orden===2 && <div>
            {materias.map(materia=><div key={`mat-${materia.id}`}><p title={materia.descripcion} className="font-w-500 color-63 border-bottom-solid-light mt-2 mb-2">{materia.nombre}</p>
{/*                    {historial.filter(item=>item.id_materia==materia.id).map(item=><p key={`hs-${item.nro_curso}`} title={item.descripcion} className="listaCursadasHistorial recortar-150">{item.periodo}</p>)} */}
        {historial.filter(item=>item.id_materia==materia.id)
        .sort((a,b)=> a.nro_curso < b.nro_curso ? -1 : a.nro_curso > b.nro_curso ? 1 : 0)
        .map(item=> {
                    if (ampliar){
                        return (<div key={uuid()}><FormatoMateriaAmpliado item={item}/></div>)
                    }else{
                        return (<div key={uuid()}><FormatoMateriaSimple item={item}/></div>)
                    }
            })}
            </div>)}
        </div>}

    </div>
    )
}

function FormatoMateriaAmpliado({item}){
    return(
    <div className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
        <span className="listaCursadasAmpliada w-150 fw-600">{item.periodo}</span> 
        <span className="listaCursadasAmpliada w-150">{item.profesor} </span> 
        <span className="listaCursadasAmpliada w-150">{`${item.tipo} Prom: ${item.promedio}`} </span>       
        <span className="listaCursadasAmpliada w-100">{`Curso #${item.nro_curso}`} </span> 
    </div>
    )
}

function FormatoMateriaSimple({item}){
    return(
        <p title={item.descripcion} className="listaCursadasHistorial recortar-150">{item.periodo}</p>
    )
}

function crearResumen(materias,periodos){

    const cant_materias = materias.length;
    const cant_periodos = periodos.length;

    if (cant_materias===0 || cant_periodos===0){
        return ''
    }

    const periodos_ordenados_anio = periodos.sort((a,b)=>{
        return a.anio > b.anio ? -1 : a.anio < b.anio ? 1 : 0 
    })

    const anio_desde = periodos_ordenados_anio[cant_periodos-1].anio;
    const anio_hasta = periodos_ordenados_anio[0].anio;
   
    return `${cant_materias} materias e/ ${anio_desde} y ${anio_hasta}`
}

function FormatoPeriodoAmpliado({item}){
    return(
    <div className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
        <span title={item.descripcion} className="listaCursadasAmpliada w-50 fw-600">{item.mensaje}</span> 
        <span className="listaCursadasAmpliada w-200">{item.descripcion} </span> 
        <span className="listaCursadasAmpliada w-150">{item.profesor} </span> 
        <span className="listaCursadasAmpliada w-150">{`${item.DiaHora}`} </span> 
        <span className="listaCursadasAmpliada w-150">{`${item.Aula}`} </span>         
    </div>
    )
}

function FormatoPeriodoSimple({item}){
    return(
        <p title={item.descripcion} className="listaCursadasHistorial recortar-140">{item.mensaje}</p>
    )
}
