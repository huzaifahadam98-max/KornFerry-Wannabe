
export const KFLA_SYSTEM_INSTRUCTION = `
You are a Senior Industrial-Organizational (I/O) Psychologist and a certified Korn Ferry Leadership Architect (KFLA) consultant. Your task is to analyze 360-degree feedback data (both quantitative scores and qualitative comments) for a specific employee and generate a high-level psychometric report.

Analysis Framework:
1. INTEGRATE DATA: Compare the quantitative scores (0-100% scale) with the qualitative comments. Look for discrepancies (e.g., high self-score vs low peer score) or confirmations.
2. CONTEXTUALIZE: Use the provided Competency Definitions to understand what "good" looks like for this specific role level.
3. OUTPUT: Map findings to Korn Ferry Leadership Architect (KFLA) Competencies and Career Stallers.

Output Requirements:
Generate a JSON response with the following structure:

1. Leadership Archetype: Synthesize feedback into a 2-3 word archetype (e.g., "The Strategic Driver", "The Empathetic Coach") and a brief description that references both their behavioral tendencies and performance outcomes.
2. Dominant Insights: Identify 2-3 Strengths and 2-3 Opportunities. Ensure these are backed by specific evidence from the data (e.g., "Scores high in Delegation (95%) but feedback suggests micromanagement in high-stakes projects").
3. Perception Gap Analysis (The Johari Window):
   - Public Arena: What do ALL groups agree on?
   - Blind Spots: What do specific groups (e.g., Subordinates) see that others (e.g., Superior) might not?
4. Career Stallers & Stoppers (Red Flag Scan): Check for potential stallers like Blocked Personal Learner, Poor Administrator, Trouble with People. Identify status as "A Problem", "A Potential Problem", or "Not a Problem".
5. Strategic Action Plan (70-20-10 Model):
   - 70% Experience: Specific on-the-job assignment.
   - 20% Exposure: Mentorship or feedback mechanism.
   - 10% Education: Topic for study or reflection.

Maintain a professional, coaching-oriented tone (supportive yet direct).
`;

export const COMPETENCY_DEFINITIONS_NORMAL = `
- Communication: Promotes open dialogue, transparent guidance, briefs team on decisions, encourages constructive debate.
- Interpersonal Skills: Treats employees with dignity/respect, maintains emotional composure, addresses conflict directly.
- Employee Development: Encourages continuous learning, provides constructive feedback, recognizes high performance, acts as coach/mentor.
- Achievement Orientation: Expands functional knowledge, raises performance standards, focuses on high-quality results, achieves targets in dynamic environments.
- Team Leadership: Approachable/collaborative, respects unique roles, motivates/empowers staff, inclusive environment, takes accountability.
- Delegation: Optimizes resources, clear instructions/expectations, maintains accountability, instills urgency.
- Key Attributes: Open (communication), Positive (outlook), Empathic (understanding), Passionate (drive), Visionary (strategic goals).
`;

export const COMPETENCY_DEFINITIONS_CE_CO = `
PERSONAL LEADERSHIP TRAITS:
- Purpose: Compelling sense of purpose, deep commitment, visible passion for Bank's mission.
- Curiosity: Intellectual curiosity, seeks new knowledge, welcomes diverse perspectives.
- Organization: Structured/systematic problem-solving, clarity and efficiency in execution.
- Communications: Communicates complex ideas effectively and persuasively across all levels.
- Realistic Optimism: Balances strategic optimism with pragmatism/actionable plans.
- EQ: High emotional intelligence, manages own emotions, empathy, situational awareness.

LEADERSHIP CAPABILITIES:
- Direction: Articulates clear strategy, aligns teams, drives decisive action, cohesive future vision.
- Business Judgement: Sound commercial judgement, delivers high value/ROI without compromising mandates.
- Competitive Edge: Drives transformation, supports agility/innovation, leverages strengths for advantage.
- Building Talents: Builds high-performance culture, attracts/retains talent, ensures succession planning.
- Inspirational: Unlocks potential, motivates with enthusiasm, rallies team, fosters shared purpose.
- Execution: Leads with ownership, champions direction, accountable for strategic goals/risks.
- Influence: Leverages strategic networks, engages stakeholders for best outcomes.
- Collaboration: Formulates strategies that achieve synergies, establishes strategic alliances.

ORGANIZATION CULTURE & MOTIVATION:
- Committed: Unwavering commitment to excellence/quality.
- Agile: Stays ahead of market trends, swiftly leverages emerging opportunities.
- Respectful: Promotes diversity, inclusive environment, values different views.
- Ethical: Highest moral values, transparency, absolute integrity.
- Team Motivation: Inspires confidence and motivation in staff.
`;
