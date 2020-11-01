import React from 'react';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import Axios from 'axios';
import {_imagenLogo} from '../imagenesBase64/logo'
import Swal from 'sweetalert2';


    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    export function imprimir(cuerpo,lugar,fechaString,alumno){

        try{
            generarConstancia(cuerpo,lugar,fechaString,alumno)
            Swal.close();
        }catch(err){

        const mensaje_html = `<p>Hubo un error al imprimir la constancia</p><p>${err}</p>`

        Swal.fire({
            html:mensaje_html,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
          })
        }
    }

function generarConstancia(cuerpo,lugar,fechaString,alumno) {
        var docDefinition = {

            content: [

                {
                    columns: [
                        {
                            image: _imagenLogo,
                            width: 200, 
                        },
                        //{
                        //         text: `Escuela de Música Contemporánea`, margin: [2, 25], style: 'anotherStyle' 
                        //},
                    ]
                },

                

                {
                    text: `${lugar},  ${fechaString}`, margin: [2, 35] , style: 'header' },
                //{ text: `Dejo constancia que el alumno ${this.parametros_dinamicos.alumno.toUpperCase()} con DNI ${this.parametros_dinamicos.dni} es Alumno Regular de nuestra institución.` , margin: [10, 50], style: '' },

                { text: `${cuerpo}`, margin: [2, 30], style: 'body' },

                '',
                //{ text: 'Atentamente,', margin: [0, 50], style: 'anotherStyle' },
            ],
            styles: {
                header: {
                    alignment: 'right'
                },
                anotherStyle: {
                    fontSize: 15,
                    bold: true,
                },
                body: {
                    lineHeight:1.5
                }
            },
            images: {
                building: 'data:/Content/img/logo1.jpg'
            }
        };
        //pdfMake.createPdf(docDefinition).download("unnombre");
        // pdfMake.createPdf(docDefinition).open();

        Swal.fire({
            html: 'Buscando...',
            timer: 600,
            onBeforeOpen: () => {
                Swal.showLoading()
            },
        }).then(data=>{
            var nombre = `CONSTANCIA-AR ${alumno.nombre} ${alumno.apellido} ID ${alumno.id_alumno}`
            pdfMake.createPdf(docDefinition).download(nombre);
        })

    }