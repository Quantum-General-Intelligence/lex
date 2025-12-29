"""Demo data for showcasing the Lex platform without external databases."""

from typing import Optional
import random

# Sample legal documents representing a realistic regulatory landscape
DEMO_NODES = [
    # Statutes
    {
        "id": "statute-apa",
        "type": "Statute",
        "title": "Administrative Procedure Act",
        "citation": "5 U.S.C. § 551-559",
        "jurisdiction": "federal",
        "agency": None,
        "year": 1946,
        "summary": "The foundational statute governing federal agency rulemaking and adjudication. Establishes requirements for notice-and-comment rulemaking, formal rulemaking, and judicial review of agency actions.",
        "text": "The Administrative Procedure Act (APA) governs the process by which federal agencies develop and issue regulations. It includes requirements for publishing notices of proposed rulemaking in the Federal Register, giving interested persons an opportunity to participate through submission of written comments, and publishing a general statement of basis and purpose when final rules are issued.",
    },
    {
        "id": "statute-foia",
        "type": "Statute",
        "title": "Freedom of Information Act",
        "citation": "5 U.S.C. § 552",
        "jurisdiction": "federal",
        "agency": None,
        "year": 1966,
        "summary": "Provides public access to federal agency records. Establishes nine exemptions and requires agencies to proactively disclose certain information.",
        "text": "The Freedom of Information Act (FOIA) provides that any person has a right to obtain access to federal agency records, except to the extent that such records are protected from public disclosure by one of nine exemptions or by one of three special law enforcement record exclusions.",
    },
    {
        "id": "statute-privacy-act",
        "type": "Statute",
        "title": "Privacy Act of 1974",
        "citation": "5 U.S.C. § 552a",
        "jurisdiction": "federal",
        "agency": None,
        "year": 1974,
        "summary": "Governs the collection, maintenance, use, and dissemination of personally identifiable information maintained by federal agencies.",
        "text": "The Privacy Act of 1974 establishes a code of fair information practices that governs the collection, maintenance, use, and dissemination of information about individuals that is maintained in systems of records by federal agencies.",
    },
    {
        "id": "statute-ferpa",
        "type": "Statute",
        "title": "Family Educational Rights and Privacy Act",
        "citation": "20 U.S.C. § 1232g",
        "jurisdiction": "federal",
        "agency": "Department of Education",
        "year": 1974,
        "summary": "Protects the privacy of student education records and gives parents rights to access and amend their children's records.",
        "text": "FERPA gives parents certain rights with respect to their children's education records. These rights transfer to the student when he or she reaches the age of 18 or attends a school beyond the high school level.",
    },
    {
        "id": "statute-clean-air",
        "type": "Statute",
        "title": "Clean Air Act",
        "citation": "42 U.S.C. § 7401",
        "jurisdiction": "federal",
        "agency": "Environmental Protection Agency",
        "year": 1970,
        "summary": "Comprehensive federal law regulating air emissions from stationary and mobile sources. Authorizes EPA to establish National Ambient Air Quality Standards.",
        "text": "The Clean Air Act is the comprehensive federal law that regulates air emissions from stationary and mobile sources. This law authorizes the EPA to establish National Ambient Air Quality Standards (NAAQS) to protect public health and welfare.",
    },
    {
        "id": "statute-nepa",
        "type": "Statute",
        "title": "National Environmental Policy Act",
        "citation": "42 U.S.C. § 4321",
        "jurisdiction": "federal",
        "agency": None,
        "year": 1970,
        "summary": "Requires federal agencies to assess environmental effects of proposed actions before making decisions.",
        "text": "NEPA requires federal agencies to assess the environmental effects of their proposed actions prior to making decisions. The range of actions covered by NEPA includes making decisions on permit applications, adopting federal land management actions, and constructing highways and other publicly-owned facilities.",
    },
    # Regulations
    {
        "id": "reg-ferpa-impl",
        "type": "Regulation",
        "title": "FERPA Regulations",
        "citation": "34 CFR Part 99",
        "jurisdiction": "federal",
        "agency": "Department of Education",
        "year": 2008,
        "summary": "Implements FERPA requirements for educational agencies and institutions receiving federal funds.",
        "text": "These regulations implement the Family Educational Rights and Privacy Act (FERPA), which affords parents the right to have access to their children's education records, the right to seek to have the records amended, and the right to have some control over the disclosure of personally identifiable information from the education records.",
    },
    {
        "id": "reg-foia-impl",
        "type": "Regulation",
        "title": "DOJ FOIA Regulations",
        "citation": "28 CFR Part 16",
        "jurisdiction": "federal",
        "agency": "Department of Justice",
        "year": 2016,
        "summary": "Department of Justice procedures for processing FOIA requests and administrative appeals.",
        "text": "These regulations set forth the procedures the Department of Justice follows in processing requests for records under the Freedom of Information Act. They describe how to make a request, how fees are assessed, and how to file an administrative appeal.",
    },
    {
        "id": "reg-naaqs",
        "type": "Regulation",
        "title": "National Ambient Air Quality Standards",
        "citation": "40 CFR Part 50",
        "jurisdiction": "federal",
        "agency": "Environmental Protection Agency",
        "year": 2015,
        "summary": "Establishes air quality standards for six criteria pollutants to protect public health and welfare.",
        "text": "The national primary ambient air quality standards define levels of air quality which the Administrator judges are necessary, with an adequate margin of safety, to protect the public health. The national secondary ambient air quality standards define levels necessary to protect the public welfare from any known or anticipated adverse effects of a pollutant.",
    },
    {
        "id": "reg-nepa-impl",
        "type": "Regulation",
        "title": "CEQ NEPA Regulations",
        "citation": "40 CFR Parts 1500-1508",
        "jurisdiction": "federal",
        "agency": "Council on Environmental Quality",
        "year": 2020,
        "summary": "Implements NEPA requirements for environmental impact statements and environmental assessments.",
        "text": "These regulations implement the procedural provisions of the National Environmental Policy Act. They establish the basic framework for environmental impact statements, environmental assessments, categorical exclusions, and other NEPA procedures.",
    },
    {
        "id": "reg-apa-rulemaking",
        "type": "Regulation",
        "title": "ACUS Rulemaking Recommendations",
        "citation": "1 CFR Part 305",
        "jurisdiction": "federal",
        "agency": "Administrative Conference of the United States",
        "year": 2018,
        "summary": "Best practices and recommendations for federal agency rulemaking procedures.",
        "text": "The Administrative Conference issues recommendations to improve the efficiency, adequacy, and fairness of agency procedures. These recommendations address notice-and-comment rulemaking, retrospective review of regulations, and public participation in the regulatory process.",
    },
    # Case Law
    {
        "id": "case-chevron",
        "type": "CaseLaw",
        "title": "Chevron U.S.A., Inc. v. Natural Resources Defense Council",
        "citation": "467 U.S. 837 (1984)",
        "jurisdiction": "federal",
        "agency": None,
        "year": 1984,
        "court": "Supreme Court",
        "summary": "Established the Chevron deference doctrine requiring courts to defer to reasonable agency interpretations of ambiguous statutes.",
        "text": "When a court reviews an agency's construction of the statute which it administers, the court must first determine whether Congress has directly spoken to the precise question at issue. If the statute is silent or ambiguous, the question is whether the agency's answer is based on a permissible construction of the statute.",
    },
    {
        "id": "case-auer",
        "type": "CaseLaw",
        "title": "Auer v. Robbins",
        "citation": "519 U.S. 452 (1997)",
        "jurisdiction": "federal",
        "agency": None,
        "year": 1997,
        "court": "Supreme Court",
        "summary": "Established Auer deference to agency interpretations of their own ambiguous regulations.",
        "text": "An agency's interpretation of its own regulation is controlling unless plainly erroneous or inconsistent with the regulation. This deference is warranted because the agency is the author of the regulation and is in a better position to reconstruct its original intent.",
    },
    {
        "id": "case-motor-vehicle",
        "type": "CaseLaw",
        "title": "Motor Vehicle Manufacturers Ass'n v. State Farm",
        "citation": "463 U.S. 29 (1983)",
        "jurisdiction": "federal",
        "agency": None,
        "year": 1983,
        "court": "Supreme Court",
        "summary": "Established the arbitrary and capricious standard for judicial review of agency rulemaking.",
        "text": "The scope of review under the arbitrary and capricious standard is narrow and a court is not to substitute its judgment for that of the agency. Nevertheless, the agency must examine the relevant data and articulate a satisfactory explanation for its action.",
    },
    {
        "id": "case-loper-bright",
        "type": "CaseLaw",
        "title": "Loper Bright Enterprises v. Raimondo",
        "citation": "603 U.S. ___ (2024)",
        "jurisdiction": "federal",
        "agency": None,
        "year": 2024,
        "court": "Supreme Court",
        "summary": "Overruled Chevron deference, holding that courts must exercise independent judgment in interpreting statutes.",
        "text": "Chevron is overruled. Courts must exercise their independent judgment in deciding whether an agency has acted within its statutory authority. The APA requires courts to decide all relevant questions of law and interpret statutory provisions.",
    },
    # Executive Orders
    {
        "id": "eo-12866",
        "type": "ExecutiveOrder",
        "title": "Executive Order 12866 - Regulatory Planning and Review",
        "citation": "E.O. 12866",
        "jurisdiction": "federal",
        "agency": "Office of Management and Budget",
        "year": 1993,
        "summary": "Establishes principles for regulatory planning and review, including cost-benefit analysis requirements.",
        "text": "Federal agencies should promulgate only such regulations as are required by law, are necessary to interpret the law, or are made necessary by compelling public need. In deciding whether and how to regulate, agencies should assess all costs and benefits of available regulatory alternatives.",
    },
    {
        "id": "eo-13563",
        "type": "ExecutiveOrder",
        "title": "Executive Order 13563 - Improving Regulation and Regulatory Review",
        "citation": "E.O. 13563",
        "jurisdiction": "federal",
        "agency": "Office of Management and Budget",
        "year": 2011,
        "summary": "Supplements E.O. 12866 with principles for retrospective review and public participation.",
        "text": "Our regulatory system must protect public health, welfare, safety, and our environment while promoting economic growth, innovation, competitiveness, and job creation. Regulations must be based on the best available science.",
    },
    # Agencies
    {
        "id": "agency-epa",
        "type": "Agency",
        "title": "Environmental Protection Agency",
        "citation": None,
        "jurisdiction": "federal",
        "agency": None,
        "abbreviation": "EPA",
        "summary": "Independent agency responsible for protecting human health and the environment.",
        "text": "The Environmental Protection Agency (EPA) is an independent executive agency of the United States federal government tasked with environmental protection matters. The EPA regulates air and water quality, pesticides, and hazardous waste.",
    },
    {
        "id": "agency-ed",
        "type": "Agency",
        "title": "Department of Education",
        "citation": None,
        "jurisdiction": "federal",
        "agency": None,
        "abbreviation": "ED",
        "summary": "Cabinet-level department responsible for federal education policy and programs.",
        "text": "The Department of Education is a Cabinet-level department of the United States government. It administers federal assistance to education and enforces federal educational laws regarding privacy and civil rights.",
    },
    {
        "id": "agency-doj",
        "type": "Agency",
        "title": "Department of Justice",
        "citation": None,
        "jurisdiction": "federal",
        "agency": None,
        "abbreviation": "DOJ",
        "summary": "Cabinet-level department responsible for enforcement of federal laws.",
        "text": "The Department of Justice (DOJ) is a cabinet-level department responsible for the enforcement of the law and administration of justice in the United States.",
    },
]

# Relationships between nodes
DEMO_RELATIONSHIPS = [
    # Statutes authorizing regulations
    {"source": "statute-ferpa", "target": "reg-ferpa-impl", "type": "AUTHORIZES"},
    {"source": "statute-foia", "target": "reg-foia-impl", "type": "AUTHORIZES"},
    {"source": "statute-clean-air", "target": "reg-naaqs", "type": "AUTHORIZES"},
    {"source": "statute-nepa", "target": "reg-nepa-impl", "type": "AUTHORIZES"},
    {"source": "statute-apa", "target": "reg-apa-rulemaking", "type": "AUTHORIZES"},
    # Regulations implementing statutes
    {"source": "reg-ferpa-impl", "target": "statute-ferpa", "type": "IMPLEMENTS"},
    {"source": "reg-foia-impl", "target": "statute-foia", "type": "IMPLEMENTS"},
    {"source": "reg-naaqs", "target": "statute-clean-air", "type": "IMPLEMENTS"},
    {"source": "reg-nepa-impl", "target": "statute-nepa", "type": "IMPLEMENTS"},
    # Case law interpreting statutes
    {"source": "case-chevron", "target": "statute-apa", "type": "INTERPRETS"},
    {"source": "case-auer", "target": "statute-apa", "type": "INTERPRETS"},
    {"source": "case-motor-vehicle", "target": "statute-apa", "type": "INTERPRETS"},
    {"source": "case-loper-bright", "target": "statute-apa", "type": "INTERPRETS"},
    # Case law overruling other cases
    {"source": "case-loper-bright", "target": "case-chevron", "type": "OVERRULES"},
    # Executive orders relating to APA
    {"source": "eo-12866", "target": "statute-apa", "type": "SUPPLEMENTS"},
    {"source": "eo-13563", "target": "eo-12866", "type": "SUPPLEMENTS"},
    # Agency relationships
    {"source": "agency-epa", "target": "reg-naaqs", "type": "PROMULGATES"},
    {"source": "agency-epa", "target": "reg-nepa-impl", "type": "ADMINISTERS"},
    {"source": "agency-ed", "target": "reg-ferpa-impl", "type": "PROMULGATES"},
    {"source": "agency-doj", "target": "reg-foia-impl", "type": "PROMULGATES"},
    # Privacy Act relationship
    {"source": "statute-privacy-act", "target": "statute-foia", "type": "RELATES_TO"},
]

# Sample document chunks for RAG
DEMO_CHUNKS = []
for node in DEMO_NODES:
    if node.get("text"):
        # Create chunks from the text
        text = node["text"]
        chunk_size = 300
        for i in range(0, len(text), chunk_size - 50):
            chunk = text[i:i + chunk_size]
            if len(chunk) > 50:
                DEMO_CHUNKS.append({
                    "id": f"{node['id']}_chunk_{i // (chunk_size - 50)}",
                    "document_id": node["id"],
                    "text": chunk,
                    "metadata": {
                        "document_id": node["id"],
                        "title": node["title"],
                        "citation": node.get("citation"),
                        "document_type": node["type"].lower(),
                        "jurisdiction": node.get("jurisdiction", "federal"),
                        "agency": node.get("agency"),
                    }
                })


class DemoDataStore:
    """In-memory data store for demo mode."""

    def __init__(self):
        self.nodes = {node["id"]: node for node in DEMO_NODES}
        self.relationships = DEMO_RELATIONSHIPS
        self.chunks = DEMO_CHUNKS

    def get_nodes(
        self,
        node_type: Optional[str] = None,
        jurisdiction: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict]:
        """Get nodes with optional filtering."""
        results = list(self.nodes.values())

        if node_type:
            results = [n for n in results if n["type"] == node_type]

        if jurisdiction:
            results = [n for n in results if n.get("jurisdiction") == jurisdiction]

        if search:
            search_lower = search.lower()
            results = [
                n for n in results
                if search_lower in n["title"].lower()
                or search_lower in (n.get("citation") or "").lower()
                or search_lower in (n.get("summary") or "").lower()
            ]

        return results[skip:skip + limit]

    def get_node(self, node_id: str) -> Optional[dict]:
        """Get a single node by ID."""
        return self.nodes.get(node_id)

    def get_node_relationships(self, node_id: str) -> list[dict]:
        """Get all relationships for a node."""
        results = []
        for rel in self.relationships:
            if rel["source"] == node_id:
                target = self.nodes.get(rel["target"])
                if target:
                    results.append({
                        "type": rel["type"],
                        "direction": "outgoing",
                        "node": {
                            "id": target["id"],
                            "title": target["title"],
                            "citation": target.get("citation"),
                            "type": target["type"],
                        }
                    })
            elif rel["target"] == node_id:
                source = self.nodes.get(rel["source"])
                if source:
                    results.append({
                        "type": rel["type"],
                        "direction": "incoming",
                        "node": {
                            "id": source["id"],
                            "title": source["title"],
                            "citation": source.get("citation"),
                            "type": source["type"],
                        }
                    })
        return results

    def get_authority_chain(self, node_id: str, max_depth: int = 5) -> list[dict]:
        """Trace the authority chain for a regulation."""
        chain = []
        visited = set()
        current_ids = [node_id]

        for depth in range(max_depth):
            next_ids = []
            for nid in current_ids:
                if nid in visited:
                    continue
                visited.add(nid)

                for rel in self.relationships:
                    if rel["source"] == nid and rel["type"] in ["IMPLEMENTS", "AUTHORIZES"]:
                        target = self.nodes.get(rel["target"])
                        if target and target["id"] not in visited:
                            chain.append(target)
                            next_ids.append(target["id"])

            if not next_ids:
                break
            current_ids = next_ids

        return chain

    def explore_graph(
        self,
        center_node_id: Optional[str] = None,
        limit: int = 100,
    ) -> dict:
        """Get nodes and relationships for visualization."""
        if center_node_id:
            center = self.nodes.get(center_node_id)
            if not center:
                return {"nodes": [], "relationships": []}

            # Get connected nodes
            connected_ids = set()
            relevant_rels = []
            for rel in self.relationships:
                if rel["source"] == center_node_id:
                    connected_ids.add(rel["target"])
                    relevant_rels.append(rel)
                elif rel["target"] == center_node_id:
                    connected_ids.add(rel["source"])
                    relevant_rels.append(rel)

            nodes = [center]
            for nid in list(connected_ids)[:limit - 1]:
                node = self.nodes.get(nid)
                if node:
                    nodes.append(node)

            return {
                "nodes": [
                    {
                        "id": n["id"],
                        "title": n["title"],
                        "citation": n.get("citation"),
                        "type": n["type"],
                        "jurisdiction": n.get("jurisdiction"),
                    }
                    for n in nodes
                ],
                "relationships": relevant_rels,
            }
        else:
            # Return all nodes up to limit
            nodes = list(self.nodes.values())[:limit]
            node_ids = {n["id"] for n in nodes}

            # Only include relationships between included nodes
            relevant_rels = [
                rel for rel in self.relationships
                if rel["source"] in node_ids and rel["target"] in node_ids
            ]

            return {
                "nodes": [
                    {
                        "id": n["id"],
                        "title": n["title"],
                        "citation": n.get("citation"),
                        "type": n["type"],
                        "jurisdiction": n.get("jurisdiction"),
                    }
                    for n in nodes
                ],
                "relationships": relevant_rels,
            }

    def search_chunks(
        self,
        query: str,
        top_k: int = 5,
        jurisdiction: Optional[str] = None,
        document_type: Optional[str] = None,
    ) -> list[dict]:
        """Simple keyword search over chunks (simulates vector search)."""
        query_terms = query.lower().split()

        scored_chunks = []
        for chunk in self.chunks:
            # Apply filters
            if jurisdiction and chunk["metadata"].get("jurisdiction") != jurisdiction:
                continue
            if document_type and chunk["metadata"].get("document_type") != document_type:
                continue

            # Score based on term overlap
            text_lower = chunk["text"].lower()
            title_lower = chunk["metadata"].get("title", "").lower()

            score = 0
            for term in query_terms:
                if term in text_lower:
                    score += text_lower.count(term) * 0.1
                if term in title_lower:
                    score += 0.3

            if score > 0:
                scored_chunks.append((score, chunk))

        # Sort by score descending
        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        results = []
        for score, chunk in scored_chunks[:top_k]:
            results.append({
                "chunk_id": chunk["id"],
                "document_id": chunk["document_id"],
                "text": chunk["text"],
                "score": min(0.95, score),  # Cap at 0.95
                "metadata": chunk["metadata"],
            })

        return results


# Global demo data store instance
_demo_store: Optional[DemoDataStore] = None


def get_demo_store() -> DemoDataStore:
    """Get or create the demo data store."""
    global _demo_store
    if _demo_store is None:
        _demo_store = DemoDataStore()
    return _demo_store


def is_demo_mode() -> bool:
    """Check if we should use demo mode (when external DBs are unavailable)."""
    # Always use demo mode for now - can be made configurable
    return True
