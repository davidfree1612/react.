import { useState } from 'react'
import LoginModal from './components/LoginModal'
import AsteroidsGame from './components/AsteroidsGame'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Si ya pasó el login/registro
  const [isPlaying, setIsPlaying] = useState(false)             // Si hizo clic en Jugar
  const [userEmail, setUserEmail] = useState('')

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      
      {/* CASO 1: No ha iniciado sesión ni se ha registrado */}
      {!isAuthenticated && !isPlaying && (
        <div className="text-center space-y-6 max-w-lg">
          <h1 className="text-5xl font-extrabold text-cyan-400 tracking-tight">
            Arcade Station 🚀
          </h1>
          <p className="text-slate-400 text-lg">
            Inicia sesión o regístrate para acceder al minijuego de Asteroids.
          </p>
          
          <button
            onClick={() => setIsOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105"
          >
            Iniciar sesión / Registrarse
          </button>
        </div>
      )}

      {/* CASO 2: Ya se autenticó, ahora ve el botón de "Jugar" */}
      {isAuthenticated && !isPlaying && (
        <div className="text-center space-y-6 max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
            Sesión iniciada como: {userEmail}
          </span>
          <h2 className="text-4xl font-black text-white">
            ¡Todo listo, Piloto! 🎮
          </h2>
          <p className="text-slate-400">
            Tu nave espacial está cargada y lista en la plataforma de lanzamiento.
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setIsPlaying(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105"
            >
              🚀 ¡Jugar Asteroids!
            </button>
            <button
              onClick={() => {
                setIsAuthenticated(false)
                setUserEmail('')
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-3.5 rounded-xl transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* CASO 3: El usuario está jugando */}
      {isPlaying && (
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-[800px] flex justify-between items-center mb-2 px-2">
            <span className="text-cyan-400 text-sm">
              Piloto: <strong className="text-white">{userEmail}</strong>
            </span>
            <button 
              onClick={() => {
                setIsPlaying(false)
                setIsAuthenticated(false)
              }} 
              className="bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg text-xs hover:bg-red-500/20 transition-colors"
            >
              Salir al inicio
            </button>
          </div>

          <AsteroidsGame />
        </div>
      )}

      {/* Modal flotante */}
      {isOpen && (
        <LoginModal 
          onClose={() => setIsOpen(false)} 
          onLoginSuccess={(email) => {
            setUserEmail(email)
            setIsAuthenticated(true) // Marca que ya se autenticó
            setIsOpen(false)         // Cierra el modal
          }}
        />
      )}

    </div>
  )
}

export default App