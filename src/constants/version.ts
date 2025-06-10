// 从 package.json 中获取版本号
const version = import.meta.env.VITE_APP_VERSION || '0.0.0';

export const APP_VERSION = version;
export const APP_NAME = 'VG Game'; 