import React from 'react';
import {useState, useEffect} from 'react';
import Main from '../componentes/Main';
import Axios from 'axios';
import Loading from '../componentes/Loading';
import Swal from 'sweetalert2';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose,faPlusSquare, faCheckSquare,faDotCircle, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import HistorialAlumno from '../componentes/HistorialAlumno';
import ImpresionesAlumno from '../componentes/Impresiones-alumno';
import {hacerfocoEnPrimerInput,seleccionarTextoInput} from '../Helpers/utilidades-globales';
import GestionEgresos from '../componentes/GestionEgresos'

export default function AbmAlumno({id_alumno, finalizarAltaOcopia,esModal,id_copia}){

    const provinciaDefault = [{id_provincia:-1, nombre:"Seleccionar país"}]

    // estados flags 
    const [cargandoDatosTablasGenerales,setCargandoTablasGenerales] = useState(false);
    const [cargandoProvincias,setCargandoProvincias] = useState(false);
    const [cargandoDatosAlumno,setCargandoDatosAlumno] = useState(false);
    const [grabandoDatosAlumno,setGrabandoDatosAlumno] = useState(false);
    const [tablasCargadas,setTablasCargadas]=useState(false)
    const [huboError,setHuboError]=useState(false)
    const [tituloAbm, setTituloAbm]=useState('');
    const [tituloCerrar,setTituloCerrar]=useState('');
    const [cargandoMateriasInstrumentos,setCargandoMateriasInstrumentos]=useState(false);
    const [contadorOperaciones,setContadorOperaciones]=useState(0);
    // vectores de selección de formulario

    const [paises,setPaises] = useState([]);
    const [nacionalidades,setNacionalidades] = useState([]);
    const [provincias,setProvincias] = useState(provinciaDefault); // lo usarmos para cargar el select de provincia cada vez que cambia el pais y se completa en base al vectorProvincias que ya tienen todas las provincias sin necesidad de ir a buscar al servidor por pais
    const [vectorProvincias,setVectorProvincias]= useState([]); // se usará para traer 1 sola vez todas las provincias y trabajar sobre el mismo con filter cada vez que se cambie el pais así evitamos ir N veces al servidor
    const [vectorDias, setVectorDias] = useState([]);
    const [vectorMeses, setVectorMeses]=useState([]);
    const [vectorAnios, setVectorAnios] = useState([]);
    
    // vectores de selección de otras operaciones

    const [materias, setMaterias]= useState([]);
    const [instrumentos, setInstrumentos]= useState([]);
    const [nivelesI, setNivelesI]= useState([]);
    const [nivelesE, setNivelesE]= useState([]);

    // Variables para manejar otras operaciones

    const [materiaSeleccionada,setMateriaSeleccionada]=useState(-1)
    const [instrumentoSeleccionado,setInstrumentoSeleccionado]=useState(-1)
    const [agregarInstrumento,setAgregarInstrumento]=useState(false)
    const [agregarMateria,setAgregarMateria]=useState(false)
    const [materiasTestAlumno, setMateriasTestAlumno]= useState([]);
    const [instrumentosAlumno, setInstrumentosAlumno]= useState([]);
    const [errorMateria,setErrorMateria]=useState(null)
    const [errorInstrumento,setErrorInstrumento]=useState(null)
    const [backupInstrumentosAlumno,setBackupInstrumentosAlumno]=useState([]);
    const [backupMateriasTestAlumno,setBackupMateriasTestAlumno]=useState([]);
    const [huboCambiosInstrumentos,setHuboCambiosInstrumentos]=useState(false)
    const [huboCambiosMaterias,setHuboCambiosMaterias]=useState(false)
    const [buscarHistorial,setBuscarHistorial]=useState(false)
    const [contadorModificaciones,setContadorModificaciones]=useState(0)
    const[datosParaImpresiones,setDatosParaImpresiones]=useState(null)
    const[historial,setHistorial]=useState([])
    const [historialAmpliado,setHistorialAmpliado]=useState(false)

    // estado objeto de inicialización que inicializa los valores del abm 
    // en el alta o es cargado con los valores de la base de datos en una modificación
    // este objeto se pasa al formulario Formik para que el estado del formulario se inicialice
    // con este objeto. Luego el resto del trabajo se hace sobre el estado del formulario  
    const [objetoInicializacion,setObjetoInicializacion]=useState({
        id_alumno:-1,
        nacionalidad:'Argentina',
        pais:1,
        provincia:1,
        nombre:'',
        apellido:'',
        anio:"2020",
        mes:"01",
        dia:"01",
        documento:'',
        sexo:'M',
        domicilio:'',
        localidad:'',
        codpostal:'',
        domicilio2:'',
        email:'',
        email_secundario:'',
        telefono:'',
        telef_laboral:'',
        telef_alternativo:'',
        celular:'',
        obs_finanzas:''
    })

    useEffect(()=>{

        const cargarTablasGenerales = async ()=>{

            setCargandoTablasGenerales(true);
        
            try{
                const vectorResultado = await Promise.all([
                    Axios.get('/api/tablasgenerales/materias'),
                    Axios.get('/api/tablasgenerales/paises'),
                    Axios.get('/api/tablasgenerales/provincias/all'),
                    Axios.get('/api/tablasgenerales/nacionalidades'),
                    Axios.get('/api/tablasgenerales/instrumentos'),
                    Axios.get('/api/tablasgenerales/nivelesi'),
                    Axios.get('/api/tablasgenerales/nivelese')
                ])

               
                setMaterias(vectorResultado[0].data);
                setPaises(vectorResultado[1].data);
                setVectorProvincias(vectorResultado[2].data);
                setNacionalidades(vectorResultado[3].data);
                setInstrumentos(vectorResultado[4].data);
                setNivelesI(vectorResultado[5].data);
                setNivelesE(vectorResultado[6].data);

                cargarVectorDias(setVectorDias);
                cargarVectorMeses(setVectorMeses);
                cargarVectorAnios(setVectorAnios);
              
                setCargandoTablasGenerales(false); 
                setTablasCargadas(true)

                
                localStorage.setItem('materias',JSON.stringify(vectorResultado[0].data));
                localStorage.setItem('paises',JSON.stringify(vectorResultado[1].data));
                localStorage.setItem('provincias',JSON.stringify(vectorResultado[2].data));
                localStorage.setItem('nacionalidades',JSON.stringify(vectorResultado[3].data));
                localStorage.setItem('instrumentos',JSON.stringify(vectorResultado[4].data));
                localStorage.setItem('nivelesi',JSON.stringify(vectorResultado[5].data));
                localStorage.setItem('nivelese',JSON.stringify(vectorResultado[6].data));

            }catch(err){
        
                    console.log(err)
                   // const mensaje_html = `<p>La busqueda de tablas generales falló</p><p>${err.response.data.message}</p>`
                    const mensaje_html = `${err}`

                    Swal.fire({
                        html:mensaje_html,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                    })   
                    setHuboError(true)
                    setCargandoTablasGenerales(false);
    
                }
            }

            
            if (!tablasGeneralesLocalStorage(setMaterias,setPaises,setVectorProvincias,setNacionalidades,setInstrumentos,setNivelesI,setNivelesE)){
                cargarTablasGenerales() // si no están almacenadas en el local storage traerlas de la bd y almacenarlas localmente
            }else{ // si existen en el local storage se han cargado en la función tablasGeneralesLocalStorage  solo generar los vectores de dias, meses y años
                cargarVectorDias(setVectorDias);
                cargarVectorMeses(setVectorMeses);
                cargarVectorAnios(setVectorAnios);
                setTablasCargadas(true)
            }

     },[id_alumno])

/*
useEffect(()=>{

},[historialAmpliado])
*/

useEffect(()=>{

    const completarDatosDelAlumno = async (id)=>{   
        setCargandoDatosAlumno(true)
        try{
            
                const {data} = await Axios.get(`/api/alumnos/${id}`)

                if (!data) {
                    const mensaje_html = `<p>No se encontraron datos para el alumno ${id}</p>`
    
                    Swal.fire({
                        html:mensaje_html,
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                    })   

                    setCargandoDatosAlumno(false)
                    setHuboError(true)
                    return
                }

                const datosDelRecordset = data[0];
                const datosAlumno = {
                    id_alumno:id_alumno,
                    nacionalidad:datosDelRecordset.nacionalidad,
                    pais:datosDelRecordset.id_pais,
                    provincia:datosDelRecordset.id_provincia,
                    nombre:datosDelRecordset.nombre,
                    apellido:datosDelRecordset.apellido,
                    documento:noNull(datosDelRecordset.documento),
                    fecha:datosDelRecordset.fecha_nac,
                    anio:datosDelRecordset.fecha_nac.slice(0,4),
                    dia:datosDelRecordset.fecha_nac.slice(8,10),
                    mes:Number(datosDelRecordset.fecha_nac.slice(5,7)),
                    sexo:datosDelRecordset.sexo,
                    domicilio:noNull(datosDelRecordset.domicilio),
                    localidad:noNull(datosDelRecordset.localidad),
                    codpostal:noNull(datosDelRecordset.codPostal),
                    domicilio2:noNull(datosDelRecordset.domicilio_2),
                    email:noNull(datosDelRecordset.email),
                    email_secundario:noNull(datosDelRecordset.Email_Secundario),
                    telefono:noNull(datosDelRecordset.telefono),
                    telef_laboral:noNull(datosDelRecordset.Telef_Laboral),
                    telef_alternativo:noNull(datosDelRecordset.Telef_Alternativo),
                    celular:noNull(datosDelRecordset.Celular),
                    obs_finanzas:noNull(datosDelRecordset.obs_finanzas)
                }
                  
                //se actualiza el objeto  de inicializacion con lo que traemos de la tabla
                // se hace un merge de los datos, los que son comunes se pisan y los nuevos se agregan

                setObjetoInicializacion({...objetoInicializacion,...datosAlumno}) 

                setDatosParaImpresiones(datosDelRecordset)

                setContadorOperaciones(contadorOperaciones+1); // modifico contadorOperaciones para que se dispare el effect que busca materias e instrumentos una vez que se hayan cargado primero los datos del alumno. De esta forma ordeno secuencialmente la carga de datos y evito el warning de react "Can't perform a React state update on an unmounted component"
                setCargandoDatosAlumno(false)

                return(datosDelRecordset)
                // return datosDelRecordset // retorno un valor para que pueda hacerse algo en el .then ya que al ser async devuelva una promesa
            }catch(err){

                console.log(err)
               // const mensaje_html = `<p>La busqueda de datos del alumno falló</p><p>${err.response.data.message}</p>`
                const mensaje_html = `${err}`
                Swal.fire({
                    html:mensaje_html,
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                })   
            
                setCargandoDatosAlumno(false)
                setHuboError(true)
            }

    }

    if (tablasCargadas ){ // este useEffect se dispara solo si ya se cargaron las tablas generales

        if (id_alumno){ //  si se recibió el nùmero de alumno por propiedad es decir si es una modificación
            
//            setTituloAbm(`Editar el alumno #${id_alumno}`);
            setTituloAbm('');
            setTituloCerrar('Cerrar la ficha del alumno');
            completarDatosDelAlumno(id_alumno)
            .then(datos=>{
                console.log('yakira',provincias)
                setProvincias(vectorProvincias.filter(item=>item.id_pais==datos.id_pais))
            }) 
            
        }
        else if (id_copia){
            setTituloAbm(`Copiar el alumno #${id_copia}`);
            setTituloCerrar('Cerrar la ficha del alumno');
            completarDatosDelAlumno(id_copia); 
        }
        else{ //  si no recibió el nùmero de curso por propiedad, es decir un alta
            setTituloAbm(`Crear un nuevo alumno`);
            setTituloCerrar('Cancelar');
            hacerScroll("nuevo-alumno");
            cargarProvinciasArgentina();
            
            let anioNacimientoDefaultAlta=anioNacimientoAlta();

            setObjetoInicializacion({...objetoInicializacion,anio:anioNacimientoDefaultAlta}) 

            hacerfocoEnPrimerInput('abm-nombre')

        }
    }

},[tablasCargadas,id_alumno,contadorModificaciones])     
  
useEffect(()=>{
    
   if (id_alumno){
    buscarMateriasAprobadasEinstrumentosAlumno()
    .then(()=> hacerScroll('ref-ficha'))
   } 


},[contadorOperaciones])


useEffect(()=>{ // hago esto para evitar el warning de can't perform... creo un effect para el mismo evento para que se ejecuten llamadas asincrónicas en distintos threads
                // podría haberlo agregado el effect que también se dispara con el mismo cambio contadorOperaciones pero para que sea más claro lo hice en dos efectos distintos pero disparados por el mismo cambio
    let mounted = true;

    if (mounted && id_alumno){ // buscar el historial solo si esta montado y si hay un id_alumno, si es un alta no buscar todavía el historial
        setBuscarHistorial(true)
    }
    
    return ()=> mounted = false
 },[contadorOperaciones]) 

const handleNivelIChange=(e,instrumento)=>{

    const nuevo_id_nivel_instrumental = e.target.value; // en e.target.value traigo el nuevo id nivel instrumental

    const copia = [...instrumentosAlumno] //en copia replico el actual estado del vector de instrumentos del alumno
    
    const datosNuevoInstrumental= nivelesI // en datosNuevoEnsamble traigo los datos del nuevo id instrumental que interesa especialmente el nombre para actualizar luego el vector de instrumentos del alumno
                    .filter(item=>item.id_nivel_instrumental==nuevo_id_nivel_instrumental)[0];

    const copiaActualizada = copia // en copiaActualizada recorro copia y al detectar el id de instrumento a modificar recupero el objeto de esa posición y modifico el id instrumental y el nombre del nuevo id instrumental
            .map(item=>
                item.id_instrumento==instrumento ? 
                {...item,id_nivel_instrumental:nuevo_id_nivel_instrumental,nivel_i:datosNuevoInstrumental.nombre} 
                : item)
    // actualizo el estado
    setInstrumentosAlumno(copiaActualizada) 
    
    setHuboCambiosInstrumentos(true)
}

const handleNivelEChange=(e,instrumento)=>{

    const nuevo_id_nivel_ensamble = e.target.value; // en e.target.value traigo el nuevo id nivel ensamble

    const copia = [...instrumentosAlumno] //en copia replico el actual estado del vector de instrumentos del alumno
    
    const datosNuevoEnsamble = nivelesE // en datosNuevoEnsamble traigo los datos del nuevo id ensamble que interesa especialmente el nombre para actualizar luego el vector de instrumentos del alumno
                    .filter(item=>item.id_nivel_ensamble==nuevo_id_nivel_ensamble)[0];

    const copiaActualizada = copia // en copiaActualizada recorro copia y al detectar el id de instrumento a modificar recupero el objeto de esa posición y modifico el id ensamble y el nombre del nuevo id ensamble
            .map(item=>
                item.id_instrumento==instrumento ? 
                {...item,id_nivel_ensamble:nuevo_id_nivel_ensamble,nivel_e:datosNuevoEnsamble.nombre} 
                : item)
    // actualizo el estado
    setInstrumentosAlumno(copiaActualizada)

    setHuboCambiosInstrumentos(true)
}

const restaurarMaterias=()=>{
    setMateriasTestAlumno(backupMateriasTestAlumno)
    setHuboCambiosMaterias(false)
}

const restaurarInstrumentos=()=>{
    setInstrumentosAlumno(backupInstrumentosAlumno)
    setHuboCambiosInstrumentos(false)
}

const buscarMateriasAprobadasEinstrumentosAlumno = async ()=>{

    try{
        setCargandoMateriasInstrumentos(true)
        const vectorResultado = await Promise.all([Axios.get(`/api/alumnos/materiastest/${id_alumno}`),
                                                Axios.get(`/api/alumnos/instrumentos/${id_alumno}`),
                                                Axios.get(`/api/alumnos/historial/${id_alumno}/1`)])
    

        if (vectorResultado[1].data.some(item=>item.id_instrumento>1))
        {
            setInstrumentosAlumno(vectorResultado[1].data)
            setBackupInstrumentosAlumno(vectorResultado[1].data)
        }            

        setMateriasTestAlumno(vectorResultado[0].data)
        setBackupMateriasTestAlumno(vectorResultado[0].data)

        setHistorial(vectorResultado[2].data)

        setCargandoMateriasInstrumentos(false)
        setHuboCambiosInstrumentos(false)
        setHuboCambiosMaterias(false)

        return(true)

    }catch(err){
        console.log(err)
        //const mensaje_html = `<p>La busqueda de instrumentos del alumno y materias aprobadas por test falló</p><p>${err.response.data.message}</p>`
        const mensaje_html = 'ddd'
        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setCargandoMateriasInstrumentos(false)
        setHuboError(true)
    }
}

const grabarAlumno = async (values)=>{



    if (agregarInstrumento || agregarMateria){

        let mensaje_validacion = `${agregarMateria ? '<p>Falta confirmar una materia. Agregue o cancele la materia seleccionada</p>' : '<p>Falta confirmar un instrumento.Agregue o cancele el instrumento seleccionado</p>'}`

        Swal.fire({
            html:mensaje_validacion,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        }) 

        return
    }

   

    let resultado;
    let id_alumno_interno;
    let nombre_interno = `${values.apellido}, ${values.nombre}`
    // me veo ogligado formatear el objeto que envío para grabar porque
    // los ids deben ser numéricos ya que se validan como números pero cuando el valor
    // viene de un "value" de un select por ejemplo se convierten a string
    // entonces antes de enviar el objeto hay que formatearlo

    const objetoAgrabar = { datosgenerales: {
                nombre: values.nombre,
                apellido: values.apellido,
                nacionalidad:values.nacionalidad,
                provincia:Number(values.provincia),
                pais:Number(values.pais),
                anio:Number(values.anio),
                mes:Number(values.mes),
                dia:Number(values.dia),
                domicilio:values.domicilio,
                domicilio2:values.domicilio2,
                localidad:values.localidad,
                codpostal:values.codpostal,
                sexo:values.sexo,
                documento:values.documento,
                telefono:values.telefono,
                telef_laboral:values.telef_laboral,
                telef_alternativo:values.telef_alternativo,
                celular:values.celular,
                email:values.email,
                email_secundario:values.email_secundario,
                obs_finanzas:values.obs_finanzas
            },
            materias: materiasTestAlumno,
            instrumentos:instrumentosAlumno
        }

    setGrabandoDatosAlumno(true)

    let mensaje_html = `<p>Los datos se grabaron exitosamente</p>`

    try{
        if (id_alumno){
            resultado= await Axios.put(`/api/alumnos/${id_alumno}`,objetoAgrabar)
            id_alumno_interno = id_alumno; // es el id del alumno a modificar
        }else{
            resultado= await Axios.post(`/api/alumnos`,objetoAgrabar)
            id_alumno_interno = resultado.data.id_alumno; // es el id del nuevo alumno 
            mensaje_html = `<p>Los datos se grabaron exitosamente</p><p>(Nuevo alumno #${resultado.data.id_alumno})</p>`
        }

        grabarInstrumentosYmaterias(id_alumno_interno,nombre_interno); // le paso el id interno y el nombre para que en alta se pueda seleccionar al alumno en el context y asì se pueda ir directo a inscripciones
        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
        setGrabandoDatosAlumno(false)
    }catch(err){
        console.log(err.response)
        const mensaje_html = `<p>Se produjo un error al grabar los datos del alumno</p><p>${err.response.data.message}</p>`


        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    
        setGrabandoDatosAlumno(false)
    }
   

}



const cambiarAmpliado = (ampliado)=>{
    setHistorialAmpliado(ampliado)
}

const grabarInstrumentosYmaterias = async (id_alumno_interno, nombre)=>{ // recibo en id_interno el id del alumno sea el nuevo recién creado o el id del alumno que estamos moficando
    try{
        let mensaje_html = `<p>Los instrumentos y materias se grabaron exitosamente</p>`

        const objetoAgrabar={instrumentos:instrumentosAlumno,
                              materias:materiasTestAlumno}

        const resultado = await Axios.post(`/api/alumnos/instrumentosmaterias/${id_alumno_interno}`,objetoAgrabar)

        // Evito mostrar la confirmación de instrumentos y materias
        // En principio solo confirmo 1 sola vez por todo. Si llegase a fallar aqui
        // se va a mostrar el mensaje de error en el catch.
        /*Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   */ 
        if (esModal){
            if(id_alumno){
                setContadorModificaciones(contadorModificaciones+1)
                finalizarAltaOcopia(false)
            }else{
                finalizarAltaOcopia(true,id_alumno_interno,nombre)
            }

        }else{
            finalizarAltaOcopia(true); // es una función que se ejecuta en el padre para ejecutar una acción luego de haber creado o copiado un curso
        }

    }catch(err){
        let mensaje_html_error;

        if(err.response.data.message){
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del usuario</p><p>${err.response.data.message}</p>`
        }else if (err.response.data) {
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del usuario</p><p>${err.response.data}</p>`
        }else{
            mensaje_html_error = `<p>Se produjo un error al grabar los datos del usuario</p><p>${err.response}</p>`
        }


        Swal.fire({
            html:mensaje_html_error,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
        })   
    }
} 

const handleMateriaSeleccionada=(e)=>{
    setMateriaSeleccionada(e.target.value)
}

const handleInstrumentoSeleccionado=(e)=>{
    setInstrumentoSeleccionado(e.target.value)
}

const modificarMateriasAprobadas =(e)=>{

    const yaExiste = materiasTestAlumno.findIndex(item=>item.id_materia==materiaSeleccionada)

    if (yaExiste!=-1){
        setErrorMateria('La materia ya figura como aprobada')
        return
    }else{
        setErrorMateria(null)
    }
     // para que cierre el select de materias
    setAgregarMateria(false);

    // para encontrar la materia seleccionada en el vector de materias
    const nuevaMateria = materias.filter(item=>item.id_materia==materiaSeleccionada)

    // para agregar la materia nueva con la función del use state
    setMateriasTestAlumno([...materiasTestAlumno,...nuevaMateria])

    // para hacer que lista de materias vuelva al valor "seleccionar"
    setMateriaSeleccionada(-1)

    setHuboCambiosMaterias(true)
}

const modificarInstrumentosYniveles =()=>{

    const yaExiste = instrumentosAlumno.findIndex(item=>item.id_instrumento==instrumentoSeleccionado)

    if (yaExiste!=-1){
        setErrorInstrumento('El instrumento ya figura en la lista del alumno')
        return
    }else{
        setErrorInstrumento(null)
    }
     // para que cierre el select de materias
     setAgregarInstrumento(false);

    // para encontrar la materia seleccionada en el vector de materias
    const nuevoInstrumento = instrumentos.filter(item=>item.id_instrumento==instrumentoSeleccionado)

    const objetoAagregar = {instrumentos:nuevoInstrumento[0].nombre,
                            id_instrumento:instrumentoSeleccionado,
                            id_nivel_ensamble:0,
                            id_nivel_instrumental:0,
                            nivel_e:'..',
                            nivel_i:'..'}
    // para agregar la materia nueva con la función del use state
    setInstrumentosAlumno([...instrumentosAlumno, objetoAagregar])

    // para hacer que lista de materias vuelva al valor "seleccionar"
    setInstrumentoSeleccionado(-1)

    setHuboCambiosInstrumentos(true)
}

const excluirMateria = (id)=>{

    const nuevaLista = materiasTestAlumno.filter(item=>item.id_materia!=id)
    setHuboCambiosMaterias(true)
    setMateriasTestAlumno([...nuevaLista])
}

const excluirInstrumento = (id)=>{
    const nuevaLista = instrumentosAlumno.filter(item=>item.id_instrumento!=id)
    setHuboCambiosInstrumentos(true)
    setInstrumentosAlumno([...nuevaLista])
}
const cancelarAbm = ()=>{
    if (!id_alumno){ // solo cancelo si es un alta o una copia ya que se hacen en la vista de cursos. La edición de un curso se hace en la vista de curso y siempre lo muestro
        finalizarAltaOcopia(false)
    }
}

const iniciarGrabarAlumno = (values)=>{
    let texto;
    let textoConfirmacion;

    if (id_alumno){
        texto = `Confirma la modificación del alumno ${id_alumno}?`
        textoConfirmacion = 'Si, modificar el alumno'
    }else{
        texto = `Confirma la creación del nuevo alumno?`
        textoConfirmacion = 'Si, crear el alumno'
    }

    Swal.fire({
        text:texto,
        showCancelButton:true,
        confirButtonText:textoConfirmacion,
        cancelButtonText:'Cancelar'
    }).then(
        resultado=>{
            if (resultado.value){
                grabarAlumno(values);

            }else{
                console.log("Se canceló la modificación o creación del alumno")
            }
        }
    )
}

const cargarProvinciasArgentina = ()=>{
    const data = vectorProvincias.filter(item=>item.id_pais==1)
    setProvincias(data)
}


const buscarProvincias = (e,setFieldValue)=>{

    const pais = e.target.value

    setCargandoProvincias(true); 

    let id_provincia;

        //atención e.target.value siempre es un string.
        // por eso aquì en este caso uso doble igual en lugar de triple igual porque item.id_encabezado es un number y encabezado es un string
    const data = vectorProvincias.filter(item=>item.id_pais==pais)

    if (data.length===1){
        id_provincia=data[0].id_provincia;
        setProvincias(data)
        setFieldValue('provincia',id_provincia)
    }else if (data.length>1) {
        setProvincias([{id_provincia:-1, nombre:"Seleccionar"},...data])
        setFieldValue('provincia',-1)
    }else{
        setProvincias([{id_provincia:-2, nombre:"----?----"}])
        setFieldValue('provincia',-2)
    }

    setCargandoProvincias(false); 

}


// Se carga directamente al traer los datos del alumno
/*const initialValuesAlumno = {

} */ 

// es un objeto cuyas propiedades deben coincidir con el nombre
                              // de los Fields y con el nombre del validationSchema

// algunas entidades comienzan de 1 y otras aceptan el valor 0 por eso
// en algunos casos valido con .positive() para los que comienzan de 1, porque positive() excluye el cero
// en otros valido con min(0) para los que comienzan de 0                              
// el .test lo dejo como ejemplo para notar que se pueden hacer validaciones más específicas

const validationSchemaAlumno = Yup.object({

nombre:Yup.string().max(20,'El nombre debe tener como máximo 20 caracteres')
        .required('Falta completar el nombre'),
apellido:Yup.string().max(20,'El apellido debe tener como máximo 20 caracteres')
        .required('Falta completar el apellido'),
/*documento:Yup.number().typeError('El documento debe ser un número').min(1000000,'El documento debe tener como mínimo 7 dígitos')
    .max(99999999,'El documento debe tener como máximo 8 dígitos')
    .required('Falta completar el documento'),*/
documento:Yup.string().typeError('El documento debe ser un número')
    .max(15,'El documento debe tener como máximo 15 carácteres')
    .required('Falta completar el documento'),    
sexo:Yup.string().max(1)
    .required('Falta completar el sexo')
    .test("sexo","El sexo debe ser M o F",value => value === 'M' || value === 'F'),
nacionalidad:Yup.string()
        .required('Falta seleccionar la nacionalidad'),
dia:Yup.number()
    .required('Falta seleccionar el día de nacimiento'),
mes:Yup.number()
    .required('Falta seleccionar el mes de nacimiento'),
anio:Yup.number()
    .min(1940,'El año no es válido')
    .required('Falta seleccionar el año de nacimiento'),        
pais:Yup.number()
    .positive('Falta seleccionar un país')
    .required('Falta seleccionar un país')
    .test("prueba","El código de país debe ser mayor a cero",value => value > 0),
provincia:  Yup.number()
    .positive('Falta seleccionar una provincia')
    .required('Falta seleccionar una provincia')
    .test("prueba","El código de provincia debe ser mayor a cero",value => value > 0),
domicilio:Yup.string().max(50,'El domicilio debe tener como máximo 50 caracteres')
    .required('Falta completar el domicilio'),            
localidad:Yup.string().max(15,'La localidad debe tener como máximo 15 caracteres')
    .required('Falta completar la localidad'),    
codpostal:Yup.string().max(10,'El código postal debe tener como máximo 10 caracteres'),            
domicilio2:Yup.string().max(50,'El domicilio 2 debe tener como máximo 50 caracteres').nullable(),
email:Yup.string().email('El email no es válido').max(200,'El email debe tener como máximo 200 caracteres')
    .required('Falta completar el e-mail'),            
email_secundario:Yup.string().email('El email no es válido').max(200,'El email 2 debe tener como máximo 200 caracteres'),
telefono:Yup.string().max(100,'El teléfono debe tener como máximo 100 caracteres')
.test('celular','Debe completar un teléfono o celular.',function(val){
    const {celular} = this.parent;
  
    if (!celular && !val){
        return false
    } else{
        return true
    }
}),
celular:Yup.string().max(100,'El celular debe tener como máximo 100 caracteres')
.test('celular','Debe completar un teléfono o celular.',function(val){
    const {telefono} = this.parent;
    if (!telefono && !val){
        return false
    }  else{
        return true
    }
}),
telef_alternativo:Yup.string().max(100,'El teléfono alt. debe tener como máximo 100 caracteres'),
telef_laboral:Yup.string().max(100,'El teléfono lab. debe tener como máximo 100 caracteres'),
obs_finanzas:Yup.string().max(1000,'Las observaciones deben tener como máximo 1000 caracteres')
})                 

const onsubmitAlumno = values =>{
    console.log(values)
    iniciarGrabarAlumno(values)
}

    if (huboError){
        return <Main center><span>Se produjo un error al cargar los datos para esta vista</span></Main>
    }

    if (cargandoDatosTablasGenerales){
        return <Main center><div><Loading/><span className="cargando">Cargando cargando datos generales...</span></div></Main>
    };

    if (cargandoDatosAlumno){
        return <Main center><div><Loading/><span className="cargando">Cargando datos personales del alumno...</span></div></Main>
    };

    if (cargandoMateriasInstrumentos){
        return <Main center><div><Loading/><span className="cargando">Cargando instrumentos, niveles y materias...</span></div></Main>
    };

  {/*  if (grabandoDatosAlumno){
        return <Main center><div><Loading/><span className="cargando">Grabando datos...</span></div></Main>
    };
*/}
    return (
        <Main> 
        { grabandoDatosAlumno && <Main><div><Loading blanco={true}/><span className="cargando">Grabando datos...</span></div></Main>}
        { id_alumno && esModal && 
            <div className="absolute top-m-15">
                <ImpresionesAlumno datosDelAlumno={datosParaImpresiones} esModal={true} 
                                   mostrarLateralmente={false}
                                   alumno={{instrumentos:instrumentosAlumno,historial:historial,materiasAprobadasTest:materiasTestAlumno}}
                />
            </div>
        } 
  <div className={grabandoDatosAlumno ? "hidden" : ""}>
      
  <div className='pt-4 rounded flex flex-wrap container-mult-flex-center relative' >
             <div><div>
            {/*<div className="AnaliticoContainer relative">
                <div className="FormAnaliticoContainer relative">
                    <div  className="mb-2 titulo-cab-modal titulo-abm flex f-row">{tituloAbm}
                    </div>
                { !esModal && <button onClick={()=>finalizarAltaOcopia(false)} title={tituloCerrar} className="absolute botonAbm"><FontAwesomeIcon icon={faWindowClose}/></button> }
            */}

                <Formik validateOnMount 
                enableReinitialize initialValues={objetoInicializacion}
    validationSchema={validationSchemaAlumno} onSubmit={onsubmitAlumno}>
{ ({ values, errors, touched, handleChange,setFieldValue, resetForm, initialValues,dirty }) =>{ 
    return (
    <Form id="ref-ficha">
  {id_alumno && <GestionEgresos id_alumno={id_alumno} finalizarCambioStatus={finalizarAltaOcopia}/>}

    <div className="AnaliticoContainer relative">
    <div  className="mb-4 titulo-abm-modal flex f-row text-larger">{tituloAbm}</div>
    {/* !esModal && <button onClick={()=>finalizarAltaOcopia(false)} title={tituloCerrar} className="absolute botonAbm"><FontAwesomeIcon className="ic-abm"  icon={faWindowClose}/></button> */}

                    
        <div className="FormAbmContainerLargo">
            <div className="flex f-col">
            {id_alumno && dirty && <span type="button" title="Deshacer los cambios y restaurar valores iniciales" 
                className="cursor-pointer absolute botonRestaurar boton-restaurar-abm-form" 
                onClick={() => resetForm(initialValues)}>Restaurar
                </span>
            }
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-nombre">Nombre</label>
                    <Field 
                        id="abm-nombre"
                        onFocus={()=>seleccionarTextoInput("abm-nombre")} 
                        onClick={()=>seleccionarTextoInput("abm-nombre")}                         
                        type="text" 
                        autoComplete="off" 
                        maxLength="20"
                        name="nombre" 
                        className={values.nombre ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="nombre"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-apellido">Apellido</label>
                    <Field 
                        id="abm-alumno-apellido"
                        type="text" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-apellido")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-apellido")}                         
                        maxLength="20"
                        autoComplete="off" 
                        name="apellido" 
                        className={values.apellido ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="apellido"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-documento">Documento</label>
                    <Field 
                        id="abm-alumno-documento"
                        type="text" 
                        autoComplete="off" 
                        maxLength="15"
                        onFocus={()=>seleccionarTextoInput("abm-alumno-documento")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-documento")}                          
                        name="documento" 
                        className={values.documento ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="documento"/></div> 
            </div>  
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-sexo">Sexo</label>
                    <select onChange={handleChange} value={values.sexo} name="sexo" className="w-selabm" id="abm-alumno-sexo">
                            <option  value="M">Hombre</option>
                            <option  value="F">Mujer</option>
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="sexo"/></div>                                     
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-nacionalidad">Nacionalidad</label>
                    <select onChange={handleChange} value={values.nacionalidad} name="nacionalidad" className="w-selabm" id="abm-alumno-nacionalidad">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                nacionalidades.map(item=>
                                    <option key={`abm-alumno-nacionalidad${item.id_nacionalidad}`} 
                                        value={item.nombre}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="nacionalidad"/></div> 
            </div>  
            <label className="Form__labels" htmlFor="fecha">Fecha de nacimiento</label>
            <div className="flex f-col items-center">
                <div className="flex f-row" id="fecha">
                        <select onChange={handleChange} 
                                value={values.dia}
                                name='dia' 
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                {vectorDias.map(item=><option value={item} key={item}>{item}</option> )}
                        </select>                       
                        <select onChange={handleChange} 
                                value={values.mes} 
                                name='mes'
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {vectorMeses.map(item=><option value={item.id} key={item.id}>{item.mes}</option> )}
                        </select>
                        <select onChange={handleChange} 
                                value={values.anio} 
                                name='anio'
                                
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                            {vectorAnios.map(item=><option 
                               disabled = {item==1900}  value={item} key={item}>{item}</option> )}
                        </select>
                        
                    </div>
                        <div className="error_formulario"><ErrorMessage name="dia"/></div> 
                        <div className="error_formulario"><ErrorMessage name="mes"/></div> 
                        <div className="error_formulario"><ErrorMessage name="anio"/></div>   
                </div>            
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-domicilio">Domicilio</label>
                    <Field 
                        id="abm-alumno-domicilio"
                        type="text" 
                        maxLength="50"
                        onFocus={()=>seleccionarTextoInput("abm-alumno-domicilio")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-domicilio")}                          
                        autoComplete="off" 
                        name="domicilio" 
                        className={values.domicilio ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="domicilio"/></div> 
            </div>   
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-localidad">Localidad</label>
                    <Field 
                        id="abm-alumno-localidad"
                        type="text" 
                        maxLength="15"
                        name="localidad" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-localidad")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-localidad")}                           
                        className={values.localidad ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="localidad"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-codpostal">Código postal</label>
                    <Field 
                        id="abm-alumno-codpostal"
                        type="text" 
                        maxLength="10"
                        name="codpostal" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-codpostal")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-codpostal")}                            
                        className={values.codpostal ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="codpostal"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-domicilio2">Domicilio 2</label>
                    <Field 
                        id="abm-alumno-domicilio2"
                        type="text" 
                        autoComplete="off" 
                        maxLength="50"
                        name="domicilio2" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-domicilio2")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-domicilio2")}                            
                        className={values.domicilio2 ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="domicilio2"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-telefono">Teléfono</label>
                    <Field 
                        id="abm-alumno-telefono"
                        type="text" 
                        autoComplete="off" 
                        maxLength="25"
                        onFocus={()=>seleccionarTextoInput("abm-alumno-telefono")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-telefono")}                          
                        name="telefono" 
                        className={values.telefono ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="telefono"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-celular">Celular</label>
                    <Field 
                        id="abm-alumno-celular"
                        type="text" 
                        maxLength="25"
                        autoComplete="off" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-celular")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-celular")}                             
                        name="celular" 
                        className={values.celular ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="celular"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-telef_alternativo">Teléfono alternativo</label>
                    <Field 
                        id="abm-alumno-telef_alternativo"
                        type="text" 
                        autoComplete="off" 
                        maxLength="25"
                        onFocus={()=>seleccionarTextoInput("abm-alumno-telef_alternativo")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-telef_alternativo")}                         
                        className={values.telef_alternativo ? '' : 'input-vacio'}
                        name="telef_alternativo" 
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="telef_alternativo"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-telef_laboral">Teléfono laboral</label>
                    <Field 
                        id="abm-alumno-telef_laboral"
                        type="text" 
                        autoComplete="off" 
                        maxLength="25"
                        onFocus={()=>seleccionarTextoInput("abm-alumno-telef_laboral")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-telef_laboral")}                          
                        name="telef_laboral" 
                        className={values.telef_laboral ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="telef_laboral"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-email">E-mail</label>
                    <Field 
                        id="abm-alumno-email"
                        type="email" 
                        autoComplete="off" 
                        maxLength="200"
                        name="email" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-email")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-email")}                           
                        value={values.email.toLowerCase()}
                        className={values.email ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="email"/></div> 
            </div>  
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-email_secundario">E-mail 2</label>
                    <Field 
                        id="abm-alumno-email_secundario"
                        type="email" 
                        maxLength="200"
                        autoComplete="off" 
                        name="email_secundario" 
                        onFocus={()=>seleccionarTextoInput("abm-alumno-email_secundario")} 
                        onClick={()=>seleccionarTextoInput("abm-alumno-email_secundario")}                                   
                        value={values.email_secundario.toLowerCase()}
                        className={values.email_secundario ? '' : 'input-vacio'}
                        />
                </div>  
                <div className="error_formulario"><ErrorMessage name="email_secundario"/></div> 
            </div>  
                                                                                                                                           
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-pais">País</label>
                    <select onChange={(e)=>{handleChange(e);buscarProvincias(e,setFieldValue)}} value={values.pais} name="pais" className="w-selabm" id="abm-alumno-pais">
                            <option disabled value="-1">Seleccionar</option>
                            {
                                paises.map(item=>
                                    <option key={`abm-alumno${item.id_pais}`} 
                                        value={item.id_pais}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="pais"/></div> 
            </div> 
            <div className="flex f-col">
                <div className="flex f-row">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-curso-provincia">Provincia</label>
                    <select onChange={handleChange} 
                            value={values.provincia} 
                            name="provincia"
                            title={values.pais==-2 ? 'No se encontraron provincias para el país seleccionado':''} 
                            disabled = {values.pais===-1}
                            className="w-selabm" id="abm-curso-provincia">
                          
                          {/*<option disabled value="-1">Seleccionar</option*/}  
                          {/* aqui no agrego el option con value -1 y texto Seleccionar, esto lo manejo dinámicamente en la función buscarRegimenes ya que este select se carga cuando se selecciona un encabezado */}
                            {
                                provincias.map(item=>
                                    <option key={uuidv4()} 
                                      value={item.id_provincia}>{item.nombre}</option>
                                )
                            }
                    </select>
                </div>  
                <div className="error_formulario"><ErrorMessage name="provincia"/></div> 
            </div> 
            <div className="flex f-col">
                    <label className="Form__labels__abmcursos_corto" htmlFor="abm-alumno-email_secundario">Observaciones financieras</label>
                    <Field
                        name="obs_finanzas"
                        component="textarea"
                        maxLength="1000"
                        rows="2"
                        className="input-vacio"
                    />
                <div className="error_formulario"><ErrorMessage name="obs_finanzas"/></div> 
            </div> 
            <button className="Form__submit" type="submit">Grabar</button>
        </div>
      
    </div>    
    </Form>) } }

    </Formik>
        </div>
    </div>
    <div className="flex f-col">
        {id_alumno && <div className="mb-2">
        <div id="histo-al" className='mb-2 cabecera color-63 border-bottom-solid-light'>{`Cursadas actuales (${historial.length})`}</div>
        {<CursadasActuales cursadas={historial}/>}
        </div>}       
    <div className="flex f-row">
    { !historialAmpliado && <div>
        <div className="AnaliticoContainer relative">
            <div className="pan-abm-al">
                <div className='mb-2 cabecera color-63 border-bottom-solid-light'>Materias Aprobadas por test</div>
                    {id_alumno && huboCambiosMaterias && 
                        <span type="button" title="Deshacer los cambios y restaurar valores iniciales" 
 
                            onClick={restaurarMaterias} 
                            className="cursor-pointer boton-restaurar-abm botonAbm">Restaurar
                        </span>
                    }
                <MateriasAlumno materias={materiasTestAlumno} 
                                excluirMateria={excluirMateria} 
                                errorMateria={errorMateria}
                />
                
                          
                <AgregarMaterias agregarMateria={agregarMateria}
                                setAgregarMateria={setAgregarMateria}
                                materiaSeleccionada={materiaSeleccionada}
                                setMateriaSeleccionada={setMateriaSeleccionada}
                                modificarMateriasAprobadas={modificarMateriasAprobadas}
                                errorMateria={errorMateria}
                                setErrorMateria={setErrorMateria}
                                handleMateriaSeleccionada={handleMateriaSeleccionada}
                                materias={materias}
                />           
            </div>
        </div>
        <div className="AnaliticoContainer relative">
            <div className="pan-abm-al">
            <div className='mb-2 cabecera color-63 border-bottom-solid-light'>Instrumentos y Niveles</div>
            {id_alumno && huboCambiosInstrumentos && 
                <span type="button" 
                    onClick={restaurarInstrumentos} 
                    title="Deshacer los cambios y restaurar valores iniciales" 
                    className="cursor-pointer boton-restaurar-abm botonAbm">Restaurar
                    </span>
            }
                
                <InstrumentosAlumno nivelesi={nivelesI} 
                                    nivelese={nivelesE} 
                                    instrumentos={instrumentosAlumno} 
                                    excluirInstrumento={excluirInstrumento}
                                    handleNivelEChange={handleNivelEChange}
                                    handleNivelIChange={handleNivelIChange}
                                    />
                
                <AgregarInstrumento agregarInstrumento={agregarInstrumento}
                                setAgregarInstrumento={setAgregarInstrumento}
                                instrumentoSeleccionado={instrumentoSeleccionado}
                                setInstrumentoSeleccionado={setInstrumentoSeleccionado}
                                modificarInstrumentosYniveles={modificarInstrumentosYniveles}
                                errorInstrumento={errorInstrumento}
                                setErrorInstrumento={setErrorInstrumento}
                                handleInstrumentoSeleccionado={handleInstrumentoSeleccionado}
                                instrumentos={instrumentos}
                />                
            </div>

        </div>
    </div> }
        { id_alumno && 
        <div className="AnaliticoContainer relative">
            <div className="pan-abm-al">
                <div id="histo-al" className='mb-2 cabecera color-63 border-bottom-solid-light'>Historial de cursadas</div>
                
                    {buscarHistorial &&  <HistorialAlumno id_alumno={id_alumno} actual={0} cambiarAmpliado={cambiarAmpliado}/>}

            </div>

        </div>}
        </div>
        </div>
      </div>
    </div>
    </Main>
    )
}

function cargarVectorHoras() {
    let hora;
    let vector_horas = []

    for (var i = 8; i < 23; i++) {
        if (i < 10) {
            hora = `0${i}`;
        } else {
            hora = `${i}`;
        }
        vector_horas.push(hora);
    }

    return vector_horas
}

function cargarCapacidades() {
    let capacidad;
    let vector_capacidad = []

    for (var i = 1; i < 100; i++) {
        vector_capacidad.push(i);
    }

    return vector_capacidad
}
function cargarVectorMinutos() {
    let vector_minutos = []

    vector_minutos.push('00');
    vector_minutos.push('30');

    return vector_minutos
}

function calcularCantIntervalos30minutos(hora_desde,min_desde,hora_hasta,min_hasta) {
    let horaDESDE = new Date(0);

    horaDESDE.setHours(hora_desde);
    horaDESDE.setMinutes(min_desde);

    let horaHASTA = new Date(0);

    horaHASTA.setHours(hora_hasta);
    horaHASTA.setMinutes(min_hasta);

    let minutos = (horaHASTA - horaDESDE) / 1000 / 60;

    console.log(minutos)
    let capacidad = minutos / 30

    return capacidad
}

function diferencia(horai,horaf,minutoi,minutof) {
    var resultado = true;
    var mensaje = '';

    var hora_desde = horai;
    var hora_hasta = horaf;
    var min_desde = minutoi;
    var min_hasta = minutof;

    var hora_desde_nummerica = Number(hora_desde + min_desde)
    var hora_hasta_nummerica = Number(hora_hasta + min_hasta)

    console.log('hora desde: ' + hora_desde_nummerica)
    console.log('hora hasta: ' + hora_hasta_nummerica)

    if (hora_desde_nummerica >= hora_hasta_nummerica) {
        resultado = false;
        mensaje = 'La hora de inicio debe ser anterior a la hora de fín'
    }

    console.log('hora_hasta_nummerica',hora_hasta_nummerica)
    console.log('hora_desde_nummerica',hora_desde_nummerica)

    return (hora_hasta_nummerica > hora_desde_nummerica  )

}

function hacerScroll(id){
    let element = document.getElementById(id);

    if(!element){return}
    element.scrollIntoView(false);
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

function anioNacimientoAlta(){
    let fecha_actual = new Date();
    let anio_hasta = Number(fecha_actual.getFullYear() - 3);

    return anio_hasta
}

function cargarVectorAnios(setAnios) {
    var anios = [];
    var anio;

    var fecha_actual = new Date();
    var anio_hasta = Number(fecha_actual.getFullYear() - 3);
    var anio_desde = anio_hasta - 80;

    for (var i = anio_hasta; i > anio_desde; i--) {
        anio = i.toString();
        anios.push(anio);
    }

    anios.push(1900); // agrego porque en la tabla hay fechas vacias que sql server los transforma a una fecha nula 1900-01-01 00:00:00.000
                      // para que tome las fechas 1900-01-01 00:00:00.000 y que el usuario vea que es un año invalido 

    setAnios(anios);
}

function noNull(valor){
    if (!valor){
        return ''
    }else{
        return valor
    }
}

function MateriasAlumno({materias,excluirMateria,errorMateria}){
//return(<p>{JSON.stringify(materias)}</p>)

return (
    <div className="mt-4">
    {materias.map(
        (item,index)=><div key={uuidv4()} className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
        <button title='Borrar'onClick={()=>excluirMateria(item.id_materia)}>
            <FontAwesomeIcon className="color-tomato" icon={faTrashAlt}/>
        </button>
        <span className="listaCursadasAnalitico recortar-150">{item.descripcion}</span> 
        <span className="listaCursadasAnalitico">{item.cod_materia}</span> 
    </div>
    )}
</div>

)
}

function InstrumentosAlumno({instrumentos,excluirInstrumento,nivelesi,nivelese,handleNivelIChange,handleNivelEChange}){

return (
<div className="mt-4 relative">
           {instrumentos.length>0 &&<div className="flex flex-row absolute tm15-r0"><span title="Nivel instrumental" className="titulo-nine">NI</span><span title="Nivel ensamble" className="cabnivei-nivele titulo-nine">NE</span></div>}
           {instrumentos.map(
               (item,index)=><div key={uuidv4()} className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
               
               <button title='Borrar'onClick={()=>excluirInstrumento(item.id_instrumento)}>
                   <FontAwesomeIcon className="color-tomato" icon={faTrashAlt}/>
               </button>
               <span className="listaCursadasAnalitico recortar-nine">{item.instrumentos}</span> 
               <span className="nivei-nivele mr-2 "><SelectNivelI value={item.id_nivel_instrumental} instrumento={item.id_instrumento} niveles={nivelesi} onchange={handleNivelIChange}/></span> 
               <span className="nivei-nivele"><SelectNivelE value={item.id_nivel_ensamble} instrumento={item.id_instrumento} niveles={nivelese} onchange={handleNivelEChange}/></span> 
           </div>
           )}
       </div>

)}


function AgregarInstrumento({agregarInstrumento,
    setAgregarInstrumento,
    instrumentoSeleccionado,
    setInstrumentoSeleccionado,
    modificarInstrumentosYniveles,
    errorInstrumento,
    setErrorInstrumento,
    handleInstrumentoSeleccionado,
    instrumentos}){
return(
<>     
        { !agregarInstrumento && <button title="Agregar un instrumento" 
        onClick={()=>{setAgregarInstrumento(true);setInstrumentoSeleccionado(-1)}}>
            <FontAwesomeIcon className="ic-abm"  icon={faPlusSquare}/> <span className="texto-acciones-menu bu-accion-abm">Agregar instrumento</span>
        </button>
        }  

        {agregarInstrumento && <button title="Cancelar" onClick={()=>{setAgregarInstrumento(false);setErrorInstrumento(null)}}>
        <FontAwesomeIcon className="ic-abm"  icon={faWindowClose}/>
        </button>
        }  

        { agregarInstrumento && 
        <div className="flex f-row">

        <select onChange={handleInstrumentoSeleccionado} value={instrumentoSeleccionado} className="w-selabm" id="abm-alumno-nacionalidad">
            <option disabled value="-1">Seleccionar</option>
            {
            instrumentos.map(item=>
            <option key={`abm-alumno-instrumentos${item.id_instrumento}`} 
            value={item.id_instrumento}>{item.nombre}</option>
            )
            }
        </select>

        { instrumentoSeleccionado>0 && 
        <button title="Agregar la materia aprobada" 
        onClick={modificarInstrumentosYniveles} className="relative">
        <FontAwesomeIcon className="ic-abm"  icon={faCheckSquare}/>
        <p onClick={modificarInstrumentosYniveles} title="Agregue el instrumento seleccionado" className="absolute cursor-pointer font-w-200"><span className="blink">Agregar</span></p>
        </button>}
        </div>  
        }      

        { agregarInstrumento && errorInstrumento && <div className="error_formulario"><span>{errorInstrumento}</span></div> }
</>
)
}

function AgregarMaterias({agregarMateria,
                          setAgregarMateria,
                          materiaSeleccionada,
                          setMateriaSeleccionada,
                          modificarMateriasAprobadas,
                          errorMateria,
                          setErrorMateria,
                          handleMateriaSeleccionada,
                          materias}){
return(
<>     
    { !agregarMateria && <button title="Agregar una materia aprobada" 
    onClick={()=>{setAgregarMateria(true);setMateriaSeleccionada(-1)}}>
    <FontAwesomeIcon className="ic-abm" icon={faPlusSquare}/> <span className="texto-acciones-menu bu-accion-abm">Agregar materia</span>
    </button>
    }  

    {agregarMateria && <button title="Cancelar" onClick={()=>{setAgregarMateria(false);setErrorMateria(null)}}>
        <FontAwesomeIcon className="ic-abm" icon={faWindowClose}/>
    </button>
    }  

    { agregarMateria && 
        <div className="flex f-row">

        <select onChange={handleMateriaSeleccionada} value={materiaSeleccionada} className="w-selabm" id="abm-alumno-nacionalidad">
            <option disabled value="-1">Seleccionar</option>
            {
                materias.map(item=>
                    <option key={`abm-alumno-materias${item.id_materia}`} 
                        value={item.id_materia}>{item.descripcion}</option>
                )
            }
        </select>

    { materiaSeleccionada>0 && 
        <div>
            <button title="Agregar la materia aprobada" 
                onClick={(e)=>modificarMateriasAprobadas(e)} className="relative">
                <FontAwesomeIcon className="ic-abm"  icon={faCheckSquare}/>
                <p onClick={modificarMateriasAprobadas} title="Agregue la materia seleccionada" className="absolute cursor-pointer font-w-200"><span className="blink" >Agregar</span></p>
            </button> 
        </div>
        }
        
    </div>  
}      

{ agregarMateria && errorMateria && <div className="error_formulario"><span>{errorMateria}</span></div> }
</>
)
}

function SelectNivelI({niveles,value,onchange,instrumento}){


   return (
        <div>
            <select className="select-nive" value={value} onChange={(e)=>onchange(e,instrumento)}>
                {niveles.map(item=>
                    <option key={uuidv4()} value={item.id_nivel_instrumental} >{item.nombre}</option>)}
            </select>
        </div>
       
    )
    
}

function SelectNivelE({niveles, value,onchange,instrumento}){

    return (
        <div>
            <select value={value} className="select-nive" onChange={(e)=>onchange(e,instrumento)}>
                {niveles.map(item=>
                    <option key={uuidv4()} value={item.id_nivel_ensamble} >{item.nombre}</option>)}
            </select>
        </div>
       
    )
    
}


function Confirma(){
    return <div>
        <span>¿Confirma?</span>
        <button>
                <FontAwesomeIcon className="ic-abm"  icon={faCheckSquare}/> 
        </button>
    </div>
}

function tablasGeneralesLocalStorage(setMaterias,setPaises,setVectorProvincias,setNacionalidades,
                                     setInstrumentos,setNivelesI,setNivelesE){
let resultado = true;

const materias = localStorage.getItem('materias');
const paises = localStorage.getItem('paises');
const provincias = localStorage.getItem('provincias');
const nacionalidades = localStorage.getItem('nacionalidades');
const instrumentos = localStorage.getItem('instrumentos');
const nivelesi = localStorage.getItem('nivelesi');
const nivelese = localStorage.getItem('nivelese');


if (materias!=null){
    setMaterias(JSON.parse(materias))
}else{
    resultado = false;
}

if (paises!=null){
    setPaises(JSON.parse(paises))
}else{
    resultado = false;
}

if (provincias!=null){
    setVectorProvincias(JSON.parse(provincias))
}else{
    resultado = false;
}

if (nacionalidades!=null){
    setNacionalidades(JSON.parse(nacionalidades))
}else{
    resultado = false;
}

if (instrumentos!=null){
    setInstrumentos(JSON.parse(instrumentos))
}else{
    resultado = false;
}

if (nivelesi!=null){
    setNivelesI(JSON.parse(nivelesi))
}else{
    resultado = false;
}

if (nivelese!=null){
    setNivelesE(JSON.parse(nivelese))
}else{
    resultado = false;
}

return resultado

}

function CursadasActuales({cursadas}){
return cursadas.map(cursadas=><div className="block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 ml-2">
    <span title={cursadas.descripcion} className="listaCursadasAmpliada w-50 fw-600">{cursadas.mensaje}</span> 
    <span className="listaCursadasAmpliada w-200">{cursadas.descripcion} </span> 
    <span className="listaCursadasAmpliada w-150">{cursadas.profesor} </span> 
    <span className="listaCursadasAmpliada w-150">{`${cursadas.DiaHora}`} </span> 
    <span className="listaCursadasAmpliada w-150">{`${cursadas.Aula}`} </span> 
</div>)
}