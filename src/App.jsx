import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap CSS
import VeiculoList from './pages/VeiculoList.jsx';
import VeiculoForm from './pages/VeiculoForm.jsx';
import { getVeiculos, deletarVeiculo } from './services/api';

function AppContent() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();  // Added to detect route changes

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getVeiculos(searchTerm);
        if (Array.isArray(data)) {
          setVehicles(data);
        } else {
          console.error('API did not return a list:', data);
          setVehicles([]);
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicles. Check your API or internet.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [location.pathname, searchTerm]);  // Refetch when path changes (e.g., navigate to /)

  if (loading) return <div>Loading vehicles...</div>;
  if (error) return <div>{error}</div>;

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este veículo?')) {
      try {
        await deletarVeiculo(id);
        const data = await getVeiculos(searchTerm);
        setVehicles(data);
        alert('Veículo deletado com sucesso!');
      } catch (error) {
        alert('Erro ao deletar: ' + error.message);
      }
    }
  };

  return (
    <div className="container mt-4">
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">Catálogo VW</a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link" href="/">Lista de Veículos</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/criar">Criar Veículo</a>
              </li>
            </ul>
            <form className="d-flex">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Buscar por marca/modelo"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<VeiculoList vehicles={vehicles} onDelete={handleDelete} />} />
        <Route path="/criar" element={<VeiculoForm />} />
        <Route path="/editar/:id" element={<VeiculoForm />} />
        {/* Add more routes */}
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;