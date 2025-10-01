import { useState } from 'react'
import './Olvide.css'
import { resetPasswordByEmail } from '../../services/api'

export default function Olvide() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const emailTrim = email.trim().toLowerCase()
    if (!emailTrim || !password || !confirm) {
      setError('Completá todos los campos')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    try {
      setLoading(true)
      const res = await resetPasswordByEmail({ email: emailTrim, password, confirmPassword: confirm })
      setMessage(res.message || 'Contraseña restablecida correctamente')
      setEmail('')
      setPassword('')
      setConfirm('')
    } catch (err) {
      setError(err.message || 'No se pudo restablecer la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="olvide">
      <div className="olvide__card">
        <h1 className="olvide__title">¡Reestablece tu contraseña viajero!</h1>
        <form onSubmit={handleSubmit} className="olvide__form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="olvide__input"
          />
          <div className="olvide__input-wrap">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Contraseña nueva"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="olvide__input"
            />
            <button type="button" className="olvide__eye" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="olvide__input-wrap">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="olvide__input"
            />
            <button type="button" className="olvide__eye" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}>
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>
          {error && <p className="olvide__error">{error}</p>}
          {message && <p className="olvide__ok">{message}</p>}
          <button className="olvide__btn" disabled={loading}>
            {loading ? 'Procesando…' : 'Reestablecer contraseña'}
          </button>
        </form>
        <div className="olvide__illustration" aria-hidden="true" />
      </div>
    </section>
  )
}


