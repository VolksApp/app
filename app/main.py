from fastapi import FastAPI, HTTPException  # Add HTTPException
from .routers import veiculos
from .database import engine
from .models import Base
from sqlalchemy import text  # Add this import
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Catálogo de Veículos Volkswagen")

# Health check endpoint at root level
@app.get("/health")
async def health_check():
    """
    Comprehensive health check endpoint for ALB.
    Checks database connectivity and returns simple status.
    """
    try:
        # Test database connectivity
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        
        logger.info("Health check passed - DB connection OK")
        return {"status": "healthy"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")

@app.get("/")
async def root():
    """Simple root endpoint"""
    return {"message": "Catalogo de Veiculos Volkswagen API"}

# Move database initialization to startup event to avoid blocking app startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        # Don't raise exception here - let app start and handle DB errors in endpoints

app.include_router(veiculos.router, prefix="/api")