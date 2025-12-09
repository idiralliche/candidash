"""add is_external and convert format to enum

Revision ID: 590a3ea04fd2
Revises: 7f9204270414
Create Date: 2025-12-09 10:33:51.280906+01:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '590a3ea04fd2'
down_revision: Union[str, None] = '7f9204270414'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Step 1: Add is_external column with default False
    op.add_column('documents', sa.Column('is_external', sa.Boolean(), nullable=False, server_default='false'))

    # Step 2: Detect existing URLs and mark them as external
    op.execute("""
        UPDATE documents
        SET is_external = true
        WHERE path LIKE 'http://%' OR path LIKE 'https://%'
    """)

    # Step 3: For external documents, set format to 'external'
    op.execute("""
        UPDATE documents
        SET format = 'external'
        WHERE is_external = true
    """)

    # Step 4: Handle invalid formats - detect from filename, fallback to txt
    op.execute("""
        UPDATE documents
        SET format = CASE
            WHEN LOWER(name) LIKE '%.pdf' THEN 'pdf'
            WHEN LOWER(name) LIKE '%.doc' THEN 'doc'
            WHEN LOWER(name) LIKE '%.docx' THEN 'docx'
            WHEN LOWER(name) LIKE '%.rtf' THEN 'rtf'
            WHEN LOWER(name) LIKE '%.txt' THEN 'txt'
            WHEN LOWER(name) LIKE '%.md' THEN 'md'
            WHEN LOWER(name) LIKE '%.ppt' THEN 'ppt'
            WHEN LOWER(name) LIKE '%.pptx' THEN 'pptx'
            WHEN LOWER(name) LIKE '%.odp' THEN 'odp'
            WHEN LOWER(name) LIKE '%.xls' THEN 'xls'
            WHEN LOWER(name) LIKE '%.xlsx' THEN 'xlsx'
            WHEN LOWER(name) LIKE '%.ods' THEN 'ods'
            WHEN LOWER(name) LIKE '%.csv' THEN 'csv'
            WHEN LOWER(name) LIKE '%.tsv' THEN 'tsv'
            WHEN LOWER(name) LIKE '%.odt' THEN 'odt'
            WHEN LOWER(name) LIKE '%.jpg' OR LOWER(name) LIKE '%.jpeg' THEN 'jpeg'
            WHEN LOWER(name) LIKE '%.png' THEN 'png'
            WHEN LOWER(name) LIKE '%.gif' THEN 'gif'
            WHEN LOWER(name) LIKE '%.webp' THEN 'webp'
            WHEN LOWER(name) LIKE '%.json' THEN 'json'
            ELSE 'txt'
        END
        WHERE format NOT IN (
            'pdf', 'doc', 'docx', 'rtf', 'txt', 'md',
            'ppt', 'pptx', 'odp',
            'xls', 'xlsx', 'ods', 'csv', 'tsv',
            'odt',
            'jpg', 'jpeg', 'png', 'gif', 'webp',
            'json',
            'external'
        ) AND is_external = false
    """)

    # Step 5: Create the enum type in PostgreSQL
    documentformat_enum = postgresql.ENUM(
        'pdf', 'doc', 'docx', 'rtf', 'txt', 'md',
        'ppt', 'pptx', 'odp',
        'xls', 'xlsx', 'ods', 'csv', 'tsv',
        'odt',
        'jpg', 'jpeg', 'png', 'gif', 'webp',
        'json',
        'external',
        name='documentformat',
        create_type=True
    )
    documentformat_enum.create(op.get_bind(), checkfirst=True)

    # Step 6: Convert format column from String to Enum
    op.execute("""
        ALTER TABLE documents
        ALTER COLUMN format TYPE documentformat
        USING format::text::documentformat
    """)


def downgrade():
    # Step 1: Convert format column back from Enum to String
    op.execute("""
        ALTER TABLE documents
        ALTER COLUMN format TYPE VARCHAR(10)
        USING format::text
    """)

    # Step 2: Drop the enum type
    op.execute("DROP TYPE IF EXISTS documentformat")

    # Step 3: Remove is_external column
    op.drop_column('documents', 'is_external')
