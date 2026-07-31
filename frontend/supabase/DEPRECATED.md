# DEPRECATED — Supabase Migration Notice

> [!IMPORTANT]
> **Single Source of Truth Constraint Enforced:**
> GlowDesk project strictly uses **MySQL 8.0** managed via SQLAlchemy + Alembic in `backend/alembic` and `devops/mysql/init.sql`.
> Supabase direct database connection and SQL migrations have been **completely deprecated and removed** to eliminate dual-database conflicts and maintain single source of truth data integrity.
