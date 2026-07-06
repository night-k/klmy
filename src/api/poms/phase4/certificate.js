import { getCertificateCatalog } from './phase4Store';

export const getCatalog = () => {
  return Promise.resolve({ data: { code: 200, success: true, data: getCertificateCatalog() } });
};
