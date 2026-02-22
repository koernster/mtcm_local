// Configuration utility
// Uses build-time REACT_APP_* environment variables (baked at Docker build)
// Throws errors if required configuration is missing

const getRequiredValue = (key: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required configuration: ${key}. Ensure Doppler is configured correctly.`);
  }
  return value;
};

const getConfig = () => {
  return {
    // Keycloak Authentication
    keycloak: {
      apiBaseUrl: getRequiredValue('KEYCLOAK_API_BASE_URL', process.env.REACT_APP_KEYCLOAK_API_BASE_URL),
      realm: getRequiredValue('KEYCLOAK_REALM', process.env.REACT_APP_KEYCLOAK_REALM),
      clientId: getRequiredValue('KEYCLOAK_CLIENT_ID', process.env.REACT_APP_KEYCLOAK_CLIENT_ID),
      redirectUrl: getRequiredValue('KEYCLOAK_REDIRECT_URL', process.env.REACT_APP_KEYCLOAK_REDIRECT_URL),
      refreshTokenInterval: Number(getRequiredValue('KEYCLOAK_REFRESH_TOKEN_INTERVAL', process.env.REACT_APP_KEYCLOAK_REFRESH_TOKEN_INTERVAL)),
    },

    // API Endpoints
    // Note: Hasura authentication now uses JWT Bearer token from Keycloak (not admin secret)
    api: {
      mtcmDbUrl: getRequiredValue('MTCM_DB_API_BASE_URL', process.env.REACT_APP_MTCM_DB_API_BASE_URL),
      hubspotUrl: getRequiredValue('HUBSPOT_API_URL', process.env.REACT_APP_HUBSPOT_API_URL),
      excelExtractorUrl: getRequiredValue('EXCEL_EXTRACTOR_API_URL', process.env.REACT_APP_EXCEL_EXTRACTOR_API_URL),
    },

    // Feature Flags
    features: {
      maintenanceMode: getRequiredValue('MAINTENANCE_MODE', process.env.REACT_APP_MAINTENANCE_MODE) === 'true',
    },

    // Formatters (regex patterns)
    formatters: {
      currency: getRequiredValue('CURRENCY_FORMAT', process.env.REACT_APP_CURRENCY_FORMAT),
      date: getRequiredValue('DATE_FORMAT', process.env.REACT_APP_DATE_FORMAT),
      percentage: getRequiredValue('PERCENTAGE_FORMAT', process.env.REACT_APP_PERCENTAGE_FORMAT),
    },

    // Locale
    locale: {
      default: getRequiredValue('DEFAULT_LOCALE', process.env.REACT_APP_DEFAULT_LOCALE),
      currency: getRequiredValue('DEFAULT_CURRENCY', process.env.REACT_APP_DEFAULT_CURRENCY),
    },
  };
};

// Export a singleton config object
export const config = getConfig();

// Export individual accessors for convenience
export const getKeycloakConfig = () => config.keycloak;
export const getApiConfig = () => config.api;
export const getFeatureFlags = () => config.features;
export const getFormatters = () => config.formatters;
export const getLocaleConfig = () => config.locale;

export default config;
