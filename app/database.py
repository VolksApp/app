import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import boto3
import json

# Cliente Secrets Manager para obter credenciais automaticamente
secrets_client = boto3.client('secretsmanager', region_name=os.environ['AWS_DEFAULT_REGION'])

def obter_credenciais_db():
    """
    Obtém credenciais do banco de dados do Secrets Manager.
    
    :return: Dicionário com 'username' e 'password'.
    :rtype: dict
    :raises Exception: Se falhar ao obter o segredo.
    :exemplo: cred = obter_credenciais_db(); print(cred['username'])
    """
    secret_arn = os.environ['DB_SECRET_ARN']
    response = secrets_client.get_secret_value(SecretId=secret_arn)
    secret = json.loads(response['SecretString'])
    return secret

credenciais = obter_credenciais_db()
DATABASE_URL = f"postgresql://{credenciais['username']}:{credenciais['password']}@{os.environ.get('DB_HOST', 'localhost')}:{os.environ.get('DB_PORT', '5432')}/{os.environ.get('DB_NAME', 'vw_catalog')}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    Fornece uma sessão de banco de dados para dependência FastAPI.
    
    :yield: Sessão SQLAlchemy.
    :rtype: Session
    :exemplo: db = next(get_db())
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()