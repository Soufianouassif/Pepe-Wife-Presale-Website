import React from 'react'

const AppIcon = ({ name, fallback, className = '', filled = false, title, style }) => (
  <span className={`inline-flex items-center justify-center ${className}`} style={style} aria-label={fallback || name} title={title || fallback || name}>
    <span className={`material-symbols-outlined ${filled ? 'material-symbols-filled' : ''}`} aria-hidden="true">
      {name}
    </span>
    <span className="sr-only">{fallback || name}</span>
  </span>
)

export default AppIcon
