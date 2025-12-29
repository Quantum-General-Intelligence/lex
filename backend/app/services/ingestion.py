"""Document ingestion service for processing legal documents."""

import re
import io
from typing import Optional
from datetime import datetime

from app.core.config import get_settings
from app.services.rag import RAGService
from app.core.database import neo4j_conn

settings = get_settings()


class DocumentParser:
    """Parse different document formats to extract text."""

    @staticmethod
    def parse_pdf(content: bytes) -> str:
        """Extract text from PDF."""
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            text_parts = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            return "\n\n".join(text_parts)
        except Exception as e:
            raise ValueError(f"Failed to parse PDF: {str(e)}")

    @staticmethod
    def parse_docx(content: bytes) -> str:
        """Extract text from Word document."""
        try:
            from docx import Document
            doc = Document(io.BytesIO(content))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            return "\n\n".join(paragraphs)
        except Exception as e:
            raise ValueError(f"Failed to parse DOCX: {str(e)}")

    @staticmethod
    def parse_html(content: bytes) -> str:
        """Extract text from HTML."""
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(content, 'html.parser')
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            text = soup.get_text(separator="\n")
            # Clean up whitespace
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            return "\n".join(lines)
        except Exception as e:
            raise ValueError(f"Failed to parse HTML: {str(e)}")

    @staticmethod
    def parse_txt(content: bytes) -> str:
        """Extract text from plain text file."""
        try:
            return content.decode('utf-8', errors='ignore')
        except Exception as e:
            raise ValueError(f"Failed to parse TXT: {str(e)}")

    @classmethod
    def parse(cls, content: bytes, content_type: str, filename: str) -> str:
        """Parse document based on content type or filename."""
        filename_lower = filename.lower() if filename else ""
        content_type_lower = content_type.lower() if content_type else ""

        if filename_lower.endswith('.pdf') or 'pdf' in content_type_lower:
            return cls.parse_pdf(content)
        elif filename_lower.endswith('.docx') or 'wordprocessingml' in content_type_lower:
            return cls.parse_docx(content)
        elif filename_lower.endswith('.doc'):
            # Old .doc format - try to read as text
            return cls.parse_txt(content)
        elif filename_lower.endswith('.html') or filename_lower.endswith('.htm') or 'html' in content_type_lower:
            return cls.parse_html(content)
        elif filename_lower.endswith('.txt') or 'text/plain' in content_type_lower:
            return cls.parse_txt(content)
        else:
            # Default to trying plain text
            return cls.parse_txt(content)


class IngestionService:
    """Service for ingesting and processing legal documents."""

    def __init__(self):
        self.rag_service = RAGService()
        self.parser = DocumentParser()

    def chunk_text(
        self,
        text: str,
        chunk_size: int = None,
        chunk_overlap: int = None,
    ) -> list[str]:
        """Split text into overlapping chunks."""
        chunk_size = chunk_size or settings.chunk_size
        chunk_overlap = chunk_overlap or settings.chunk_overlap

        if len(text) <= chunk_size:
            return [text]

        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_size

            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence ending within last 100 chars
                search_start = max(end - 100, start)
                last_period = text.rfind('. ', search_start, end)
                if last_period > start:
                    end = last_period + 1

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            start = end - chunk_overlap

        return chunks

    def extract_citations(self, text: str) -> list[dict]:
        """Extract legal citations from text."""
        citations = []

        # USC citations (e.g., "5 U.S.C. § 552")
        usc_pattern = r'(\d+)\s*U\.?S\.?C\.?\s*§\s*([\d\w-]+)'
        for match in re.finditer(usc_pattern, text):
            citations.append({
                "type": "usc",
                "title": match.group(1),
                "section": match.group(2),
                "full_citation": match.group(0),
            })

        # CFR citations (e.g., "34 CFR 99.1")
        cfr_pattern = r'(\d+)\s*C\.?F\.?R\.?\s*([\d.]+)'
        for match in re.finditer(cfr_pattern, text):
            citations.append({
                "type": "cfr",
                "title": match.group(1),
                "section": match.group(2),
                "full_citation": match.group(0),
            })

        # Public Law citations (e.g., "Pub. L. 93-380")
        pub_law_pattern = r'Pub\.?\s*L\.?\s*(\d+-\d+)'
        for match in re.finditer(pub_law_pattern, text):
            citations.append({
                "type": "public_law",
                "number": match.group(1),
                "full_citation": match.group(0),
            })

        # Case citations (e.g., "Brown v. Board of Education, 347 U.S. 483")
        case_pattern = r'(\w+\s+v\.?\s+\w+),?\s*(\d+)\s+U\.?S\.?\s+(\d+)'
        for match in re.finditer(case_pattern, text):
            citations.append({
                "type": "case",
                "case_name": match.group(1),
                "volume": match.group(2),
                "page": match.group(3),
                "full_citation": match.group(0),
            })

        return citations

    def extract_agencies(self, text: str) -> list[str]:
        """Extract agency names from text."""
        agencies = []

        known_agencies = [
            "Department of Education",
            "Department of Health and Human Services",
            "Department of Justice",
            "Department of Labor",
            "Department of Defense",
            "Department of Homeland Security",
            "Environmental Protection Agency",
            "Federal Trade Commission",
            "Securities and Exchange Commission",
            "Office of Management and Budget",
            "Office of Personnel Management",
            "Consumer Financial Protection Bureau",
            "Federal Communications Commission",
            "National Labor Relations Board",
        ]

        for agency in known_agencies:
            if agency.lower() in text.lower():
                agencies.append(agency)

        return list(set(agencies))

    def extract_dates(self, text: str) -> list[dict]:
        """Extract dates from legal text."""
        dates = []

        # Common date patterns
        patterns = [
            (r'effective\s+(\w+\s+\d+,?\s+\d{4})', 'effective_date'),
            (r'enacted\s+(\w+\s+\d+,?\s+\d{4})', 'enacted_date'),
            (r'amended\s+(\w+\s+\d+,?\s+\d{4})', 'amendment_date'),
        ]

        for pattern, date_type in patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                dates.append({
                    "type": date_type,
                    "raw": match.group(1),
                })

        return dates

    def detect_document_type(self, text: str, filename: str = "") -> str:
        """Try to detect the type of legal document."""
        text_lower = text.lower()
        filename_lower = filename.lower()

        # Check for regulatory indicators
        if 'cfr' in text_lower or 'code of federal regulations' in text_lower:
            return 'regulation'
        if 'u.s.c.' in text_lower or 'united states code' in text_lower:
            return 'statute'
        if ' v. ' in text_lower and ('u.s.' in text_lower or 'court' in text_lower):
            return 'case_law'
        if 'executive order' in text_lower:
            return 'executive_order'
        if 'guidance' in filename_lower or 'memorandum' in text_lower:
            return 'guidance'

        return 'regulation'  # Default

    def generate_title(self, text: str, filename: str) -> str:
        """Generate a title from the document content or filename."""
        # Try to extract title from first line
        lines = text.strip().split('\n')
        for line in lines[:5]:
            line = line.strip()
            if len(line) > 10 and len(line) < 200:
                # Looks like a title
                return line

        # Fall back to filename
        if filename:
            # Remove extension and clean up
            name = filename.rsplit('.', 1)[0]
            name = name.replace('_', ' ').replace('-', ' ')
            return name.title()

        return "Untitled Document"

    def generate_summary(self, text: str, max_length: int = 500) -> str:
        """Generate a simple summary from the document text."""
        # Take first few paragraphs
        paragraphs = text.split('\n\n')
        summary_parts = []
        current_length = 0

        for para in paragraphs:
            para = para.strip()
            if not para or len(para) < 50:
                continue
            if current_length + len(para) > max_length:
                break
            summary_parts.append(para)
            current_length += len(para)

        return ' '.join(summary_parts) if summary_parts else text[:max_length]

    async def create_graph_node(
        self,
        document_id: str,
        title: str,
        document_type: str,
        jurisdiction: str,
        agency: Optional[str],
        summary: str,
        text: str,
        citation: Optional[str] = None,
    ) -> bool:
        """Create a node in Neo4j for the document."""
        try:
            # Map document type to Neo4j label
            type_mapping = {
                'statute': 'Statute',
                'regulation': 'Regulation',
                'case_law': 'CaseLaw',
                'executive_order': 'ExecutiveOrder',
                'guidance': 'Regulation',
                'public_comment': 'Document',
            }
            label = type_mapping.get(document_type, 'Document')

            # Ensure connection
            if not neo4j_conn._driver:
                await neo4j_conn.connect()

            query = f"""
            CREATE (n:{label} {{
                id: $id,
                title: $title,
                citation: $citation,
                jurisdiction: $jurisdiction,
                agency: $agency,
                summary: $summary,
                text: $text,
                source: 'upload',
                created_at: datetime()
            }})
            RETURN n.id as id
            """

            params = {
                "id": document_id,
                "title": title,
                "citation": citation,
                "jurisdiction": jurisdiction,
                "agency": agency,
                "summary": summary,
                "text": text[:10000] if text else None,  # Limit text size
            }

            result = await neo4j_conn.execute_query(query, params)
            return bool(result)

        except Exception as e:
            print(f"Failed to create graph node: {e}")
            return False

    async def process_document(
        self,
        document_id: str,
        raw_text: str,
        title: str,
        document_type: str,
        jurisdiction: str = "federal",
        agency: Optional[str] = None,
        citation: Optional[str] = None,
        create_graph_node: bool = True,
    ) -> dict:
        """Process a document: chunk, extract entities, and index."""
        # Chunk the text
        chunks = self.chunk_text(raw_text)

        # Extract metadata
        citations = self.extract_citations(raw_text)
        agencies = self.extract_agencies(raw_text)
        dates = self.extract_dates(raw_text)

        # Use first agency found if not specified
        if not agency and agencies:
            agency = agencies[0]

        # Generate summary
        summary = self.generate_summary(raw_text)

        # Prepare metadata for vector store
        metadata = {
            "title": title,
            "document_type": document_type,
            "jurisdiction": jurisdiction,
            "agency": agency,
            "citation_count": len(citations),
        }

        # Add to vector store
        chunks_added = 0
        try:
            chunks_added = await self.rag_service.add_document(
                document_id=document_id,
                chunks=chunks,
                metadata=metadata,
            )
        except Exception as e:
            print(f"Failed to add to vector store: {e}")

        # Create graph node
        graph_created = False
        if create_graph_node:
            graph_created = await self.create_graph_node(
                document_id=document_id,
                title=title,
                document_type=document_type,
                jurisdiction=jurisdiction,
                agency=agency,
                summary=summary,
                text=raw_text,
                citation=citation,
            )

        return {
            "document_id": document_id,
            "title": title,
            "document_type": document_type,
            "chunks_created": chunks_added,
            "citations_found": len(citations),
            "citations": citations[:10],  # Return first 10
            "agencies_mentioned": agencies,
            "dates_found": dates,
            "summary": summary,
            "graph_node_created": graph_created,
            "text_length": len(raw_text),
        }

    async def ingest_file(
        self,
        content: bytes,
        filename: str,
        content_type: str,
        document_type: Optional[str] = None,
        jurisdiction: str = "federal",
        title: Optional[str] = None,
    ) -> dict:
        """Full ingestion pipeline for a file upload."""
        import uuid

        # Parse the file
        raw_text = self.parser.parse(content, content_type, filename)

        if not raw_text or len(raw_text.strip()) < 50:
            raise ValueError("Document appears to be empty or too short")

        # Auto-detect document type if not specified
        if not document_type:
            document_type = self.detect_document_type(raw_text, filename)

        # Generate title if not provided
        if not title:
            title = self.generate_title(raw_text, filename)

        # Generate document ID
        document_id = f"doc-{uuid.uuid4().hex[:12]}"

        # Process the document
        result = await self.process_document(
            document_id=document_id,
            raw_text=raw_text,
            title=title,
            document_type=document_type,
            jurisdiction=jurisdiction,
        )

        return {
            **result,
            "filename": filename,
            "content_type": content_type,
        }

    def parse_regulation_structure(self, text: str) -> dict:
        """Parse the structure of a regulation document."""
        structure = {
            "sections": [],
            "subsections": [],
        }

        # Section pattern (e.g., "§ 99.1" or "Section 99.1")
        section_pattern = r'(?:§|Section)\s*([\d.]+)\s*([^\n]+)?'
        for match in re.finditer(section_pattern, text):
            structure["sections"].append({
                "number": match.group(1),
                "title": match.group(2).strip() if match.group(2) else None,
            })

        # Subsection pattern (e.g., "(a)", "(1)")
        subsection_pattern = r'\(([a-z]|\d+)\)\s*([^(]+)'
        for match in re.finditer(subsection_pattern, text):
            structure["subsections"].append({
                "marker": match.group(1),
                "text_preview": match.group(2)[:100].strip(),
            })

        return structure


# Lazy singleton instance
_ingestion_service = None


def get_ingestion_service():
    """Get or create the ingestion service lazily."""
    global _ingestion_service
    if _ingestion_service is None:
        _ingestion_service = IngestionService()
    return _ingestion_service
