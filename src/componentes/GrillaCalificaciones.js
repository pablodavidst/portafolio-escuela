import React, {useState, useEffect, useRef} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faPhone,faMobile,faEnvelopeOpenText,faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faWindowClose, faEdit, faSave } from '@fortawesome/free-regular-svg-icons';
import { faPlusCircle, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import Loading from '../componentes/Loading';
import {scrollTop, hacerScroll,scrollBottom} from '../Helpers/utilidades-globales';
import {v4 as uuid} from 'uuid'
import Calificaciones from '../componentes/Calificaciones';
import Swal from 'sweetalert2';
import {useAlumno} from '../Context/alumnoContext';

export default function AlumnosCurso({nro_curso,notas,finalizarCalificaciones, observaciones}){

    const [alumnos,setAlumnos]=useState([]);
    const [calificaciones,setCalificaciones]=useState([]);
    const [buscandoAlumnos,setBuscandoAlumnos]=useState(false)
    const [buscandoCalificaciones,setBuscandoCalificaciones]=useState(false)
    const [grabandoCalificaciones,setGrabandoCalificaciones]=useState(false)
    const [errorCalificaciones,setErrorCalificaciones]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [orden,setOrden]=useState(1)
    const [ampliar,setAmpliar]=useState(false)
    const [alumnoSeleccionado,setAlumnoSeleccionado]=useState(null)
    const [nombreAlumnoSeleccionado,setNombreAlumnoSeleccionado]=useState('')
    const [editar,setEditar]=useState(false)
    const [grabar,setGrabar]=useState(false)
    const {usuario} = useAlumno();
    const [contador,setContador]=useState(0)
    const [observacionesCal,setObservacionesCal]=useState('')
    const [observacionesCalOriginal,setObservacionesCalOriginal]=useState('')
    const [filasobs,setFilasObs]=useState(1)
    const [datosCurso,setDatosCurso]=useState(null)
    const idIntervalo = useRef();

    useEffect(()=>{
       
        setBuscandoAlumnos(true)

        let mounted = true;

        const buscarAlumnos = async ()=>{

           try{
                const {data}= await Axios.get(`/api/cursos/alumnos/${nro_curso}`)
        
                setAlumnos(data)
                setBuscandoAlumnos(false)

            }catch(err){
                console.log(err.response.data)
                setBuscandoAlumnos(false)
                setHuboError(true)
            }
        }
        
        if (mounted){
            buscarAlumnos()
        }


        return () => mounted = false;
    },[contador])

    useEffect(()=>{

        if (alumnos.length>0 && notas){
            buscarCalificaciones();
        }

        buscarDatosDelCurso()
            .then(data=>{
                setDatosCurso(data);
                setObservacionesCalOriginal(data.observaciones_cal)
                setObservacionesCal(data.observaciones_cal)
            })
    
    },[alumnos,contador]) // cada vez que se recargue la lista de alumnos por ejemplo por una inscripción
                 // o una anulación vemos si un alumno esta seleccionado y verificamos si esta inscripto
    

    useEffect(()=>{
        let lineas = observacionesCal.split('\n').length
        let ancho = Number(observacionesCal.length)/100 
        let total = lineas;

        if (ancho>1){
            total = lineas + ancho
        }

        setFilasObs(total)


    },[observacionesCal])

    const cancelarAcciones = ()=>{
        setEditar(false)
        setGrabar(false)
        setAlumnoSeleccionado(null)
        setNombreAlumnoSeleccionado('')
    }

    const iniciarEditar = (item)=>{
        setAlumnoSeleccionado(item.id_alumno)
        setNombreAlumnoSeleccionado(item.nombre)
        setEditar(true)
    }

    const iniciarGrabar = async (notas)=>{
        //setAlumnoSeleccionado(null)
        //setNombreAlumnoSeleccionado('')
        //setGrabar(true)
    
        Swal.fire({
            text:'¿Confirma las calificaciones para el alumno?',
            showCancelButton:true,
            confirButtonText:'Si, grabar las calificaciones',
            cancelButtonText:'Cancelar'
        }).then(
            resultado=>{
                if (resultado.value){
                    grabarCalificaciones(notas);
    
                }else{
                    console.log("Se canceló la modificación o creación del aula")
                }
            }
        )
    }

    const grabarCalificaciones = async (notas)=>{
        
        setGrabandoCalificaciones(true)
        const objetoAgrabar = {...notas}

        try{
            const resultado = await Axios.put(`/api/cursos/calificaciones/${nro_curso}/${notas.id_alumno}/${usuario.id_prof}`, objetoAgrabar)
        
            setGrabandoCalificaciones(false)
            setAlumnoSeleccionado(null)
            finalizarCalificaciones()

            Swal.fire({
                html:'<p>Se grabaron las calificaciones exitosamente</p>',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })

           setContador(contador+1)
        }catch(err){
            let mensaje_html_error;

            console.log(Object.entries(err))
   
            if(err.response){
                if(err.response.data.message){
                    mensaje_html_error = `<p>Se produjo un error al grabar las calificaciones</p><p>${err.response.data.message}</p>`
                }else if (err.response.data) {
                    mensaje_html_error = `<p>Se produjo un error al grabar las calificaciones</p><p>${err.response.data}</p>`
                }else{
                    mensaje_html_error = `<p>Se produjo un error al grabar las calificaciones</p><p>${err.response}</p>`
                }
            }else{
                mensaje_html_error = `<p>Se produjo un error al grabar las calificaciones</p><p>${err}</p>`
            }

            setGrabandoCalificaciones(false)

            Swal.fire({
                html:mensaje_html_error,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
            })   
        }
    
        
    }

    const handleChangeObservaciones = (e)=>{
        setObservacionesCal(e.target.value)
    }

    const iniciarGrabarObservaciones=()=>{
        Swal.fire({
            text:'¿Confirma las observaciones?',
            showCancelButton:true,
            confirButtonText:'Si, grabar las observaciones',
            cancelButtonText:'Cancelar'
        }).then(
            resultado=>{
                if (resultado.value){
                    grabarObservaciones(observacionesCal)
    
                }else{
                    console.log("Se canceló la modificación de las observaciones")
                }
            }
        )
    }

    
const grabarObservaciones = async(observaciones)=>{

    console.log(observaciones)
    const objetoAgrabar = {observaciones:observaciones}

    try{
        const resultado = Axios.put(`/api/cursos/calificaciones/observaciones/${nro_curso}`,objetoAgrabar)
        Swal.fire({
            html:'<p>Se grabaron las observaciones exitosamente</p>',
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        }).then((data)=>{
            buscarDatosDelCurso()
            .then((data)=>{
                setDatosCurso(data);
                setTimeout(() => {
                    setObservacionesCalOriginal(data.observaciones_cal)
                    setObservacionesCal(data.observaciones_cal)
                }, 500);
                
            })
        })
  
    }catch(err){
        Swal.fire({
            html:'<p>Hubo un error al grabar las observaciones</p>',
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })

        console.log(err)
    }
}

async function buscarDatosDelCurso(){
    try{           
        const {data} = await Axios.get(`/api/cursos/curso/${nro_curso}`)
        console.log('fui a buscar los datos del curso'.data)
        return(data)
    }catch(err){
        console.log(err);
    }
}

    const comentarAlumno=(alumno)=>{

        const verificar = observacionesCal.search(alumno);
        const longitud = alumno.length;
        const elemento = document.getElementById('obs-cal')

        if (verificar>-1){
            //alert('El alumno ya figura en las observaciones')


            Swal.fire({
                text:`El alumno ya figura en las observaciones`,
                icon: 'warning',
                showConfirmButton: false,
                timer:1500
            }).then(
                ()=>{
                    setTimeout(() => {
                        elemento.focus()
                        elemento.selectionStart = Number(verificar);
                        elemento.selectionEnd = Number(verificar) + Number(longitud);
                    },300);
                }
            )
           return
        }

        const longitudTotal = observacionesCal.length;
        let copiaObservaciones = observacionesCal;

        if (longitudTotal>0){
            copiaObservaciones = `${copiaObservaciones}\n${alumno} `
        }else{
            copiaObservaciones = `${alumno} `
        }

        setObservacionesCal(copiaObservaciones)

        elemento.focus()
        
        setTimeout(() => {
                elemento.selectionStart = elemento.selectionEnd = Number(longitudTotal) + Number(longitud) + 2;
        },10);


    }

    const buscarCalificaciones = async ()=>{
    
        setBuscandoCalificaciones(true)
        setErrorCalificaciones(false)
    
        try{
            const {data} = await Axios.get(`/api/cursos/curso/calificaciones/${nro_curso}`)
            setCalificaciones(data);
            setBuscandoCalificaciones(false)
        }catch(err){
            setBuscandoCalificaciones(false)
            setErrorCalificaciones(true)
            console.log(err)
        }
    }

    if (huboError || errorCalificaciones){
        return <Main center><span title={errorCalificaciones ? "Revise la ficha del curso. Es posible que el encabezado o régimen sean inválidos" : ""}>Se produjo un error al cargar las calificaciones</span></Main>
    }

    if (buscandoAlumnos){
        return <Main center><div><Loading/><span className="cargando">Buscando calificaciones...</span></div></Main>
    };

    return(
        <>  
        <Listado alumnos={alumnos} 
                notas={notas} 
                calificaciones={calificaciones} 
                alumnoSeleccionado={alumnoSeleccionado} 
                nombreAlumnoSeleccionado={nombreAlumnoSeleccionado} 
                setAlumnoSeleccionado={setAlumnoSeleccionado}
                iniciarEditar={iniciarEditar}
                iniciarGrabar={iniciarGrabar}
                finalizarCalificaciones={finalizarCalificaciones}
                grabandoCalificaciones={grabandoCalificaciones}
                cancelarAcciones={cancelarAcciones}
                observaciones={observacionesCal}
                observacionesCalOriginal={observacionesCalOriginal}
                grabarObservaciones={iniciarGrabarObservaciones}
                filasobs={filasobs}
                comentarAlumno={comentarAlumno}
                handleChangeObservaciones={handleChangeObservaciones}/>
        </>
    )
}

function Listado({alumnos,
                  nombreAlumnoSeleccionado,
                  notas,
                  finalizarCalificaciones,
                  calificaciones,
                  alumnoSeleccionado,
                  setAlumnoSeleccionado,
                  grabandoCalificaciones,
                  iniciarEditar,
                  iniciarGrabar,
                  cancelarAcciones,
                  observaciones,
                  observacionesCalOriginal,
                  grabarObservaciones,
                  filasobs,
                  comentarAlumno,
                  handleChangeObservaciones}){

    
    const [mostrarInfo, setMostrarInfo]= useState(false)

    const switchMostrarInfo = ()=>{
        if (mostrarInfo){
            setMostrarInfo(false)
        }else{
            setMostrarInfo(true)
        }
    }

    return (
    alumnos.filter(item=>item.id_alumno>0).length>0 ? 
    <div className="p-4"> 

        <div className="flex f-row relative items-center">
            <span className="cabecera">Grilla de calificaciones</span>
            {/*<span title={mostrarInfo ? 'Ocultar la información de contacto de los alumnos' : 'Visualizar la información de contacto de los alumnos' } onClick={switchMostrarInfo} className="cursor-pointer mr-2 ml-2 text-small" >
                    <FontAwesomeIcon className="cursor-pointer" icon={faInfoCircle}/> {mostrarInfo ? 'Ocultar info' : 'Ver info' } 
            </span>*/} 
        </div>  
        <div className="mt-6 mb-2">
            <Observaciones  filasobs={filasobs} 
                            observaciones={observaciones} 
                            grabar={grabarObservaciones} 
                            onchange={handleChangeObservaciones}
                            observacionesCalOriginal={observacionesCalOriginal}/>
        </div>  

        {notas && calificaciones.length > 0 && alumnoSeleccionado!=alumnos[0].id_alumno &&
            <div className="g-encabezado-1">
                <Calificaciones encabezado={calificaciones[0]}/>
            </div>}                            

        {alumnos.filter(item=>item.id_alumno>0).map((item,index)=>
        <div className="flex f-row border-bottom-solid-light mt-2 mb-2 justify-content-center" key={`curso-al${item.id_alumno}`}>
            { alumnoSeleccionado!= item.id_alumno && <div className="flex f-col width-300 relative color-63" >
                <span onClick={()=>comentarAlumno(item.nombre)}> {index+1} - {item.nombre}</span>
                <div className="flex f-row">
                    <span title={item.instrumentos} className="text-small inst-cal">{item.instrumentos} </span>
                    <FontAwesomeIcon className="cursor-pointer text-small" title="Escribir un comentario sobre el alumno" onClick={()=>comentarAlumno(item.nombre)} icon={faPencilAlt}/>
                </div>
                <div className="absolute right-0">
                    <Acciones editar={iniciarEditar} 
                            grabar={iniciarGrabar} 
                            cancelar={cancelarAcciones}
                            alumnoSeleccionado={alumnoSeleccionado}
                            nombreAlumnoSeleccionado={nombreAlumnoSeleccionado}
                            setAlumnoSeleccionado={setAlumnoSeleccionado}
                            alumno={item}
                            cancelarAcciones={cancelarAcciones}/>
                </div>
            </div>}
            
            {notas && calificaciones.length > 0 && 
                <>
                {alumnoSeleccionado==item.id_alumno && grabandoCalificaciones && <Main center><Loading/><span className="cargando">Grabando calificaciones...</span></Main>}
                <div className={grabandoCalificaciones ? 'hidden' : ''}>
                    <Calificaciones encabezado={calificaciones[0]} 
                                    notas={calificaciones.filter(notas=>notas.id_alumno === item.id_alumno)} 
                                    editar={true} 
                                    nombreAlumnoSeleccionado={nombreAlumnoSeleccionado}
                                    alumnoSeleccionado={alumnoSeleccionado} 
                                    id_alumno={item.id_alumno}
                                    grabarNotas={iniciarGrabar}
                                    cancelarAcciones={cancelarAcciones}/> 
                </div>
                </>}     
        </div>
        
        )}
    </div>
    :
    <div className="p-4"> 
        <p>No se encontraron alumnos</p>
    </div>
    )
}

function Acciones({editar,grabar,cancelar, alumnoSeleccionado, nombreAlumnoSeleccionado, setAlumnoSeleccionado,alumno}){

    if (!alumnoSeleccionado){
       return <span className="cursor-pointer texto-acciones-menu botonNc inline-block-1 mr-2" title='Editar las notas del alumno'onClick={()=>editar(alumno)}>
            <FontAwesomeIcon className="color-tomato" icon={faEdit}/>
        </span>
    }

    if (alumnoSeleccionado && alumnoSeleccionado==alumno.id_alumno){
       return <div className="flex f-row">
            {/*<span className="cursor-pointer texto-acciones-menu botonNc inline-block-1 mr-2" title='Cancelar'onClick={()=>cancelar(id_alumno)}>
                <FontAwesomeIcon className="text-white" icon={faWindowClose}/>
            </span>
            <span className="cursor-pointer texto-acciones-menu botonNc inline-block-1 mr-2" title='Grabar'onClick={()=>grabar(id_alumno)}>
                <FontAwesomeIcon className="text-white" icon={faSave}/>
            </span>*/}
        </div>
    }

    if (alumnoSeleccionado && alumnoSeleccionado!=alumno.id_alumno){
        return <div className="flex f-row">
             <button className="cursor-pointer texto-acciones-menu botonNc inline-block-1" title={`No se puede seleccionar mientras se está editando otra fila. Grabe o cancele las notas del alumno ${nombreAlumnoSeleccionado}`}>
                <FontAwesomeIcon className="color-tomato" icon={faBan}/>
            </button>
        </div>
    }

}

function Observaciones({observaciones,grabar,onchange,filasobs,observacionesCalOriginal}){
    return <div>
        <textarea id="obs-cal" placeholder="Observaciones" title="Observaciones" className="bg-wheat width-100x100" type="text" value={observaciones} rows={filasobs} maxLength="1000" cols="100" onChange={(e)=>onchange(e)}/> 
        <div className="flex f-reverse">
            <span className={observacionesCalOriginal!=observaciones ? "color-63 cursor-pointer mr-2 ml-6 text-small blink" : "hidden"}
                  onClick={grabar}>
                        <FontAwesomeIcon 
                        className="cursor-pointer color-tomato" 
                        icon={faSave}/> Grabar observaciones
            </span>
        </div>
    </div>
}