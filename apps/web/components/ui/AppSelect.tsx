'use client';

import type { SelectProps } from 'antd';
import { Select } from 'antd';

export function AppSelect<ValueType = string>(props: SelectProps<ValueType>) {
  return <Select {...props} />;
}
