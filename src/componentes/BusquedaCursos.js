import React, {useState, useEffect} from 'react';
import Main from './Main';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose, faPlusSquare, faEdit ,faCopy, faEye} from '@fortawesome/free-regular-svg-icons';
import { faCircle,faUsers,faPhone,faMobile,faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons';
import {useAlumno} from '../Context/alumnoContext';
import Loading from '../componentes/Loading';
import {hacerScroll,hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import { Link } from 'react-router-dom';
import AbmCurso from '../abms/abm-curso';
import AlumnosCurso from '../componentes/Alumnos-curso';

export default function BusquedaCursos({finalizarSeleccion}){

    const [cursos,setCursos]=useState([]);
    const [cuatrimestres,setCuatrimestres]=useState([]);
    const [buscandoCursos,setBuscandoCursos]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [textoBusqueda,setTextoBusqueda]=useState('');
    const [id_cuatrimestre,setIdCuatrimestre]=useState(-1);
    const {cuatrimestreActivo} = useAlumno();
    const [cursoSeleccionado, setCursoSeleccionado]=useState(null)
    const[grupalIndividual,setGrupalIndividual,]=useState(-1);
    const[tipoCurso,setTipoCurso,]=useState(-1);
    const[cursoRecuperatorio,setCursoRecuperatorio]=useState(-1);

    useEffect(()=>{
        setIdCuatrimestre(cuatrimestreActivo.id_cuatrimestre);

    },[])

    useEffect(()=>{
        setBuscandoCursos(true)
        buscarCursos()
    },[id_cuatrimestre])

    const buscarCursos = async ()=>{

        try{
             const vectorResultados = await Promise.all([Axios.get(`/api/cursos/all/${id_cuatrimestre}`),
                                 Axios.get(`/api/tablasgenerales/cuatrimestres`)])
     
            const cursosOrdenadosPorMateria = await ordenarCursosPorMateria(vectorResultados[0].data)

             setCursos(cursosOrdenadosPorMateria);

             setCuatrimestres(vectorResultados[1].data)

             setBuscandoCursos(false)
             hacerfocoEnPrimerInput("texto-busqueda")
         }catch(err){
             console.log(err)
             setBuscandoCursos(false)
             setHuboError(true)
         }
     }

    async function handleSubmit(e,alumno) {
        e.preventDefault();
        finalizarSeleccion(alumno.id_alumno,alumno.nombre,alumno.apellido,alumno.documento)
    }

    function limpiarFiltro(){
        setTextoBusqueda("")
        hacerfocoEnPrimerInput("texto-busqueda")
    }

    const handleChangeCuatrimestre = (e)=>{
        setIdCuatrimestre(e.target.value)
    }

    const handleChangeGrupalIndividual = (e)=>{
        setGrupalIndividual(e.target.value);
        setTipoCurso(-1);
        setCursoRecuperatorio(-1);
        setCursoSeleccionado(null)
    }

    const handleChangeTipoCurso = (e)=>{
        setTipoCurso(e.target.value);
        setGrupalIndividual(-1);
        setCursoRecuperatorio(-1);
        setCursoSeleccionado(null)
    }

    const handleChangeCursoRecuperatorio = (e)=>{

        const valorBooleano = e.target.value==='true' ? true : false
        setCursoRecuperatorio(valorBooleano);
        setGrupalIndividual(-1);
        setTipoCurso(-1);
        setCursoSeleccionado(null)
    }


    const handleInputChange = (e)=>{  // defino una función que va a escuchar los cambios que ocurren en los inputs. Agrego el listener con onChange
        //e.preventDefault()
        console.log(e.target.value)
        setTextoBusqueda(e.target.value)
    }

    function seleccionarCurso(e,item){
        finalizarSeleccion(item.id_alumno,item.nombre,item.apellido,item.documento)
    }

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (buscandoCursos){
        return <Main center><div><Loading/><span className="cargando">Buscando cursos...</span></div></Main>
    };

    return(
//        AlumnosCurso
        <>
            <Formulario
                handleSubmit={handleSubmit}
                textoBusqueda={textoBusqueda}
                handleInputChange={handleInputChange}
                limpiarFiltro={limpiarFiltro}
                handleChangeCuatrimestre={handleChangeCuatrimestre}
                cuatrimestres={cuatrimestres}
                cuatrimestre={id_cuatrimestre}
                handleChangeGrupalIndividual={handleChangeGrupalIndividual}
                handleChangeTipoCurso={handleChangeTipoCurso}
                handleChangeCursoRecuperatorio={handleChangeCursoRecuperatorio}
                grupalIndividual={grupalIndividual}
                tipoCurso={tipoCurso}
                cursoRecuperatorio={cursoRecuperatorio}
             />
                <Listado cursos={cursos} 
                    textoBusqueda={textoBusqueda} 
                    seleccionarCurso={seleccionarCurso} 
                    setCursoSeleccionado={setCursoSeleccionado} 
                    cursoSeleccionado={cursoSeleccionado}
                    cuatrimestreActivo={cuatrimestreActivo}
                    grupalIndividual={grupalIndividual}
                    cursoRecuperatorio={cursoRecuperatorio}
                    tipoCurso={tipoCurso}
                    finalizar={finalizarSeleccion}/>
            </>
    )
}

function Listado({cursos,textoBusqueda,
                  seleccionarCurso,
                  cursoSeleccionado,
                  setCursoSeleccionado,
                  cuatrimestreActivo,
                  finalizar,
                  grupalIndividual,
                  tipoCurso,
                  cursoRecuperatorio}){
    const [copiarCurso,setCopiarCurso]= useState(false)
    const [verCabecera,setVerCabecera]= useState(false)
    const [verAlumnos,setVerAlumnos]= useState(false)

    const finalizarAltaOcopia= (alta)=>{
        if (alta){
            finalizar(true)
        }else{
            setCursoSeleccionado(null);
            setVerCabecera(false);
            setVerAlumnos(false);
            setCopiarCurso(false);
        }

    }

    const iniciarVerCabecera = (item)=>{
        setCursoSeleccionado(item.nro_curso);
        setVerCabecera(true);
        setVerAlumnos(false);
        setCopiarCurso(false);
    }

    const iniciarVerAlumnos = (item)=>{
        setCursoSeleccionado(item.nro_curso)
        setVerCabecera(false);
        setVerAlumnos(true);
        setCopiarCurso(false);
    }

    const iniciarCopiarCurso = (item)=>{
        setCursoSeleccionado(item.nro_curso)
        setVerCabecera(false);
        setVerAlumnos(false);
        setCopiarCurso(true);
    }


    const cursosFiltrados = filtrarCursos(cursos,grupalIndividual,cursoRecuperatorio,tipoCurso)

    const cursosEncontrados = cursosFiltrados.filter(
        item=>item.descripcion.toUpperCase().includes(textoBusqueda.toUpperCase())||
        item.nombre.toUpperCase().includes(textoBusqueda.toUpperCase())||
        item.campo_auxiliar.toUpperCase().includes(textoBusqueda.toUpperCase())||
        item.DiaHora.toUpperCase().includes(textoBusqueda.toUpperCase()))

    return (
    <div>
        {cursos && <span className="text-small inline-block mb-4 block text-right">{cursosEncontrados.length} cursos encontrados</span>}
        {cursosEncontrados.length==0 && <Main center><div><Loading/><span className="cargando">Preparando listado...</span></div></Main>}
        {cursosEncontrados
            .map(item=>
                <div key={`alin-${item.nro_curso}`}>
                    {/* la funcion seleccionarAlumno hay que encerrarla para que no se ejecute sola  */}
                        <div  className="cursor-pointer" onClick={()=>iniciarVerCabecera(item)}>
                            <FontAwesomeIcon className="mr-2 ic-abm text-xxsmall" icon={faCircle}/>
                            <span className="lista-cursos w-50">#{item.nro_curso}</span>
                            <span className="lista-cursos w-150">{item.descripcion}</span>
                            <span className="lista-cursos w-50">{item.campo_auxiliar}</span>
                            <span className="lista-cursos w-100">{item.nombre}</span>
                            <span className="lista-cursos w-50">{item.DiaHora}</span>
                            <span className="lista-cursos w-65">{item.comienzo} hs.</span>
                            <span title={item.alerta ? 'Curso recuperatorio' : 'Curso regular'} className="lista-cursos w-35">{item.alerta ? 'ME' : 'R'}</span>
                            <span className="lista-cursos w-100">{item.tipo}</span>
                            <span title={item.grupal ? 'Curso grupal':'Curso individual'} className="lista-cursos w-35">{item.grupal ? 'G':'I'}</span>
                        </div>

                        {cursoSeleccionado==item.nro_curso &&
                            <div className="flex f-row color-63">
                                <AbmCurso nro_curso={null} 
                                    cuatrimestreActivo={cuatrimestreActivo} 
                                    cursoCopiado={item.nro_curso} 
                                    finalizarAltaOcopia={finalizarAltaOcopia} 
                                    esModal={false}
                                    mainSinClases={true}/>
                                <AlumnosCurso nro_curso={item.nro_curso}/>
                            </div>}
                                
                </div>
            )
        }
    </div>
    )
}

function Formulario({handleSubmit,
                     textoBusqueda,
                     handleInputChange,
                     limpiarFiltro,
                     cuatrimestres, 
                     cuatrimestre, 
                     handleChangeCuatrimestre,
                     handleChangeGrupalIndividual,
                     handleChangeTipoCurso,
                     handleChangeCursoRecuperatorio,
                     grupalIndividual,
                     tipoCurso,
                     cursoRecuperatorio}){
    return(
         <form onSubmit={handleSubmit}>
            {/* Tengo conectado el input email con el estado usuario.email a través del atributo value y del evento onChange */}
            
            <div className="flex f-col">
           
            <Seleccionadores 
                cuatrimestres={cuatrimestres}
                cuatrimestre={cuatrimestre}
                handleChangeCuatrimestre = {handleChangeCuatrimestre}
                cambiarGrupalIndividual={handleChangeGrupalIndividual}
                grupalIndividual={grupalIndividual}
                cambiarTipoCurso={handleChangeTipoCurso}
                tipoCurso={tipoCurso}
                cambiarCursosRecuperatorios={handleChangeCursoRecuperatorio}
                cursoRecuperatorio={cursoRecuperatorio}
            />
            
            <div className="flex f-row ml-4">
                {/*<FontAwesomeIcon className="mt-2 mr-2 razon-social" icon={faUsers}/>*/}
                <input value={textoBusqueda} 
                    onChange={handleInputChange} 
                    type="text" 
                    name="busqueda" 
                    id="texto-busqueda"
                    title="Filtrar por Materia, Abreviatura, Profesor o día"
                    autoComplete="off"
                    placeholder="Filtrar por Materia, Abreviatura, Profesor o día" 
                    className="Form__field"/>

                    { textoBusqueda!="" && <button><FontAwesomeIcon 
                        className="color-tomato"
                        title="Limpiar el filtro"
                        icon={faWindowClose} 
                        onClick={limpiarFiltro}/>
                    </button>}
                    
            </div>   
            </div>
        </form>
      

    )
}

function Detalle1({curso}){

    return <div>
        <h1>Este es el detalle del curso #{curso.nro_curso} para copiar</h1>
{/*<AbmCurso cuatrimestreActivo={46} esModal={false} cursoCopiado={curso.nro_curso}/>*/}
</div>
}

function Detalle2({curso}){

    return <div>
        <h1>Este es el detalle del curso #{curso.nro_curso} para ver alumnos</h1>
{/*<AbmCurso cuatrimestreActivo={46} esModal={false} cursoCopiado={curso.nro_curso}/>*/}
</div>
}

function Detalle3({curso}){

    return <div>
        <h1>Este es el detalle del curso #{curso.nro_curso} para ver cabecera</h1>
{/*<AbmCurso cuatrimestreActivo={46} esModal={false} cursoCopiado={curso.nro_curso}/>*/}
    </div>
}

function Seleccionadores({cuatrimestres,cuatrimestre,handleChangeCuatrimestre,cambiarTipoCurso,
                     cambiarCursosRecuperatorios, 
                     tipoCurso, 
                     cursoRecuperatorio,
                     grupalIndividual,
                     cambiarGrupalIndividual}){
    return (
        <div className="flex f-row selecTipoCurso">

            <span title="Curso Regular o Mesa de examen" className="tipo-curso mr-4 ml-4 mt-3px hidden">Período</span>
            
            <select title="Cuatrimestre" className="w-selabm ml-4 select-bper" value={cuatrimestre} onChange={(e)=>handleChangeCuatrimestre(e)}>
                {cuatrimestres.map(item=>
                    <option key={`periodo-${item.id_cuatrimestre}`} value={item.id_cuatrimestre}>{item.nombre}</option>
                    )}
            </select>

            <span title="Curso Regular o Mesa de examen" className="tipo-curso mr-4 ml-4 mt-3px hidden">R/ME</span>

            <select title="Curso Regular o Mesa de examen" value={cursoRecuperatorio} 
                className="ml-4 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline" name="" id="" 
                onChange={cambiarCursosRecuperatorios}>
                <option value="-1">R/ME</option>
                <option value="false">Regulares</option>
                <option value="true">Recuperatorios</option>
            </select>

            <span title="Curso Standard, Instrumental o Ensamble" className="tipo-curso mr-4 ml-4 mt-3px hidden">Tipo</span>

            <select title="Curso Standard, Instrumental o Ensamble" value={tipoCurso} 
                className="ml-2 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline" name="" id="" 
                onChange={cambiarTipoCurso}>
                <option value="-1">Tipo de curso</option>
                <option value="Standard">Standard</option>
                <option value="Instrumental">Instrumental</option>
                <option value="Ensamble">Ensamble</option>
            </select>

            <select title="Curso grupal o individual" value={grupalIndividual} 
                className="ml-2 block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline" name="" id="" 
                onChange={cambiarGrupalIndividual}>
                <option value="-1">G/I</option>
                <option value="1">Grupal</option>
                <option value="0">Individual</option>
            </select>

        </div>

    )
    
}

async function ordenarCursosPorMateria(cursos){
    return cursos.sort((a,b)=>a.descripcion.localeCompare(b.descripcion))
}

function filtrarCursos(cursos,grupalIndividual,cursoRecuperatorio,tipoCurso){

if (grupalIndividual==-1 && cursoRecuperatorio==-1 && tipoCurso==-1){
    return cursos
}

if (tipoCurso!=-1){
    return cursos.filter(item=>item.tipo===tipoCurso)
}

if (cursoRecuperatorio!=-1){
    return cursos.filter(item=>item.alerta===cursoRecuperatorio)
}

return cursos.filter(item=>item.grupal==grupalIndividual)
}


