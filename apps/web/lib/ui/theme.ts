import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#668875',
    colorSuccess: '#668875',
    colorWarning: '#f2b84b',
    colorError: '#d95b4f',
    colorText: '#17211f',
    colorTextSecondary: '#68736f',
    colorBgLayout: '#f4f5f1',
    colorBorder: '#dfe4df',
    borderRadius: 10,
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
      fontWeight: 700,
    },
    Card: {
      borderRadiusLG: 16,
    },
    Table: {
      headerBg: '#f4f5f1',
      headerColor: '#68736f',
    },
  },
};
