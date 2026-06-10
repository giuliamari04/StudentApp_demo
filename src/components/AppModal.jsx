import '../assets/styles/modal.css'

function AppModal({
  type = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Annulla',
  showCancel = false,
  onConfirm,
  onCancel,
}) {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    danger: '🗑️',
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card glass">
        <div className={`modal-icon modal-${type}`}>
          {icons[type] || icons.info}
        </div>

        <h2>{title}</h2>
        <p>{message}</p>

        <div className="modal-actions">
          {showCancel && (
            <button className="modal-cancel" onClick={onCancel}>
              {cancelText}
            </button>
          )}

          <button
            className={type === 'danger' || type === 'error' ? 'modal-delete' : 'modal-confirm'}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppModal