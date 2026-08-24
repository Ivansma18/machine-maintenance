'use client';

import type { ButtonProps } from 'antd';
import { Button } from 'antd';

type AppButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';

export type AppButtonProps = Omit<ButtonProps, 'type' | 'danger' | 'variant'> & {
  variant?: AppButtonVariant;
};

const variantProps: Record<AppButtonVariant, { type: 'primary' | 'default' | 'text'; danger?: boolean }> = {
  primary: { type: 'primary', danger: false },
  secondary: { type: 'default', danger: false },
  quiet: { type: 'text', danger: false },
  danger: { type: 'primary', danger: true },
};

export function AppButton({ variant = 'primary', ...props }: AppButtonProps) {
  return <Button {...variantProps[variant]} {...props} />;
}
