import api from "./api";
export const classService = {
  getAllClasses: () => api.get('/class'),
  getClass: (id) => api.get(`/class/${id}`),
  createClass: (data) => api.post('/class', data),
  updateClass: (id, data) => api.put(`/class/${id}`, data),
  deleteClass: (id) => api.delete(`/class/${id}`),
}