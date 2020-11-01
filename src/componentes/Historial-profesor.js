import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faUser, faPlusSquare, faEdit, faEyeSlash, faFileCode, faMinusSquare } from '@fortawesome/free-regular-svg-icons';
import { faEye, faPlusCircle, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';
import {imprimir as imprimirHistorial} from '../impresiones/historial';
import {scrollTop, hacerScroll,scrollBottom} from '../Helpers/utilidades-globales';
import {v4 as uuid} from 'uuid'

export default function Busqueda({profesor,id_prof}){

    const [historialAlumno,setHistorialAlumno]=useState([]);
    const [buscandoHistorial,setBuscandoHistorial]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    const [periodos,setPeriodos]=useState([])
    const [orden,setOrden]=useState(1)
    const [ampliar,setAmpliar]=useState(false)

    useEffect(()=>{
       
        setBuscandoHistorial(true)

        let mounted = true;

        const buscarHistorialAlumno = async ()=>{

           try{
                const {data}= await Axios.get(`/api/usuarios/profesores/historial/${id_prof}`)
        
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

    const crearVectorDePeriodos = (historial)=>{
        const periodos = historial.map(item=>{return {id:item.id_cuatrimestre,nombre:item.Cuatrimestre, anio:item.anio}}).sort((a,b)=>a.id-b.id).filter((item,index,vector)=>{
            return index>0 ? item.id!=vector[index-1].id : item
        })
        setPeriodos(periodos)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar el historial del profesor</span></Main>
    }

    if (buscandoHistorial){
        return <Main center><div><Loading blanco={true}/><span className="cargando text-white">Buscando historial del profesor...</span></div></Main>
    };

    return(
        <>  
        <Listado historial={historialAlumno} 
                 periodos={periodos} 
                 orden={orden} 
                 setorden={setOrden}
                 ampliar={ampliar}
                 setAmpliar={setAmpliar}
                 ejecutarImprimirHistorial={ejecutarImprimirHistorial}
                 profesor={profesor}
                />
        </>
    )
}

const ejecutarImprimirHistorial = (profesor,historialAlumno)=>{
    
    
        imprimirHistorial(profesor,historialAlumno)
    }

function Listado({historial, periodos, orden, setorden, ampliar,setAmpliar,ejecutarImprimirHistorial, profesor}){
    let tipo = 1;

    const materias = historial.map(item=>{return {id:item.id_materia,nombre:item.cod_materia,descripcion:item.Materia}}).sort((a,b)=>a.id-b.id).filter((item,index,vector)=>{
        return index>0 ? item.id!=vector[index-1].id : item
    }).sort((a,b)=>a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0 )

    const prueba = (tipo)=>{
        tipo = tipo
    }

    const resumen = crearResumen(materias,periodos,historial)

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
              //  hacerScroll("titulo-modal");
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
               // if(existe_modal){
                    window.scrollBy({
                        top: 500,
                        behaviour: 'smooth'
                      })
                //}

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
            <div className="flex f-row">
                <p className="text-small color-63 mb-2">{resumen}</p>
                <span className="text-small text-white ml-4 mb-2 cursor-pointer" title="Imprimir el historial de cursos del profesor" onClick={()=>{ejecutarImprimirHistorial(profesor,historial)}}>
                    <FontAwesomeIcon className="ic-abm" icon={faFilePdf} /> <span className="texto-acciones-menu">Imprimir</span>
                </span>
            </div>
           
            <span onClick={switchOrden} className="orden_historial cursor-pointer"><FontAwesomeIcon className="ic-abm" icon={faEye} />{orden===1 ? ' Ver por materia' : ' Ver por cuatrimestre '}</span>
            {/*<button title={ampliar ? 'Reducir' : 'Ampliar'} onClick={switchAmpliar}>
                <FontAwesomeIcon className={ ampliar ? '' : ''} icon={ampliar ? faMinusSquare : faPlusCircle}/> <span className="texto-acciones-menu cabecera">{ ampliar ? 'Reducir':'Ampliar'}</span>
            </button>
            */}
        </div>
        }
        { orden===1 && <div>
            {periodos.map(periodo=><div key={`per-${periodo.id}`}><p className="font-w-500 color-63 border-bottom-solid-light mt-2 mb-2">
                                    {periodo.nombre}</p>
{/*                    {historial.filter(item=>item.id_cuatrimestre==periodo.id).map(item=><p key={`hs-${item.nro_curso}`} title={item.descripcion} className="listaCursadasHistorial recortar-150">{item.mensaje}</p>)}*/}
                    {historial.filter(item=>item.id_cuatrimestre==periodo.id)
                    .sort((a,b)=> a.nro_curso < b.nro_curso ? -1 : a.nro_curso > b.nro_curso ? 1 : 0)
                    .map((item,index)=>
                        {
                        return <div key={uuid()}><FormatoPeriodoAmpliado item={item} index={index}/></div>
                        })}
            </div>)}
        </div>}
        { orden===2 && <div>
            {materias.map(materia=><div key={`mat-${materia.id}`}><p title={materia.descripcion} className="font-w-500 color-63 border-bottom-solid-light mt-2 mb-2">{materia.nombre} {materia.descripcion}</p>
{/*                    {historial.filter(item=>item.id_materia==materia.id).map(item=><p key={`hs-${item.nro_curso}`} title={item.descripcion} className="listaCursadasHistorial recortar-150">{item.periodo}</p>)} */}
        {historial.filter(item=>item.id_materia==materia.id)
        .sort((a,b)=> a.nro_curso < b.nro_curso ? -1 : a.nro_curso > b.nro_curso ? 1 : 0)
        .map((item,index)=> 
                {
                    return <div key={uuid()}>
                           <FormatoMateriaAmpliado item={item} index={index}/> 
                    </div>
                           

            })}
            </div>)}
        </div>}

    </div>
    )
}

function detallePeriodo(periodo,historial){
    return historial.reduce((ac,item)=>{
        if (item.id_cuatrimestre===periodo.id){
            return ac + 1
        }else{
            return ac
        }
    },0)
}

function FormatoMateriaAmpliado({item,index}){
    return(
    <div className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
        <span className="listaCursadasAmpliada w-150">{item.Cuatrimestre} </span> 
        <span className="listaCursadasAmpliada w-150">{`Alumnos: ${item.CantidadInscriptos} Prom: ${item.PromedioEstimativo.toFixed(2)}`} </span>       
        <span className="listaCursadasAmpliada w-100">{`Curso #${item.nro_curso}`} </span> 
    </div>
    )
}

function FormatoMateriaSimple({item,index}){
    return(
        <p title={item.descripcion} className="listaCursadasHistorial recortar-150">{item.Cuatrimestre}</p>
    )
}

function crearResumen(materias,periodos,historial){

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
   
    const cursos = historial.reduce((acumulador,item)=>{
        return acumulador + 1
    },0)

    const alumnos = historial.reduce((acumulador,item)=>{
        return acumulador + item.CantidadInscriptos
    },0)   
    
    return `${cant_materias} materias ${cursos} cursos y ${alumnos} alumnos e/ ${anio_desde} y ${anio_hasta}`
}

function FormatoPeriodoAmpliado({item,index}){
    return(
    <div className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
        <span className="listaCursadasAmpliada">{index+1}</span>
        <span className="listaCursadasAmpliada w-150 fw-600">{item.Materia} {item.cod_materia}</span> 
        <span className="listaCursadasAmpliada w-35">{item.cod_materia} </span> 
        <span className="listaCursadasAmpliada w-150">{`Alumnos: ${item.CantidadInscriptos} Prom: ${item.PromedioEstimativo.toFixed(2)}`} </span>       
        <span className="listaCursadasAmpliada w-100">{`Curso #${item.nro_curso}`} </span> 

    </div>
    )
}

function FormatoPeriodoSimple({item,index}){
    return(
        <p title={item.descripcion} className="listaCursadasHistorial recortar-150">{item.Materia}</p>
    )
}
