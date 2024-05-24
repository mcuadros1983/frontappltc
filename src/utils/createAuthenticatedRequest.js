// utils.js
export const createAuthenticatedRequest = (url, method = "GET", body = null) => { 
    const headers = {
      "Content-Type": "application/json",
    };
  
    const credentialsOption = {
      credentials: "include",
    };
  
    const request = {
      method,
      headers,
      ...credentialsOption,
    };
  
    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      request.body = JSON.stringify(body);
    }
  
    return fetch(url, request);
  };
  