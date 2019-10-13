def test_encryption():
    from core import encryptor

    encrypted = encryptor.encrypt('hello')
    assert isinstance(encrypted, bytes)
    assert encryptor.decrypt(encrypted) == 'hello'
