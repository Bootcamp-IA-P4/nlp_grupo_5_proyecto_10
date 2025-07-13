# # db/create_db.py

# from database import engine
# from db import models

# models.Base.metadata.create_all(bind=engine)


from database import engine, Base  # <-- importa desde el mismo nivel
import models  # <-- importa modelos desde el mismo nivel

models.Base.metadata.create_all(bind=engine)