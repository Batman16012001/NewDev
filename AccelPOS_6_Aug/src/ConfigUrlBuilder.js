import { API_CONFIG } from "./ApiConfig";
export const getApiUrl = (module, endpoint) => {
  const { environment, localBaseUrls } = API_CONFIG;

  if (environment === "development") {
    const baseUrl = localBaseUrls[module];
    if (!baseUrl)
      throw new Error(`Local base URL for module "${module}" not found.`);

    // Ensure baseUrl ends with /
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;

    return `${normalizedBaseUrl}${module}/${normalizedEndpoint}`;
  }

  // Add production logic here if needed
};
