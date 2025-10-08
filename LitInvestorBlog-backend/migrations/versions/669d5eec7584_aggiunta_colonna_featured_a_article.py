# LitInvestorBlog-backend/migrations/versions/669d5eec7584_aggiunta_colonna_featured_a_article.py

"""Aggiunta colonna featured a Article

Revision ID: 669d5eec7584
Revises: f729a940b869
Create Date: 2025-09-28 14:22:58.615006

"""

from alembic import op
import sqlalchemy as sa

revision = "669d5eec7584"
down_revision = "f729a940b869"
branch_labels = None
depends_on = None

def upgrade():

    with op.batch_alter_table("article", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("featured", sa.Boolean(), nullable=False, server_default="0")
        )

def downgrade():

    with op.batch_alter_table("article", schema=None) as batch_op:
        batch_op.drop_column("featured")
