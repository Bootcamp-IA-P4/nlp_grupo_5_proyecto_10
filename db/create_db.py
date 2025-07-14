# # db/create_db.py

# from database import engine
# from db import models

# models.Base.metadata.create_all(bind=engine)


# from database import engine, Base  # <-- importa desde el mismo nivel
# import models  # <-- importa modelos desde el mismo nivel

# models.Base.metadata.create_all(bind=engine)

try:
    from db.database import engine, Base  # Para entorno local
    import db.models as models
except ImportError:
    from database import engine, Base     # Para Docker
    import models

models.Base.metadata.create_all(bind=engine)