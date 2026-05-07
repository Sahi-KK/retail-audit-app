export type AuditCategory = 'cleanliness' | 'merchandising' | 'operations' | 'staff' | 'clinical' | 'rayban_meta';

export interface AuditQuestion {
  id: string;
  category: AuditCategory;
  text: string;
  maxScore: 5;
}

export const auditQuestions: AuditQuestion[] = [
  // Tab 1: Cleanliness & Hygiene
  {
    id: 'c1',
    category: 'cleanliness',
    text: 'General Physical Cleanliness: Are the store floors, baseboards, and glass entryways completely spotless, freshly swept/mopped, and free of any debris or scuff marks?',
    maxScore: 5
  },
  {
    id: 'c2',
    category: 'cleanliness',
    text: 'Glasses & Lens Cleanliness: Are the display frames, lenses, and nose pads across the entire store completely free of settled dust, smudges, fingerprints, and makeup residue?',
    maxScore: 5
  },
  {
    id: 'c4',
    category: 'cleanliness',
    text: 'Dedicated Mirror Spotlessness: Are all full-length floor mirrors and tabletop try-on mirrors completely pristine, free of streaks, fingerprints, and smudges?',
    maxScore: 5
  },
  {
    id: 'c6',
    category: 'cleanliness',
    text: 'Cashdesk Hygiene: Is the cashdesk clean and free of personal items, with the laptop or device properly placed on it?',
    maxScore: 5
  },
  {
    id: 'c7',
    category: 'cleanliness',
    text: 'Fixture & Asset Maintenance: Are all physical assets (Capacity, Lit Gogos, tables, styling trays) structurally intact and free of chipped paint, broken hinges, scratched glass, or peeling laminate?',
    maxScore: 5
  },
  {
    id: 'c8',
    category: 'cleanliness',
    text: 'Store Ambiance: Is the store climate maintained at a comfortable level for customers?',
    maxScore: 5
  },

  // Tab 2: Visual Merchandising & Brand Integrity
  {
    id: 'm1',
    category: 'merchandising',
    text: 'Front Facade & Campaign: Is the updated marketing campaign featured on the front facade, with zero expired marketing visible?',
    maxScore: 5
  },
  {
    id: 'm2',
    category: 'merchandising',
    text: 'Key Equity Placements & NPIs: Are brands placed in correct rows? (Rows 1-3 = CO, Rows 4-5 = NPI, Rows 6-8 = Best Sellers)',
    maxScore: 5
  },
  {
    id: 'm4',
    category: 'merchandising',
    text: 'Price Tags Compliance: Are all price tags attached to the articles? (Scoring: 0 for No/Missing, 5 for Yes)',
    maxScore: 5
  },
  {
    id: 'm5',
    category: 'merchandising',
    text: 'VM Mapping: Do the physical frames match the specific model featured in the 10x10 tool or graphic holders adjacent to them?',
    maxScore: 5
  },
  {
    id: 'm6',
    category: 'merchandising',
    text: 'Planogram Execution: Is the store strictly adhering to the most recently issued corporate planogram across all capacity fixtures and floor displays?',
    maxScore: 5
  },
  {
    id: 'm7',
    category: 'merchandising',
    text: 'Cash Desk Communication: Are the three core communications present (Sunperks Loyalty, Brand Promotion, and Seasonal Promotion)? Is the desk surface clutter-free?',
    maxScore: 5
  },


  // Tab 3: Store Operations & Asset Protection
  {
    id: 'o1',
    category: 'operations',
    text: 'Asset Security: Are all designated cabinets physically locked, and are the keys secured on a manager\'s person at all times?',
    maxScore: 5
  },
  {
    id: 'o2',
    category: 'operations',
    text: 'Core Bestseller Availability: Are the brand\'s historically top-selling anchor SKUs physically in stock and properly merchandised?',
    maxScore: 5
  },
  {
    id: 'o3',
    category: 'operations',
    text: 'Omnichannel Readiness: Does the store have a designated iPad or device for assistance? (If no, mark 5; if yes, mark based on its current functionality).',
    maxScore: 5
  },
  {
    id: 'o5',
    category: 'operations',
    text: 'Back-of-House Organization: Is the stockroom organized by brand/style with the Planogram and Key Equity Planning visible and adhered to?',
    maxScore: 5
  },
  {
    id: 'o6',
    category: 'operations',
    text: 'Daily Checklist Compliance: Is the daily store opening/closing checklist visibly completed and signed off by the acting Manager on Duty?',
    maxScore: 5
  },

  // Tab 4: Staff Behaviour & Customer Experience
  {
    id: 's1',
    category: 'staff',
    text: 'Active Floor Positioning: Are associates strategically positioned in active zones ready to intercept traffic, rather than clustering together or hiding behind the cash wrap?',
    maxScore: 5
  },
  {
    id: 's2',
    category: 'staff',
    text: 'The 10-Second Greet: Is every customer actively acknowledged with a warm, premium welcome within 10 seconds of crossing the lease line?',
    maxScore: 5
  },
  {
    id: 's3',
    category: 'staff',
    text: '7 Steps Protocol: Upon walk-in, does the staff immediately inform the customer about free eye checkups and available optical frame collections?',
    maxScore: 5
  },
  {
    id: 's4',
    category: 'staff',
    text: 'The Fresh Wipe Presentation: Before handing any display frame to a customer, does the associate proactively wipe the lenses with a microfiber cloth?',
    maxScore: 5
  },
  {
    id: 's5',
    category: 'staff',
    text: 'Styling Tray & Multi-Frame Trial: Is the associate using a styling tray to present at least 3 frames and actively encouraging the customer to try more frames?',
    maxScore: 5
  },
  {
    id: 's6',
    category: 'staff',
    text: 'F.A.B. Value Articulation: Does the staff effectively explain the specific technology/features of the frame or lens (Features, Advantages, Benefits)?',
    maxScore: 5
  },
  {
    id: 's8',
    category: 'staff',
    text: 'Campaign Integration: Does the associate proactively inform the customer about current seasonal campaigns or promotions early in the conversation?',
    maxScore: 5
  },

  // Tab 5: LensCrafters Clinical Operations
  {
    id: 'l1',
    category: 'clinical',
    text: 'Clinical Pre-Test Sanitization: Are the clinical pre-test machines visibly sanitized in front of the patient, with fresh chin-rest paper installed?',
    maxScore: 5
  },
  {
    id: 'l2',
    category: 'clinical',
    text: 'The Clinical Receiving Handoff: Does the retail associate actively step up, receive the doctor\'s handoff warmly, and immediately review recommendations?',
    maxScore: 5
  },
  {
    id: 'l3',
    category: 'clinical',
    text: 'Contact Lens Station: Is the training station clean and stocked? (Simplified clinical requirement for contact lens area)',
    maxScore: 5
  },
  {
    id: 'l4',
    category: 'clinical',
    text: 'Vision Benefit Transparency: Does the associate clearly explain the patient\'s specific vision insurance allowances (e.g., EyeMed) before styling?',
    maxScore: 5
  },
  {
    id: 'l7',
    category: 'clinical',
    text: 'Exam Lane Presentation: Do the active exam lanes look strictly clinical, meticulously organized, and free of personal staff clutter?',
    maxScore: 5
  },
  {
    id: 'l8',
    category: 'clinical',
    text: 'Lens Selling Table: Is the customer being thoroughly explained the lens technologies and benefits at the dedicated selling table?',
    maxScore: 5
  },
  {
    id: 'l9',
    category: 'clinical',
    text: 'Top-Down Price Anchoring: When discussing lenses, does the associate initiate the conversation by anchoring with the premium option first?',
    maxScore: 5
  },

  // Tab 6: Ray-Ban Meta Excellence
  {
    id: 'rm1',
    category: 'rayban_meta',
    text: 'Dual-Greeting Interception: Did the staff offer a clear choice between "Standard Style" and "Ray-Ban Meta AI" during the opening greeting?',
    maxScore: 5
  },
  {
    id: 'rm2',
    category: 'rayban_meta',
    text: 'Style-First Styling: Was the frame fit and aesthetic suitability prioritized BEFORE introducing the smart AI features?',
    maxScore: 5
  },
  {
    id: 'rm3',
    category: 'rayban_meta',
    text: 'The Rule of Three Pitch: Did the staff effectively group the pitch into the 3 core benefits: AI Help, Hands-free Capture, and All-day Convenience?',
    maxScore: 5
  },
  {
    id: 'rm4',
    category: 'rayban_meta',
    text: 'Strategic Discovery: Did the staff ask specific questions to identify if the customer needs relate to Travel, Work, or Everyday use?',
    maxScore: 5
  },
  {
    id: 'rm5',
    category: 'rayban_meta',
    text: 'AI Excellence (Hindi/Translation): Did the staff specifically demo or mention high-value features like Hindi interaction or Live Translation?',
    maxScore: 5
  },
  {
    id: 'rm6',
    category: 'rayban_meta',
    text: 'Text Action Utility: Did the staff explain real-world AI text tasks such as reading signs, calling numbers, or scanning QR codes?',
    maxScore: 5
  },
  {
    id: 'rm7',
    category: 'rayban_meta',
    text: 'POV Capture Differentiator: Was the 12MP camera and 3K video pitched as a unique way to capture "hands-free" POV memories?',
    maxScore: 5
  },
  {
    id: 'rm8',
    category: 'rayban_meta',
    text: 'Hardware Readiness: Is the Ray-Ban Meta demo unit fully functional, lens-pristine, and sufficiently charged for customer trial?',
    maxScore: 5
  },
  {
    id: 'rm9',
    category: 'rayban_meta',
    text: 'Objection & Value Mastery: Did staff handle price/tech concerns by framing it as "3 products in one" or simplifying for non-tech users?',
    maxScore: 5
  },
  {
    id: 'rm10',
    category: 'rayban_meta',
    text: 'All-Day Practicality: Were the 8-hour battery, charging case support, and open-ear audio pitched as essential everyday tools?',
    maxScore: 5
  },
  {
    id: 'rm11',
    category: 'rayban_meta',
    text: 'Lifestyle Soft Close: Did the staff move toward a decision by linking the preferred frame style to the specific AI value identified?',
    maxScore: 5
  },
  {
    id: 'rm12',
    category: 'rayban_meta',
    text: 'Success Handover: Did the staff proactively commit to a post-purchase setup walkthrough of the Meta AI app and charging case?',
    maxScore: 5
  },
  {
    id: 's9',
    category: 'staff',
    text: 'Cleaning Tools Maintenance: Are staff utilizing clean, brand-approved microfiber cloths (no dirty or frayed rags) to maintain the inventory?',
    maxScore: 5
  }
];
