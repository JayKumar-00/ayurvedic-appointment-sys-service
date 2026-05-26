export const ASSIGNMENT_STATUS = ['pending', 'completed'] as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUS)[number];
