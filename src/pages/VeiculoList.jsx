import React, { useEffect, useState } from 'react';
import { getVeiculos } from '../services/api';
import logo from '../assets/vw-logo.png';  // Kept your logo import

function VeiculoList({ vehicles: propVehicles, onDelete }) {
  const [veiculos, setVeiculos] = useState(propVehicles || []);
  const [loading, setLoading] = useState(!propVehicles);
  const [error, setError] = useState(null);

  useEffect(() => {
    setVeiculos(propVehicles || []);
  }, [propVehicles]);

  useEffect(() => {
    if (propVehicles) return;
    async function fetchData() {
      try {
        const data = await getVeiculos();
        setVeiculos(data);
      } catch (error) {
        setError('Erro ao carregar veículos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [propVehicles]);

  if (loading) return <div className="text-center">Carregando...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <img src={logo} alt="Logo Volkswagen" className="d-block mx-auto mb-4" style={{ width: '100px' }} />
      {veiculos.length === 0 ? (
        <p className="text-center text-muted fst-italic">Nenhum veículo encontrado. Crie um novo!</p>
      ) : (
        <div className="row">
          {veiculos.map(v => (
            <div key={v.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{v.marca} {v.modelo}</h5>
                  <p className="card-text">R$ {v.preco}</p>
                  {v.imagem1_url && <img src={v.imagem1_url} alt="Imagem 1" className="card-img-top mb-2" />}
                  {v.imagem2_url && <img src={v.imagem2_url} alt="Imagem 2" className="card-img-top" />}
                  <div className="mt-2">
                    <a href={`/editar/${v.id}`} className="btn btn-warning me-2">Editar</a>
                    <button onClick={() => onDelete(v.id)} className="btn btn-danger">Deletar</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VeiculoList;