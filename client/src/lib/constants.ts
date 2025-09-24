export const EMPLOYEE_CATEGORIES = {
  software_developer: 'Software Developer',
  ml_engineer: 'ML Engineer', 
  qa_engineer: 'QA Engineer',
  ui_ux_developer: 'UI/UX Developer',
} as const;

export const USER_ROLES = {
  founder: 'Founder',
  l1_manager: 'L1 Manager',
  l2_manager: 'L2 Manager', 
  l3_manager: 'L3 Manager',
  peer: 'Peer',
} as const;

export const REVIEW_STATUS = {
  not_started: 'Not Started',
  self_assessment: 'Self Assessment',
  feedback_collection: 'Feedback Collection',
  manager_review: 'Manager Review',
  meeting_scheduled: 'Meeting Scheduled',
  completed: 'Completed',
  appeal_requested: 'Appeal Requested',
  appeal_completed: 'Appeal Completed',
} as const;

export const RATING_SCALE = {
  1: 'Unsatisfactory (Bottom 10%)',
  2: 'Needs Improvement (Next 20%)',
  3: 'Meets Expectations (Middle 40%)',
  4: 'Exceeds Expectations (Next 20%)',
  5: 'Outstanding (Top 10%)',
} as const;

export const APPEAL_STATUS = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected', 
  completed: 'Completed',
} as const;

export const SELF_ASSESSMENT_FIELDS = {
  software_developer: [
    'Technical skills assessment (languages, frameworks, tools)',
    'Code quality metrics',
    'Bug resolution rate',
    'Feature delivery count',
    'Technical documentation contributed',
    'Code review participation',
    'Innovation/optimization initiatives',
    'Learning certifications completed',
  ],
  ml_engineer: [
    'Model performance improvements',
    'Research papers/patents',
    'Algorithm optimization metrics',
    'Data pipeline contributions',
    'Experimentation velocity',
    'Production model deployments',
    'Knowledge sharing sessions conducted',
  ],
  qa_engineer: [
    'Test coverage achievements',
    'Bug detection efficiency',
    'Automation scripts created',
    'Test case documentation',
    'Critical bug discoveries',
    'Process improvement suggestions',
    'Cross-team collaboration',
  ],
  ui_ux_developer: [
    'Design portfolio submissions',
    'User satisfaction scores',
    'Accessibility improvements',
    'Design system contributions',
    'Prototypes delivered',
    'A/B test results',
    'Design review participation',
  ],
} as const;

export const COMMON_ASSESSMENT_FIELDS = [
  'Educational qualifications added this year',
  'Professional achievements',
  'Expected increment percentage',
  'Career goals',
  'Training needs identified',
  'Work-from-home preference',
  'Project contributions',
  'Client feedback received',
  'Team collaboration rating',
  'Initiative and ownership examples',
  'Challenges faced and solutions',
  'Areas of improvement (self-identified)',
] as const;

export const FEEDBACK_CRITERIA = [
  { key: 'technicalCompetence', label: 'Technical Competence' },
  { key: 'communicationSkills', label: 'Communication Skills' },
  { key: 'teamCollaboration', label: 'Team Collaboration' },
  { key: 'problemSolving', label: 'Problem Solving Ability' },
  { key: 'leadershipPotential', label: 'Leadership Potential' },
  { key: 'reliability', label: 'Reliability and Commitment' },
  { key: 'innovation', label: 'Innovation and Creativity' },
] as const;

export const RATING_WEIGHTS = {
  self_assessment: 0.4,
  feedback_360: 0.3,
  l3_input: 0.2,
  kra_achievement: 0.1,
} as const;

export const MEETING_DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
] as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error', 
  WARNING: 'warning',
  INFO: 'info',
} as const;
