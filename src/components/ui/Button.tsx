import type { ButtonHTMLAttributes } from 'react'
import { buttonStyles, type ButtonSize, type ButtonVariant } from './buttonStyles'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  /** `lg` is the 56 px hero size; `md` is the default 52 px; `sm` is 44 px (minimum tap target). */
  size?: ButtonSize
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...rest}
    />
  )
}
