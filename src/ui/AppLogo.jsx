import logo from '../assets/logo.png'

/**
 * Shared application logo mark. Single source of truth for the Arc Agent
 * Hub v7 brand image — used across the landing nav, footer, sidebar,
 * loading/splash screens, and empty states so the mark never drifts out
 * of sync between surfaces.
 */
export function AppLogo({ size = 34, className = '', ...rest }) {
  return (
    <img
      src={logo}
      alt="Arc Agent Hub v7"
      width={size}
      height={size}
      className={`app-logo ${className}`.trim()}
      {...rest}
    />
  )
}
