def test_create_vehicle():
    from crud import criar_veiculo
    from database import SessionLocal  # Assuming this exists
    db = SessionLocal()
    vehicle = {"marca": "VW", "modelo": "Golf", "ano": 2020, "preco": 30000}
    result = criar_veiculo(db, vehicle)
    assert result.marca == "VW"
    db.rollback()  # Clean up