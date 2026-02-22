declare namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_KEYCLOAK_API_BASE_URL: string;
      REACT_APP_KEYCLOAK_REALM: string;
      REACT_APP_KEYCLOAK_CLIENT_ID: string;
      REACT_APP_KEYCLOAK_REDIRECT_URL: string;
      REACT_APP_KEYCLOAK_REFRESH_TOKEN_INTERVAL: number | undefined;
      REACT_APP_HUBSPOT_API_URL: string;
      REACT_APP_HUBSPOT_API_TOKEN: string;
      REACT_APP_EXCEL_EXTRACTOR_API_URL: string;

      //formatters
      REACT_APP_DATE_FORMAT: string;
      REACT_APP_CURRENCY_FORMAT: string;
      REACT_APP_PERCENTAGE_FORMAT: string;

      REACT_APP_DEFAULT_LOCALE: string;
      REACT_APP_DEFAULT_CURRENCY: string;
    }
  }
  