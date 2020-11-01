import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import Main from '../componentes/Main';
import Modal from '../componentes/Modal';
import useModal from '../hooks/useModal';
import { Link } from 'react-router-dom';
import Loading from '../componentes/Loading';
import {useAlumno} from '../Context/alumnoContext';
import AbmCurso from '../abms/abm-curso';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle,faCircle,faWindowClose, faCopy, faPlusSquare, faEdit,faFilePdf, faCalendar } from '@fortawesome/free-regular-svg-icons';
import { faTrash,faAngleLeft,faAngleRight, faSync,faUsers,faSearch } from '@fortawesome/free-solid-svg-icons';
import {imprimir} from '../impresiones/registro';
import BusquedaCursos from '../componentes/BusquedaCursos';
import CronogramaCursos from '../componentes/CronogramaCursos';
import Swal from 'sweetalert2';

import {scrollTop, hacerScroll} from '../Helpers/utilidades-globales';


       
export default function Cursos({match,history}){

    const anchoPaginacion = 40;

    const [cursos,setCursos] = useState([])
    const [cursosAmostrar,setCursosAmostrar]=useState([])
    const {toggle, isShowing } = useModal();
    const [materias, setMaterias ] = useState([]);
    const [profesores, setProfesores ] = useState([]);
    const [tipos, setTipos ] = useState([]);
    const [dias, setDias ] = useState([]);
    const [criterio, setCriterio ] = useState('original');
    const [dia,setDia]=useState(-1);
    const [tipo,setTipo]=useState(-1);
    const [profesor,setProfesor]=useState(-1);
    const [materia,setMateria]=useState(-1);
    const [tipoCurso,setTipoCurso]=useState(-1); // 0 Regular 1 Recuperatorio
    const [grupalIndividual,setGrupalIndividual]=useState(-1); // 0 individual 1 grupal
    const [cursosRecuperatorios,setCursosRecuperatorios]= useState(-1);
    // para activar el modal llamar a la función toggle en con alguna condicion o un evento...
    const [cargandoCursos,setCargandoCursos] = useState(false);
    const {cuatrimestreActivo, habilitarBusquedaAlumnos,desHabilitarBusquedaAlumnos} = useAlumno();
   // const {alumno, cambiarAlumno} = useAlumno();
    const [crearCurso,setCrearCurso]=useState(false);
    const [cursoAcopiar,setCursoAcopiar]=useState(null);
    const [cursoAeditar,setCursoAeditar]=useState(null);
    const [copiarUnCurso, setCopiarUnCurso] = useState(false);
    const [editarUnCurso, setEditarUnCurso] = useState(false);
    const [contadorOperaciones, setContadorOperaciones]= useState(0);
    const [ultimosCursosCreados, setUltimosCursosCreados ]= useState([]);
    const [buscarCursosNoVigentes,setBuscarCursosNoVigentes]= useState(false);
    const [verCursosPorDia,setVerCursosPorDia]= useState(false);
    const prueba = match.params.id;

    const [iIni, setIini]=useState(0)
    const [iFin, setIfin]=useState(anchoPaginacion-1)
    const [hayFiltrosActivos,setHayFiltrosActivos]=useState(false)

    const [orden,setOrden]=useState('descripcion')
    const [nuevoCampo,setNuevoCampo]=useState(true)
    const [contadorOrden,setContadorOrden]=useState(0)
    const [cantidadFilas,setCantidadFilas]=useState(0);

    useEffect(()=>{

    const buscarCursos = async ()=>{

        habilitarBusquedaAlumnos();
//        desHabilitarBusquedaAlumnos();    

        setCargandoCursos(true)
        try{          
            /*const {data} = await Axios.get(`/api/cursos/all/${cuatrimestreActivo.id_cuatrimestre}`)
            setCursos(data)
            listarUltimoCursosCreados(data,setUltimosCursosCreados)
            setCargandoCursos(false)*/

            const vectorResultado = await Promise.all([Axios.get(`/api/cursos/all/${cuatrimestreActivo.id_cuatrimestre}`),
                                                      Axios.get(`/api/cursos/altasrecientes`)])
           /*setCursos(vectorResultado[0].data)

            setUltimosCursosCreados(vectorResultado[1].data)

             setCargandoCursos(false)      */
            setUltimosCursosCreados(vectorResultado[1].data)

            const data_mas_selector = vectorResultado[0].data.map((item)=>{return{...item,seleccion:false}})
            // agrego el campo seleccion para los checkbox
            const cursosOrdenadosPorMateria = await ordenarCursosPorMateria(data_mas_selector)
            
            setCursos(cursosOrdenadosPorMateria)

            setCargandoCursos(false)

        }catch(err){
            console.log(err)
            setCargandoCursos(false)
        }
    }
        
        buscarCursos()
    },[cuatrimestreActivo,contadorOperaciones])

   /* useEffect(()=>{
        console.log(`la prueba es ${prueba}`)
        history.push('/cursos/6680')
    },[prueba])
*/
    useEffect(()=>{ // procesa los cierres de modales por boton cerrar y no por otro motivo
        if (!isShowing){
            if (crearCurso){
                setCrearCurso(null)
            }
            if (copiarUnCurso){
                setCopiarUnCurso(false)
            }
            if (editarUnCurso){
                setEditarUnCurso(false)
            }        
            if(buscarCursosNoVigentes){
                setBuscarCursosNoVigentes(false)
            }
            if(verCursosPorDia){
                setVerCursosPorDia(false)
            }
            
        }
    },[isShowing])

useEffect(()=>{
    resetLista()
},[contadorOrden])
    
useEffect(()=>{
  // Comentario 281020201353 
  // agrego esta validacion para que redefina la paginacion solo si cambió la cantidad de filas a mostrar
  // Validación necesaria despuès de agregar el campo seleccion para el checkbox porque salta este evento
  // si cambia el vector cursosAmostrar por la seleccion y cambia la paginacion y no es normal
  if(cantidadFilas!=cursosAmostrar.length){
    definirValoresPaginacion(cursosAmostrar,iIni,iFin,setIini,setIfin,anchoPaginacion)
  }

    
    if (cursosAmostrar.length != cursos.length){
        setHayFiltrosActivos(true)
    }else{
        setHayFiltrosActivos(false)
    }

// comentario 281020201355
// se hace esta asignacion para la validacion de arriba, ver comentario 281020201353
setCantidadFilas(cursosAmostrar.length)

},[cursosAmostrar])

    useEffect(()=>{
            const materias = materiasDeLosCursos()
            setMaterias(materias)
            const profesores = profesoresDeLosCursos()
            setProfesores(profesores)
            const dias = diasDeLosCursos()
            setDias(dias)
            const tipos = tiposDeLosCursos()
            setTipos(tipos)


            setCursosAmostrar(cursos)
    },[cursos])

    useEffect(()=>{
        resetLista()
    },[cursosRecuperatorios,profesor,grupalIndividual,materia,dia,tipoCurso])

  /*  return <>
        <Modal hide={toggle} isShowing={isShowing}>
            <h1>SOY UN MODAL</h1>
        </Modal>
    </>
*/

/*function finalizarAltaOcopia (confirmado){
    // puede finalizar porque confirmó y creó un curso nuevo o porque lo canceló

    setCopiarUnCurso(false);
    setCrearCurso(false);
    setEditarUnCurso(false)

    if(confirmado){ // si finalizar porque creó incrementamos contadorOperaciones para que se
                    // active el useEffect que trae los datos de los cursos otra vez
        setContadorOperaciones(contadorOperaciones+1);
    }

    scrollTop()
}*/

const resetLista=()=>{

    const filtrarVectorCursosOriginal = cursos.filter(item=>
            ((item.nombre == profesor && profesor!='-1')||
                profesor=='-1')
            && ((item.grupal == grupalIndividual && grupalIndividual != '-1') ||
                grupalIndividual=='-1')
            && ((item.descripcion == materia && materia != '-1') ||
                materia=='-1')
            && ((item.DiaHora == dia && dia != '-1') ||
                dia=='-1')
            && ((item.tipo == tipoCurso && tipoCurso != '-1') ||
                tipoCurso=='-1')
            && ((item.alerta == cursosRecuperatorios && cursosRecuperatorios != '-1') ||
                cursosRecuperatorios=='-1')                                                
            ) 
            .sort((a,b)=>{return comparacion(a,b)})
    
         setCursosAmostrar(filtrarVectorCursosOriginal)

}

const ordenarCursosPorMateria = async (vectorCursos)=>{

    // si no quisiera modificar el orden original debería hacer una copia pero la idea aqui
    // es alterar el orden que viene del stored y ordenar por materia

    vectorCursos.sort((a,b)=>{
        return a.descripcion.localeCompare(b.descripcion)
    })

    return vectorCursos

}

function finalizarAltaOcopia (altaOcopiaConfirmada){

    //altaOcopiaConfirmada es un flag booleano que viene en true si se grabó pero si se canceló
    // sin grabar trae null o falso

    if (altaOcopiaConfirmada){
        setContadorOperaciones(contadorOperaciones+1); // para que traiga los cursos de nuevo
    }

    // ATENCION: Cuando es un alta o copia el abm tiene un botòn de cerrar propio
    // que queda encima del botòn cerrar del MODAL como queda arriba se ejecuta la función
    // cancelar abm que llama a finalizarAltaOcopia(false)
    //es decir que en alta o copia hay 2 BOTONES

    //En el caso de una modificación este botón no se habilita por lo tanto existe solo el botón
    // del MODAL que al cerrar no llama a finalizaraltaocopia

    // esta lógica se hizo cuando el abm funcionaba directamente sobre la vista y no con el modal

    // REVISAR...

    console.log('pasapasa')
    setCopiarUnCurso(false);
    setCrearCurso(false);
    setEditarUnCurso(false)
    setCursoAeditar(null)
    setCursoAcopiar(null)

    toggle() // para que cierre el modal
}

const materiasDeLosCursos = ()=>{

    return cursos.map(item=>item.descripcion).sort().filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const profesoresDeLosCursos = ()=>{

    return cursos.map(item=>item.nombre).sort().filter((item,index,vector)=>
        item != vector[index-1])
   
}

const diasDeLosCursos = ()=>{
    // aquì ordeno al array por id de dia en lugar de ordenarlo alfabeticamente si no Jueves vendría primero que Lunes
    // no hago el sort directamente sobre cursos porque modificaría el orden del original
    // hago una copia y devuelvo esta

 /*  return copia.sort((a,b)=>a.dia - b.dia).map(item=>item.DiaHora).filter((item,index,vector)=>
    item != vector[index-1] )
*/
    const copia = [...cursos]; // trabajar sobre una copia sino modifica el orden original del vector por descripcion de la materia

    return copia.sort((a,b)=>a.dia - b.dia).map(item=>item.DiaHora).filter((item,index,vector)=>
        item != vector[index-1] )
   
}

const tiposDeLosCursos = ()=>{

    return ['I','G']
   
}

const refrescarLista = ()=>{
    setContadorOperaciones(contadorOperaciones+1)
}

const handleChangeSelectProfesores = (e)=> {
    
   setProfesor(e.target.value)

// el resto de la acciòn se ejecuta en el useEffect

}

const handleChangeSelectMaterias = (e)=> {

 
   setMateria(e.target.value)

     // el resto de la acciòn se ejecuta en el useEffect

}

const funcionOrden = (nombre_campo)=>{

    if (orden==nombre_campo){
        setNuevoCampo(false)
    }else{
        setNuevoCampo(true)
    }

    setOrden(nombre_campo)
    setContadorOrden(contadorOrden+1)

}

const comparacion = (a,b)=>{

    switch (orden){
        case null : return 0 
        case 'alerta':
        case 'nota':
        case 'grupal':
        case 'nro_curso':
    
        if(nuevoCampo==true){
                return a[orden] - b[orden]
            }else{
                if (contadorOrden%2==0){
                    return b[orden] - a[orden]
                }else{
                    return a[orden] - b[orden]
                }
            }
            case 'f_solicitud':
    
                const dia_a = Number(a[orden].substring(0,2));
                const mes_a  = Number(a[orden].substring(3,5));
                const anio_a = Number(a[orden].substring(6,10));
    
                const fa = new Date(anio_a,mes_a,dia_a);
    
                const dia_b = Number(b[orden].substring(0,2));
                const mes_b  = Number(b[orden].substring(3,5));
                const anio_b = Number(b[orden].substring(6,10));
    
                const fb = new Date(anio_b,mes_b,dia_b);
    
                if(nuevoCampo==true){
                    return fa-fb
                }else{
                    if (contadorOrden%2==0){
                        return fb-fa
                    }else{
                        return fa-fb
                    }
                }        
        default : 
            if(nuevoCampo==true){
                return a[orden].localeCompare(b[orden])
            }else{
                if (contadorOrden%2==0){
                    return b[orden].localeCompare(a[orden])
                }else{
                    return a[orden].localeCompare(b[orden])
                }
            }
    }
    
}

const handleChangeSelectDias = (e)=> {

  setDia(e.target.value)

// El resto de la acción se ejecuta en el useEffect
}

const handleChangeSelectTipos = (e)=> {

    setTipoCurso(e.target.value);
  // El resto de la acción se ejecuta en el useEffect

}

const limpiarFiltros = ()=> {

    setDia(-1);
    setTipo(-1);
    setProfesor(-1);
    setMateria(-1);
    setCursosRecuperatorios(-1);
    setTipoCurso(-1);
    setGrupalIndividual(-1)
   
     
    const vectorOrdenado = ordenarVector(cursos)
   
    setCursosAmostrar(vectorOrdenado)
}

const limpiarCursoRecuperatorio = ()=> {
    setCursosRecuperatorios(-1);
}

const limpiarProfesor = ()=> {
    setProfesor(-1);
}

const limpiarGrupalIndividual = ()=> {
    setGrupalIndividual(-1);
}

const limpiarMateria = ()=> {
    setMateria(-1);
}

const limpiarDia = ()=> {
    setDia(-1);
}

const limpiarTipoCurso = ()=> {
    setTipoCurso(-1);
}

const handleChangeSelectME = (e)=> {

    const valorBooleano = e.target.value==="true" ? true: false;

    setCursosRecuperatorios(valorBooleano);
// El resto de la acción se ejecuta en el useEffect

}

const handleChangeSelectGrupalIndividual = (e)=> {

    setGrupalIndividual(e.target.value)
// El resto de la acción se ejecuta en el useEffect

}
const copiarCurso = (id)=>{
    setCopiarUnCurso(true)
    setCrearCurso(false)
    setEditarUnCurso(false)
    setCursoAcopiar(id)
    toggle()
    /*setTimeout(() => {
        hacerScroll("nuevo-curso")
    }, 600);*/
}

const editarCurso = (id)=>{
    setCopiarUnCurso(false)
    setEditarUnCurso(true)
    setCrearCurso(false)
    setCursoAeditar(id)
    toggle()

    /*setTimeout(() => {
        hacerScroll("nuevo-curso")
    }, 600);*/
}

const cambiarTipoCurso = (e)=>{
    // viene Standard, Ensamble o Instrumental
    setTipoCurso(e.target.value)
}


const cambiarCursosRecuperatorios = (e)=>{
    // viene 1 o 0 para indicar si es o no recuperatorio 
    setCursosRecuperatorios(e.target.value)
}

const handleChangeSelectTipo = (e)=> {

    setTipo(e.target.value);
    setDia(-1);
    setProfesor(-1);
    setMateria(-1);
    setGrupalIndividual(-1)

    const tipoAbuscar =  e.target.value ==="I" ? 0 : 1;

    const filtrarVectorCursosOriginal = cursos.filter(item=>item.grupal===tipoAbuscar)
    setCursosAmostrar(filtrarVectorCursosOriginal)

}

/*const iniciarNuevoCurso = ()=>{
    setCrearCurso(true);
    
    setTimeout(() => {
        hacerScroll("nuevo-curso")
    }, 600);
}*/

const cambiarCheck =(e)=>{

    const aux3 = cursosAmostrar.map(item=>{
        if (item.nro_curso!=e.target.value){
            return item
        }else{
            return {...item,seleccion:!item.seleccion}
        }
    })

    setCursosAmostrar(aux3)
}

const marcarTodo =()=>{
    const aux = cursosAmostrar.map(item=>{return {...item,seleccion:true}})
    setCursosAmostrar(aux)
}

const desMarcarTodo =()=>{
    const aux = cursosAmostrar.map(item=>{return {...item,seleccion:false}})
    setCursosAmostrar(aux)
}

const gestionarChecks = (marcarTodos)=>{

    if (marcarTodos){
        marcarTodo();
    }else{
        desMarcarTodo();
    }
}  

const imprimirRegistros = ()=>{
    
    const cursos_seleccionados = cursosAmostrar.some(item=>item.seleccion==true)

    if(!cursos_seleccionados){
        alert('No hay cursos seleccionados')
        return
    }

    const seleccionados = cursosAmostrar.filter(item=>item.seleccion==true)

    const html = `Registros a imprimir: ${seleccionados.length}`

    Swal.fire({
        html:html,
        icon: 'warning',
        confirmButtonText:'Continuar',
        confirmButtonColor: '#3085d6',
        showCancelButton:true,
        cancelButtonText:'Cancelar'
        }).then((respuesta)=>{

            if(seleccionados.length==0){
                return
            }
        
            if (respuesta.value){
                seleccionados.forEach(item => {
                    imprimir(false,null,cuatrimestreActivo,item.nro_curso)
                });
            }
        })

//    const resultado = armarListaEmailsSync(cursosAmostrar) // la lista de emails no la armo más aquí sino en el click de enviar mail

    
}

const iniciarNuevoCurso = ()=>{
    setCrearCurso(true);
    toggle()    
}

const iniciarAbrirBusquedaCursosNoVigentes = ()=>{
    setBuscarCursosNoVigentes(true);
    toggle();
}

const iniciarAbrirVerCursosPorDia = ()=>{
    setVerCursosPorDia(true);
    toggle();
}

const paginar = (ini,fin)=>{
    setIini(ini)
    setIfin(fin)
}

if (cargandoCursos){
    return <Main center><Loading/><span className="cargando">Cargando cursos actuales...</span></Main>
  };

  //`/curso/${curso.nro_curso}`
return(
    <Main>
         { isShowing && crearCurso && 
                <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                                
                    <AbmCurso cuatrimestreActivo={cuatrimestreActivo} 
                        finalizarAltaOcopia={finalizarAltaOcopia}
                        esModal={true}
                    />    
        
                </Modal>
         }
         { isShowing && copiarUnCurso && 
                <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                                
                <AbmCurso cuatrimestreActivo={cuatrimestreActivo} 
                  cursoCopiado={cursoAcopiar} 
                  finalizarAltaOcopia={finalizarAltaOcopia}
                  esModal={true}
                  />
        
                </Modal>
         }

        { isShowing && editarUnCurso && 
                <Modal hide={toggle} isShowing={isShowing} estilo={{width:'500px'}} estiloWrapper={{background:'#000000bf'}}>
                                
                    <AbmCurso cuatrimestreActivo={cuatrimestreActivo} 
                    nro_curso={cursoAeditar} 
                    finalizarAltaOcopia={finalizarAltaOcopia}
                    esModal={true}
                    />
        
                </Modal>
         }
         { isShowing && buscarCursosNoVigentes && 
            <Modal hide={toggle} titulo={'Listado de cursos por cuatrimestre / Reutilización de cursos'} isShowing={isShowing} estilo={{width:'800px'}} estiloWrapper={{background:'#000000bf'}}>
                            
                <BusquedaCursos finalizarAltaOcopia={finalizarAltaOcopia}/>

            </Modal>
        }
        { isShowing && verCursosPorDia && 
            <Modal hide={toggle} titulo={'Cronograma de cursos'} isShowing={isShowing} estilo={{width:'1200px'}} estiloWrapper={{background:'#000000bf'}}>
                            
                <CronogramaCursos propCursos={cursos}/>

            </Modal>
        }   


        <div className="bg-blue p-4 rounded relative mt-v ml-auto mr-auto mb-8"> 
        
        <div className="flex f-row">
       
        <TipoCursos cambiarTipoCurso={handleChangeSelectTipos} 
                    cambiarCursosRecuperatorios={handleChangeSelectME}
                    tipoCurso={tipoCurso} cursoRecuperatorio={cursosRecuperatorios}
                    grupalIndividual={grupalIndividual}
                    limpiarFiltros={limpiarFiltros}
                    hayFiltrosActivos={hayFiltrosActivos}
                    cambiarGrupalIndividual={handleChangeSelectGrupalIndividual}
                    materia = {materia}
                    handleChangeSelectMaterias = {handleChangeSelectMaterias}
                    materias = {materias}
                    profesor = {profesor}
                    handleChangeSelectProfesores = {handleChangeSelectProfesores}
                    profesores = {profesores}
                    dia = {dia}
                    handleChangeSelectDias = {handleChangeSelectDias}
                    dias = {dias}
                    limpiarCursoRecuperatorio ={limpiarCursoRecuperatorio}
                    limpiarDia ={limpiarDia}
                    limpiarTipoCurso = {limpiarTipoCurso}
                    limpiarProfesor = {limpiarProfesor}
                    limpiarMateria = {limpiarMateria}
                    limpiarGrupalIndividual = {limpiarGrupalIndividual}
                    />

        <div className="flex f-col centro-w300 ml-auto mr-auto res-lista">
            <div className="flex f-col">
                <span>{cursosAmostrar.length== 1 ? `1 curso encontrado`:`${cursosAmostrar.length} cursos encontrados`}</span> 
                <Paginacion anchoPaginacion={anchoPaginacion} longitud={cursosAmostrar.length} paginar={paginar} iIni={iIni} iFin={iFin}/>
            </div>
            {/*<ListaUltimosCursos cursos={ultimosCursosCreados} /> */}

          
        </div>   

         {cuatrimestreActivo && <Cabecera cuatrimestreActivo={cuatrimestreActivo} 
                                         refrescarLista={refrescarLista} 
                                         iniciarNuevoCurso={iniciarNuevoCurso}
                                         verCursosPorDia={iniciarAbrirVerCursosPorDia}
                                         iniciarAbrirBusquedaCursosNoVigentes={iniciarAbrirBusquedaCursosNoVigentes}
                                         imprimirRegistros = {imprimirRegistros}/>}

         
        </div>      
        <table className="table mt-2 mb-8">
            <thead className="bg-blue-500 text-white ">
            <tr className="titulo-lista">

                    <th scope="col"></th>
                    <th>
                        <a onClick={()=>gestionarChecks(true)} 
                            title="Marcar todos" 
                            className="tdec-none cursor-pointer ml-2 color-63 ">
                            <FontAwesomeIcon className="cursor-pointer text-white" icon={faCheckCircle}/> 
                        </a> 

                        <a onClick={()=>gestionarChecks(false)} 
                            title="Desmarcar todos" 
                            className="tdec-none cursor-pointer ml-2 mr-2 color-63 ">
                            <FontAwesomeIcon className="cursor-pointer text-white" icon={faCircle}/> 
                        </a> 
                    </th>                    
                    {/*<td scope="col"><Seleccionador valor={tipo} onchange={handleChangeSelectTipo} vector = {tipos}/></td>*/}
                    <th scope="col" className={orden=='nro_curso' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('nro_curso')}>#ID</th>
                    <th scope="col" className={orden=='grupal' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('grupal')}>I/G</th>
                    <th scope="col" className={orden=='descripcion' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('descripcion')}>Materia</th>
                    <th className={orden=='nombre' ? 'orden-activo' : 'mw-120x cursor-pointer'} onClick={()=>funcionOrden('nombre')} scope="col">Profesor</th>
                    <th scope="DiaHora" className={orden=='DiaHora' ? 'orden-activo' : 'cursor-pointer'} onClick={()=>funcionOrden('DiaHora')}>Día</th>
                    <th scope="col">Hora</th>
                    <th className={orden=='nota' ? 'orden-activo' : 'pad-list1 cursor-pointer'} onClick={()=>funcionOrden('nota')}  title="Cantidad de alumnos inscriptos " scope="col">Alumnos</th>
                    <th className="pad-list1" title="Cantidad de lugares disponibles en el curso " scope="col">Disp.</th>
                    <th className="pad-list1" title="Curso Regular o Mesa de examen" className={orden=='alerta' ? 'orden-activo cursor-pointer' : 'cursor-pointer'} onClick={()=>funcionOrden('alerta')} scope="col">R/ME</th>
                    <th title="Curso Standard, Instrumental o Ensamble" className={orden=='tipo' ? 'orden-activo cursor-pointer' : 'cursor-pointer'} onClick={()=>funcionOrden('tipo')} scope="col">Tipo</th>
                    <th span="3" className="" scope="col">Acciones</th>
                </tr>    
            </thead> 
            <tbody>
            {
                cursosAmostrar
                .map((item,index)=>{return {...item,indice:index+1}})
                .filter((item,index)=>{
                    return index>= iIni && index<=iFin
                })
                .map(curso => {
                return (
                    <tr key={curso.nro_curso} className="bg-blueTabla">
                        <td className="indice">{curso.indice}</td>
                        <td className="text-center"><input value={curso.nro_curso} 
                            checked={curso.seleccion} 
                            onChange={(e)=>cambiarCheck(e)} type="checkbox" 
                            title="Marque o desmarque éste alumno"/>
                        </td>
                        <td className="filas-lista-principal">{curso.nro_curso}</td>
                        <td className="filas-lista-principal" title={curso.grupal ? 'Curso grupal' : 'Curso de horarios individuales'}>{curso.grupal ? 'G' : 'I'}</td>
                        <td title={curso.descripcion} className="filas-lista-principal">
                            <Link 
                                className="color-63 tdec-none" 
                                to={{
                                    pathname: `/curso/${curso.nro_curso}`                                }}> 
                                {curso.descripcion}
                            </Link> 
                        </td>
                        <td title={curso.nombre} className="filas-lista mw-120x">{curso.nombre}</td>
                        <td className="filas-lista">{curso.DiaHora}</td>
                        <td className="filas-lista">{curso.comienzo} hs</td>
                        <td className="text-center filas-lista">{curso.nota}</td>
                        <td className={curso.disponibilidad>0 ? 'dispo-1 filas-lista' : 'dispo-0 filas-lista'}>{curso.disponibilidad}</td>        
                        <td title={curso.alerta===false ? 'Regular' : 'Mesa de examen'} className="filas-lista">{curso.alerta===false ? 'R' : 'ME'}</td>
                        <td title={curso.tipo} className="filas-lista">{curso.tipo}</td>
                        <td onClick={()=>copiarCurso(curso.nro_curso)} title={`Crear un curso igual al ${curso.nro_curso} \n${curso.descripcion}\n${curso.nombre}\n${curso.DiaHora} ${curso.periodo}`} className="tipo-curso cursor-copy width-35 color-tomato text-large filas-lista">
                              <FontAwesomeIcon className="cursor-copy"  icon={faCopy}/>
                        </td>
                        <td onClick={()=>editarCurso(curso.nro_curso)} title="Editar la cabecera del curso" className="tipo-curso cursor-pointer filas-lista width-35 color-tomato text-large">
                              <FontAwesomeIcon className="cursor-pointer"  icon={faEdit}/>
                        </td> 
                        <td onClick={()=>editarCurso(curso.nro_curso)} title="Editar las inscripciones del curso " className="tipo-curso cursor-pointer filas-lista width-35">
                            <Link 
                                className="filas-lista color-tomato text-large hw" 
                                to={{
                                    pathname: `/curso/${curso.nro_curso}`
                                }} > 
                                <FontAwesomeIcon className="cursor-pointer"  icon={faUsers}/>
                            </Link> 
                        </td>     
                        {<td onClick={()=>imprimir(false,null,cuatrimestreActivo,curso.nro_curso)} title="Imprimir el registro del curso" className="tipo-curso cursor-pointer width-35 color-tomato text-large filas-lista">
                              <FontAwesomeIcon className="cursor-pointer"  icon={faFilePdf}/>
                        </td>}                                                                   
                    </tr>
                   )
                })
            }
            </tbody>
        </table>
        <div className="flex f-col centro-w300 ml-auto mr-auto res-lista">
            <div className="flex f-col">
                <Paginacion anchoPaginacion={anchoPaginacion} longitud={cursosAmostrar.length} paginar={paginar} iIni={iIni} iFin={iFin}/>
            </div>
        </div> 
      </div>
  
      {/*crearCurso && <AbmCurso cuatrimestreActivo={cuatrimestreActivo} finalizarAltaOcopia={finalizarAltaOcopia}/>*/}
      {/*copiarUnCurso && <AbmCurso cuatrimestreActivo={cuatrimestreActivo} cursoCopiado={cursoAcopiar} finalizarAltaOcopia={finalizarAltaOcopia}/>*/}
    </Main>
)
    }


//onClick={()=>imprimir(true,cursoActualizado,cuatrimestreActivo.nombre)}
function Seleccionador({vector,onchange,valor,nombre}){
    let clasesSelect = "block appearance-none w-100 select-titulo rounded shadow leading-tight";
    let clasesActivo = "block appearance-none w-full select-titulo rounded shadow leading-tight";

    return (            
        <div className="input-field col s12">
            <select value={valor} onChange = {onchange} className={valor=="-1" ? clasesSelect : clasesActivo}>
                <option value="-1" key="-1">{nombre}</option>
                {vector.map(item=><option value={item} key={item}>{item}</option> )}
            </select>
        </div>
        )
}    



function Cabecera({cuatrimestreActivo,
                    iniciarNuevoCurso,
                    refrescarLista,
                    iniciarAbrirBusquedaCursosNoVigentes,
                    verCursosPorDia,
                    imprimirRegistros}){
    return <div className="flex f-col">
                {/*<span className="cabecera">{`Listado de cursos ${cuatrimestreActivo.nombre}`}</span>*/}
                
                <span title="Refrescar la lista" onClick={()=>refrescarLista()} 
                        className="cursor-pointer acciones-lista-cabecera botonNc mr-4" >
                        <FontAwesomeIcon className="color-tomato" icon={faSync}/> Refrescar
                </span>

                <span onClick={iniciarNuevoCurso} className="cursor-pointer acciones-lista-cabecera botonNc mr-4" >
                    <FontAwesomeIcon className="color-tomato" icon={faPlusSquare}/> Crear un nuevo curso
                </span>
                
                <span onClick={iniciarAbrirBusquedaCursosNoVigentes} className="cursor-pointer acciones-lista-cabecera botonNc mr-4" >
                    <FontAwesomeIcon className="color-tomato" icon={faSearch}/> Buscar cursos por período / Reutilizar
                </span>

                <span onClick={imprimirRegistros} className="cursor-pointer acciones-lista-cabecera botonNc mr-4" >
                    <FontAwesomeIcon className="color-tomato" icon={faFilePdf}/> Imprimir registros
                </span>
  
                {/*<span onClick={verCursosPorDia} className="cursor-pointer acciones-lista-cabecera botonNc mr-4" >
                    <FontAwesomeIcon className="cursor-copy" icon={faCalendar}/> Ver cronograma
                    </span>*/}
            </div>    
}

function Cabecera_old({cuatrimestreActivo,
    iniciarNuevoCurso,
    refrescarLista,
    iniciarAbrirBusquedaCursosNoVigentes,
    verCursosPorDia}){
return <div className="cableft absolute">
<span className="cabecera">{`Listado de cursos ${cuatrimestreActivo.nombre}`}</span>

<span title="Refrescar la lista" onClick={()=>refrescarLista()} 
        className="cursor-pointer acciones-lista-cabecera botonNc mr-4 ml-6" >
        <FontAwesomeIcon className="color-tomato" icon={faSync}/> Refrescar
</span>

<span onClick={iniciarNuevoCurso} className="cursor-pointer acciones-lista-cabecera botonNc mr-4" >
    <FontAwesomeIcon className="color-tomato" icon={faPlusSquare}/> Crear un nuevo curso
</span>

<span onClick={iniciarAbrirBusquedaCursosNoVigentes} className="cursor-pointer acciones-lista-cabecera botonNc mr-4" >
    <FontAwesomeIcon className="color-tomato" icon={faSearch}/> Buscar cursos por período / Reutilizar
</span>
{/*<span onClick={verCursosPorDia} className="cursor-pointer acciones-lista-cabecera botonNc mr-4" >
    <FontAwesomeIcon className="cursor-copy" icon={faCalendar}/> Ver cronograma
    </span>*/}
</div>    
}
function TipoCursos({hayFiltrosActivos,
    limpiarFiltros,
    limpiarCursoRecuperatorio,
    cambiarTipoCurso,
    cambiarCursosRecuperatorios, 
    tipoCurso, 
    cursoRecuperatorio,
    grupalIndividual,
    cambiarGrupalIndividual,
    materia,handleChangeSelectMaterias,materias,
    profesor,handleChangeSelectProfesores,profesores,
    dia,handleChangeSelectDias,dias,
    limpiarGrupalIndividual,limpiarTipoCurso,limpiarMateria,limpiarProfesor,
    limpiarDia}){

let clasesSelect = "block appearance-none w-100 select-titulo rounded shadow leading-tight";
let clasesActivo = "block appearance-none w-full select-titulo rounded shadow leading-tight";
    
return (
<div className="flex f-col">
{/*<div className="flex f-col absolute top-50 left-50 zi-100">*/}

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray">Regular/Mesa Ex.</span>

<div className="flex f-row">
<select title="Curso Regular o Mesa de examen" value={cursoRecuperatorio} 
    className={cursoRecuperatorio=="-1" ? clasesSelect : clasesActivo} 
    onChange={cambiarCursosRecuperatorios}>
    <option value="-1">Todos</option>
    <option value="false">Regulares</option>
    <option value="true">Recuperatorios</option>
</select>
{ cursoRecuperatorio!="-1" && <button><FontAwesomeIcon 
                    className="ic-abm"
                    icon={faWindowClose} 
                    onClick={limpiarCursoRecuperatorio}/>
                </button>}
</div>
</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray">Tipo de curso</span>

<div className="flex f-row">
<select title="Curso Standard, Instrumental o Ensamble" value={tipoCurso} 
    className={tipoCurso=="-1" ? clasesSelect : clasesActivo} 
    onChange={cambiarTipoCurso}>
        <option value="-1">Todos</option>
        <option value="Standard">Standard</option>
        <option value="Instrumental">Instrumental</option>
        <option value="Ensamble">Ensamble</option>
</select>                                
{ tipoCurso!="-1" && <button><FontAwesomeIcon 
                    className="ic-abm"
                    icon={faWindowClose} 
                    onClick={limpiarTipoCurso}/>
                </button>}
</div>
</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray">Individual/Grupal</span>
    <div className="flex f-row">
   
<select title="Curso grupal o individual" value={grupalIndividual} 
    className={grupalIndividual=="-1" ? clasesSelect : clasesActivo}
    onChange={cambiarGrupalIndividual}>
    <option value="-1">Todos</option>
    <option value="1">Grupal</option>
    <option value="0">Individual</option>
</select>
{ grupalIndividual!="-1" && <button><FontAwesomeIcon 
                    className="ic-abm"
                    icon={faWindowClose} 
                    onClick={limpiarGrupalIndividual}/>
                </button>}
</div>
</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray">Materia</span>
<div className="flex f-row">
   
<Seleccionador valor={materia} onchange={handleChangeSelectMaterias} vector = {materias} nombre='Todas'/>
{ materia!="-1" && <button><FontAwesomeIcon 
                    className="ic-abm"
                    icon={faWindowClose} 
                    onClick={limpiarMateria}/>
                </button>}
</div>

</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray">Profesor</span>

<div className="flex f-row">
   
<Seleccionador valor={profesor} onchange={handleChangeSelectProfesores} vector = {profesores} nombre='Todos'/>
{ profesor!="-1" && <button><FontAwesomeIcon 
                    className="ic-abm"
                    icon={faWindowClose} 
                    onClick={limpiarProfesor}/>
                </button>}
</div>
</div>

<div className="flex f-row">
    <span className="cursor-pointer p2-2 text-small botonNc w-150  inline-block-1 border-bottom-dotted-gray text-left color-gray">Día</span>

<div className="flex f-row">
   
<Seleccionador valor={dia} onchange={handleChangeSelectDias} vector = {dias} nombre='Todos'/>
{ dia!="-1" && <button><FontAwesomeIcon 
                    className="ic-abm"
                    icon={faWindowClose} 
                    onClick={limpiarDia}/>
                </button>}
</div>
</div>
{hayFiltrosActivos && <a onClick={limpiarFiltros} title="Limpiar todos los filtros" className="cursor-pointer mt-2 mr-2 ml-2 color-63">
<FontAwesomeIcon className="color-tomato" icon={faTrash}/><span className="text-small color-gray">Limpiar filtros</span>
</a> }
</div>

)

}

function TipoCursos_old({hayFiltrosActivos,
                    limpiarFiltros,
                    limpiarCursoRecuperatorio,
                    cambiarTipoCurso,
                    cambiarCursosRecuperatorios, 
                    tipoCurso, 
                    cursoRecuperatorio,
                    grupalIndividual,
                    cambiarGrupalIndividual,
                    materia,handleChangeSelectMaterias,materias,
                    profesor,handleChangeSelectProfesores,profesores,
                    dia,handleChangeSelectDias,dias}){
    return (
        <div className="flex f-row selecTipoCurso">

            <span title="Curso Regular o Mesa de examen" className="tipo-curso mr-4 ml-4 mt-3px hidden">R/ME</span>

        <div className="flex f-row">
             { cursoRecuperatorio!="-1" && <button><FontAwesomeIcon 
                                    className="ic-abm"
                                    icon={faWindowClose} 
                                    onClick={limpiarCursoRecuperatorio}/>
                                </button>}
                <select title="Curso Regular o Mesa de examen" value={cursoRecuperatorio} 
                    className="ml-4 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline" name="" id="" 
                    onChange={cambiarCursosRecuperatorios}>
                    <option value="-1">R/ME</option>
                    <option value="false">Regulares</option>
                    <option value="true">Recuperatorios</option>
                </select>
        </div>


            <span title="Curso Standard, Instrumental o Ensamble" className="tipo-curso mr-4 ml-4 mt-3px hidden">Tipo</span>

            <div className="flex f-row">
                    { tipoCurso!="-1" && <button><FontAwesomeIcon 
                                    className="ic-abm"
                                    icon={faWindowClose} 
                                    onClick={console.log('')}/>
                                </button>}
                <select title="Curso Standard, Instrumental o Ensamble" value={tipoCurso} 
                    className="ml-2 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline" name="" id="" 
                    onChange={cambiarTipoCurso}>
                        <option value="-1">Tipo de curso</option>
                        <option value="Standard">Standard</option>
                        <option value="Instrumental">Instrumental</option>
                        <option value="Ensamble">Ensamble</option>
                </select>                                
            </div>

            <div className="flex f-row">
                    { grupalIndividual!="-1" && <button><FontAwesomeIcon 
                                    className="ic-abm"
                                    icon={faWindowClose} 
                                    onClick={console.log('')}/>
                                </button>}
                <select title="Curso grupal o individual" value={grupalIndividual} 
                    className="ml-2 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline" name="" id="" 
                    onChange={cambiarGrupalIndividual}>
                    <option value="-1">G/I</option>
                    <option value="1">Grupal</option>
                    <option value="0">Individual</option>
                </select>
            </div>

            <div className="flex f-row">
                    { materia!="-1" && <button><FontAwesomeIcon 
                                    className="ic-abm"
                                    icon={faWindowClose} 
                                    onClick={console.log('')}/>
                                </button>}
                <Seleccionador valor={materia} onchange={handleChangeSelectMaterias} vector = {materias} nombre='Materia'/>
            </div>

            <div className="flex f-row">
                    { profesor!="-1" && <button><FontAwesomeIcon 
                                    className="ic-abm"
                                    icon={faWindowClose} 
                                    onClick={console.log('')}/>
                                </button>}
                <Seleccionador valor={profesor} onchange={handleChangeSelectProfesores} vector = {profesores} nombre='Profesor'/>
            </div>

            <div className="flex f-row">
                    { dia!="-1" && <button><FontAwesomeIcon 
                                    className="ic-abm"
                                    icon={faWindowClose} 
                                    onClick={console.log('')}/>
                                </button>}
                <Seleccionador valor={dia} onchange={handleChangeSelectDias} vector = {dias} nombre='Día'/>
            </div>
            {hayFiltrosActivos && <a onClick={limpiarFiltros} title="Limpiar todos los filtros" className="cursor-pointer mt-2 mr-2 ml-2 color-63">
                <FontAwesomeIcon className="color-tomato" icon={faTrash}/>
            </a> }
        </div>

    )
    
}

/*
function TipoCursos({cambiarTipoCurso}){

    return 
    (
        <div className="input-field col s12">
            <select onChange = {cambiarTipoCurso} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                <option value="-1" key="1">Regular</option>
                <option value="-1" key="21">Recuperatorio</option>
            </select>
        </div>
    )
    //<span className="absolute selecTipoCurso">Tipo de curso</span>

}*/

function listarUltimoCursosCreados(cursos,setUltimosCursosCreados){
    console.log(cursos)
    const cursos_filtrados = cursos.map(item=>{return {id:item.nro_curso,
                                                       materia:item.campo_auxiliar,
                                                       profesor:item.nombre,
                                                       fecha:item.columna}}).sort((a,b)=> b.id - a.id).slice(0,10)
    setUltimosCursosCreados(cursos_filtrados)
}

function ListaUltimosCursos({cursos}){
    
    
    return(<div className="contenedor-uc"> Ultimos cursos creados
        {
            cursos.map(item=>{
                return (
                <Link  key={`ult-cur${item.id}`} className="text-black" 
                                to={{
                                    pathname: `/curso/${item.id}`                                }}> 
                <span className="ultimos-cursos" title={`${item.materia}\n${item.profesor}\nCreado el ${item.fecha}`}>{item.id}</span>
                            </Link> 
            )
                })
        }
    </div>

    )
}

function ordenarVector(vector){
    vector.sort((a,b)=>{

        if(a.dia>b.dia){ // ordenar primero por día
            return 1
        }

        if(a.dia<b.dia){ // ordenar primero por día
            return -1
        }

        if (a.dia===b.dia){ // si el día es igual ordenar por horario comienzo
            return a.comienzo.localeCompare(b.comienzo)
        }

    })

    return vector
}

function definirValoresPaginacion(vector,inicial,final,setinicial,setfinal,anchoPaginacion){

    const longitud = vector.length;

    if (longitud>anchoPaginacion){
        setinicial(0);
        setfinal(anchoPaginacion-1)
    }else{
        setinicial(0);
        setfinal(longitud-1)
    }

}

function Paginacion({longitud,iIni,iFin,paginar,anchoPaginacion}){

    let imas, fmas,imenos, fmenos;

    let mostrar=true;
    let mostrarMenos = true;
    let mostrarMas = true;

    const hayMasParaMostrar = (longitud - 1) - iFin;
    const hayMenosParaMostrar = iIni;

    if (longitud<anchoPaginacion){
        mostrar=false
    }{
       if (hayMasParaMostrar==0){
            mostrarMas=false
       } 
       else if (hayMasParaMostrar<=anchoPaginacion){
            fmas = iFin + hayMasParaMostrar;
            imas = iFin + 1;
       }else if (hayMasParaMostrar>anchoPaginacion){
            fmas = iFin + anchoPaginacion;
            imas = iFin + 1;
       }

        if (hayMenosParaMostrar==0){
                mostrarMenos=false
        } 
        else if (hayMenosParaMostrar<=anchoPaginacion){
                fmenos = iIni - 1;
                imenos = 0;
        }else if (hayMenosParaMostrar>anchoPaginacion){
                fmenos = iIni - 1;
                imenos = iIni - anchoPaginacion;
        }
    }

    return <div>
        {mostrar && mostrarMenos && 
            <span   title={`${imenos+1}-${fmenos+1}`} 
                    className="cursor-pointer ml-2 mr-2" 
                    onClick={()=>paginar(imenos,fmenos)}>
                        <FontAwesomeIcon icon={faAngleLeft}/>
            </span>}
        <span>{iIni+1} - {iFin+1}</span>
        {mostrar && mostrarMas && 
            <span title={`${imas+1}-${fmas+1}`} 
                    className="cursor-pointer ml-2" 
                    onClick={()=>paginar(imas,fmas)}>
                           <FontAwesomeIcon icon={faAngleRight}/>
            </span>}
</div>
}

function Alumno({}){
    return <div className="ap-2">
    spacer goes here
 </div>
 
 
}

