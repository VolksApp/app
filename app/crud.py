from sqlalchemy.orm import Session
from sqlalchemy import or_
from . import models, schemas
import boto3
from fastapi import HTTPException

def criar_veiculo(db: Session, veiculo: schemas.VeiculoCreate):
    """
    Cria um novo veículo no banco.
    
    :param db: Sessão de banco.
    :type db: Session
    :param veiculo: Dados do veículo.
    :type veiculo: VeiculoCreate
    :return: Veículo criado.
    :rtype: models.Veiculo
    :exemplo: veic = criar_veiculo(db, VeiculoCreate(marca='VW', ...))
    """
    db_veiculo = models.Veiculo(**veiculo.dict())
    db.add(db_veiculo)
    db.commit()
    db.refresh(db_veiculo)
    return db_veiculo

def get_veiculos(db: Session, search: str = None):
    """
    Retorna todos os veículos.
    
    :param db: Sessão de banco.
    :type db: Session
    :return: Lista de veículos.
    :rtype: List[models.Veiculo]
    :exemplo: veics = get_veiculos(db)
    """
    query = db.query(models.Veiculo)
    if search:
        query = query.filter(or_(models.Veiculo.marca.ilike(f"%{search}%"), models.Veiculo.modelo.ilike(f"%{search}%")))
    return query.all()

def get_veiculo(db: Session, veiculo_id: int):
    return db.query(models.Veiculo).filter(models.Veiculo.id == veiculo_id).first()

def update_veiculo(db: Session, veiculo_id: int, veiculo: schemas.VeiculoCreate):
    db_veiculo = get_veiculo(db, veiculo_id)
    if not db_veiculo:
        raise HTTPException(404, "Veículo não encontrado")
    for key, value in veiculo.dict().items():
        setattr(db_veiculo, key, value)
    db.commit()
    db.refresh(db_veiculo)
    return db_veiculo

def delete_veiculo(db: Session, veiculo_id: int):
    db_veiculo = get_veiculo(db, veiculo_id)
    if not db_veiculo:
        raise HTTPException(404, "Veículo não encontrado")
    db.delete(db_veiculo)
    db.commit()

def upload_imagem_s3(arquivo, veiculo_id, imagem_num):
    """
    Faz upload de imagem para S3 e retorna URL.
    
    :param arquivo: Arquivo de imagem.
    :param veiculo_id: ID do veículo.
    :param imagem_num: 1 ou 2.
    :return: URL S3.
    :rtype: str
    :raises ValueError: Se mais de 2 imagens.
    """
    s3_client = boto3.client('s3')
    bucket = 'vw-vehicle-images'
    key = f'veiculo_{veiculo_id}_imagem{imagem_num}.jpg'
    s3_client.upload_fileobj(arquivo, bucket, key, ExtraArgs={'ACL': 'public-read'})
    return f'https://{bucket}.s3.amazonaws.com/{key}'