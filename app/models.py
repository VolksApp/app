from sqlalchemy import Column, Integer, String, Float, Text
from .database import Base

class Veiculo(Base):
    """
    Modelo de banco para entidade Veiculo.
    
    Representa um veículo no catálogo de vendas com informações relevantes.
    """
    __tablename__ = "veiculos"

    id = Column(Integer, primary_key=True, index=True)  # ID único
    marca = Column(String, index=True)  # Marca do veículo (ex: Volkswagen)
    modelo = Column(String, index=True)  # Modelo do veículo
    ano = Column(Integer)  # Ano de fabricação
    preco = Column(Float)  # Preço de venda
    especificacoes_tecnicas = Column(Text)  # Especificações técnicas (JSON string)
    imagem1_url = Column(String, nullable=True)  # URL da primeira imagem no S3
    imagem2_url = Column(String, nullable=True)  # URL da segunda imagem no S3
    descricao = Column(Text, nullable=True)  # Descrição adicional para vendas