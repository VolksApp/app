from pydantic import BaseModel

class VeiculoBase(BaseModel):
    """
    Schema base para Veiculo.
    """
    marca: str
    modelo: str
    ano: int
    preco: float
    especificacoes_tecnicas: str
    descricao: str | None = None

class VeiculoCreate(VeiculoBase):
    pass

class Veiculo(VeiculoBase):
    """
    Schema completo para Veiculo com ID e imagens.
    """
    id: int
    imagem1_url: str | None = None
    imagem2_url: str | None = None

    class Config:
        from_attributes = True