from __future__ import annotations

from dotenv import load_dotenv
from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    """Configuración centralizada de la aplicación."""

    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_", extra="ignore")

    env: str = Field(default="development", validation_alias=AliasChoices("APP_ENV", "ENV"))

    database_url: str = Field(
        default="postgresql+psycopg://postgres:root@localhost:5432/universidad",
        validation_alias=AliasChoices("APP_DATABASE_URL", "DATABASE_URL"),
    )
    api_title: str = "Universidad Digital API"
    api_version: str = "1.0.0"

    jwt_secret: str | None = Field(default=None, validation_alias="APP_JWT_SECRET")
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = Field(default=60, validation_alias="APP_JWT_EXPIRATION")
    cookie_name: str = "access_token"
    cookie_secure: bool = Field(default=False, validation_alias="APP_COOKIE_SECURE")
    cookie_samesite: str = Field(default="lax", validation_alias="APP_COOKIE_SAMESITE")

    cors_origins: str | list[str] = Field(default_factory=list, validation_alias="APP_CORS_ORIGINS")

    # Mail sender and frontend URL (restablecimiento de contraseña)
    mail_host: str = Field(default="sandbox.smtp.mailtrap.io", validation_alias=AliasChoices("MAIL_HOST"))
    mail_port: int = Field(default=2525, validation_alias=AliasChoices("MAIL_PORT"))
    mail_user: str | None = Field(default=None, validation_alias=AliasChoices("MAIL_USER"))
    mail_pass: str | None = Field(default=None, validation_alias=AliasChoices("MAIL_PASS"))
    mail_from: str = Field(default="no-reply@universidad-digital.com", validation_alias=AliasChoices("MAIL_FROM", "EMAIL_FROM"))
    frontend_url: str = Field(default="http://localhost:3000", validation_alias=AliasChoices("APP_BASE_URL", "FRONTEND_URL"))

    # Mailtrap Sandbox API
    mailtrap_api_token: str | None = Field(default=None, validation_alias=AliasChoices("MAILTRAP_API_TOKEN"))
    mailtrap_inbox_id: str | None = Field(default=None, validation_alias=AliasChoices("MAILTRAP_INBOX_ID"))

    password_reset_expiration_minutes: int = 30

    auto_create_tables: bool = True

    @property
    def is_production(self) -> bool:
        return self.env.lower() == "production"

    @field_validator("database_url", mode="before")
    @classmethod
    def _fix_database_url(cls, value: object) -> object:
        if isinstance(value, str) and value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg://", 1)
        return value

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value: object) -> list[str]:
        if isinstance(value, str):
            items = [item.strip() for item in value.split(",") if item.strip()]
            return items
        if isinstance(value, list):
            return value
        return []


settings = Settings()
