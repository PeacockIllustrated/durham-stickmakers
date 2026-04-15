export const CONTACT_SUBJECTS = [
  'General enquiry',
  'Commission a stick',
  'Repair or restoration',
  'Workshop booking',
  'Press or media',
  'Volunteering',
  'Other',
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];
