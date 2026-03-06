from __future__ import annotations

import pytest
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError
from app.roles.models import Role
from app.roles.schemas import RoleCreate, RoleUpdate
from app.roles.services import create_role, delete_role, get_role, list_roles, update_role


@pytest.mark.unit
class TestCreateRole:
    def test_crear_rol_valido(self, db_session: Session) -> None:
        # Arrange
        data = RoleCreate(name="Nuevo Rol", description="Descripción del rol")

        # Act
        role = create_role(db_session, data)

        # Assert
        assert role.id is not None
        assert role.name == "Nuevo Rol"
        assert role.description == "Descripción del rol"

    def test_crear_rol_nombre_duplicado_falla(self, db_session: Session) -> None:
        # Arrange
        existing_role = Role(name="Rol Existente", description="Existe")
        db_session.add(existing_role)
        db_session.commit()

        data = RoleCreate(name="Rol Existente", description="Otro")

        # Act / Assert
        with pytest.raises(ConflictError, match="El nombre del rol ya existe"):
            create_role(db_session, data)

    def test_crear_rol_sin_descripcion(self, db_session: Session) -> None:
        # Arrange
        data = RoleCreate(name="Rol Simple")

        # Act
        role = create_role(db_session, data)

        # Assert
        assert role.name == "Rol Simple"
        assert role.description is None


@pytest.mark.unit
class TestListRoles:
    def test_listar_roles_vacio(self, db_session: Session) -> None:
        # Act
        roles = list_roles(db_session)

        # Assert
        assert roles == []

    def test_listar_roles_multiples(self, db_session: Session) -> None:
        # Arrange
        role1 = Role(name="Rol 1")
        role2 = Role(name="Rol 2")
        role3 = Role(name="Rol 3")
        db_session.add_all([role1, role2, role3])
        db_session.commit()

        # Act
        roles = list_roles(db_session)

        # Assert
        assert len(roles) == 3
        assert all(r.name in ["Rol 1", "Rol 2", "Rol 3"] for r in roles)


@pytest.mark.unit
class TestGetRole:
    def test_obtener_rol_existente(self, db_session: Session) -> None:
        # Arrange
        role = Role(name="Rol Existente", description="Test")
        db_session.add(role)
        db_session.commit()

        # Act
        retrieved = get_role(db_session, role.id)

        # Assert
        assert retrieved.id == role.id
        assert retrieved.name == "Rol Existente"

    def test_obtener_rol_inexistente_falla(self, db_session: Session) -> None:
        # Act / Assert
        with pytest.raises(NotFoundError, match="Rol no encontrado"):
            get_role(db_session, 999)


@pytest.mark.unit
class TestUpdateRole:
    def test_actualizar_nombre_rol(self, db_session: Session) -> None:
        # Arrange
        role = Role(name="Nombre Original", description="Desc")
        db_session.add(role)
        db_session.commit()

        data = RoleUpdate(name="Nombre Actualizado")

        # Act
        updated = update_role(db_session, role.id, data)

        # Assert
        assert updated.name == "Nombre Actualizado"
        assert updated.description == "Desc"

    def test_actualizar_descripcion_rol(self, db_session: Session) -> None:
        # Arrange
        role = Role(name="Rol", description="Descripción original")
        db_session.add(role)
        db_session.commit()

        data = RoleUpdate(description="Nueva descripción")

        # Act
        updated = update_role(db_session, role.id, data)

        # Assert
        assert updated.name == "Rol"
        assert updated.description == "Nueva descripción"

    def test_actualizar_nombre_existente_falla(self, db_session: Session) -> None:
        # Arrange
        role1 = Role(name="Rol 1")
        role2 = Role(name="Rol 2")
        db_session.add_all([role1, role2])
        db_session.commit()

        data = RoleUpdate(name="Rol 2")

        # Act / Assert
        with pytest.raises(ConflictError, match="El nombre del rol ya existe"):
            update_role(db_session, role1.id, data)


@pytest.mark.unit
class TestDeleteRole:
    def test_eliminar_rol(self, db_session: Session) -> None:
        # Arrange
        role = Role(name="Rol a Eliminar")
        db_session.add(role)
        db_session.commit()
        role_id = role.id

        # Act
        delete_role(db_session, role_id)

        # Assert
        deleted_role = db_session.get(Role, role_id)
        assert deleted_role is None

    def test_eliminar_rol_inexistente_falla(self, db_session: Session) -> None:
        # Act / Assert
        with pytest.raises(NotFoundError, match="Rol no encontrado"):
            delete_role(db_session, 999)
