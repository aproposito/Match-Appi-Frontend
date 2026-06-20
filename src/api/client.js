const BASE_URL = 'http://127.0.0.1:8000/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición')
  }

  return data
}

export function get(endpoint) {
  return request(endpoint)
}

export function post(endpoint, body) {
  return request(endpoint, { method: 'POST', body: JSON.stringify(body) })
}

export function put(endpoint, body) {
  return request(endpoint, { method: 'PUT', body: JSON.stringify(body) })
}

export function del(endpoint) {
  return request(endpoint, { method: 'DELETE' })
}