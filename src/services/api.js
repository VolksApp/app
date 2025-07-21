// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // ALB routes /api/* to backend
});

export const getVeiculos = async (search = null) => {
  try {
    const params = search ? { search } : {};
    const response = await api.get('/veiculos/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching veiculos:', error);
    throw error;
  }
};

export const getVeiculo = async (id) => {
  try {
    const response = await api.get(`/veiculos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching veiculo:', error);
    throw error;
  }
};

export const criarVeiculo = async (dados) => {
  /**
   * Cria um veículo via API.
   * 
   * @param {Object} dados - Dados do veículo.
   * @returns {Promise<Object>} Veículo criado.
   * @throws {Error} Se falhar.
   * @example criarVeiculo({marca: 'VW', ...});
   */
  try {
    const response = await api.post('/veiculos/', dados);
    return response.data;
  } catch (error) {
    throw new Error('Erro ao criar veículo: ' + error.message);
  }
};

export const uploadImagens = async (veiculoId, imagens) => {
  /**
   * Faz upload de imagens para veículo.
   * 
   * @param {number} veiculoId - ID do veículo.
   * @param {FileList|Array<File>} imagens - Arquivos de imagens (máx 2).
   * @returns {Promise<Object>} URLs das imagens.
   * @throws {Error} Se mais de 2 ou erro.
   */
  if (imagens.length > 2) throw new Error('Máximo 2 imagens');
  const formData = new FormData();
  imagens.forEach((img) => {
    formData.append('imagens', img);
  });
  try {
    const response = await api.post(`/veiculos/${veiculoId}/imagens`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro no upload: ' + error.message);
  }
};

export const editarVeiculo = async (veiculoId, dados) => {
  try {
    const response = await api.put(`/veiculos/${veiculoId}`, dados);
    return response.data;
  } catch (error) {
    throw new Error('Erro ao editar veículo: ' + error.message);
  }
};

export const deletarVeiculo = async (veiculoId) => {
  try {
    await api.delete(`/veiculos/${veiculoId}`);
  } catch (error) {
    throw new Error('Erro ao deletar veículo: ' + error.message);
  }
};