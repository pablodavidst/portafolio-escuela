import moment from 'moment';

export function fechaActual(){
    const fecha = new moment();
    return fecha
}

export function compararFechas(fecha){
    const fechaActual = new moment();
    const fechaRegistro = new moment(fecha)

    const diferencia = fechaActual.diff(fechaRegistro,'seconds')
    
    return diferencia
}

export function sumarMinutos(horaI,minutoI,minutosMas){
    const startTime = `${horaI}:${minutoI}`;
    const durationInMinutes = minutosMas;

    const endTime = moment(startTime, 'HH:mm').add(durationInMinutes, 'minutes').format('HH:mm');
    return endTime
}