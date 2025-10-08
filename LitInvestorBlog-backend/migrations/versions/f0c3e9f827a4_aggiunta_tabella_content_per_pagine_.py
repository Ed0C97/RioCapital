# LitInvestorBlog-backend/migrations/versions/f0c3e9f827a4_aggiunta_tabella_content_per_pagine_.py

"""Aggiunta tabella Content per pagine statiche

Revision ID: f0c3e9f827a4
Revises: 669d5eec7584
Create Date: 2025-09-29 11:05:15.470040

"""

from alembic import op
import sqlalchemy as sa

revision = "f0c3e9f827a4"
down_revision = "669d5eec7584"
branch_labels = None
depends_on = None

def upgrade():

    op.create_table(
        "content",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("page_key", sa.String(length=50), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("page_key"),
    )

def downgrade():

    op.drop_table("content")
