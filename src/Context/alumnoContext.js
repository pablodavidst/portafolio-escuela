import React, { useState, useEffect, useMemo } from 'react';
import Axios from 'axios';
import useModal from '../hooks/useModal';

// Primero creo un contexto
const AlumnoContext = React.createContext();

// Segundo creo un Provider que es una función que recibe props y retorna un objeto value con
// propiedades y métodos y los pondrá a disposición de cualquier componente que quiera conectarse
// con este contexto 

export function AlumnoProvider(props){
    const [alumno,setAlumno] = useState({id:null,nombre:''});
    const [usuario,setUsuario] = useState(null);
    const [mensaje,setMensaje] = useState(null);
    const [cuatrimestreActivo,setCuatrimestreActivo]=useState(null);
    const [mostrarBusquedaAlumnos,setMostrarBusquedaAlumnos] = useState(false);
    const [contadorOperacionesGlobales,setContadorOperacionesGlobales] = useState(0);

    function incrementarContadorOperacionesGlobales(id,nombre){
        console.log('incrementarContadorOperacionesGlobales')
        setContadorOperacionesGlobales(contadorOperacionesGlobales+1)
    } 
    
    function cambiarAlumno(id,nombre){
        setAlumno({id:id,nombre:nombre})
    } 
    
    function setearUsuario(usuario){
        setUsuario(usuario)
    } 

    function reinicializarAlumno(){
        setAlumno({id:null,nombre:''})
    }

    function reinicializarMensaje(){
        setMensaje(null)
    }

    function cambiarMensaje(mensaje){
        setMensaje(mensaje)
    }

    function cambiarCuatrimestreActivo(cuatrimestre){
        setCuatrimestreActivo(cuatrimestre)
    }

    function habilitarBusquedaAlumnos(){
        setMostrarBusquedaAlumnos(true)
    }

    function desHabilitarBusquedaAlumnos(){
        setMostrarBusquedaAlumnos(false)
    }

    const value = useMemo(()=>{
        return (
            {   alumno,
                cambiarAlumno,
                reinicializarAlumno,
                mensaje,
                cambiarMensaje,
                reinicializarMensaje,
                cuatrimestreActivo, 
                cambiarCuatrimestreActivo,
                mostrarBusquedaAlumnos,
                desHabilitarBusquedaAlumnos,
                habilitarBusquedaAlumnos,
                incrementarContadorOperacionesGlobales,
                contadorOperacionesGlobales,setearUsuario,usuario}
        )
    },[alumno,usuario,mensaje,cuatrimestreActivo,mostrarBusquedaAlumnos,contadorOperacionesGlobales]) // usamos useMemo para decirle que retorne siempre el mismo objeto 
                // a menos que cambie la propiedad alumno o mensaje. Si alumno o el mensaje
                // cambia vuelve a crear el objeto value.

    return <AlumnoContext.Provider value={value} {...props}/>
}

// Para que los componentes puedan consumir este contexto hay que exportar un hook
// para que se importe

export function useAlumno(){ // este hook lo va a usar el comonente que desee consumir este contexto
    const context = React.useContext(AlumnoContext)

    if (!context){
        throw new Error("useAlumno debe estar dentro del proveedor AlumnoContext")
    } // Si utilizamos este hook en un componente que no esté conectado con el contexto
      // sea el mismo o alguno de sus padres. Es decir que el contexto debe envolver a la 
      // rama que va a usar el mismo.
      return context; // aqui retornamos para el consumidor el objeto value
}