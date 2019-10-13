from app import db, init_app


def run_migration():
    app = init_app('sys')
    with app.app_context():

        db.create_all()
        db.session.commit()


def clear_cache():
    from core import cache
    cache.clear()
