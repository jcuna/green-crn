def test_encryption():
    from core import encryptor

    encrypted = encryptor.encrypt('hello')
    assert isinstance(encrypted, bytes)
    assert b'hello' not in encrypted
    assert encryptor.decrypt(encrypted) == 'hello'
