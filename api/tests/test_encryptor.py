def test_encryption(no_db_client):
    from core import encryptor

    encrypted = encryptor.encrypt('hello')
    assert isinstance(encrypted, bytes)
    assert b'hello' not in encrypted
    assert encryptor.decrypt(encrypted) == 'hello'
