import { useState } from 'react'

function LoginModal({ onClose, onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Si se registra o inicia sesión con éxito, enviamos el correo y cerramos el modal
    if (onLoginSuccess) {
      onLoginSuccess(email)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md p-8 rounded-2xl shadow-2xl mx-4 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold leading-none"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-center mb-2 text-cyan-400">
          {isRegistering ? '¡Crea tu cuenta nueva!' : '¡Bienvenido de nuevo!'}
        </h2>
        <p className="text-sm text-slate-400 text-center mb-6">
          {isRegistering 
            ? 'Regístrate para desbloquear la zona de juegos' 
            : 'Ingresa tus datos para acceder a la nave'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="piloto@galaxy.com"
              required
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-3 rounded-lg transition-colors shadow-md shadow-cyan-500/20"
          >
            {isRegistering ? 'Registrarse y Continuar' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-cyan-400 hover:underline font-medium"
          >
            {isRegistering 
              ? '¿Ya tienes una cuenta? Inicia sesión' 
              : '¿Eres usuario nuevo? Regístrate aquí'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default LoginModal