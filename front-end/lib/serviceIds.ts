export type NetworkProvider = 'MTN' | 'Glo' | 'Airtel' | '9Mobile';

/**
 * Map of UI network provider names to VTPass serviceID values
 * Based on VTPass API documentation: https://vtpass.com/documentation/
 */
export const networkProviderServiceIDs: Record<NetworkProvider, string> = {
  'MTN': 'mtn',
  'Glo': 'glo',
  'Airtel': 'airtel',
  '9Mobile': 'etisalat', // VTPass still uses the old 'etisalat' service ID
};

/**
 * Data service IDs for different network providers
 * These are used for data bundle purchases
 */
export const dataServiceIDs: Record<NetworkProvider, string> = {
  'MTN': 'mtn-data',
  'Glo': 'glo-data',
  'Airtel': 'airtel-data',
  '9Mobile': 'etisalat-data', // VTPass still uses the old 'etisalat' service ID
};

/**
 * TV provider service IDs
 */
export const tvServiceIDs = {
  'DSTV': 'dstv',
  'GOTV': 'gotv',
  'Startimes': 'startimes',
  'Showmax': 'showmax',
};

/**
 * Electricity provider service IDs
 */
export const electricityServiceIDs = {
  'IKEDC': 'ikeja-electric',
  'EKEDC': 'eko-electric',
  'AEDC': 'abuja-electric',
  'JED': 'jos-electric',
  'IBEDC': 'ibadan-electric',
  'PHED': 'portharcourt-electric',
  'KED': 'kaduna-electric',
};