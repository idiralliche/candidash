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
        SET format = 'EXTERNAL'
        WHERE is_external = true
    """)

    # Step 4: Handle invalid formats - detect from filename, fallback to TXT
    op.execute("""
        UPDATE documents
        SET format = CASE
            WHEN LOWER(name) LIKE '%.pdf' THEN 'PDF'
            WHEN LOWER(name) LIKE '%.doc' THEN 'DOC'
            WHEN LOWER(name) LIKE '%.docx' THEN 'DOCX'
            WHEN LOWER(name) LIKE '%.rtf' THEN 'RTF'
            WHEN LOWER(name) LIKE '%.txt' THEN 'TXT'
            WHEN LOWER(name) LIKE '%.md' THEN 'MD'
            WHEN LOWER(name) LIKE '%.ppt' THEN 'PPT'
            WHEN LOWER(name) LIKE '%.pptx' THEN 'PPTX'
            WHEN LOWER(name) LIKE '%.odp' THEN 'ODP'
            WHEN LOWER(name) LIKE '%.xls' THEN 'XLS'
            WHEN LOWER(name) LIKE '%.xlsx' THEN 'XLSX'
            WHEN LOWER(name) LIKE '%.ods' THEN 'ODS'
            WHEN LOWER(name) LIKE '%.csv' THEN 'CSV'
            WHEN LOWER(name) LIKE '%.tsv' THEN 'TSV'
            WHEN LOWER(name) LIKE '%.odt' THEN 'ODT'
            WHEN LOWER(name) LIKE '%.jpg' OR LOWER(name) LIKE '%.jpeg' THEN 'JPEG'
            WHEN LOWER(name) LIKE '%.png' THEN 'PNG'
            WHEN LOWER(name) LIKE '%.gif' THEN 'GIF'
            WHEN LOWER(name) LIKE '%.webp' THEN 'WEBP'
            WHEN LOWER(name) LIKE '%.json' THEN 'JSON'
            ELSE 'TXT'
        END
        WHERE format NOT IN (
            'PDF', 'DOC', 'DOCX', 'RTF', 'TXT', 'MD',
            'PPT', 'PPTX', 'ODP',
            'XLS', 'XLSX', 'ODS', 'CSV', 'TSV',
            'ODT',
            'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP',
            'JSON',
            'EXTERNAL'
        ) AND is_external = false
    """)

    # Step 5: Create the enum type in PostgreSQL
    documentformat_enum = postgresql.ENUM(
        'PDF', 'DOC', 'DOCX', 'RTF', 'TXT', 'MD',
        'PPT', 'PPTX', 'ODP',
        'XLS', 'XLSX', 'ODS', 'CSV', 'TSV',
        'ODT',
        'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP',
        'JSON',
        'EXTERNAL',
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
