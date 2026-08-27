import type { TagProps } from 'antd';
import { Tag } from 'antd';

type AppTagTone = 'neutral' | 'success' | 'warning' | 'critical';

export type AppTagProps = Omit<TagProps, 'color'> & {
  tone?: AppTagTone;
};

const toneColors: Record<AppTagTone, TagProps['color']> = {
  neutral: 'default',
  success: 'success',
  warning: 'warning',
  critical: 'error',
};

export function AppTag({ tone = 'neutral', children, ...props }: AppTagProps) {
  return (
    <Tag color={toneColors[tone]} variant="filled" {...props}>
      {children}
    </Tag>
  );
}
