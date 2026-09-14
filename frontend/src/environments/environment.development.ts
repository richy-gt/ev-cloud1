// Configuracion para desarrollo local
import { environment as baseEnvironment } from './environment';

export const environment = {
  ...baseEnvironment,
  production: false,
};
