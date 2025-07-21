import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { criarVeiculo, uploadImagens, editarVeiculo, getVeiculo } from '../services/api';
import { Link } from 'react-router-dom';

function VeiculoForm() {
  const { id } = useParams();  // Get ID from URL for edit
  const isEdit = !!id;
  const [formData, setFormData] = useState({ marca: '', modelo: '', ano: '', preco: '', especificacoes_tecnicas: '', descricao: '' });
  const [imagens, setImagens] = useState([]);
  const [loading, setLoading] = useState(isEdit);  // Load data if editing
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const fetchVehicle = async () => {
        try {
          const data = await getVeiculo(id);
          setFormData(data);
        } catch (err) {
          setError('Erro ao carregar veículo: ' + err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchVehicle();
    }
  }, [id, isEdit]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.files.length > 2) {
      alert('Máximo 2 imagens');
      return;
    }
    setImagens(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let veiculo;
      if (isEdit) {
        veiculo = await editarVeiculo(id, formData);
      } else {
        veiculo = await criarVeiculo(formData);
      }
      if (imagens.length > 0) {
        await uploadImagens(veiculo.id, imagens);
      }
      alert(isEdit ? 'Veículo editado com sucesso!' : 'Veículo criado com sucesso!');
    }
    catch (error) {
      console.error(error);  // For debugging
      alert(`Erro ao ${isEdit ? 'editar' : 'criar'} veículo: ${error.message || 'Tente novamente'}`);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <label className="form-label">Marca:</label>
        <input className="form-control" name="marca" placeholder="Marca" value={formData.marca} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Modelo:</label>
        <input className="form-control" name="modelo" placeholder="Modelo" value={formData.modelo} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Ano:</label>
        <input className="form-control" name="ano" type="number" placeholder="Ano" value={formData.ano} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Preço:</label>
        <input className="form-control" name="preco" type="number" placeholder="Preço" value={formData.preco} onChange={handleChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Especificações Técnicas:</label>
        <textarea className="form-control" name="especificacoes_tecnicas" placeholder="Especificações Técnicas" value={formData.especificacoes_tecnicas} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Descrição:</label>
        <textarea className="form-control" name="descricao" placeholder="Descrição" value={formData.descricao} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Imagens (máx. 2):</label>
        <input className="form-control" type="file" multiple onChange={handleFileChange} accept="image/*" />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Enviando...' : (isEdit ? 'Salvar Edição' : 'Criar Veículo')}
      </button>
      <Link to="/" className="btn btn-secondary ms-2">Voltar à Lista</Link>
    </form>
  );
}

export default VeiculoForm;