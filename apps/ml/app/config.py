from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    api_key: str | None = None
    embedding_model: str = "intfloat/multilingual-e5-large"
    vision_model_path: str | None = None
    log_level: str = "INFO"
    model_config = SettingsConfigDict(env_prefix="ML_", env_file=".env", extra="ignore")


settings = Settings()
