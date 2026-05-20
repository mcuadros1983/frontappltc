const API_URL = process.env.REACT_APP_API_URL;

export const getPromociones = async () => {
  const res = await fetch(`${API_URL}/promociones`, {
    credentials: "include",
  });
  return res.json();
};

export const getPromocion = async (id) => {
  const res = await fetch(`${API_URL}/promociones/${id}`, {
    credentials: "include",
  });
  return res.json();
};

export const createPromocion = async (data) => {
  const res = await fetch(`${API_URL}/promociones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updatePromocion = async (id, data) => {
  const res = await fetch(`${API_URL}/promociones/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deletePromocion = async (id) => {
  const res = await fetch(`${API_URL}/promociones/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
};