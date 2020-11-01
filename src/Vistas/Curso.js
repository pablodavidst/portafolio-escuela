import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import Main from '../componentes/Main';
import AbmCurso from '../abms/abm-curso';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import { Link,useParams } from 'react-router-dom';
import Loading from '../componentes/Loading';
import { v4 as uuidv4 } from 'uuid';
import {useAlumno} from '../Context/alumnoContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPlusSquare, faWindowClose, faCheckCircle, faTrashAlt, faFilePdf, faEdit } from '@fortawesome/free-regular-svg-icons';
import { faBackspace, faHandPaper, faPencilRuler, faEnvelopeSquare, faInfoCircle, faEnvelopeOpenText, faMobile, faPhone,faMailBulk, faOtter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import {imprimir} from '../impresiones/registro';
import {scrollTop, hacerScroll} from '../Helpers/utilidades-globales';
import { Route } from 'react-router-dom'
import Calificaciones from '../componentes/Calificaciones';
import GrillaCalificaciones from '../componentes/GrillaCalificaciones';
import ListaCursosCriterios from '../componentes/ListaCursosCriterios';

export default function Curso({match,location}){

    //const nro_curso = match.params.id; // al ser pasado por params llega como string el id de curso
    const params = useParams();
    const nro_curso = params.id;

    const [alumnos,setAlumnos] = useState([])
    const {toggle, isShowing } = useModal();
    const [cargandoAlumnos,setCargandoAlumnos] = useState(false);
    const [inscribiendo,setInscribiendo] = useState(false);
    const [preguntarTipoInscripcion,setPreguntarTipoInscripcion]= useState(false)
    const {alumno, cambiarAlumno,cambiarMensaje, cuatrimestreActivo,habilitarBusquedaAlumnos} = useAlumno();
    const [tipoCursada,setTipoCursada]= useState(1); // regular por default
    const [alertas,setAlertas]= useState([]);
    const [yaInscripto,setYaInscripto]= useState(false);
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    const [contadorModificacionesFicha,setContadorModificacionesFicha]=useState(0);
    const [horarioSeleccionado,setHorarioSeleccionado]=useState(null);
    const [horarios,setHorarios] = useState([]);
    const [cursoActualizado,setCursoActualizado]=useState(null);
    const [abrirfichaConDelay, setAbrirfichaConDelay]=useState(false);
    const [listaEmails, setListaEmails]=useState([]);
    const [mostrarInfo, setMostrarInfo]=useState(false);
    const [hayUnError, setHayUnError]=useState(false);
    const [mostrarJsonAlumnos, setMostrarJsonAlumnos]=useState(false);
    const [cursoNoVigente,setCursoNoVigente]=useState(false);
    const [calificaciones,setCalificaciones] = useState([]);
    const [buscandoCalificaciones,setBuscandoCalificaciones]=useState(false);
    const [errorCalificaciones, setErrorCalificaciones] = useState(false);
    const [abrirCalificaciones, setAbrirCalificaciones] = useState(false);
    const [abrirAbmCurso, setAbrirAbmCurso] = useState(false);
    const [hayAlumnos, setHayAlumnos] = useState(false);
    const [mostrar, setMostrar] = useState(false);
    const [historialMateria, setHistorialMateria] = useState([]);

   
    // para activar el modal llamar a la función toggle en con alguna condicion o un evento...

    useEffect(()=>{
        habilitarBusquedaAlumnos()
        setHayUnError(false)
        buscarDatosDelCurso()
        // actualizo los datos del curso al entrar para no tener la info
                               // de la vista de cursos sino la real de la base de datos
                               // ya que puede haber habido algún cambio en el curso por otro usuario
                               // entre el momento en que se leyò la lista de cursos y el momento en 
                               // que entro al mismo
        // al principio solo usaba la info que venía desde el location.state (cursos) el
        // objeto cursoActualizado lo agregué más tarde así que algunos datos los tomo del
        // objeto cursoActualizado y otros de location.state... Debería tomar todo del primero para que sea màs limpio y màs claro

        setTimeout(()=>setAbrirfichaConDelay(true),200) 
        // uso el flag abrirfichaConDelay para asegurarme que el componente abm-curso
        // se renderice después de renderizar el componente padre
        // ya que el componente hijo (abm-curso) usa useEffect y useState y eso genera
        // un warning 
    },[contadorModificacionesFicha,nro_curso])

    useEffect(()=>{

    setCargandoAlumnos(true)

    buscarAlumnos()
        .then(data=>{
            setAlumnos(data);
            setCargandoAlumnos(false);
            setHorarios(data.map(item=>({comienzo:item.comienzo,id_alumno:item.id_alumno})))
            armarListaEmails(data,setListaEmails)
            verificarSiHayAlumnos(data,setHayAlumnos)
        })
        .catch(err=>{
            console.log(err);
            setCargandoAlumnos(false);
    
            const mensaje_html = `Se produjo un error al buscar los alumnos, encabezados o las calificaciones. ${err}`
            Swal.fire({
                html:mensaje_html,
                icon: 'warning',
                confirmButtonColor: '#3085d6',  
            })   
        });
    },[contadorOperaciones,contadorModificacionesFicha,nro_curso]) // para que se busquen los alumnos cada vez que se hizo una operació nueva
                                // y al cargar el componente, cada vez que se hace un alta o baja
                                // se incrementa el valor del contadorOperaciones y por cada cambio
                                // se dispara este effect. Es mejor usar un número que se incrementa
                                // a usar un booleano que habría que validar que el efecto se
                                // dispare en el true pero no en el false.
    useEffect(()=>{

        verificarYtratarAlumno() ;

    },[alumno.id, contadorOperaciones,cursoActualizado])
  /*  return <>
        <Modal hide={toggle} isShowing={isShowing}>
            <h1>SOY UN MODAL</h1>
        </Modal>
    </>
*/

useEffect(()=>{ // procesa los cierres de modales por boton cerrar y no por otro motivo
    if (!isShowing){
        if (abrirCalificaciones){
            setAbrirCalificaciones(false)
        }
     
        if(abrirAbmCurso){
            setAbrirAbmCurso(false)
        }
    }
},[isShowing])

useEffect(()=>{

    if(alumnos.length>0){
        buscarCalificaciones();
    }

    if(alumno.id){
        hacerVerificacionesDelAlumnoSeleccionado();
    }
},[alumnos]) // cada vez que se recargue la lista de alumnos por ejemplo por una inscripción
             // o una anulación vemos si un alumno esta seleccionado y verificamos si esta inscripto

const verificarYtratarAlumno = ()=>{
    console.log('alumno',alumno)
    if (alumno.id){

        buscarAlertasAlumnoMateria();
        buscarHistorialAlumnoMateria();
        hacerVerificacionesDelAlumnoSeleccionado();

    }else{

        setAlertas([])
    }
    setPreguntarTipoInscripcion(false)
}   

const buscarAlertasAlumnoMateria = async ()=>{
    try{
        const alertas = await Axios.get(`/api/alumnos/alertas/${alumno.id}/${cursoActualizado.id_materia}`)
        setAlertas(alertas.data)
    }catch(err){
        console.log(err)
    }
}

const buscarHistorialAlumnoMateria = async ()=>{
    try{
        const historial = await Axios.get(`/api/alumnos/historialm/${alumno.id}/${cursoActualizado.id_materia}`)
        console.log(historial.data)
        setHistorialMateria(historial.data)
    }catch(err){
        console.log(err)
    }
}

const finalizarCalificaciones=()=>{
    buscarAlumnos()
        .then(data=>setAlumnos(data))
        .catch(err=>console.log(err))
}   

const explicarError = (mensaje)=>{
    Swal.fire({
        html:`<p>${mensaje}</p>`,
        icon: 'warning',
        showConfirmButton: true
        //timer:4000
    })
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
        })
        .then(()=>{
            contadorModificacionesFicha(contadorModificacionesFicha+1)
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


async function buscarAlumnos(){

    try{           
        const {data} = await Axios.get(`/api/cursos/alumnos/${nro_curso}`)

        
        return data 

    }catch(err){
       
        return err
    }
}

const switchMostrar=()=>{
    if (mostrar){
        setMostrar(false)
    }else{
        setMostrar(true)
    }
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

function finalizarAltaOcopia (){

    setContadorModificacionesFicha(contadorModificacionesFicha+1); // para que traiga los cursos de nuevo

    toggle() // para que cierre el modal
}

const editarCurso = ()=>{
    setAbrirAbmCurso(true)
    toggle()
}

const iniciarCalificaciones = ()=>{
    setAbrirCalificaciones(true)
    toggle()
}

const hacerVerificacionesDelAlumnoSeleccionado = ()=>{

        const alumnoEstaInscripto = verSiYaInscripto(alumno.id,alumnos)
        console.log('verificando alumnos',alumnos)
        if (alumnoEstaInscripto){
            //cambiarColorAlAlumnoInscripto(alumno.id)
            setYaInscripto(true)
        }else{
            setYaInscripto(false)
        }

}

function finalizarModificacionFichaCurso(){
    setContadorModificacionesFicha(contadorModificacionesFicha+1)
    //scrollTop()
}

async function buscarDatosDelCurso(){
   // setCargandoAlumnos(true)
    try{           
        const {data} = await Axios.get(`/api/cursos/curso/${nro_curso}`)
        setCursoActualizado(data);
        if (data.id_cuatrimestre!=cuatrimestreActivo.id_cuatrimestre){
            setCursoNoVigente(true)
        }
    }catch(err){
        console.log(err);
    }
}

const inscribirAlumno = async ()=>{

    try{

        const objetoInscripcion = {
            id:Number(nro_curso), // como el n de curso se pasa por params llega como string
            id_alumno : Number(alumno.id),
            id_tipo_cursada : Number(tipoCursada),
//            tipo:location.state.grupal === 1 ? 'GRUPAL' : 'INDIVIDUAL',
//            hora_individual:location.state.grupal === 1 ? '' : horarioSeleccionado
            tipo:cursoActualizado.grupal === 1 ? 'GRUPAL' : 'INDIVIDUAL',
            hora_individual:cursoActualizado.grupal === 1 ? '' : horarioSeleccionado            
        }

        setInscribiendo(true);
        const resultado = await Axios.post('/api/cursos/inscripcion/',objetoInscripcion)
        
        setContadorOperaciones(contadorOperaciones+1)

        const mensaje_html = `<p>La inscripción se realizó con éxito</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })
          buscarDatosDelCurso(); // actualizo los datos del curso
          setInscribiendo(false);
          setPreguntarTipoInscripcion(false)  
    }catch(err){
        //cambiarMensaje(err.response.data)

        const mensaje_html = `<p>La inscripción falló</p><p>${err.response.data}</p>`

        Swal.fire({
            html:mensaje_html,
            text: err.response.data,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          }).then(respuesta=>{

                Swal.fire({
                    html: 'Actualizando datos del curso...',
                    timer: 2500,
                    onBeforeOpen: () => {
                        Swal.showLoading()
                    }
        
                })
                buscarDatosDelCurso(); // actualizo los datos del curso
                setContadorOperaciones(contadorOperaciones+1); // para que vuelva a traer los alumnos
                setInscribiendo(false);

            })
    }   
}

const cambiarTipoCursada = (e)=>{
    setTipoCursada(e.target.value)
}

const ejecutarCambioHorario = async (id_alumno,nuevoHorario)=>{
    const objetoCambioHorario = {
        id: Number(nro_curso),
        id_alumno:Number(id_alumno),
        nuevohorario : nuevoHorario
    }

    setInscribiendo(true);

    try{
        const resultadoDelCambio = await Axios.post('/api/cursos/alumno/cambiohora',objetoCambioHorario)

        setContadorOperaciones(contadorOperaciones+1)

        const mensaje_html = `<p>El cambio de horario se realizó con éxito</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })

        setInscribiendo(false);

    }catch(err){
        const mensaje_html = `<p>El cambio de horario falló</p><p>${err.response.data}</p>`

        Swal.fire({
            html:mensaje_html,
            text: err.response.data,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })

          setContadorOperaciones(contadorOperaciones+1)
          setInscribiendo(false);
        }
}

const eliminarAlumno = async (id_alumno)=>{
  /*  const objetoEliminarAlumno = {
        id: Number(nro_curso),
        id_alumno:Number(id_alumno)
    }
*/
    setInscribiendo(true);
    const _urlEliminar = `/api/cursos/alumno/${Number(nro_curso)}/${Number(id_alumno)}`

    try{
        const resultadoDelCambio = await Axios.delete(_urlEliminar)

        setContadorOperaciones(contadorOperaciones+1)

        const mensaje_html = `<p>Se eliminó al alumno del curso</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })

        setInscribiendo(false);

    }catch(err){
        const mensaje_html = `<p>La eliminación del curso falló</p><p>${err.response.data}</p>`

        Swal.fire({
            html:mensaje_html,
            text: err.response.data,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })

          setInscribiendo(false);
        }
}

const switchMostrarInfo = ()=>{
    if (mostrarInfo){
        setMostrarInfo(false)
    }else{
        setMostrarInfo(true)
    }
}

const iniciarEliminacion = (id,nombre)=>{
    Swal.fire({
        text:`Confirma la eliminación de ${nombre} del curso #${nro_curso} ?`,
        showCancelButton:true,
        confirButtonText:'Si, eliminar',
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                eliminarAlumno(id);
            }else{
                console.log("Eliminación cancelada")
            }
        }
    )
}

const iniciarInscripcion = ()=>{

    
    const pregunta = horarioSeleccionado != null && horarioSeleccionado!='' ? 
                        `Confirma la inscripción de ${alumno.nombre} al curso #${nro_curso} a las ${horarioSeleccionado} hs ?`
                        :
                        `Confirma la inscripción de ${alumno.nombre} al curso #${nro_curso} ?`

    Swal.fire({
        text: pregunta,
        showCancelButton:true,
        confirButtonText:'Si, inscribir',
        cancelButtonText:'Cancelar inscripción'
    }).then(
        resultado=>{
            if (resultado.value){
                inscribirAlumno();
            }else{
                console.log("Inscripción cancelada")
            }
        }
    )
}

if (cargandoAlumnos){
    return <Main center><Loading/><span className="cargando">Cargando alumnos...</span></Main>
};

if (inscribiendo){
    return <Main center><Loading/><span className="cargando">Inscribiendo...</span></Main>
};

if (!cursoActualizado){
    return <Main center><Loading/></Main>
}

if (false){
return <Main center><table>{
    alumnos.map(alumnoItem => {
        return (
            <div>
                {alumnoItem.descripcion}
              
    
            </div>
            )
        })
    }</table></Main>
}


if (cursoActualizado.grupal===1)
{
return(
<Main> 
    <div className="curso-cab border-bottom-solid-light">  
        <Link className="color-63 tdec-none" to="/cursos">
            <span className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera text-xsmall" title="Volver a cursos" >
                <FontAwesomeIcon className="color-tomato" icon={faBackspace}/> Volver 
            </span> 
        </Link>
            <span className="ml-2" title={cursoActualizado.Materia}><span className="text-smaller color-gray mr-2">Materia:</span>{cursoActualizado.cod_materia}</span>
            <span className="ml-2"><span className="text-smaller color-gray mr-2">Inscriptos:</span>{cursoActualizado.inscriptos}</span>
            
            <span className="text-smaller color-gray ml-2">Disponible:</span>
            {
                !cursoActualizado ? <span className='dispo-1 disponible wh-4'>?</span>
                : <span className={cursoActualizado.Disponibilidad>0 ? 'dispo-1 disponible wh-4 ml-2' : 'ml-2 wh-4 dispo-0 disponible'}>{cursoActualizado.Disponibilidad}</span>
            }

            {cursoNoVigente && <span className="error_formulario absolute right-10 top-45 bg-white blink p-2">Curso no vigente. Corresponde al {cursoActualizado.cuatrimestre}</span>}
            <span className="ml-2"><span className="text-smaller color-gray mr-2">Profesor:</span>{cursoActualizado.Profesor}</span>
            <span className="ml-2"><span className="text-smaller color-gray mr-2">Día:</span>{cursoActualizado.DiaHora}</span>
            <span className="ml-4 color-gray">{cursoActualizado.grupal ? 'Curso Grupal' : 'Curso Individual' }</span>  
            <span className="ml-2 color-gray">{cursoActualizado.mesa_examen ? 'Recuperatorio' : 'Regular' }</span>
    
            <Opciones
                hayAlumnos = {hayAlumnos}
                crearMailToListaEmails = {crearMailToListaEmails}
                listaEmails = {listaEmails}
                imprimir = {imprimir}
                cursoActualizado = {cursoActualizado}
                cuatrimestreActivo = {cuatrimestreActivo}
                switchMostrarInfo = {switchMostrarInfo}
                iniciarCalificaciones = {iniciarCalificaciones}
                editarCurso = {editarCurso}
                mostrarInfo = {mostrarInfo}
                mostrarTextos = {false}
            />
    </div>
      
        <div className={mostrar ? "flex f-row wrapper2 mostrar" : "flex f-row wrapper2 nomostrar"} onClick={switchMostrar}>

            <div id="slide2">
                <span onClick={switchMostrar} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera flex justify-content-end" >
                    { mostrar && <FontAwesomeIcon className="text-white" icon={faWindowClose}/>} 
                    { !mostrar && <FontAwesomeIcon title="Ver más cursos" className="mostrar-menu-lateral text-white" icon={faPlusSquare}/>}
                </span>  
                { mostrar && <div>
                    <p className="mt-4 mb-4 sub-titulo-cab-modal text-small">Otros cursos de {cursoActualizado.Profesor}</p>
                    <ListaCursosCriterios id_prof={cursoActualizado.id_prof} nro_curso={nro_curso}/>
                    <p className="mt-4 mb-4 sub-titulo-cab-modal text-small">Otros cursos de {cursoActualizado.Materia}</p>
                    <ListaCursosCriterios id_materia={cursoActualizado.id_materia} nro_curso={nro_curso}/>
                </div>}
            </div>
        </div>     
{ isShowing && abrirAbmCurso && 
        <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                        
            <AbmCurso cuatrimestreActivo={cuatrimestreActivo} 
            nro_curso={nro_curso} 
            finalizarAltaOcopia={finalizarAltaOcopia}
            esModal={true}
            />

        </Modal>
        
}
{
    isShowing && abrirCalificaciones && 
        <Modal hide={toggle} isShowing={isShowing} estilo={{width:'900px'}} estiloWrapper={{background:'#000000bf'}}>
            <GrillaCalificaciones nro_curso={nro_curso} 
                                  notas={true} 
                                  finalizarCalificaciones={finalizarCalificaciones} 
                                  observaciones={cursoActualizado.observaciones_cal} 
                                  grabarObservaciones={grabarObservaciones}/>
        </Modal>
}
    <div className="bg-blue color-63 p-4 rounded relative mt-25x">
          
    <Alertas alertas={alertas} historial={historialMateria}/> 

{ mostrarJsonAlumnos && <div style={{width: "100%"}}><p>{JSON.stringify(alumnos, null, "\t")}</p>
<p>{JSON.stringify(cursoActualizado, null, "\t")}</p>
</div> } 

<div className="contenedor-curso-grupal mb-8">
<table className="" id="table-curso">
            <thead className="">
                <tr className="">
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    {!mostrarInfo && <td scope="col">
                        {calificaciones.length > 0 && hayAlumnos && <Calificaciones encabezado={calificaciones[0]}/> }
                    </td>}

                </tr>
            </thead>
            { alumnos.length > 0?  
                <tbody>
                    
                {   
                    alumnos.map(alumnoItem => {
                    return (
                        <>
                        <tr className="border-bottom-solid" id={`ref${alumnoItem.id_alumno}`} key={uuidv4()}>
                            <td>
                                { horarios.length > 0 && <HorariosGrupales hora={alumnoItem.comienzo} 
                                            horarios={horarios} 
                                            alumno={{nombre:alumnoItem.nombre,id:alumnoItem.id_alumno}}
                                            setHayUnError={setHayUnError}/>}
                            </td>
                            <td className={definirElColor(alumnoItem.id_alumno,alumno.id)}>
                            {alumnoItem.nombre}
                            </td>
                            <td className="text-black">{alumnoItem.instrumentos}</td>
                            {/*<td className="text-white">{alumnoItem.descripcion}</td>*/}
                            <td className="text-white" dangerouslySetInnerHTML={createMarkup(alumnoItem.descripcion)}></td>                                                        
                            <td>
                                {alumnoItem.id_alumno >0 && <button title="Eliminar al alumno del curso" onClick={()=>iniciarEliminacion(alumnoItem.id_alumno,alumnoItem.nombre)}>
                                    <FontAwesomeIcon className="" icon={faTrashAlt}/>
                                </button>
                                }
                            </td>
                            { mostrarInfo && alumnoItem.id_alumno >0 && <td><Info celular={alumnoItem.celular}
                                                   email={alumnoItem.email}
                                                   telefono={alumnoItem.telefono}
                                                   Telef_Alternativo={alumnoItem.Telef_Alternativo}
                                                   Telef_Laboral={alumnoItem.Telef_Laboral} /></td>}
                            {<td>
                            {!mostrarInfo && calificaciones.length > 0 && alumnos.length > 0 && <Calificaciones encabezado={calificaciones[0]} notas={calificaciones.filter(item=>item.id_alumno === alumnoItem.id_alumno)}/> }
                            {buscandoCalificaciones && <div className="flex f-row acciones-lista-cabecera"><Loading/><span className="mr-4">Contando cantidad de cursadas de cada alumno...</span></div>}
                            {errorCalificaciones && <span title="Revise la ficha del curso. Es posible que el encabezado o régimen sean inválidos" className="error_formulario">Error al cargar las calificaciones</span>}

                            </td>}                           
                        </tr>

                        {/*{mostrarInfo && 
                        <tr>
                            <td></td>
                            <td colSpan="5" className="border-none">
                                  {calificaciones.length > 0 && alumnos.length > 0 && <Calificaciones encabezado={calificaciones[0]}/> }
                            </td>
                        </tr>}*/}
                        {mostrarInfo && <tr>
                            <td></td>
                            <td colSpan="5" className="border-none">
                                {calificaciones.length > 0 && alumnos.length > 0 && <Calificaciones encabezado={calificaciones[0]}/> }
                                {calificaciones.length > 0 && alumnos.length > 0 && <Calificaciones encabezado={calificaciones[0]} notas={calificaciones.filter(item=>item.id_alumno === alumnoItem.id_alumno)}/> }                            
                            </td>
                        </tr>}
                        </>
                        )
                    })
                }
            </tbody> 
            :
            <tbody>
                <tr>
                    <td>
                        <span className="text-black">No hay alumnos inscriptos</span>
                    </td>
                </tr>
            </tbody> 
            }
        </table>

        <div className="">


    {alumno.id && !yaInscripto && !preguntarTipoInscripcion && !hayUnError &&
        <div className="texto-inscribir mt-4 blink cursor-pointer"  onClick={()=>setPreguntarTipoInscripcion(true)}> 
            <span className="mr-4">Inscribir a {alumno.nombre}</span> 
            <FontAwesomeIcon icon={faEdit}/>
        </div>
    }
    {alumno.id && !yaInscripto && hayUnError &&
        /*<div className="text-black cursor-pointer"  onClick={()=>alert('El curso tiene un error')}> 
            <span className="mr-4">Error. No se puede inscribir</span> 
            <FontAwesomeIcon className="blink" icon={faHandPaper}/>
        </div>*/
        <div className="cursor-pointer text-black  mt-4"  onClick={()=>explicarError(`El curso tiene un error`)}> 
            <span className="mr-4 no-insc">Error. No se puede inscribir</span> 
            <FontAwesomeIcon className="blink color-tomato" icon={faHandPaper}/>
        </div>
    }    
    {alumno.id && yaInscripto && 
        <button onClick={()=>hacerScroll(alumno.id)}><span className="mr-4 color-63">{alumno.nombre} ya figura en este curso</span>
        <FontAwesomeIcon 
                        icon={faCheckCircle}/>
        </button>
    }
    {preguntarTipoInscripcion && 
        <PreguntaTipoInscripcion binddato={tipoCursada} 
                                 onchange={cambiarTipoCursada} 
                                 cerrar={()=>setPreguntarTipoInscripcion(false)}
                                 alumno={alumno}
                                 curso={cursoActualizado}
                                 inscribir={iniciarInscripcion}
        />
    }
    </div>
        </div>
      </div>
      {/*abrirfichaConDelay && <AbmCurso nro_curso={nro_curso} cuatrimestreActivo={cuatrimestreActivo} finalizarAltaOcopia={finalizarModificacionFichaCurso}/>*/}

</Main>)
} // fin si es curso grupal


//if (location.state.grupal===0)
if (cursoActualizado.grupal===0)
{
return(
<Main> 
<div className="curso-cab border-bottom-solid-light">  
        <Link className="color-63 tdec-none" to="/cursos">
            <span className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera text-xsmall" title="Volver a cursos" >
                <FontAwesomeIcon className="color-tomato" icon={faBackspace}/> Volver 
            </span> 
        </Link>
            <span className="ml-2" title={cursoActualizado.Materia}><span className="text-smaller color-gray mr-2">Materia:</span>{cursoActualizado.cod_materia}</span>
            <span className="ml-2"><span className="text-smaller color-gray mr-2">Inscriptos:</span>{cursoActualizado.inscriptos}</span>
            
            <span className="text-smaller color-gray ml-2">Disponible:</span>
            {
                !cursoActualizado ? <span className='dispo-1 disponible wh-4'>?</span>
                : <span className={cursoActualizado.Disponibilidad>0 ? 'dispo-1 disponible wh-4 ml-2' : 'ml-2 wh-4 dispo-0 disponible'}>{cursoActualizado.Disponibilidad}</span>
            }

            {cursoNoVigente && <span className="error_formulario absolute right-10 top-45 bg-white blink p-2">Curso no vigente. Corresponde al {cursoActualizado.cuatrimestre}</span>}
            <span className="ml-2"><span className="text-smaller color-gray mr-2">Profesor:</span>{cursoActualizado.Profesor}</span>
            <span className="ml-2"><span className="text-smaller color-gray mr-2">Día:</span>{cursoActualizado.DiaHora}</span>
            <span className="ml-4 color-gray">{cursoActualizado.grupal ? 'Curso Grupal' : 'Curso Individual' }</span>  
            <span className="ml-2 color-gray">{cursoActualizado.mesa_examen ? 'Recuperatorio' : 'Regular' }</span>
            <Opciones
                hayAlumnos = {hayAlumnos}
                crearMailToListaEmails = {crearMailToListaEmails}
                listaEmails = {listaEmails}
                imprimir = {imprimir}
                cursoActualizado = {cursoActualizado}
                cuatrimestreActivo = {cuatrimestreActivo}
                switchMostrarInfo = {switchMostrarInfo}
                iniciarCalificaciones = {iniciarCalificaciones}
                editarCurso = {editarCurso}
                mostrarInfo = {mostrarInfo}
                mostrarTextos = {false}
        />
    </div>
      
<div className={mostrar ? "flex f-row wrapper2 mostrar" : "flex f-row wrapper2 nomostrar"} onClick={switchMostrar}>

            <div id="slide2">
                <span onClick={switchMostrar} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera flex justify-content-end" >
                    { mostrar && <FontAwesomeIcon className="text-white" icon={faWindowClose}/>} 
                    { !mostrar && <FontAwesomeIcon title="Ver más cursos" className="mostrar-menu-lateral text-white" icon={faPlusSquare}/>}
                </span>  
                { mostrar && <div className="flex f-row">
                    <div>
                        <p className="mt-4 mb-4 sub-titulo-cab-modal text-small">Otros cursos de {cursoActualizado.Profesor}</p>
                        <ListaCursosCriterios id_prof={cursoActualizado.id_prof} nro_curso={nro_curso}/>
                        <p className="mt-4 mb-4 sub-titulo-cab-modal text-small">Otros cursos de {cursoActualizado.Materia}</p>
                        <ListaCursosCriterios id_materia={cursoActualizado.id_materia} nro_curso={nro_curso}/>
                    </div>
                    <div className="p-2 border-left-solid-white flex f-col">
                        <FontAwesomeIcon className="color-tomato" icon={faMailBulk}/>
                        <FontAwesomeIcon className="color-tomato" icon={faInfoCircle}/>
                        <FontAwesomeIcon className="color-tomato" icon={faFilePdf}/>
                    </div>
                </div>}
            </div>
        </div>         
{ isShowing && abrirAbmCurso && 
        <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                        
            <AbmCurso cuatrimestreActivo={cuatrimestreActivo} 
            nro_curso={nro_curso} 
            finalizarAltaOcopia={finalizarAltaOcopia}
            esModal={true}
            />
        </Modal>
}   
{
    isShowing && abrirCalificaciones && 
        <Modal hide={toggle} isShowing={isShowing} estilo={{width:'900px'}} estiloWrapper={{background:'#000000bf'}}>
            <GrillaCalificaciones nro_curso={nro_curso} 
                                  notas={true} 
                                  finalizarCalificaciones={finalizarCalificaciones} 
                                  observaciones={cursoActualizado.observaciones_cal}
                                  grabarObservaciones={grabarObservaciones}/>
        </Modal>
}
    <div className="bg-blue text-white p-4 rounded relative mt-25x">
        
        {/*<Cabecera id={nro_curso} cursoActualizado={cursoActualizado}/>*/}

        <Alertas alertas={alertas} historial={historialMateria}/>

{ mostrarJsonAlumnos && <div style={{width: "100%"}}><p>{JSON.stringify(alumnos, null, "\t")}</p>
<p>{JSON.stringify(cursoActualizado, null, "\t")}</p>
</div> } 
<div className="contenedor-curso-grupal mb-8">

<table className="" id="table-curso">
            <thead className="">
            <tr>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    <th scope="col"></th>
                    {!mostrarInfo &&<td scope="col">
                        {calificaciones.length > 0 && hayAlumnos && <Calificaciones encabezado={calificaciones[0]}/> }
                    </td>}

                </tr>
            </thead>
            { alumnos.length > 0?  
                <tbody>
                {  
                    alumnos.map(alumnoItem => {
                    return (
                        <>
                        <tr className="border-bottom-solid" id={`ref${alumnoItem.id_alumno}`} key={uuidv4()}>
                            <td className={definirElColor(alumnoItem.id_alumno,alumno.id)}>
                            {horarios.length>0 && <HorariosIndividuales hora={alumnoItem.comienzo} 
                                      horarios={horarios} 
                                      alumno={{nombre:alumnoItem.nombre,id:alumnoItem.id_alumno}}
                                      ejecutarCambioHorario={ejecutarCambioHorario}
                                      setHayUnError={setHayUnError}/>
                            }          
                            </td>
                            <td className={definirElColor(alumnoItem.id_alumno,alumno.id)}>
                                {
                                    alumnoItem.id_alumno===0 && alumno.id && !yaInscripto && !preguntarTipoInscripcion && !hayUnError &&
                                    <div className="ml-4 texto-inscribir cursor-pointer" onClick={()=>{
                                        setPreguntarTipoInscripcion(true)
                                        setHorarioSeleccionado(alumnoItem.comienzo)}}>
                                        <span className="mr-4">Inscribir a {alumno.nombre}</span> 
                                        <FontAwesomeIcon className="blink" icon={faEdit}/>
                                        <span className="ml-4">{alumnoItem.comienzo} hs.</span> 
                                    </div>
                                }    
                                {
                                alumnoItem.id_alumno > 0 && <span>{alumnoItem.nombre}</span>           
                                }

                                {alumnoItem.id_alumno===0 && alumno.id && horarioSeleccionado===alumnoItem.comienzo && preguntarTipoInscripcion && !hayUnError &&
                                        <PreguntaTipoInscripcion binddato={tipoCursada} 
                                                                onchange={cambiarTipoCursada} 
                                                                cerrar={()=>{setHorarioSeleccionado(null)
                                                                    setPreguntarTipoInscripcion(false)}}
                                                                alumno={alumno}
                                                                curso ={cursoActualizado}
                                                                inscribir={iniciarInscripcion}
                                        />
                                    }                                
                            </td>
                            <td className="text-black">{alumnoItem.instrumentos}</td>
                            <td className="text-white" dangerouslySetInnerHTML={createMarkup(alumnoItem.descripcion)}>
                            </td>
                            <td className="bg-blue">
                                {alumnoItem.id_alumno >0 && <button title="Eliminar al alumno del curso" onClick={()=>iniciarEliminacion(alumnoItem.id_alumno, alumnoItem.nombre)}>
                                    <FontAwesomeIcon className="" icon={faTrashAlt}/>
                                </button>
                                }
                            </td>
                            { mostrarInfo && alumnoItem.id_alumno >0 &&  <td className="relative"><Info celular={alumnoItem.celular}
                                                   email={alumnoItem.email}
                                                   telefono={alumnoItem.telefono}
                                                   Telef_Alternativo={alumnoItem.Telef_Alternativo}
                                                   Telef_Laboral={alumnoItem.Telef_Laboral} /></td>}
                             {!mostrarInfo &&<td>
                                {calificaciones.length > 0 && alumnoItem.id_alumno > 0 && <Calificaciones encabezado={calificaciones[0]} notas={calificaciones.filter(item=>item.id_alumno === alumnoItem.id_alumno)}/> }
                                {buscandoCalificaciones && <div className="flex f-row acciones-lista-cabecera"><Loading/><span className="mr-4">Contando cantidad de cursadas de cada alumno...</span></div>}
                                {errorCalificaciones && <span title="Revise la ficha del curso. Es posible que el encabezado o régimen sean inválidos" className="error_formulario" >Error al cargar las calificaciones</span>}
                             </td>}                                                    
                        </tr>
                        {/*{mostrarInfo && 
                        <tr>
                            <td></td>
                            <td colSpan="5" className="border-none">
                                  {calificaciones.length > 0 && alumnoItem.id_alumno > 0 && <Calificaciones encabezado={calificaciones[0]}/> }
                            </td>
                        </tr>}*/}
                        {mostrarInfo && 
                        <tr>
                            <td></td>
                            <td colSpan="5" className="border-none">
                                {calificaciones.length > 0 && alumnoItem.id_alumno > 0 && <Calificaciones encabezado={calificaciones[0]}/> }
                                {calificaciones.length > 0 && alumnoItem.id_alumno > 0 && <Calificaciones encabezado={calificaciones[0]} notas={calificaciones.filter(item=>item.id_alumno === alumnoItem.id_alumno)}/> }                            
                            </td>
                        </tr>}                        
                        </>
                        )
                    })
                }
            </tbody> 
            :
            <tbody>
                <tr>
                    <td>
                        <span className="text-black">No hay alumnos inscriptos</span>
                    </td>
                </tr>
            </tbody> 
            }
        </table>
        {alumno.id && !yaInscripto && hayUnError &&
        <div className="cursor-pointer text-black  mt-4"  onClick={()=>explicarError(`El curso fue creado como individual pero no se asignaron horarios individuales. Debería modificar el curso y deshabilitar el casillero de Intervalos Horarios`)}> 
            <span className="mr-4 no-insc">Error. No se puede inscribir</span> 
            <FontAwesomeIcon className="blink color-tomato" icon={faHandPaper}/>
        </div>
        }  
        </div>  
      </div>
     
      {/*abrirfichaConDelay && <AbmCurso nro_curso={nro_curso} cuatrimestreActivo={cuatrimestreActivo}/>*/}
</Main>)
} // fin si es curso grupal

}


function PreguntaTipoInscripcion ({cerrar,onchange, binddato, alumno, inscribir,curso}){
    let tipos = [];

    if (curso.mesa_examen){
        tipos = [0,"Recuperatorio"]

    }else{
        tipos = [0,"Regular","Recursada","Libre","Invitado"]
    }

    return (
        <div className="mr-4 ml-4">
            <span className="mb-2 inline-block-1 text-black">{`¿Cómo desea inscribir a ${alumno.nombre}?`}</span>
            <div className="flex f-col">
            <div className="flex f-row">
                {curso.mesa_examen==false && <select onChange={onchange} value={binddato} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                    <option key="tipos1" value="1">{tipos[1]}</option>
                    <option key="tipos2" value="2">{tipos[2]}</option>
                    <option key="tipos3" value="3">{tipos[3]}</option>
                    <option key="tipos4"  value="4">{tipos[4]}</option>
                </select> }
                {curso.mesa_examen==true && <select onChange={onchange} value={binddato} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                    <option key="tipos1" value="1">{tipos[1]}</option>
                </select>}                
                <button><FontAwesomeIcon  className="text-black"
                                icon={faWindowClose} 
                                title="Cancelar"
                                onClick={cerrar}/>
                            </button>
                <button className="text-black" onClick={inscribir}>Inscribir como {tipos[binddato]}
                    <FontAwesomeIcon className="text-black ml-2"
                        icon={faCheckCircle}/>
                </button>
            </div>                              
            </div>   
                      
        </div>
    )
}    

function Info({email,celular,telefono,Telef_Alternativo,Telef_Laboral,Email_Secundario}){
    return (                
    <div className="max-w-sm rounded overflow-hidden ml-4 text-black">
            <div className="px-6 py-4 mb-2">
                      <span title="Teléfono" className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 mr-2">
                                <FontAwesomeIcon icon={faPhone}></FontAwesomeIcon>  {telefono}     
                         </span>
                        <span title="Teléfono alternativo" className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 mr-2">
                                {Telef_Alternativo}       
                         </span>                        
                        <span title="Teléfono laboral" className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2 mr-2">
                                {Telef_Laboral}     
                        </span>    
                        <span title="Celular" className="whitespace-no-wrap inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2    ">
                                <FontAwesomeIcon icon={faMobile}></FontAwesomeIcon>{celular}     
                        </span>    
                                                    
                        <div className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2    ">
                                <FontAwesomeIcon icon={faEnvelopeOpenText}></FontAwesomeIcon>
                                <a target="_blank" className="mr-2 ml-2" href={crearMailToIndividual(email)} title="E-mail principal">{email}</a> 
                                <a target="_blank" className="mr-2 ml-2" href={crearMailToIndividual(Email_Secundario)} title="E-mail secundario">{Email_Secundario}</a>      
                        </div>     
                </div>
  </div>
    )       
}

function createMarkup(codigo) { return {__html: codigo}; };

function Alertas({alertas,historial}){

    if (alertas.length===0){
        return null
    }

    return(
        <div className="max-w-sm overflow-hidden shadow-lg mb-2 p-2 AlertaContainer contenedor-curso-grupal">
        <div className="px-6 py-4">
            <div className="mb-2 bg-tomato text-white"> <FontAwesomeIcon className="blink" icon={faHandPaper}/> Alertas</div>
            <p className="text-gray-700 text-base">
                {alertas[0].mensaje}
            </p>
            <Historial historial={historial}/>
        </div>  
        <div className="px-6 py-4">
            <div className="flex f-col al-lis">
            {alertas.map(
               (item)=>{
                   return(
                    <span key={item.id_materia} className={item.descripcion ? "alerta inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2" : ''}>
                    {item.descripcion}        
                </span>
                   )
               } 
            )}
            </div>
        </div>
    </div>)}

function Algo(){
    return <h1>algo</h1>
}
function verSiYaInscripto(id,vector){
    let resultado = true;

    console.log('el vector de alumnos del curso',vector)
    console.log('el id del alumno',id)

    const verificar = vector.findIndex(item=>item.id_alumno===id)

    if (verificar===-1){
        resultado=false;
    }

    return resultado;
}

function definirElColor(id_alumno_tabla,id_alumno_seleccionado){
    return  id_alumno_tabla===id_alumno_seleccionado ? "bg-alumnoInscripto" : "filas-lista-principal";
}


function HorariosIndividuales({hora,alumno,horarios,ejecutarCambioHorario,setHayUnError}){
   // const [horarioIndividual,setHorarioIndividual] = useState(hora)
   // no hace falta que use un estado con useState pero SE PUEDE USAR AQUI

    const cambiarHorarioIndividual = (e)=>{

        const nuevoHorario = e.target.value;

        Swal.fire({
            text:`Confirma el cambio de horario de ${hora} a ${nuevoHorario} para el alumno ${alumno.nombre} ?`,
            showCancelButton:true,
            confirButtonText:'Si, cambiar el horario',
            cancelButtonText:'Cancelar'
        }).then(
            resultado=>{
                if (resultado.value){
                    ejecutarCambioHorario(alumno.id,nuevoHorario)
                }else{
//                    setHorarioIndividual(e.target.value)
                    e. preventDefault();
                }
            }
        )
    }

    if (horarios.length===0){
        setHayUnError(true)
        return <span className="error_formulario">Error</span>
    }

    const horasDelVectorHorarios = horarios.filter(item=>item.comienzo.length>0)
    if (horasDelVectorHorarios.length===0){
        setHayUnError(true)
        return <span className="error_formulario" title="El curso fue creado como individual pero no se asignaron horarios individuales. Debería modificar el curso y deshabilitar el casillero de Intervalos Horarios">Error</span>
    }


    const disabled = alumno.id === 0 ? true : null

    return (
        <select disabled={disabled} value={hora} onChange={cambiarHorarioIndividual}>
            {horarios.map(
                item=>{ return(
                item.comienzo===hora ? 
                <option key={uuidv4()} disabled value={item.comienzo}>{item.comienzo}</option>
                : item.comienzo.length===0 ? 'Error' : <option key={item.comienzo} value={item.comienzo}>{item.comienzo}</option>)}
                )
            }
        </select>
    )
}

function HorariosGrupales({hora,alumno,horarios,setHayUnError}){
    // const [horarioIndividual,setHorarioIndividual] = useState(hora)
    // no hace falta que use un estado con useState pero SE PUEDE USAR AQUI
 
    
     if (horarios.length===0){
        setHayUnError(true)
         return <span className="error_formulario">Error</span>
     }
 
     const horasDelVectorHorarios = horarios.filter(item=>item.comienzo.length>0)

     
     if (horasDelVectorHorarios.length>0){
         setHayUnError(true)
         return <span className="error_formulario" title="El curso fue creado como grupal pero se asignaron horarios individuales. Debería modificar el curso y marcar el casillero de Intervalos Horarios">Error</span>
     }
 
     return null // si no hubo errores devolver nulo porque un curso grupal no necesita mostrar un horario en la primer columna
              // el propósito de esta función es detectar cursos grupales tratados como individuales
     
 }


function Cabecera({id,cursoActualizado}){

    console.log('cursoActualizado',cursoActualizado)

return <div className="cableft-detalle-cursos absolute cabecera-detalle-curso">
        <Link className="color-63 tdec-none" to="/cursos">
        <span className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" title="Volver a cursos" >
                <FontAwesomeIcon className="color-tomato" icon={faBackspace}/> Volver 
            </span> 
        </Link>

</div>  
}

function ListaUltimosCursos(){
    const cursos = [{"id":6691,"materia":"EMO","profesor":"Teodoro Cromberg","fecha":"13/06/20            14:00"},{"id":6690,"materia":"ART1","profesor":"Tomás Babjackzuk","fecha":"12/06/20            20:17"},{"id":6689,"materia":"ENJ (D)","profesor":"Juan Cruz Urquiza","fecha":"12/06/20            20:10"},{"id":6688,"materia":"AHT","profesor":"Julio Aguirre","fecha":"12/06/20            20:03"},{"id":6687,"materia":"ART3","profesor":"Sebastián Bazán","fecha":"12/06/20            20:02"},{"id":6686,"materia":"ART3","profesor":"Sebastián Bazán","fecha":"12/06/20            19:53"},{"id":6685,"materia":"EAP4","profesor":"Sebastián Bazán","fecha":"12/06/20            19:48"},{"id":6683,"materia":"ARR2","profesor":"Daniel Johansen","fecha":"28/03/20            20:11"},{"id":6682,"materia":"CPC","profesor":"Nora Olga Malatesta","fecha":"28/03/20            20:06"},{"id":6681,"materia":"ENJ","profesor":"Ricardo Nole","fecha":"27/03/20            14:33"}]


    return(<div className="contenedor-uc"> Ultimos cursos creados
        {
            cursos.map(item=>{
                return (
                <Link key={`ult-cur${item.id}`} className="color-63" 
                                to={{
                                    pathname: `/cursos/${item.id}`,
                                    state: {nro_curso:item.id}
                                }}> 
                <span className="ultimos-cursos" title={`${item.materia}\n${item.profesor}\nCreado el ${item.fecha}`}>{item.id}</span>
                            </Link> 
            )
                })
        }
    </div>

    )
}


const Button = () => (
  <Route render={({ history}) => (
    <button
      type='button'
      onClick={() => { history.push('/cursos/6680') }}
    >
      Click Me!
    </button>
  )} />
)

function armarListaEmails(alumnos,setListaEmails){

    const emails = alumnos.filter(item=>item.email.trim()!='').map(item=>item.email)

    setListaEmails(emails)
}

function crearMailToListaEmails(listaEmails){
    return listaEmails.length>0 ? `mailto: ${listaEmails}` : ``
}

function crearMailToIndividual(email){
    return email!=null && email!='' ? `mailto: ${email}` : ``
}

function verificarSiHayAlumnos(lista,setHayAlumnos){
    if(!lista){
        setHayAlumnos(false)
        return
    }

    if(lista.length==0){
        setHayAlumnos(false)
        return
    }

    // Si el tipo de curso es individual la lista no puede venir vacía porque trae los horarios aunque no haya alumnos inscriptos
    // Si el tipo de curso es grupal puede venir vacía si no hay alumnos inscriptos
    if(lista[0].tipo=='GRUPAL'){
        if (lista.length>0){
            setHayAlumnos(true)
        }else{
            setHayAlumnos(false)
        }
    }else{
        const verificacion = lista.some(item=>item.id_alumno>0)
        if (verificacion){
            setHayAlumnos(true)
        }else{
            setHayAlumnos(false)
        }
    }

}

function Historial({historial}){
    return <div>
        {historial.length > 0 && <div>
        <span className="mt-4 mb-2 text-small inline-block-1 border-bottom-solid-light">Historial de cursadas de la materia</span>
        <table className="hist-mat">
            <thead>
                <tr>
                    <td>Cuatrimestre</td>
                    <td>Profesor</td>
                    <td>Promedio</td>
                    <td>Tipo</td>
                </tr>
            </thead>
            <tbody>
        {historial.map(item=>{return <tr>
                        <td>{item.nombre}</td>
                        <td>{item.profesor}</td>
                        <td>{item.promedio}</td>
                        <td>{item.tipo}</td>
                    </tr>})}    
            </tbody>
        </table>
        </div>}
    </div>
}

function Opciones({hayAlumnos,
                    crearMailToListaEmails,
                    listaEmails,
                    imprimir,
                    cursoActualizado,
                    cuatrimestreActivo,
                    switchMostrarInfo,
                    iniciarCalificaciones,
                    mostrarInfo,
                    mostrarTextos,
                    editarCurso}){
   return <div className={ mostrarTextos ? "botonNc flex f-row" : "ml-6 inline-block-1"}>
    {hayAlumnos > 0 && <>
        <a title='Mail grupal' className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" target="_blank" href={crearMailToListaEmails(listaEmails)}>
            <FontAwesomeIcon className="color-tomato" icon={faMailBulk}/> {mostrarTextos ? 'Mail grupal' : ''}
        </a> 
        <span title={mostrarInfo ? ' Ocultar info de contacto' : ' Mostrar info de contacto'} onClick={switchMostrarInfo} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
            <FontAwesomeIcon className="color-tomato" icon={faInfoCircle}/> {mostrarTextos ? mostrarInfo ? ' Ocultar info de contacto' : ' Mostrar info de contacto' : '' } 
        </span> 
    </>}    
        <span title='Imprimir Registro' onClick={()=>imprimir(false,cursoActualizado,cuatrimestreActivo)} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
            <FontAwesomeIcon className="color-tomato" icon={faFilePdf}/> {mostrarTextos ? 'Imprimir Registro' : ''}
        </span> 
        <span title="Editar la cabecera del curso" onClick={()=>editarCurso()} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
            <FontAwesomeIcon className="color-tomato" icon={faEdit}/> {mostrarTextos ? 'Editar la cabecera del curso' : ''}
        </span> 
        { hayAlumnos && <span title="Calificar" onClick={()=>iniciarCalificaciones()} className="cursor-pointer mr-2 ml-2 acciones-lista-cabecera" >
            <FontAwesomeIcon className="color-tomato" icon={faPencilRuler}/> {mostrarTextos ? 'Calificar' : ''}
        </span>}             
    </div>
}