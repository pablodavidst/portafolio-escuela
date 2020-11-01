import React, { useState, useEffect } from 'react';
import { Link, withRouter,NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBalanceScale, faChartLine,faPowerOff, faBars, faCalendarAlt as calendar2, faClone,faUsers, faUserTie, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import {faCompass, faUserCircle, faCaretSquareUp, faCaretSquareDown, faCalendarAlt,faWindowClose,faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import {useAlumno} from '../Context/alumnoContext';
import useModal from '../hooks/useModal';
import Modal from './Modal';
import Busqueda from './Busqueda'
import Aulas from './Aulas'
import Instrumentos from './Instrumentos'
import Materias from './Materias'
import Cuatrimestres from './Cuatrimestres'
import imagen from '../logoemc.PNG';

export default function Nav({ usuario, logout, cuatrimestreActivo }) {

  const {mostrarBusquedaAlumnos, habilitarBusquedaAlumnos,desHabilitarBusquedaAlumnos} = useAlumno();
  const {toggle, isShowing } = useModal();
  const [componenteModal,setComponenteModal]= useState(null)
  const [titulo,setTitulo]= useState('')
  const [abrirMenuVertical,setAbrirMenuVertical]= useState(false)
  const [mostrar, setMostrar] = useState(false);


  const toggleMenuVertical = ()=>{
    setAbrirMenuVertical(!abrirMenuVertical)
  }

  const switchVistaBusquedaAlumnos = ()=>{

    if (mostrarBusquedaAlumnos){
          desHabilitarBusquedaAlumnos();
      }else{
         habilitarBusquedaAlumnos()
      }
  }

const switchMostrar=()=>{
    if (mostrar){
        setMostrar(false)
    }else{
        setMostrar(true)
    }
}

const mostrarMenuLateral=()=>{
    setMostrar(true)
}

const noMostrarMenuLateral=()=>{
  setMostrar(false)
}

  useEffect(()=>{
    console.log('se carga el nav')
  },[cuatrimestreActivo])

  

  return (
    <div>
    {usuario && <div onMouseEnter={mostrarMenuLateral} onMouseLeave={noMostrarMenuLateral}  className={mostrar ? "flex f-row wrapper_nav mostrar" : "flex f-row wrapper_nav nomostrar_nav"} onClick={switchMostrar}>
        <div id="slide2">
            <span onClick={switchMostrar} className="cursor-pointer mr-2 ml-2 color-tomato flex justify-content-end" >
                        {/*{ mostrar && <FontAwesomeIcon title="Cerrar" className="mostrar-menu-lateral" icon={faWindowClose}/>}*/}
                        { !mostrar && <FontAwesomeIcon title="Otras operaciones" className="mostrar-menu-lateral_nav" icon={faBars}/>}
            </span>  
            <MenuVertical setComponenteModal={setComponenteModal} toggle={toggle} setTitulo={setTitulo} toggleMenuVertical={toggleMenuVertical} />
        </div>
    </div>}
    <div>
    <nav className="Nav">
      <ul className="Nav__links">
       {!usuario && <li>
          <Link className="razon-social" to="/">
            Escuela de Música Contemporánea 
          </Link>
       </li>}
        {usuario && cuatrimestreActivo && <li title={`Cuatrimestre activo ${cuatrimestreActivo.nombre} (${cuatrimestreActivo.id_cuatrimestre})`} className="Nav__link-push fw-400 text-smaller"><p className="text-xsmall mb-2">Sesión de {usuario.nombre}</p>{cuatrimestreActivo.nombre}</li>}
        {usuario && <LoginRoutes toggle={toggle} 
                      usuario={usuario} 
                      logout={logout} 
                      switchVistaBusquedaAlumnos={switchVistaBusquedaAlumnos} 
                      setComponenteModal={setComponenteModal} 
                      setTitulo={setTitulo}
                      abrirMenuVertical={abrirMenuVertical} 
                      toggleMenuVertical={toggleMenuVertical} />}
      </ul>
    </nav>
    {/*usuario && <li className="color-gray">Sesión de {usuario.nombre}</li>*/}

    </div>
    { isShowing && <Modal hide={toggle} isShowing={isShowing} titulo={titulo} estiloWrapper={{background:'#000000bf'}}>
                           <SeleccionarComponenteModal componente={componenteModal}
                           />
                    </Modal>}      
    
    </div>

  );
}

function LoginRoutes({ usuario, 
                        logout, 
                        switchVistaBusquedaAlumnos,
                        toggle, 
                        setComponenteModal, 
                        setTitulo,
                        abrirMenuVertical,
                        toggleMenuVertical }) {

  const estilo_prueba = {color:'white',background:'tomato',padding:'3px'}

  return (
    <>
      {/*<li title="Cursos e inscripciones" className="Nav__link-push">
        <Link className="Nav__link" to="/cursos">
          <FontAwesomeIcon icon={faUsers} />
        </Link>
    </li>*/}
    <li title="Cursos e inscripciones" className="Nav__link-push">
          <div className="text-center"> 
              <NavLink activeClassName="op-active" className="Nav__link"  to="/cursos">
                <FontAwesomeIcon icon={faUsers} />
                <p className="text-small color-63 text-center">Cursos</p>
              </NavLink>
          </div>
    </li>
      {/*<li title="Usuarios profesores y administrativos" className="Nav__link-push">
        <div> 
          <Link className="Nav__link"  to="/personal">
            <FontAwesomeIcon icon={faChalkboardTeacher} />
          </Link>
        </div>
       
      </li> */}  
      <li title="Usuarios profesores y administrativos" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/personal">
            <FontAwesomeIcon icon={faChalkboardTeacher} />
            <p className="text-small color-63 text-center">Usuarios</p>
          </NavLink>
      </div>
      </li>         
      {/*<li title="Alumnos" className="Nav__link-push">
        <Link className="Nav__link"  to="/alumnos">
          <FontAwesomeIcon icon={faUserCircle} />
        </Link>
      </li>*/ }
      <li title="Alumnos" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/alumnos">
            <FontAwesomeIcon icon={faUserCircle} />
            <p className="text-small color-63 text-center">Alumnos</p>
          </NavLink>
      </div>
      </li>   
      {/*<li title="Cronograma diario de cursos" className="Nav__link-push relative">
        <Link className="Nav__link"  to="/cronograma-diario">
          <FontAwesomeIcon icon={faCalendarAlt}/><span className="text-small sub-i">D</span>
        </Link>
      </li>*/}     
      <li title="Cronograma diario de cursos" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/cronograma-diario">
            <FontAwesomeIcon icon={faCalendarAlt}/><span className="text-small sub-i">D</span>
            <p className="text-small color-63 text-center">Agenda diaria</p>
          </NavLink>
      </div>
      </li>         
      {/*<li title="Cronograma semanal de cursos" className="Nav__link-push relative">
        <Link className="Nav__link"  to="/cronograma-semanal">
          <FontAwesomeIcon icon={calendar2}/><span className="text-small sub-i">S</span>
        </Link>
      </li>*/}    
      <li title="Cronograma semanal de cursos" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/cronograma-semanal">
          <FontAwesomeIcon icon={calendar2}/><span className="text-small sub-i">S</span>
            <p className="text-small color-63 text-center">Agenda semanal</p>
          </NavLink>
      </div>
      </li> 
      <li title="Estadísticas" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/estadisticas">
          <FontAwesomeIcon icon={faChartLine}/><span className="text-small sub-i"></span>
            <p className="text-small color-63 text-center">Estadísticas</p>
          </NavLink>
      </div>
      </li>  
      <li title="Lista comparativa de inscripción entre períodos" className="Nav__link-push">
      <div className="text-center"> 
          <NavLink activeClassName="op-active" className="Nav__link"  to="/comparativas">
          <FontAwesomeIcon icon={faBalanceScale}/><span className="text-small sub-i"></span>
            <p className="text-small color-63 text-center">Comparativas</p>
          </NavLink>
      </div>
      </li>                            
      {/*<li className="Nav__link-push relative listado-al">
        <div>
          <span className="listado-al" title="Búsqueda y edición de cuatrimestres, aulas, instrumentos y materias" onClick={()=>toggleMenuVertical()} className="Nav__link">
            <FontAwesomeIcon className={abrirMenuVertical ? 'text-#e17851' : ''} icon={ !abrirMenuVertical ? faCaretSquareDown : faCaretSquareUp} />
          </span>
        </div>
      { abrirMenuVertical && <MenuVertical setComponenteModal={setComponenteModal} toggle={toggle} setTitulo={setTitulo} toggleMenuVertical={toggleMenuVertical} /> }
      </li>*/ }

      {/*<li title="Abrir la aplicación en una nueva pestaña" className="Nav__link-push">
        <Link className="Nav__link" to="/" target="_blank">
          <FontAwesomeIcon icon={faClone} />
        </Link>
      </li>*/}
      
      <li title="Abrir la aplicación en una nueva pestaña" className="Nav__link-push">
        <div className="text-center"> 
          <Link className="Nav__link" to="/" target="_blank">
            <FontAwesomeIcon icon={faClone} />
            <p className="text-small color-63 text-center">Nueva ventana</p>
          </Link>
        </div>
      </li> 
      <li className="Nav__link-push">
      <button className="Perfil__boton-logout" title="Salir" onClick={logout}>
          <FontAwesomeIcon icon={faPowerOff} />
          <span className="text-xxsmall block">Salir</span>
        </button>
      </li>
    
    
    </>
  );
}

function MenuVertical({setComponenteModal, toggle, setTitulo,toggleMenuVertical}){
  return(
<div className="menu-vertical-nav" onMouseLeave={toggleMenuVertical}>
        <ul className="ul-ml-n20 fixed">
          <li title="Listado y edición de cuatrimestres" className="listado-al p-2" onClick={()=>{setComponenteModal('cuatrimestres')
                          setTitulo('Listado de cuatrimestres')
                           toggle();toggleMenuVertical()}}>Cuatrimestres
          </li>
          <li title="Listado y edición de aulas" className="listado-al  p-2" onClick={()=>{setComponenteModal('aulas')
                            setTitulo('Listado de aulas')
                            toggle();toggleMenuVertical()}}>Aulas
          </li>
          <li title="Listado y edición de instrumentos" className="listado-al  p-2" onClick={()=>{setComponenteModal('instrumentos')
                            setTitulo('Listado de instrumentos')
                            toggle();toggleMenuVertical()}}>Instrumentos
          </li>
          <li title="Listado y edición de materias" className="listado-al  p-2" onClick={()=>{setComponenteModal('materias')
                          setTitulo('Listado de materias')
                          toggle();toggleMenuVertical()}}>Materias
          </li>
        </ul>
    </div>

  )
}

function SeleccionarComponenteModal({componente}){
 
  switch(componente){
    case  'aulas' : return <Aulas/>
    break;
    case 'materias' : return <Materias/>
    break;
    case 'instrumentos' : return <Instrumentos/>
    break;
    case 'cuatrimestres' : return <Cuatrimestres/>
    break;
    default: return null
  }
}