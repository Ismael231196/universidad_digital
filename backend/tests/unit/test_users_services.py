from __future__ import annotations

import pytest
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError
from app.core.security import hash_password
from app.roles.models import Role
from app.users.models import User
from app.users.schemas import UserCreate, UserUpdate
from app.users.services import (
    assign_role,
    create_user,
    deactivate_user,
    get_user,
    list_users,
    remove_role,
    update_user,
)


@pytest.mark.unit
class TestCreateUser:
    def test_crear_usuario_estudiante_valido(self, db_session: Session) -> None:
        # Arrange
        role = Role(name="Estudiante")
        db_session.add(role)
        db_session.commit()

        data = UserCreate(
            email="newuser@example.com",
            full_name="Nuevo Usuario",
            password="ValidPassword123",
            role_ids=[role.id],
        )

        # Act
        user = create_user(db_session, data)

        # Assert
        assert user.id is not None
        assert user.email == "newuser@example.com"
        assert user.full_name == "Nuevo Usuario"
        assert user.is_active is True
        assert len(user.roles) == 1
        assert user.roles[0].name == "Estudiante"

    def test_crear_usuario_email_duplicado_falla(self, db_session: Session) -> None:
        # Arrange
        existing_user = User(
            email="existing@example.com",
            full_name="Usuario Existente",
            hashed_password=hash_password("Password123"),
        )
        db_session.add(existing_user)
        db_session.commit()

        data = UserCreate(
            email="existing@example.com",
            full_name="Otro Usuario",
            password="ValidPassword123",
        )

        # Act / Assert
        with pytest.raises(ConflictError, match="El email ya está registrado"):
            create_user(db_session, data)

    def test_crear_usuario_admin_requiere_password_largo(self, db_session: Session) -> None:
        # Arrange
        admin_role = Role(name="Administrador")
        db_session.add(admin_role)
        db_session.commit()

        data = UserCreate(
            email="admin@example.com",
            full_name="Admin",
            password="Short123",  # >=8 (schema) pero <12 para regla de admin
            role_ids=[admin_role.id],
        )

        # Act / Assert
        with pytest.raises(ConflictError, match="al menos 12 caracteres"):
            create_user(db_session, data)

    def test_crear_usuario_asigna_rol_default_estudiante(self, db_session: Session) -> None:
        # Arrange
        role = Role(name="Estudiante")
        db_session.add(role)
        db_session.commit()

        data = UserCreate(
            email="student@example.com",
            full_name="Estudiante",
            password="ValidPassword123",
            role_ids=[],
        )

        # Act
        user = create_user(db_session, data)

        # Assert
        assert len(user.roles) == 1
        assert user.roles[0].name == "Estudiante"


@pytest.mark.unit
class TestListUsers:
    def test_listar_usuarios_vacio(self, db_session: Session) -> None:
        # Act
        users = list_users(db_session)

        # Assert
        assert users == []

    def test_listar_usuarios_multiples(self, db_session: Session) -> None:
        # Arrange
        user1 = User(
            email="user1@example.com",
            full_name="Usuario 1",
            hashed_password=hash_password("Pass123"),
        )
        user2 = User(
            email="user2@example.com",
            full_name="Usuario 2",
            hashed_password=hash_password("Pass123"),
        )
        db_session.add_all([user1, user2])
        db_session.commit()

        # Act
        users = list_users(db_session)

        # Assert
        assert len(users) == 2
        assert any(u.email == "user1@example.com" for u in users)
        assert any(u.email == "user2@example.com" for u in users)


@pytest.mark.unit
class TestGetUser:
    def test_obtener_usuario_existente(self, db_session: Session) -> None:
        # Arrange
        user = User(
            email="user@example.com",
            full_name="Usuario",
            hashed_password=hash_password("Pass123"),
        )
        db_session.add(user)
        db_session.commit()

        # Act
        retrieved = get_user(db_session, user.id)

        # Assert
        assert retrieved.id == user.id
        assert retrieved.email == "user@example.com"

    def test_obtener_usuario_inexistente_falla(self, db_session: Session) -> None:
        # Act / Assert
        with pytest.raises(NotFoundError, match="Usuario no encontrado"):
            get_user(db_session, 999)


@pytest.mark.unit
class TestUpdateUser:
    def test_actualizar_nombre_usuario(self, db_session: Session) -> None:
        # Arrange
        user = User(
            email="user@example.com",
            full_name="Nombre Original",
            hashed_password=hash_password("Pass123"),
        )
        db_session.add(user)
        db_session.commit()

        data = UserUpdate(full_name="Nombre Actualizado")

        # Act
        updated = update_user(db_session, user.id, data)

        # Assert
        assert updated.full_name == "Nombre Actualizado"
        assert updated.email == "user@example.com"

    def test_actualizar_password_usuario(self, db_session: Session) -> None:
        # Arrange
        user = User(
            email="user@example.com",
            full_name="Usuario",
            hashed_password=hash_password("OldPassword123"),
        )
        db_session.add(user)
        db_session.commit()
        old_hash = user.hashed_password

        data = UserUpdate(password="NewPassword123")

        # Act
        updated = update_user(db_session, user.id, data)

        # Assert
        assert updated.hashed_password != old_hash

    def test_actualizar_is_active_usuario(self, db_session: Session) -> None:
        # Arrange
        user = User(
            email="user@example.com",
            full_name="Usuario",
            hashed_password=hash_password("Pass123"),
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()

        data = UserUpdate(is_active=False)

        # Act
        updated = update_user(db_session, user.id, data)

        # Assert
        assert updated.is_active is False

    def test_actualizar_roles_usuario(self, db_session: Session) -> None:
        # Arrange
        user = User(
            email="user@example.com",
            full_name="Usuario",
            hashed_password=hash_password("Pass123"),
        )
        role1 = Role(name="Rol1")
        role2 = Role(name="Rol2")
        db_session.add_all([user, role1, role2])
        db_session.commit()

        data = UserUpdate(role_ids=[role2.id])

        # Act
        updated = update_user(db_session, user.id, data)

        # Assert
        assert len(updated.roles) == 1
        assert updated.roles[0].id == role2.id


@pytest.mark.unit
class TestDeactivateUser:
    def test_desactivar_usuario(self, db_session: Session) -> None:
        # Arrange
        user = User(
            email="user@example.com",
            full_name="Usuario",
            hashed_password=hash_password("Pass123"),
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()

        # Act
        deactivated = deactivate_user(db_session, user.id)

        # Assert
        assert deactivated.is_active is False


@pytest.mark.unit
class TestAssignRole:
    def test_asignar_rol_a_usuario(self, db_session: Session) -> None:
        # Arrange
        user = User(
            email="user@example.com",
            full_name="Usuario",
            hashed_password=hash_password("Pass123"),
        )
        role = Role(name="Docente")
        db_session.add_all([user, role])
        db_session.commit()

        # Act
        updated = assign_role(db_session, user.id, role.id)

        # Assert
        assert len(updated.roles) == 1
        assert updated.roles[0].id == role.id

    def test_asignar_rol_inexistente_falla(self, db_session: Session) -> None:
        # Arrange
        user = User(
            email="user@example.com",
            full_name="Usuario",
            hashed_password=hash_password("Pass123"),
        )
        db_session.add(user)
        db_session.commit()

        # Act / Assert
        with pytest.raises(NotFoundError, match="Rol no encontrado"):
            assign_role(db_session, user.id, 999)


@pytest.mark.unit
class TestRemoveRole:
    def test_remover_rol_de_usuario(self, db_session: Session) -> None:
        # Arrange
        user = User(
            email="user@example.com",
            full_name="Usuario",
            hashed_password=hash_password("Pass123"),
        )
        role = Role(name="Docente")
        user.roles = [role]
        db_session.add_all([user, role])
        db_session.commit()

        # Act
        updated = remove_role(db_session, user.id, role.id)

        # Assert
        assert len(updated.roles) == 0
