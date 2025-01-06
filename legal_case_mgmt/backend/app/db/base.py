# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base
from app.models.user import User

# Additional models will be imported here as we create them:
# from app.models.case import Case
# from app.models.client import Client
# from app.models.document import Document
# from app.models.filing import Filing
# from app.models.attorney import Attorney
# from app.models.event import Event
# from app.models.evidence import Evidence
# from app.models.task import Task
# from app.models.contact import Contact
# from app.models.expense import Expense