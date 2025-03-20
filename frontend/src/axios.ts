import axios from 'axios';

// Cria instância padrão
const api = axios.create({
  baseURL: 'http://localhost:3000', // Sua API Go via LB
});

// Interceptor: adiciona traceparent em TODAS as requests
api.interceptors.request.use((config) => {
  const traceId = crypto.randomUUID().replace(/-/g, '').substring(0, 32);
  const spanId = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  const traceparent = `00-${traceId}-${spanId}-01`;
  config.headers['traceparent'] = traceparent;
  return config;
});

export default api;
