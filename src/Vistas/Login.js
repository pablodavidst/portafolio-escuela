import React, { useState } from 'react';
import Main from '../componentes/Main';

export default function Login({login, mostrarError}){

    // la interface del usuario depende del estado, en este caso consiste solo de un objeto usuario. Cada vez que cambia el estado se vuelve a renderizar la interface
const [datosLogin,setdatosLogin] = useState({username:'',password:''})    


    const handleInputChange = (e)=>{  // defino una función que va a escuchar los cambios que ocurren en los inputs. Agrego el listener con onChange
        setdatosLogin({...datosLogin,[e.target.name]:e.target.value})
    }

    function handleSubmit(e) {
        e.preventDefault();
    
        login(datosLogin.username, datosLogin.password);

      }

      /*async function handleSubmit(e) {
        e.preventDefault();
    
        try {
          await login(datosLogin.username, datosLogin.password);
        } catch (error) {
            console.log(error)
            mostrarError(error.message);
        }
      }     */ 

    return ( // envuelvo un contenido X con un componente Main 
    <Main center>  
        <div className="Signup">
            <div className="FormContainer">
                <p className="FormContainer__info">Login</p>
                <form onSubmit={handleSubmit}>
                    {/* Tengo conectado el input email con el estado usuario.email a través del atributo value y del evento onChange */}
                    <input value={datosLogin.usuario} 
                        onChange={handleInputChange} 
                        type="text" 
                        name="username" 
                        placeholder="Usuario" 
                        className="Form__field" required/>
                    <input value={datosLogin.password} 
                        onChange={handleInputChange} 
                        type="password" 
                        name="password" 
                        placeholder="Contraseña" 
                        className="Form__field" required/>
                    <button className="Form__submit" type="submit">Ingresar</button>
                </form>
            </div>
        </div>
    </Main>
    )
}