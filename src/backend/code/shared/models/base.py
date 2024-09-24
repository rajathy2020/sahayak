""" This file contains the Enums used in the application """
from enum import Enum

class StatusEnum(str, Enum):
    independent = "independent"
    acquired = "acquired"
    operating = "operating"
    closed = "closed"
    ipo = "ipo"

