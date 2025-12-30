#!/usr/bin/env python3
"""
Seed script to populate the legal knowledge graph with demo data.
Run with: python3 -m scripts.seed_data
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import chromadb
from app.core.database import neo4j_conn, init_neo4j_schema


def get_chroma_client_for_seed():
    """Get ChromaDB client - works both inside and outside Docker."""
    hosts_to_try = [
        ("chromadb", 8000),
        ("localhost", 8000),
    ]

    for host, port in hosts_to_try:
        try:
            client = chromadb.HttpClient(host=host, port=port)
            client.heartbeat()
            print(f"  Connected to ChromaDB at {host}:{port}")
            return client
        except Exception:
            continue

    raise ConnectionError("Could not connect to ChromaDB")


# =============================================================================
# STATUTES - Federal Laws
# =============================================================================
STATUTES = [
    # Administrative Law
    {
        "id": "statute-apa",
        "title": "Administrative Procedure Act",
        "citation": "5 U.S.C. §§ 551-559",
        "jurisdiction": "federal",
        "year": 1946,
        "summary": "Governs the process by which federal agencies develop and issue regulations. Establishes requirements for rulemaking, adjudication, and judicial review.",
        "text": """The Administrative Procedure Act (APA) establishes the procedures that federal agencies must follow in rulemaking and adjudication.

Key provisions include:
- Notice-and-comment rulemaking requirements (§ 553)
- Standards for formal and informal adjudication (§§ 554-557)
- Scope of judicial review of agency actions (§ 706)
- Requirements for public access to agency proceedings

The APA applies to all executive branch agencies and independent regulatory commissions. It requires agencies to publish proposed rules in the Federal Register, allow public comment, and respond to significant comments in the final rule.""",
    },
    {
        "id": "statute-foia",
        "title": "Freedom of Information Act",
        "citation": "5 U.S.C. § 552",
        "jurisdiction": "federal",
        "year": 1966,
        "summary": "Provides the public right to request access to records from federal agencies, subject to nine exemptions.",
        "text": """The Freedom of Information Act (FOIA) establishes the public's right to obtain information from federal agencies.

Agencies must:
- Proactively disclose certain information in reading rooms
- Respond to requests within 20 business days
- Provide records unless an exemption applies
- Conduct adequate searches for responsive records

Nine exemptions protect:
1. Classified national security information
2. Internal agency personnel rules
3. Information exempted by other statutes
4. Trade secrets and confidential business information
5. Inter-agency or intra-agency communications (deliberative process)
6. Personal privacy (Exemptions 6 and 7(C))
7. Law enforcement records
8. Financial institution regulation
9. Geological and geophysical information""",
    },
    {
        "id": "statute-privacy-act",
        "title": "Privacy Act of 1974",
        "citation": "5 U.S.C. § 552a",
        "jurisdiction": "federal",
        "year": 1974,
        "summary": "Establishes requirements for collection, maintenance, and disclosure of personal information by federal agencies.",
        "text": """The Privacy Act of 1974 governs the collection, maintenance, use, and dissemination of personal information by federal agencies.

Key requirements:
- Agencies must publish System of Records Notices (SORNs)
- Individuals have rights to access and amend their records
- Agencies may only disclose records with consent or under 12 routine use exceptions
- Computer matching programs must follow specific procedures
- Agencies must maintain accurate, relevant, timely, and complete records

The Act provides civil remedies and criminal penalties for violations. Individuals may sue for damages when agencies fail to comply.""",
    },
    # Education
    {
        "id": "statute-ferpa",
        "title": "Family Educational Rights and Privacy Act",
        "citation": "20 U.S.C. § 1232g",
        "jurisdiction": "federal",
        "year": 1974,
        "summary": "Protects the privacy of student education records and gives parents and eligible students rights regarding those records.",
        "text": """FERPA protects the privacy of student education records at schools receiving federal funding.

Key provisions:
- Parents have the right to inspect and review education records
- Rights transfer to student at age 18 or college enrollment (eligible students)
- Schools must have written permission to release records
- Directory information may be disclosed without consent if proper notice given
- Schools must notify parents annually of their FERPA rights

Violations can result in withdrawal of federal funding. The Department of Education enforces FERPA through the Student Privacy Policy Office.""",
    },
    # Healthcare
    {
        "id": "statute-hipaa",
        "title": "Health Insurance Portability and Accountability Act",
        "citation": "42 U.S.C. § 1320d et seq.",
        "jurisdiction": "federal",
        "year": 1996,
        "summary": "Establishes national standards for electronic health care transactions and protects the privacy and security of health information.",
        "text": """HIPAA establishes national standards for health information privacy and security.

Title I: Health Care Access and Portability
- Protects health insurance coverage for workers changing jobs
- Limits exclusions for preexisting conditions

Title II: Administrative Simplification
- Privacy Rule: Standards for protecting individually identifiable health information (PHI)
- Security Rule: Standards for electronic PHI safeguards
- Transaction Standards: Electronic data interchange requirements
- Identifier Standards: National provider identifiers

Covered entities include health plans, health care clearinghouses, and health care providers who transmit health information electronically.""",
    },
    {
        "id": "statute-hitech",
        "title": "Health Information Technology for Economic and Clinical Health Act",
        "citation": "42 U.S.C. § 17901 et seq.",
        "jurisdiction": "federal",
        "year": 2009,
        "summary": "Strengthens HIPAA enforcement, expands breach notification requirements, and promotes adoption of electronic health records.",
        "text": """The HITECH Act strengthened HIPAA privacy and security protections.

Key provisions:
- Breach notification requirements for unsecured PHI
- Extended HIPAA requirements to business associates
- Increased civil and criminal penalties for violations
- State attorneys general enforcement authority
- Meaningful Use incentive program for EHR adoption

Tier penalties range from $100 to $50,000 per violation, with annual caps up to $1.5 million per violation category.""",
    },
    # Environmental
    {
        "id": "statute-nepa",
        "title": "National Environmental Policy Act",
        "citation": "42 U.S.C. §§ 4321-4347",
        "jurisdiction": "federal",
        "year": 1970,
        "summary": "Requires federal agencies to assess environmental effects of proposed actions before making decisions.",
        "text": """NEPA establishes national environmental policy and requires environmental review of federal actions.

Key requirements:
- Environmental Impact Statements (EIS) for major federal actions significantly affecting the environment
- Environmental Assessments (EA) to determine if EIS is needed
- Categorical Exclusions for routine actions with no significant impact
- Public participation in the environmental review process
- Consideration of alternatives including no action

The Council on Environmental Quality (CEQ) oversees NEPA implementation and issues regulations at 40 CFR Parts 1500-1508.""",
    },
    {
        "id": "statute-clean-air-act",
        "title": "Clean Air Act",
        "citation": "42 U.S.C. §§ 7401-7671q",
        "jurisdiction": "federal",
        "year": 1970,
        "summary": "Comprehensive federal law regulating air emissions from stationary and mobile sources to protect public health and welfare.",
        "text": """The Clean Air Act regulates air pollution to protect public health and the environment.

Major programs:
- National Ambient Air Quality Standards (NAAQS) for criteria pollutants
- State Implementation Plans (SIPs) for achieving NAAQS
- New Source Performance Standards (NSPS) for new facilities
- National Emission Standards for Hazardous Air Pollutants (NESHAP)
- Prevention of Significant Deterioration (PSD) permits
- Title V operating permits for major sources
- Mobile source emission standards (vehicles)
- Acid rain program (Title IV)
- Stratospheric ozone protection (Title VI)

EPA has primary implementation authority with state delegation.""",
    },
    {
        "id": "statute-clean-water-act",
        "title": "Clean Water Act",
        "citation": "33 U.S.C. §§ 1251-1388",
        "jurisdiction": "federal",
        "year": 1972,
        "summary": "Establishes structure for regulating pollutant discharges into waters of the United States.",
        "text": """The Clean Water Act (CWA) regulates discharges of pollutants to protect water quality.

Key programs:
- National Pollutant Discharge Elimination System (NPDES) permits
- Water quality standards for surface waters
- Total Maximum Daily Loads (TMDLs) for impaired waters
- Section 404 permits for dredge and fill material (wetlands)
- Pretreatment standards for industrial discharges to POTWs
- Nonpoint source pollution management (Section 319)
- Oil spill prevention and response

The Act prohibits discharge of pollutants from point sources without a permit. EPA and Army Corps of Engineers share implementation.""",
    },
    {
        "id": "statute-rcra",
        "title": "Resource Conservation and Recovery Act",
        "citation": "42 U.S.C. §§ 6901-6992k",
        "jurisdiction": "federal",
        "year": 1976,
        "summary": "Governs the disposal of solid and hazardous waste, establishing cradle-to-grave tracking.",
        "text": """RCRA establishes the framework for managing solid and hazardous waste.

Subtitle C - Hazardous Waste:
- Identification and listing of hazardous wastes
- Generator requirements and manifest system
- Transporter requirements
- Treatment, storage, and disposal facility (TSDF) standards
- Land disposal restrictions
- Corrective action for releases

Subtitle D - Solid Waste:
- Criteria for municipal solid waste landfills
- State solid waste management plans

Subtitle I - Underground Storage Tanks:
- Technical standards for UST systems
- Release detection and corrective action""",
    },
    {
        "id": "statute-cercla",
        "title": "Comprehensive Environmental Response, Compensation, and Liability Act",
        "citation": "42 U.S.C. §§ 9601-9675",
        "jurisdiction": "federal",
        "year": 1980,
        "summary": "Provides authority for cleanup of hazardous substance releases and establishes liability for responsible parties (Superfund).",
        "text": """CERCLA (Superfund) addresses releases of hazardous substances to the environment.

Key provisions:
- Strict, joint and several liability for cleanup costs
- Categories of potentially responsible parties (PRPs):
  * Current owners/operators
  * Past owners/operators at time of disposal
  * Generators who arranged for disposal
  * Transporters who selected disposal sites
- National Priorities List (NPL) of contaminated sites
- Remedial investigation/feasibility study process
- Remedy selection criteria (nine factors)
- Natural resource damages

The Superfund Trust Fund finances cleanups where PRPs cannot be found or are insolvent.""",
    },
    # Information Security
    {
        "id": "statute-fisma",
        "title": "Federal Information Security Management Act",
        "citation": "44 U.S.C. § 3541 et seq.",
        "jurisdiction": "federal",
        "year": 2002,
        "summary": "Requires federal agencies to develop, document, and implement information security programs.",
        "text": """FISMA requires each federal agency to develop and implement an information security program.

Requirements include:
- Periodic risk assessments
- Policies and procedures to reduce risk
- Security awareness training for personnel
- Periodic testing and evaluation of controls
- Remediation of deficiencies
- Procedures for detecting and responding to incidents
- Plans for continuity of operations
- Annual reporting to OMB

FISMA was updated by FISMA 2014, emphasizing continuous monitoring and real-time risk management.""",
    },
    {
        "id": "statute-e-government",
        "title": "E-Government Act of 2002",
        "citation": "44 U.S.C. § 3501 note",
        "jurisdiction": "federal",
        "year": 2002,
        "summary": "Promotes electronic government services and establishes privacy requirements for federal websites.",
        "text": """The E-Government Act promotes the use of Internet-based technology for government services.

Key provisions:
- Establishes Office of Electronic Government within OMB
- Privacy Impact Assessments (PIAs) required before collecting PII
- Machine-readable privacy policies for federal websites
- Federal Information Security Management (FISMA provisions)
- Government information locator service
- Accessibility requirements (Section 508 integration)

Agencies must conduct PIAs when developing or procuring IT systems that collect, maintain, or disseminate identifiable information.""",
    },
    {
        "id": "statute-paperwork-reduction",
        "title": "Paperwork Reduction Act",
        "citation": "44 U.S.C. §§ 3501-3521",
        "jurisdiction": "federal",
        "year": 1980,
        "summary": "Requires OMB approval before agencies collect information from the public to minimize paperwork burden.",
        "text": """The Paperwork Reduction Act requires agencies to obtain OMB approval before collecting information from the public.

Key requirements:
- Information Collection Requests (ICRs) submitted to OIRA
- Burden hour estimates and justification
- Public notice and comment (60-day and 30-day notices)
- OMB control numbers displayed on forms
- Three-year approval cycle
- Information Collection Budget

OIRA reviews collections for practical utility, burden minimization, and consistency with other requirements.""",
    },
    # Financial
    {
        "id": "statute-glba",
        "title": "Gramm-Leach-Bliley Act",
        "citation": "15 U.S.C. §§ 6801-6809",
        "jurisdiction": "federal",
        "year": 1999,
        "summary": "Requires financial institutions to explain information-sharing practices and protect sensitive data.",
        "text": """The Gramm-Leach-Bliley Act (GLBA) protects consumer financial information.

Privacy provisions:
- Privacy notices explaining information collection and sharing
- Opt-out rights for sharing with nonaffiliated third parties
- Limits on disclosure of account numbers for marketing

Safeguards Rule requirements:
- Written information security program
- Employee training and management
- Oversight of service providers
- Regular testing and monitoring
- Adjustment based on changes

The FTC, banking regulators, and SEC enforce GLBA for their respective regulated entities.""",
    },
    {
        "id": "statute-sox",
        "title": "Sarbanes-Oxley Act",
        "citation": "15 U.S.C. § 7201 et seq.",
        "jurisdiction": "federal",
        "year": 2002,
        "summary": "Establishes corporate governance and financial disclosure requirements for public companies.",
        "text": """The Sarbanes-Oxley Act (SOX) reformed corporate accountability after Enron and WorldCom scandals.

Key provisions:
- Section 302: CEO/CFO certification of financial reports
- Section 404: Internal control assessment and auditor attestation
- Section 409: Real-time disclosure of material changes
- Section 802: Criminal penalties for document destruction
- Section 806: Whistleblower protections
- Section 906: Criminal certification requirements

The Public Company Accounting Oversight Board (PCAOB) oversees auditors of public companies.""",
    },
    {
        "id": "statute-dodd-frank",
        "title": "Dodd-Frank Wall Street Reform and Consumer Protection Act",
        "citation": "12 U.S.C. § 5301 et seq.",
        "jurisdiction": "federal",
        "year": 2010,
        "summary": "Comprehensive financial regulatory reform establishing consumer protection bureau and systemic risk oversight.",
        "text": """Dodd-Frank reformed financial regulation following the 2008 financial crisis.

Major provisions:
- Financial Stability Oversight Council (FSOC) for systemic risk
- Consumer Financial Protection Bureau (CFPB) creation
- Volcker Rule restricting proprietary trading
- Orderly liquidation authority for failing institutions
- Derivatives regulation (Title VII)
- Enhanced prudential standards for large banks
- Executive compensation and proxy access
- Credit rating agency reform
- Whistleblower incentives and protections

The Act created or modified authority for multiple agencies including the Fed, SEC, CFTC, and FDIC.""",
    },
    # Consumer Protection
    {
        "id": "statute-ftc-act",
        "title": "Federal Trade Commission Act",
        "citation": "15 U.S.C. §§ 41-58",
        "jurisdiction": "federal",
        "year": 1914,
        "summary": "Establishes the FTC and prohibits unfair or deceptive acts or practices in commerce.",
        "text": """The FTC Act established the Federal Trade Commission and its enforcement authority.

Section 5 prohibits:
- Unfair methods of competition
- Unfair acts or practices
- Deceptive acts or practices

Unfairness standard (codified 1994):
- Causes or likely to cause substantial injury
- Not reasonably avoidable by consumers
- Not outweighed by benefits to consumers or competition

The FTC enforces through administrative actions, consent decrees, and civil penalties. It has broad authority over privacy, data security, and advertising practices.""",
    },
    {
        "id": "statute-fcra",
        "title": "Fair Credit Reporting Act",
        "citation": "15 U.S.C. § 1681 et seq.",
        "jurisdiction": "federal",
        "year": 1970,
        "summary": "Regulates collection, dissemination, and use of consumer credit information.",
        "text": """The Fair Credit Reporting Act (FCRA) regulates consumer reporting agencies.

Key requirements:
- Permissible purposes for obtaining consumer reports
- Accuracy and dispute resolution obligations
- Consumer access to their files
- Adverse action notices when credit denied
- Identity theft protections (FACTA amendments)
- Prescreening and marketing restrictions
- Disposal requirements for consumer report information

Consumer reporting agencies must follow reasonable procedures to ensure maximum possible accuracy. The CFPB and FTC share enforcement authority.""",
    },
    # Civil Rights
    {
        "id": "statute-civil-rights-1964",
        "title": "Civil Rights Act of 1964",
        "citation": "42 U.S.C. § 2000a et seq.",
        "jurisdiction": "federal",
        "year": 1964,
        "summary": "Landmark legislation prohibiting discrimination based on race, color, religion, sex, or national origin.",
        "text": """The Civil Rights Act of 1964 prohibits discrimination in multiple contexts.

Title I: Voting rights
Title II: Public accommodations
Title III: Public facilities
Title IV: Public education desegregation
Title VI: Federally assisted programs (prohibits discrimination by recipients)
Title VII: Employment discrimination
- Prohibits discrimination based on race, color, religion, sex, national origin
- Applies to employers with 15+ employees
- Created the Equal Employment Opportunity Commission (EEOC)
- Disparate treatment and disparate impact theories

Title VII has been amended by the Pregnancy Discrimination Act, Civil Rights Act of 1991, and interpreted to cover sexual orientation/gender identity.""",
    },
    {
        "id": "statute-ada",
        "title": "Americans with Disabilities Act",
        "citation": "42 U.S.C. § 12101 et seq.",
        "jurisdiction": "federal",
        "year": 1990,
        "summary": "Prohibits discrimination against individuals with disabilities in employment, public services, and public accommodations.",
        "text": """The ADA prohibits discrimination on the basis of disability.

Title I - Employment:
- Reasonable accommodation requirement
- Essential job functions analysis
- Undue hardship defense
- Medical examination limits

Title II - State and Local Government:
- Program accessibility
- Effective communication
- Reasonable modifications

Title III - Public Accommodations:
- Barrier removal in existing facilities
- New construction accessibility
- Auxiliary aids and services

The ADA Amendments Act of 2008 broadened the definition of disability, overturning restrictive Supreme Court interpretations.""",
    },
]

# =============================================================================
# REGULATIONS - Implementing Rules
# =============================================================================
REGULATIONS = [
    # FERPA
    {
        "id": "reg-ferpa-34cfr99",
        "title": "FERPA Regulations",
        "citation": "34 CFR Part 99",
        "jurisdiction": "federal",
        "agency": "Department of Education",
        "summary": "Implementing regulations for FERPA, detailing requirements for protection of student education records.",
        "text": """34 CFR Part 99 implements FERPA and establishes:

§ 99.1 - Applicability to educational agencies and institutions
§ 99.3 - Definitions (education records, directory information, etc.)
§ 99.4 - Student rights
§ 99.5 - Annual notification requirements
§ 99.7 - Parental consent requirements
§ 99.10 - Right to inspect and review records
§ 99.20 - Amendment of records procedures
§ 99.30 - Consent required for disclosure
§ 99.31 - Exceptions to consent (health/safety, subpoena, etc.)
§ 99.33 - Recordkeeping of disclosures
§ 99.35 - Disclosure to authorized representatives""",
    },
    # HIPAA
    {
        "id": "reg-hipaa-privacy",
        "title": "HIPAA Privacy Rule",
        "citation": "45 CFR Part 164 Subpart E",
        "jurisdiction": "federal",
        "agency": "HHS Office for Civil Rights",
        "summary": "Standards for privacy of individually identifiable health information.",
        "text": """The HIPAA Privacy Rule establishes standards for protected health information (PHI).

Key provisions:
- Uses and disclosures permitted without authorization (TPO)
- Minimum necessary standard
- Individual rights:
  * Access to PHI
  * Amendment requests
  * Accounting of disclosures
  * Restriction requests
  * Confidential communications
- Notice of Privacy Practices requirements
- Business associate agreements
- Authorization requirements for marketing and sale of PHI
- De-identification standards (Safe Harbor and Expert Determination)

Covered entities must implement policies and procedures, train workforce, and designate a privacy official.""",
    },
    {
        "id": "reg-hipaa-security",
        "title": "HIPAA Security Rule",
        "citation": "45 CFR Part 164 Subpart C",
        "jurisdiction": "federal",
        "agency": "HHS Office for Civil Rights",
        "summary": "Standards for protection of electronic protected health information (ePHI).",
        "text": """The HIPAA Security Rule requires safeguards for electronic PHI.

Administrative Safeguards (§ 164.308):
- Security management process
- Assigned security responsibility
- Workforce security
- Information access management
- Security awareness training
- Security incident procedures
- Contingency plan
- Evaluation

Physical Safeguards (§ 164.310):
- Facility access controls
- Workstation use and security
- Device and media controls

Technical Safeguards (§ 164.312):
- Access control
- Audit controls
- Integrity controls
- Transmission security

Standards are either required or addressable (implement or document alternative).""",
    },
    {
        "id": "reg-hipaa-breach",
        "title": "HIPAA Breach Notification Rule",
        "citation": "45 CFR Part 164 Subpart D",
        "jurisdiction": "federal",
        "agency": "HHS Office for Civil Rights",
        "summary": "Requirements for notification following breach of unsecured PHI.",
        "text": """The Breach Notification Rule requires notification after breaches of unsecured PHI.

Breach definition: Acquisition, access, use, or disclosure not permitted under Privacy Rule that compromises PHI security or privacy.

Risk assessment factors:
1. Nature and extent of PHI involved
2. Unauthorized person who received PHI
3. Whether PHI was actually acquired or viewed
4. Extent to which risk has been mitigated

Notification requirements:
- Individual notice within 60 days of discovery
- Media notice for breaches affecting 500+ residents of state
- HHS notice (immediate for 500+, annual log for smaller)
- Business associates must notify covered entities

Encryption and destruction are safe harbors from breach notification.""",
    },
    # FOIA
    {
        "id": "reg-foia-rules",
        "title": "DOJ FOIA Regulations",
        "citation": "28 CFR Part 16",
        "jurisdiction": "federal",
        "agency": "Department of Justice",
        "summary": "Department of Justice regulations implementing the Freedom of Information Act.",
        "text": """28 CFR Part 16 establishes DOJ FOIA procedures:

Subpart A - FOIA:
- Request requirements (reasonably describe records)
- Multi-track processing
- Response time frames (20 business days, 10-day extension)
- Fee categories (commercial, educational, news media, other)
- Fee waivers in public interest
- Appeals to Office of Information Policy
- Segregability of exempt portions

Each agency issues its own FOIA regulations consistent with the statute and DOJ guidance. Agencies must designate Chief FOIA Officers and FOIA Public Liaisons.""",
    },
    # NEPA
    {
        "id": "reg-nepa-ceq",
        "title": "CEQ NEPA Regulations",
        "citation": "40 CFR Parts 1500-1508",
        "jurisdiction": "federal",
        "agency": "Council on Environmental Quality",
        "summary": "Regulations implementing the procedural provisions of NEPA.",
        "text": """CEQ regulations establish NEPA procedures for federal agencies.

Key provisions:
- Categorical Exclusions: Actions normally without significant impact
- Environmental Assessments: Brief analysis to determine EIS need
- Finding of No Significant Impact (FONSI): Concludes EA
- Environmental Impact Statements: Detailed analysis required when significant

EIS process:
1. Notice of Intent to prepare EIS
2. Scoping (determine issues to analyze)
3. Draft EIS with alternatives analysis
4. Public comment period (45 days minimum)
5. Final EIS responding to comments
6. Record of Decision (ROD)

2020 CEQ rule revisions streamlined timelines and page limits but were subsequently revised in 2022.""",
    },
    # Clean Air Act
    {
        "id": "reg-naaqs",
        "title": "National Ambient Air Quality Standards",
        "citation": "40 CFR Part 50",
        "jurisdiction": "federal",
        "agency": "Environmental Protection Agency",
        "summary": "Primary and secondary ambient air quality standards for criteria pollutants.",
        "text": """40 CFR Part 50 establishes National Ambient Air Quality Standards (NAAQS).

Criteria pollutants and current standards:
- Ozone (O3): 0.070 ppm (8-hour)
- Particulate Matter (PM2.5): 9 μg/m³ (annual), 35 μg/m³ (24-hour)
- Particulate Matter (PM10): 150 μg/m³ (24-hour)
- Carbon Monoxide (CO): 9 ppm (8-hour), 35 ppm (1-hour)
- Nitrogen Dioxide (NO2): 53 ppb (annual), 100 ppb (1-hour)
- Sulfur Dioxide (SO2): 75 ppb (1-hour)
- Lead (Pb): 0.15 μg/m³ (rolling 3-month)

Primary standards protect public health with adequate margin of safety. Secondary standards protect public welfare (crops, visibility, buildings).""",
    },
    # Clean Water Act
    {
        "id": "reg-npdes",
        "title": "NPDES Permit Regulations",
        "citation": "40 CFR Part 122",
        "jurisdiction": "federal",
        "agency": "Environmental Protection Agency",
        "summary": "Regulations for National Pollutant Discharge Elimination System permits.",
        "text": """40 CFR Part 122 governs NPDES permits for point source discharges.

Key provisions:
- Permit application requirements
- Technology-based effluent limitations
- Water quality-based effluent limitations
- Monitoring and reporting requirements
- Standard permit conditions
- General permits for similar discharges
- State program authorization

Permit types:
- Individual permits for unique dischargers
- General permits for categories of dischargers
- Multi-sector general permit for stormwater

Permits are issued for 5-year terms with renewal applications due 180 days before expiration.""",
    },
    # RCRA
    {
        "id": "reg-rcra-hazwaste",
        "title": "RCRA Hazardous Waste Regulations",
        "citation": "40 CFR Parts 260-270",
        "jurisdiction": "federal",
        "agency": "Environmental Protection Agency",
        "summary": "Regulations governing identification and management of hazardous waste.",
        "text": """40 CFR Parts 260-270 implement RCRA Subtitle C hazardous waste requirements.

Part 261 - Identification:
- Definition of solid waste and hazardous waste
- Listed wastes (F, K, P, U lists)
- Characteristic wastes (ignitability, corrosivity, reactivity, toxicity)
- Exclusions and exemptions

Part 262 - Generators:
- Large quantity generators (LQGs): 1,000+ kg/month
- Small quantity generators (SQGs): 100-1,000 kg/month
- Very small quantity generators (VSQGs): <100 kg/month

Part 264/265 - Treatment, Storage, Disposal Facilities
Part 266 - Special wastes (batteries, lamps, etc.)
Part 268 - Land disposal restrictions
Part 270 - Permit requirements""",
    },
    # Information Security
    {
        "id": "reg-nist-800-53",
        "title": "NIST SP 800-53 Security Controls",
        "citation": "NIST SP 800-53 Rev. 5",
        "jurisdiction": "federal",
        "agency": "NIST",
        "summary": "Catalog of security and privacy controls for federal information systems.",
        "text": """NIST Special Publication 800-53 Rev. 5 provides security and privacy controls.

Control Families:
- AC: Access Control
- AT: Awareness and Training
- AU: Audit and Accountability
- CA: Assessment, Authorization, and Monitoring
- CM: Configuration Management
- CP: Contingency Planning
- IA: Identification and Authentication
- IR: Incident Response
- MA: Maintenance
- MP: Media Protection
- PE: Physical and Environmental Protection
- PL: Planning
- PM: Program Management
- PS: Personnel Security
- PT: PII Processing and Transparency
- RA: Risk Assessment
- SA: System and Services Acquisition
- SC: System and Communications Protection
- SI: System and Information Integrity
- SR: Supply Chain Risk Management

Control baselines: Low, Moderate, High impact systems. Privacy controls apply regardless of impact level.""",
    },
    {
        "id": "reg-omb-a130",
        "title": "OMB Circular A-130",
        "citation": "OMB Circular A-130",
        "jurisdiction": "federal",
        "agency": "Office of Management and Budget",
        "summary": "Policy for management of federal information resources.",
        "text": """OMB Circular A-130 establishes policy for federal information resource management.

Key requirements:
- Information management planning
- Privacy requirements under the Privacy Act
- Security requirements under FISMA
- Open data and transparency policies
- Records management requirements
- Statistical information quality

Agency responsibilities:
- Designate Senior Agency Official for Privacy (SAOP)
- Designate Chief Information Security Officer (CISO)
- Conduct Privacy Impact Assessments
- Publish System of Records Notices
- Implement security authorization process
- Report metrics to OMB

Appendix I addresses responsibilities for protecting federal information resources.""",
    },
    {
        "id": "reg-fedramp",
        "title": "FedRAMP Authorization Requirements",
        "citation": "FedRAMP Authorization Act (codified)",
        "jurisdiction": "federal",
        "agency": "GSA",
        "summary": "Security authorization requirements for cloud services used by federal agencies.",
        "text": """FedRAMP provides standardized security authorization for cloud services.

Authorization process:
1. Readiness Assessment (optional)
2. Full Security Assessment by 3PAO
3. Agency Authorization or JAB P-ATO
4. Continuous Monitoring

Impact levels:
- Low: Public data, minimal impact if compromised
- Moderate: Most federal data, serious impact
- High: Highly sensitive data, severe/catastrophic impact

Continuous monitoring requirements:
- Monthly vulnerability scanning
- Annual penetration testing
- Ongoing Plan of Action and Milestones (POA&M)
- Significant change reviews

FedRAMP Marketplace lists authorized cloud services.""",
    },
    # Financial
    {
        "id": "reg-glba-safeguards",
        "title": "FTC Safeguards Rule",
        "citation": "16 CFR Part 314",
        "jurisdiction": "federal",
        "agency": "Federal Trade Commission",
        "summary": "Information security program requirements for financial institutions under GLBA.",
        "text": """16 CFR Part 314 requires financial institutions to develop security programs.

Required elements (2023 amendments):
- Designated qualified individual responsible for program
- Written risk assessment
- Safeguards to control identified risks:
  * Access controls
  * Data inventory and classification
  * Encryption of customer information
  * Multi-factor authentication
  * Secure development practices
  * Change management
  * Monitoring and testing
- Regular testing (penetration testing, vulnerability assessments)
- Policies and procedures for security program
- Oversight of service providers
- Incident response plan
- Annual written report to board of directors

Applies to non-bank financial institutions under FTC jurisdiction.""",
    },
    # ADA
    {
        "id": "reg-ada-title-ii",
        "title": "ADA Title II Regulations",
        "citation": "28 CFR Part 35",
        "jurisdiction": "federal",
        "agency": "Department of Justice",
        "summary": "Regulations implementing ADA requirements for state and local governments.",
        "text": """28 CFR Part 35 implements ADA Title II for public entities.

General requirements:
- No qualified individual shall be excluded from participation
- Reasonable modifications to policies and practices
- Effective communication (auxiliary aids and services)
- Program accessibility

Self-evaluation and transition plans:
- Evaluate current policies and practices
- Identify necessary modifications
- Transition plan for structural changes (entities with 50+ employees)

Web accessibility:
- 2024 rule requires WCAG 2.1 Level AA compliance
- Applies to web content and mobile applications
- Phased compliance deadlines based on population size

Enforcement through private lawsuits and DOJ complaints.""",
    },
]

# =============================================================================
# EXECUTIVE ORDERS
# =============================================================================
EXECUTIVE_ORDERS = [
    {
        "id": "eo-12866",
        "title": "Executive Order 12866 - Regulatory Planning and Review",
        "citation": "E.O. 12866",
        "jurisdiction": "federal",
        "year": 1993,
        "summary": "Establishes cost-benefit analysis requirements and OIRA review of significant regulatory actions.",
        "text": """E.O. 12866 governs the regulatory process for executive branch agencies.

Key requirements:
- Cost-benefit analysis for significant regulatory actions
- OIRA review of significant rules before publication
- Regulatory Impact Analysis for economically significant rules ($100M+)
- Unified Regulatory Agenda published twice annually
- Public participation in rulemaking

Significant regulatory actions include rules with:
- Annual economic effect of $100 million or more
- Material adverse effects on economy, sector, or region
- Material inconsistency with another agency's action
- Budgetary impact on entitlements, grants, or fees
- Novel legal or policy issues

Independent regulatory agencies are encouraged but not required to comply.""",
    },
    {
        "id": "eo-13985",
        "title": "Executive Order 13985 - Advancing Racial Equity",
        "citation": "E.O. 13985",
        "jurisdiction": "federal",
        "year": 2021,
        "summary": "Directs agencies to advance equity and support underserved communities.",
        "text": """E.O. 13985 establishes equity as a federal government priority.

Agency requirements:
- Conduct equity assessments of programs and policies
- Allocate resources to advance equity
- Engage with underserved communities
- Report barriers to equitable outcomes
- Establish equity teams and action plans

Equity considerations in:
- Regulatory actions
- Procurement and contracting
- Grant programs
- Service delivery
- Data collection and analysis

Annual equity action plans must identify priority actions and measurable goals.""",
    },
    {
        "id": "eo-14028",
        "title": "Executive Order 14028 - Improving the Nation's Cybersecurity",
        "citation": "E.O. 14028",
        "jurisdiction": "federal",
        "year": 2021,
        "summary": "Modernizes federal cybersecurity standards and improves software supply chain security.",
        "text": """E.O. 14028 modernizes federal cybersecurity following major incidents.

Key requirements:
- Zero trust architecture implementation
- Multi-factor authentication for federal systems
- Encryption of data at rest and in transit
- Endpoint detection and response deployment
- Cloud security improvements
- Software supply chain security:
  * Software Bill of Materials (SBOM)
  * Secure development practices
  * Third-party testing and verification
- Standardized incident response playbooks
- Cyber Safety Review Board establishment
- Logging requirements for federal systems

Agencies must meet implementation milestones set by OMB and CISA.""",
    },
    {
        "id": "eo-14110",
        "title": "Executive Order 14110 - Safe, Secure, and Trustworthy AI",
        "citation": "E.O. 14110",
        "jurisdiction": "federal",
        "year": 2023,
        "summary": "Establishes standards for AI safety, security, and civil rights protection.",
        "text": """E.O. 14110 establishes framework for responsible AI development and use.

Key requirements:
- Safety testing for dual-use foundation models
- Red-team testing and reporting to government
- Watermarking and content authentication
- Guidelines for AI in critical infrastructure
- Privacy protections in AI development
- Civil rights protections against algorithmic discrimination
- Worker protection from AI displacement
- Standards for federal AI procurement
- International leadership on AI governance

Agencies must:
- Inventory AI use cases
- Designate Chief AI Officers
- Conduct AI impact assessments
- Ensure human oversight of AI decisions affecting rights

NIST must develop AI Risk Management Framework guidance.""",
    },
]

# =============================================================================
# CASE LAW - Landmark Decisions
# =============================================================================
CASE_LAW = [
    {
        "id": "case-chevron",
        "title": "Chevron U.S.A., Inc. v. Natural Resources Defense Council, Inc.",
        "citation": "467 U.S. 837 (1984)",
        "jurisdiction": "federal",
        "court": "Supreme Court",
        "year": 1984,
        "summary": "Established framework for judicial deference to agency interpretation of ambiguous statutes.",
        "text": """Chevron established the two-step framework for reviewing agency statutory interpretation.

Step One: Has Congress directly spoken to the precise question at issue?
- If yes, the court and agency must give effect to congressional intent
- Use traditional tools of statutory interpretation

Step Two: If the statute is silent or ambiguous, is the agency's interpretation permissible?
- Court defers to reasonable agency interpretation
- Agency need not choose the best interpretation
- Deference based on agency expertise and accountability

Chevron was a cornerstone of administrative law for 40 years. In 2024, Loper Bright Enterprises v. Raimondo overruled Chevron, holding courts must exercise independent judgment on statutory interpretation.""",
    },
    {
        "id": "case-loper-bright",
        "title": "Loper Bright Enterprises v. Raimondo",
        "citation": "603 U.S. ___ (2024)",
        "jurisdiction": "federal",
        "court": "Supreme Court",
        "year": 2024,
        "summary": "Overruled Chevron deference, requiring courts to exercise independent judgment on statutory questions.",
        "text": """Loper Bright overruled Chevron deference after 40 years.

Holding:
- Courts must exercise independent judgment in deciding whether an agency has acted within its statutory authority
- APA § 706 requires courts to decide all relevant questions of law
- Chevron cannot be reconciled with APA
- Stare decisis does not require retaining Chevron

Impact on administrative law:
- Agencies cannot rely on ambiguity to expand authority
- Courts will more frequently reject agency interpretations
- Prior decisions applying Chevron remain precedential
- Skidmore deference (persuasive weight) may increase

The decision significantly shifts power from agencies to courts in statutory interpretation.""",
    },
    {
        "id": "case-state-farm",
        "title": "Motor Vehicle Manufacturers Association v. State Farm",
        "citation": "463 U.S. 29 (1983)",
        "jurisdiction": "federal",
        "court": "Supreme Court",
        "year": 1983,
        "summary": "Established 'hard look' review requiring agencies to consider important aspects of problems.",
        "text": """State Farm established the framework for arbitrary and capricious review under APA § 706.

Agency action is arbitrary and capricious if the agency:
- Relied on factors Congress did not intend
- Failed to consider an important aspect of the problem
- Offered an explanation counter to the evidence
- Is so implausible it cannot be ascribed to difference in view or agency expertise

Requirements for reasoned decision-making:
- Examine relevant data
- Articulate satisfactory explanation
- Rational connection between facts found and choice made
- Consider significant reliance interests

Agencies must provide reasoned explanation for changing course from prior policy.""",
    },
    {
        "id": "case-west-virginia-epa",
        "title": "West Virginia v. Environmental Protection Agency",
        "citation": "597 U.S. 697 (2022)",
        "jurisdiction": "federal",
        "court": "Supreme Court",
        "year": 2022,
        "summary": "Applied major questions doctrine requiring clear congressional authorization for agency actions of vast economic significance.",
        "text": """West Virginia v. EPA established the major questions doctrine as a clear statement rule.

Holding:
- EPA's Clean Power Plan exceeded statutory authority
- Generation-shifting approach was a major question requiring clear congressional authorization
- Section 111(d) did not clearly authorize transforming the electricity sector

Major questions doctrine applies when:
- Agency claims to discover vast authority in modest statutory provisions
- Action has major economic or political significance
- Agency has no expertise in the area
- Long-extant statute gains new significance

Clear congressional authorization required for:
- Decisions of vast economic and political significance
- Transformative expansion of regulatory authority
- Actions that fundamentally change an industry

Courts, not agencies, decide whether a question is major.""",
    },
    {
        "id": "case-auer",
        "title": "Auer v. Robbins",
        "citation": "519 U.S. 452 (1997)",
        "jurisdiction": "federal",
        "court": "Supreme Court",
        "year": 1997,
        "summary": "Established deference to agency interpretations of their own ambiguous regulations.",
        "text": """Auer established deference to agency interpretations of their own regulations.

Standard:
- Agency interpretation of its own ambiguous regulation controls unless plainly erroneous or inconsistent
- More deferential than Chevron deference to statutory interpretation

Kisor v. Wilkie (2019) narrowed but retained Auer deference:
- Regulation must be genuinely ambiguous after exhausting tools of interpretation
- Agency interpretation must be reasonable
- Character and context of interpretation matters:
  * Authoritative position
  * Expertise
  * Fair and considered judgment (not post-hoc litigation position)
- No deference if creates unfair surprise or allows unfair enforcement

Auer deference remains viable but constrained after Kisor.""",
    },
    {
        "id": "case-griswold",
        "title": "Griswold v. Connecticut",
        "citation": "381 U.S. 479 (1965)",
        "jurisdiction": "federal",
        "court": "Supreme Court",
        "year": 1965,
        "summary": "Recognized constitutional right to privacy in marital relations, establishing penumbral rights doctrine.",
        "text": """Griswold established a constitutional right to privacy.

Holding:
- Connecticut law banning contraceptive use violated marital privacy
- Various constitutional guarantees create zones of privacy
- First Amendment association rights
- Third Amendment prohibition on quartering soldiers
- Fourth Amendment protection against unreasonable searches
- Fifth Amendment self-incrimination protection
- Ninth Amendment reservation of rights to the people

The penumbras and emanations of these guarantees create a zone of privacy protecting intimate marital decisions.

Griswold's privacy right was foundational for later decisions on contraception, abortion, intimate conduct, and family relationships.""",
    },
    {
        "id": "case-citizens-united",
        "title": "Citizens United v. Federal Election Commission",
        "citation": "558 U.S. 310 (2010)",
        "jurisdiction": "federal",
        "court": "Supreme Court",
        "year": 2010,
        "summary": "Held that corporate political speech cannot be banned, overturning restrictions on independent expenditures.",
        "text": """Citizens United addressed corporate political speech under the First Amendment.

Holding:
- Corporate independent expenditures are protected political speech
- Government cannot suppress speech based on speaker's corporate identity
- Austin v. Michigan Chamber of Commerce overruled
- Portions of McConnell v. FEC overruled

Retained restrictions:
- Disclosure requirements constitutional
- Disclaimer requirements constitutional
- Direct contributions to candidates may still be limited
- Foreign national ban remains

The decision significantly increased corporate and union spending in elections through independent expenditures and Super PACs.""",
    },
]

# =============================================================================
# AGENCIES
# =============================================================================
AGENCIES = [
    {"id": "agency-doe", "title": "Department of Education", "jurisdiction": "federal", "abbreviation": "ED"},
    {"id": "agency-doj", "title": "Department of Justice", "jurisdiction": "federal", "abbreviation": "DOJ"},
    {"id": "agency-omb", "title": "Office of Management and Budget", "jurisdiction": "federal", "abbreviation": "OMB"},
    {"id": "agency-nist", "title": "National Institute of Standards and Technology", "jurisdiction": "federal", "abbreviation": "NIST"},
    {"id": "agency-gsa", "title": "General Services Administration", "jurisdiction": "federal", "abbreviation": "GSA"},
    {"id": "agency-hhs", "title": "Department of Health and Human Services", "jurisdiction": "federal", "abbreviation": "HHS"},
    {"id": "agency-ocr", "title": "HHS Office for Civil Rights", "jurisdiction": "federal", "abbreviation": "OCR"},
    {"id": "agency-epa", "title": "Environmental Protection Agency", "jurisdiction": "federal", "abbreviation": "EPA"},
    {"id": "agency-ceq", "title": "Council on Environmental Quality", "jurisdiction": "federal", "abbreviation": "CEQ"},
    {"id": "agency-ftc", "title": "Federal Trade Commission", "jurisdiction": "federal", "abbreviation": "FTC"},
    {"id": "agency-cfpb", "title": "Consumer Financial Protection Bureau", "jurisdiction": "federal", "abbreviation": "CFPB"},
    {"id": "agency-sec", "title": "Securities and Exchange Commission", "jurisdiction": "federal", "abbreviation": "SEC"},
    {"id": "agency-cisa", "title": "Cybersecurity and Infrastructure Security Agency", "jurisdiction": "federal", "abbreviation": "CISA"},
    {"id": "agency-eeoc", "title": "Equal Employment Opportunity Commission", "jurisdiction": "federal", "abbreviation": "EEOC"},
    {"id": "agency-oira", "title": "Office of Information and Regulatory Affairs", "jurisdiction": "federal", "abbreviation": "OIRA"},
]

# =============================================================================
# RELATIONSHIPS
# =============================================================================
RELATIONSHIPS = [
    # FERPA authority chain
    ("statute-ferpa", "reg-ferpa-34cfr99", "AUTHORIZES"),
    ("agency-doe", "reg-ferpa-34cfr99", "REGULATES"),
    ("reg-ferpa-34cfr99", "statute-ferpa", "IMPLEMENTS"),

    # FOIA authority chain
    ("statute-foia", "reg-foia-rules", "AUTHORIZES"),
    ("agency-doj", "reg-foia-rules", "REGULATES"),

    # Privacy Act
    ("statute-privacy-act", "reg-omb-a130", "AUTHORIZES"),

    # HIPAA authority chain
    ("statute-hipaa", "reg-hipaa-privacy", "AUTHORIZES"),
    ("statute-hipaa", "reg-hipaa-security", "AUTHORIZES"),
    ("statute-hipaa", "reg-hipaa-breach", "AUTHORIZES"),
    ("statute-hitech", "reg-hipaa-breach", "AUTHORIZES"),
    ("agency-hhs", "reg-hipaa-privacy", "REGULATES"),
    ("agency-hhs", "reg-hipaa-security", "REGULATES"),
    ("agency-ocr", "reg-hipaa-privacy", "ENFORCES"),
    ("agency-ocr", "reg-hipaa-security", "ENFORCES"),
    ("agency-ocr", "reg-hipaa-breach", "ENFORCES"),
    ("reg-hipaa-security", "reg-nist-800-53", "CITES"),

    # NEPA authority chain
    ("statute-nepa", "reg-nepa-ceq", "AUTHORIZES"),
    ("agency-ceq", "reg-nepa-ceq", "REGULATES"),

    # Clean Air Act
    ("statute-clean-air-act", "reg-naaqs", "AUTHORIZES"),
    ("agency-epa", "reg-naaqs", "REGULATES"),
    ("case-west-virginia-epa", "statute-clean-air-act", "INTERPRETS"),

    # Clean Water Act
    ("statute-clean-water-act", "reg-npdes", "AUTHORIZES"),
    ("agency-epa", "reg-npdes", "REGULATES"),

    # RCRA
    ("statute-rcra", "reg-rcra-hazwaste", "AUTHORIZES"),
    ("agency-epa", "reg-rcra-hazwaste", "REGULATES"),

    # CERCLA
    ("statute-cercla", "statute-rcra", "CITES"),

    # FISMA/Security relationships
    ("statute-fisma", "reg-nist-800-53", "AUTHORIZES"),
    ("statute-fisma", "reg-omb-a130", "AUTHORIZES"),
    ("statute-fisma", "reg-fedramp", "AUTHORIZES"),
    ("agency-nist", "reg-nist-800-53", "REGULATES"),
    ("agency-omb", "reg-omb-a130", "REGULATES"),
    ("agency-gsa", "reg-fedramp", "REGULATES"),
    ("agency-cisa", "reg-fedramp", "ENFORCES"),
    ("eo-14028", "reg-nist-800-53", "CITES"),
    ("eo-14028", "reg-fedramp", "CITES"),

    # E-Government
    ("statute-e-government", "statute-fisma", "CITES"),
    ("statute-e-government", "statute-privacy-act", "CITES"),

    # Cross-references
    ("reg-omb-a130", "statute-privacy-act", "CITES"),
    ("reg-omb-a130", "statute-fisma", "CITES"),
    ("reg-omb-a130", "statute-paperwork-reduction", "CITES"),

    # APA as foundational
    ("statute-apa", "reg-ferpa-34cfr99", "AUTHORIZES"),
    ("statute-apa", "reg-foia-rules", "AUTHORIZES"),
    ("statute-apa", "reg-nepa-ceq", "AUTHORIZES"),
    ("statute-apa", "reg-hipaa-privacy", "AUTHORIZES"),
    ("case-chevron", "statute-apa", "INTERPRETS"),
    ("case-loper-bright", "statute-apa", "INTERPRETS"),
    ("case-loper-bright", "case-chevron", "OVERRULES"),
    ("case-state-farm", "statute-apa", "INTERPRETS"),
    ("case-auer", "statute-apa", "INTERPRETS"),

    # Financial regulations
    ("statute-glba", "reg-glba-safeguards", "AUTHORIZES"),
    ("agency-ftc", "reg-glba-safeguards", "REGULATES"),
    ("statute-dodd-frank", "agency-cfpb", "ESTABLISHES"),
    ("statute-fcra", "agency-cfpb", "AUTHORIZES"),
    ("statute-fcra", "agency-ftc", "AUTHORIZES"),
    ("agency-sec", "statute-sox", "ENFORCES"),

    # FTC Act
    ("statute-ftc-act", "agency-ftc", "ESTABLISHES"),

    # Civil Rights
    ("statute-civil-rights-1964", "agency-eeoc", "ESTABLISHES"),
    ("statute-ada", "reg-ada-title-ii", "AUTHORIZES"),
    ("agency-doj", "reg-ada-title-ii", "REGULATES"),

    # Executive Orders
    ("eo-12866", "agency-oira", "AUTHORIZES"),
    ("eo-12866", "statute-apa", "CITES"),
    ("eo-14110", "reg-nist-800-53", "CITES"),

    # Case law relationships
    ("case-west-virginia-epa", "agency-epa", "CONSTRAINS"),
    ("case-citizens-united", "agency-ftc", "CONSTRAINS"),
]


async def seed_neo4j():
    """Seed the Neo4j database with legal data."""
    print("Connecting to Neo4j...")
    await neo4j_conn.connect()

    print("Initializing schema...")
    await init_neo4j_schema()

    print("Clearing existing data...")
    await neo4j_conn.execute_query("MATCH (n) DETACH DELETE n")

    print("Creating Statute nodes...")
    for statute in STATUTES:
        query = """
        CREATE (s:Statute {
            id: $id,
            title: $title,
            citation: $citation,
            jurisdiction: $jurisdiction,
            year: $year,
            summary: $summary,
            text: $text
        })
        """
        await neo4j_conn.execute_query(query, statute)
    print(f"  Created {len(STATUTES)} statutes")

    print("Creating Regulation nodes...")
    for reg in REGULATIONS:
        query = """
        CREATE (r:Regulation {
            id: $id,
            title: $title,
            citation: $citation,
            jurisdiction: $jurisdiction,
            agency: $agency,
            summary: $summary,
            text: $text
        })
        """
        await neo4j_conn.execute_query(query, reg)
    print(f"  Created {len(REGULATIONS)} regulations")

    print("Creating Executive Order nodes...")
    for eo in EXECUTIVE_ORDERS:
        query = """
        CREATE (e:ExecutiveOrder {
            id: $id,
            title: $title,
            citation: $citation,
            jurisdiction: $jurisdiction,
            year: $year,
            summary: $summary,
            text: $text
        })
        """
        await neo4j_conn.execute_query(query, eo)
    print(f"  Created {len(EXECUTIVE_ORDERS)} executive orders")

    print("Creating CaseLaw nodes...")
    for case in CASE_LAW:
        query = """
        CREATE (c:CaseLaw {
            id: $id,
            title: $title,
            citation: $citation,
            jurisdiction: $jurisdiction,
            court: $court,
            year: $year,
            summary: $summary,
            text: $text
        })
        """
        await neo4j_conn.execute_query(query, case)
    print(f"  Created {len(CASE_LAW)} case law entries")

    print("Creating Agency nodes...")
    for agency in AGENCIES:
        query = """
        CREATE (a:Agency {
            id: $id,
            title: $title,
            jurisdiction: $jurisdiction,
            abbreviation: $abbreviation
        })
        """
        await neo4j_conn.execute_query(query, agency)
    print(f"  Created {len(AGENCIES)} agencies")

    print("Creating relationships...")
    for source_id, target_id, rel_type in RELATIONSHIPS:
        query = f"""
        MATCH (source), (target)
        WHERE source.id = $source_id AND target.id = $target_id
        CREATE (source)-[r:{rel_type}]->(target)
        """
        await neo4j_conn.execute_query(query, {
            "source_id": source_id,
            "target_id": target_id,
        })
    print(f"  Created {len(RELATIONSHIPS)} relationships")

    await neo4j_conn.close()
    print("Neo4j seeding complete!")


def seed_chromadb():
    """Seed ChromaDB with document chunks."""
    print("\nSeeding ChromaDB...")

    try:
        chroma = get_chroma_client_for_seed()

        # Create or get collection
        collection = chroma.get_or_create_collection(
            name="legal_documents",
            metadata={"description": "Legal document chunks for RAG"},
        )

        # Clear existing data
        try:
            existing = collection.get()
            if existing["ids"]:
                collection.delete(ids=existing["ids"])
        except Exception:
            pass

        # Add all document chunks
        all_ids = []
        all_docs = []
        all_metadata = []

        # Statutes
        for statute in STATUTES:
            chunks = statute["text"].split("\n\n")
            for i, chunk in enumerate(chunks):
                if chunk.strip():
                    all_ids.append(f"{statute['id']}-{i}")
                    all_docs.append(chunk.strip())
                    all_metadata.append({
                        "document_id": statute["id"],
                        "title": statute["title"],
                        "citation": statute["citation"],
                        "document_type": "statute",
                        "jurisdiction": statute["jurisdiction"],
                        "year": statute.get("year"),
                        "chunk_index": i,
                    })

        # Regulations
        for reg in REGULATIONS:
            chunks = reg["text"].split("\n\n")
            for i, chunk in enumerate(chunks):
                if chunk.strip():
                    all_ids.append(f"{reg['id']}-{i}")
                    all_docs.append(chunk.strip())
                    all_metadata.append({
                        "document_id": reg["id"],
                        "title": reg["title"],
                        "citation": reg["citation"],
                        "document_type": "regulation",
                        "jurisdiction": reg["jurisdiction"],
                        "agency": reg.get("agency"),
                        "chunk_index": i,
                    })

        # Executive Orders
        for eo in EXECUTIVE_ORDERS:
            chunks = eo["text"].split("\n\n")
            for i, chunk in enumerate(chunks):
                if chunk.strip():
                    all_ids.append(f"{eo['id']}-{i}")
                    all_docs.append(chunk.strip())
                    all_metadata.append({
                        "document_id": eo["id"],
                        "title": eo["title"],
                        "citation": eo["citation"],
                        "document_type": "executive_order",
                        "jurisdiction": eo["jurisdiction"],
                        "year": eo.get("year"),
                        "chunk_index": i,
                    })

        # Case Law
        for case in CASE_LAW:
            chunks = case["text"].split("\n\n")
            for i, chunk in enumerate(chunks):
                if chunk.strip():
                    all_ids.append(f"{case['id']}-{i}")
                    all_docs.append(chunk.strip())
                    all_metadata.append({
                        "document_id": case["id"],
                        "title": case["title"],
                        "citation": case["citation"],
                        "document_type": "case_law",
                        "jurisdiction": case["jurisdiction"],
                        "court": case.get("court"),
                        "year": case.get("year"),
                        "chunk_index": i,
                    })

        collection.add(
            ids=all_ids,
            documents=all_docs,
            metadatas=all_metadata,
        )

        print(f"  Added {len(all_ids)} document chunks to ChromaDB")
        print("ChromaDB seeding complete!")

    except Exception as e:
        print(f"  Warning: Could not seed ChromaDB: {e}")
        print("  ChromaDB may not be running. Start it with docker-compose.")


async def main():
    """Run all seeding operations."""
    print("=" * 60)
    print("Lex - Legal Cartography Demo Data Seeder")
    print("=" * 60)

    try:
        await seed_neo4j()
    except Exception as e:
        print(f"Neo4j seeding failed: {e}")
        print("Make sure Neo4j is running (docker-compose up neo4j)")

    try:
        seed_chromadb()
    except Exception as e:
        print(f"ChromaDB seeding failed: {e}")

    print("\n" + "=" * 60)
    print("Seeding complete!")
    print(f"  - {len(STATUTES)} statutes")
    print(f"  - {len(REGULATIONS)} regulations")
    print(f"  - {len(EXECUTIVE_ORDERS)} executive orders")
    print(f"  - {len(CASE_LAW)} case law entries")
    print(f"  - {len(AGENCIES)} agencies")
    print(f"  - {len(RELATIONSHIPS)} relationships")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
