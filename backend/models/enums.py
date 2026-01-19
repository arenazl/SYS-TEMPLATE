import enum

class RolUsuario(str, enum.Enum):
    USUARIO = "usuario"
    SUPERVISOR = "supervisor"
    ADMIN = "admin"
