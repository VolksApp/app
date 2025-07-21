from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/veiculos", tags=["veiculos"])

@router.post("/", response_model=schemas.Veiculo)
def criar_veiculo(veiculo: schemas.VeiculoCreate, db: Session = Depends(get_db)):
    """
    Endpoint para criar veículo.
    
    Descrição: Cria um novo veículo no catálogo.
    Exemplo: POST /veiculos com body { "marca": "Volkswagen", "modelo": "Gol", ... }
    """
    return crud.criar_veiculo(db, veiculo)

@router.post("/{veiculo_id}/imagens")
def upload_imagens(veiculo_id: int, imagens: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    """
    Endpoint para upload de até 2 imagens.
    
    Descrição: Faz upload para S3 e atualiza URLs no veículo.
    Exemplo: POST /veiculos/1/imagens com arquivos multipart.
    :raises HTTPException: Se mais de 2 imagens ou veículo não encontrado.
    """
    if len(imagens) > 2:
        raise HTTPException(400, "Máximo 2 imagens")
    veiculo = crud.get_veiculo(db, veiculo_id)
    if not veiculo:
        raise HTTPException(404, "Veículo não encontrado")
    urls = []
    for i, img in enumerate(imagens, 1):
        url = crud.upload_imagem_s3(img.file, veiculo_id, i)
        urls.append(url)
    if len(urls) >= 1:
        veiculo.imagem1_url = urls[0]
    if len(urls) == 2:
        veiculo.imagem2_url = urls[1]
    db.commit()
    return {"urls": urls}

@router.get("/", response_model=List[schemas.Veiculo])
def get_veiculos(search: str = None, db: Session = Depends(get_db)):
    """
    Endpoint para listar veículos.
    
    Descrição: Retorna todos os veículos no catálogo, filtrados por marca ou modelo se search fornecido.
    Exemplo: GET /veiculos?search=Polo retorna veículos com Polo na marca ou modelo.
    """
    return crud.get_veiculos(db, search=search)

@router.get("/{veiculo_id}", response_model=schemas.Veiculo)
def get_veiculo(veiculo_id: int, db: Session = Depends(get_db)):
    """
    Endpoint para obter veículo por ID.
    
    Descrição: Retorna detalhes de um veículo específico.
    Exemplo: GET /veiculos/6 retorna o veículo com ID 6.
    :raises HTTPException: Se veículo não encontrado.
    """
    veiculo = crud.get_veiculo(db, veiculo_id)
    if not veiculo:
        raise HTTPException(404, "Veículo não encontrado")
    return veiculo

@router.put("/{veiculo_id}", response_model=schemas.Veiculo)
def update_veiculo(veiculo_id: int, veiculo: schemas.VeiculoCreate, db: Session = Depends(get_db)):
    """
    Endpoint para editar veículo.
    
    Descrição: Atualiza um veículo existente.
    Exemplo: PUT /veiculos/1 com body { "marca": "Nova Marca", ... }
    """
    return crud.update_veiculo(db, veiculo_id, veiculo)

@router.delete("/{veiculo_id}")
def delete_veiculo(veiculo_id: int, db: Session = Depends(get_db)):
    """
    Endpoint para deletar veículo.
    
    Descrição: Deleta um veículo pelo ID.
    Exemplo: DELETE /veiculos/1
    """
    crud.delete_veiculo(db, veiculo_id)
    return {"message": "Veículo deletado com sucesso"}

@router.get("/health")
def health_check():
    """
    Endpoint de health check para ALB.
    """
    return {"status": "healthy"}

# Endpoints para GET, PUT, DELETE semelhantes com docstrings em PT