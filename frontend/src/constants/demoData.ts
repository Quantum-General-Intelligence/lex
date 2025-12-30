// Shared demo data for fallback when backend is unavailable

// Demo graph data for visualization
export const DEMO_GRAPH_DATA = {
  nodes: [
    { id: '1', title: 'Administrative Procedure Act', citation: '5 U.S.C. § 551-559', type: 'Statute', jurisdiction: 'federal' },
    { id: '2', title: 'FOIA', citation: '5 U.S.C. § 552', type: 'Statute', jurisdiction: 'federal' },
    { id: '3', title: 'Privacy Act', citation: '5 U.S.C. § 552a', type: 'Statute', jurisdiction: 'federal' },
    { id: '4', title: 'OMB Circular A-130', citation: 'OMB A-130', type: 'Regulation', jurisdiction: 'federal' },
    { id: '5', title: 'NIST SP 800-53', citation: 'NIST 800-53', type: 'Guidance', jurisdiction: 'federal' },
    { id: '6', title: 'FERPA', citation: '20 U.S.C. § 1232g', type: 'Statute', jurisdiction: 'federal' },
    { id: '7', title: 'Dept. of Education', type: 'Agency', jurisdiction: 'federal' },
    { id: '8', title: '34 CFR Part 99', citation: '34 CFR 99', type: 'Regulation', jurisdiction: 'federal' },
    { id: '9', title: 'Student Privacy Rule', type: 'Regulation', jurisdiction: 'federal' },
    { id: '10', title: 'HIPAA', citation: '42 U.S.C. § 1320d', type: 'Statute', jurisdiction: 'federal' },
  ],
  links: [
    { source: '1', target: '4', type: 'AUTHORIZES' },
    { source: '2', target: '4', type: 'AUTHORIZES' },
    { source: '3', target: '4', type: 'AUTHORIZES' },
    { source: '4', target: '5', type: 'IMPLEMENTS' },
    { source: '6', target: '8', type: 'AUTHORIZES' },
    { source: '7', target: '8', type: 'REGULATES' },
    { source: '8', target: '9', type: 'IMPLEMENTS' },
    { source: '6', target: '9', type: 'AUTHORIZES' },
    { source: '3', target: '10', type: 'CITES' },
  ],
}

// Demo node details for graph viewer detail panel
export const DEMO_NODE_DETAILS: Record<string, {
  id: string
  type: string
  title: string
  citation?: string
  jurisdiction?: string
  agency?: string
  year?: number
  court?: string
  summary?: string
  text?: string
  abbreviation?: string
}> = {
  '1': {
    id: '1',
    type: 'Statute',
    title: 'Administrative Procedure Act',
    citation: '5 U.S.C. § 551-559',
    jurisdiction: 'federal',
    year: 1946,
    summary: 'The APA governs the process by which federal agencies develop and issue regulations. It includes requirements for publishing notices of proposed and final rulemaking in the Federal Register, and provides opportunities for the public to comment on notices of proposed rulemaking.',
    text: 'For the purpose of this subchapter—(1) "agency" means each authority of the Government of the United States, whether or not it is within or subject to review by another agency...',
  },
  '2': {
    id: '2',
    type: 'Statute',
    title: 'Freedom of Information Act',
    citation: '5 U.S.C. § 552',
    jurisdiction: 'federal',
    year: 1967,
    summary: 'FOIA provides the public the right to request access to records from any federal agency. Federal agencies are required to disclose any information requested under FOIA unless it falls under one of nine exemptions.',
    text: 'Each agency shall make available to the public information as follows: (1) Each agency shall separately state and currently publish in the Federal Register for the guidance of the public...',
  },
  '3': {
    id: '3',
    type: 'Statute',
    title: 'Privacy Act of 1974',
    citation: '5 U.S.C. § 552a',
    jurisdiction: 'federal',
    year: 1974,
    summary: 'The Privacy Act establishes a code of fair information practices that governs the collection, maintenance, use, and dissemination of information about individuals maintained in systems of records by federal agencies.',
    text: 'Each agency that maintains a system of records shall maintain in its records only such information about an individual as is relevant and necessary to accomplish a purpose of the agency...',
  },
  '4': {
    id: '4',
    type: 'Regulation',
    title: 'OMB Circular A-130',
    citation: 'OMB A-130',
    jurisdiction: 'federal',
    agency: 'Office of Management and Budget',
    year: 2016,
    summary: 'Establishes general policy for the planning, budgeting, governance, acquisition, and management of federal information, personnel, equipment, funds, IT resources and supporting infrastructure.',
    text: 'This Circular establishes policy for the management of Federal information resources. OMB includes procedural and analytic guidelines for implementing specific aspects of these policies as appendices.',
  },
  '5': {
    id: '5',
    type: 'Guidance',
    title: 'NIST Special Publication 800-53',
    citation: 'NIST 800-53',
    jurisdiction: 'federal',
    agency: 'National Institute of Standards and Technology',
    year: 2020,
    summary: 'Provides a catalog of security and privacy controls for federal information systems and organizations to protect organizational operations, assets, individuals, and the Nation from a diverse set of threats.',
  },
  '6': {
    id: '6',
    type: 'Statute',
    title: 'Family Educational Rights and Privacy Act',
    citation: '20 U.S.C. § 1232g',
    jurisdiction: 'federal',
    year: 1974,
    summary: 'FERPA protects the privacy of student education records. It applies to all schools that receive funds under an applicable program of the U.S. Department of Education.',
    text: 'No funds shall be made available under any applicable program to any educational agency or institution which has a policy or practice of permitting the release of education records...',
  },
  '7': {
    id: '7',
    type: 'Agency',
    title: 'U.S. Department of Education',
    jurisdiction: 'federal',
    abbreviation: 'ED',
    year: 1979,
    summary: 'The Department of Education is the agency of the federal government that establishes policy for, administers and coordinates most federal assistance to education.',
  },
  '8': {
    id: '8',
    type: 'Regulation',
    title: 'FERPA Regulations',
    citation: '34 CFR Part 99',
    jurisdiction: 'federal',
    agency: 'Department of Education',
    year: 1988,
    summary: 'Implements FERPA requirements. Defines education records, establishes procedures for access and amendment, and specifies conditions for disclosure of personally identifiable information.',
  },
  '9': {
    id: '9',
    type: 'Regulation',
    title: 'Student Privacy Protection Rule',
    jurisdiction: 'federal',
    agency: 'Department of Education',
    year: 2011,
    summary: 'Strengthens FERPA protections by limiting the circumstances under which student education records can be disclosed without consent.',
  },
  '10': {
    id: '10',
    type: 'Statute',
    title: 'Health Insurance Portability and Accountability Act',
    citation: '42 U.S.C. § 1320d',
    jurisdiction: 'federal',
    year: 1996,
    summary: 'HIPAA establishes national standards to protect sensitive patient health information from being disclosed without patient consent or knowledge.',
    text: 'The Secretary shall adopt standards for transactions, and data elements for such transactions, to enable health information to be exchanged electronically...',
  },
}

// Demo compliance response for fallback
export const DEMO_COMPLIANCE_RESPONSE = {
  document_summary: 'Analyzed document for regulatory compliance.',
  overall_status: 'review_required' as const,
  issues: [
    {
      severity: 'warning' as const,
      regulation_id: 'privacy-act',
      regulation_citation: '5 U.S.C. § 552a',
      issue_description: 'Document references personal data collection without specifying Privacy Act compliance procedures.',
      document_excerpt: '...collect personal information from users...',
      suggested_fix: 'Add Privacy Act Statement and specify routine uses.',
      confidence: 0.82,
    },
    {
      severity: 'info' as const,
      regulation_id: 'records-mgmt',
      regulation_citation: '44 U.S.C. § 3101',
      issue_description: 'Document mentions data retention but does not specify retention schedule.',
      document_excerpt: '...data will be retained...',
      suggested_fix: 'Reference approved records schedule or specify retention period.',
      confidence: 0.75,
    },
  ],
  checked_regulations: 15,
  processing_time_ms: 342.5,
}

// Demo query response for fallback
export function getDemoQueryResponse(query: string) {
  return {
    query,
    answer: `Based on the legal corpus analysis for "${query}":\n\nThe relevant federal regulations address this topic through multiple statutory authorities. Key provisions include requirements for agency compliance, reporting obligations, and enforcement mechanisms.\n\nNote: This is a demonstration response. In production, this would be generated by analyzing the actual ingested legal documents.`,
    confidence_score: 0.85,
    citations: [
      {
        document_id: 'demo-1',
        document_title: 'Administrative Procedure Act',
        citation: '5 U.S.C. § 551-559',
        chunk_text: 'The Administrative Procedure Act governs the process by which federal agencies develop and issue regulations...',
        relevance_score: 0.92,
      },
      {
        document_id: 'demo-2',
        document_title: 'Freedom of Information Act',
        citation: '5 U.S.C. § 552',
        chunk_text: 'Each agency shall make available to the public information as follows...',
        relevance_score: 0.78,
      },
    ],
    chain_of_thought: `1. Parsed query: "${query}"\n2. Searched vector store for semantic matches\n3. Found 2 relevant document chunks\n4. Retrieved graph context for related legal nodes\n5. Synthesized answer from top sources\n6. Confidence based on source coverage: 85%`,
    ambiguity_flags: ['Limited source coverage - human review recommended'],
    processing_time_ms: 234.5,
  }
}
