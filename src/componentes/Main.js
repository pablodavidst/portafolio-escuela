import React from 'react'

export default function Main({children, center, eliminarClases}){
    let classes = `Main ${center ? 'Main--center' : ''}`

        return (
            <main className={ eliminarClases ? '' : classes}>
                {children}
            </main>
        )
}