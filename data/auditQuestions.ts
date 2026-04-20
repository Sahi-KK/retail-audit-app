export type AuditCategory = 'cleanliness' | 'merchandising' | 'operations' | 'staff' | 'clinical';

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
    id: 'c3',
    category: 'cleanliness',
    text: 'Cleaning Tools: Are staff utilizing clean, brand-approved microfiber cloths (no dirty or frayed rags) to maintain the inventory?',
    maxScore: 5
  },
  {
    id: 'c4',
    category: 'cleanliness',
    text: 'Dedicated Mirror Spotlessness: Are all full-length floor mirrors and tabletop try-on mirrors completely pristine, free of streaks, fingerprints, and smudges?',
    maxScore: 5
  },
  {
    id: 'c5',
    category: 'cleanliness',
    text: 'Illumination & Acrylic Dust Control: Are all overhead LEDs and shelf lightboxes fully functional, and are the brightly lit acrylic glorifiers completely free of accumulated dust?',
    maxScore: 5
  },
  {
    id: 'c6',
    category: 'cleanliness',
    text: 'Cash Wrap / POS Hygiene: Is the primary checkout counter completely clear of staff\'s personal items, stray paperwork, and clutter, with a visibly sanitized payment terminal?',
    maxScore: 5
  },
  {
    id: 'c7',
    category: 'cleanliness',
    text: 'Fixture & Wall Maintenance: Are all physical assets (wall bays, tables, styling trays) structurally intact and free of chipped paint, broken hinges, scratched glass, or peeling laminate?',
    maxScore: 5
  },
  {
    id: 'c8',
    category: 'cleanliness',
    text: 'Store Ambiance: Is the store climate maintained at a comfortable level, and is the officially approved corporate playlist playing at a conversation-friendly volume?',
    maxScore: 5
  },

  // Tab 2: Visual Merchandising & Brand Integrity
  {
    id: 'm1',
    category: 'merchandising',
    text: 'Window & Primary Campaign Currency: Is the primary storefront window and center table featuring the globally mandated campaign for the current month, with zero expired marketing visible?',
    maxScore: 5
  },
  {
    id: 'm2',
    category: 'merchandising',
    text: 'The Strike Zone & Anchor Placement: Are the highest-volume anchor brands positioned strictly in the designated eye-level "Strike Zone" (Rows 6, 7, and 8)?',
    maxScore: 5
  },
  {
    id: 'm3',
    category: 'merchandising',
    text: 'Brand Segregation: Are fashion/luxury frames distinctly separated from active/performance frames with clear visual breaks to prevent brand dilution?',
    maxScore: 5
  },
  {
    id: 'm4',
    category: 'merchandising',
    text: 'Price Tag Concealment: Are 100% of the frame price tags neatly tucked behind the temples to ensure a pristine visual presentation?',
    maxScore: 5
  },
  {
    id: 'm5',
    category: 'merchandising',
    text: 'Glorifier Alignment: Do the physical frames placed on acrylic glorifiers exactly match the specific model featured in the marketing graphic positioned directly behind them?',
    maxScore: 5
  },
  {
    id: 'm6',
    category: 'merchandising',
    text: 'Planogram Execution: Is the store strictly adhering to the most recently issued corporate planogram across all wall bays and floor fixtures?',
    maxScore: 5
  },
  {
    id: 'm7',
    category: 'merchandising',
    text: 'Point-of-Purchase (POP) Impulse: Is the cash wrap area strategically utilizing impulse merchandise (cleaning kits, cords) fully stocked and neatly presented?',
    maxScore: 5
  },
  {
    id: 'm8',
    category: 'merchandising',
    text: 'Customer Sightline Alignment (10x10 Tool): Is the 10x10 VM graphic tool strategically placed to capture the customer\'s natural entry sightline, with the model\'s gaze directing the customer\'s eyes into the store?',
    maxScore: 5
  },

  // Tab 3: Store Operations & Asset Protection
  {
    id: 'o1',
    category: 'operations',
    text: 'High-Value Asset Security: Are all designated luxury cabinets physically locked, and are the keys secured on a manager\'s person at all times?',
    maxScore: 5
  },
  {
    id: 'o2',
    category: 'operations',
    text: 'Core Bestseller Availability: Are the brand\'s historically top-selling anchor SKUs physically in stock and properly merchandised on the floor?',
    maxScore: 5
  },
  {
    id: 'o3',
    category: 'operations',
    text: 'Omnichannel Readiness: Are the store’s iPads/tablets fully charged, physically present on the floor, and accessible to process "Ship-to-Home" orders?',
    maxScore: 5
  },
  {
    id: 'o4',
    category: 'operations',
    text: 'Cash Wrap & Supply Readiness: Is the POS area fully stocked with supplies (premium shopping bags, hard cases, receipt paper) so the associate never has to abandon a customer?',
    maxScore: 5
  },
  {
    id: 'o5',
    category: 'operations',
    text: 'Back-of-House Organization: Is the stockroom strictly organized by brand, gender, and style, allowing fresh pair retrieval within 60 seconds?',
    maxScore: 5
  },
  {
    id: 'o6',
    category: 'operations',
    text: 'Daily Checklist Compliance: Is the daily store opening/closing checklist visibly completed and signed off by the acting Manager on Duty?',
    maxScore: 5
  },
  {
    id: 'o7',
    category: 'operations',
    text: 'Security Tag Compliance: If applicable, are 100% of the required frames tagged correctly without physically damaging the acetate frames?',
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
    text: 'Open-Ended Discovery: Does the associate actively bypass passive greetings and use open-ended lifestyle questions to uncover the customer\'s needs?',
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
    text: 'The Styling Tray Protocol: Is the associate actively using a styling tray to present at least 3 distinct frames, preventing the customer from juggling multiple pairs?',
    maxScore: 5
  },
  {
    id: 's6',
    category: 'staff',
    text: 'F.A.B. Value Articulation: Does the staff effectively explain the specific technology/features of the frame or lens (Features, Advantages, Benefits)?',
    maxScore: 5
  },
  {
    id: 's7',
    category: 'staff',
    text: 'Top-Down Price Anchoring: When discussing lenses, does the associate initiate the conversation by anchoring with the premium option first?',
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
    text: 'Clinical Pre-Test Sanitization: Are the clinical pre-test machines visibly sanitized in front of the patient, with fresh chin-rest paper installed and absolutely no lingering makeup or skin oil from previous exams?',
    maxScore: 5
  },
  {
    id: 'l2',
    category: 'clinical',
    text: 'The Clinical Receiving Handoff: Does the retail associate actively step up, receive the doctor\'s handoff warmly, and immediately review the specific lifestyle and lens recommendations?',
    maxScore: 5
  },
  {
    id: 'l3',
    category: 'clinical',
    text: 'Contact Lens I&R Station: Is the dedicated contact lens training station flawlessly clean, with an immaculate sink, pristine tabletop mirrors, and a fully organized, fully stocked supply of trial lenses and solutions?',
    maxScore: 5
  },
  {
    id: 'l4',
    category: 'clinical',
    text: 'Vision Benefit Transparency: Does the associate clearly explain the patient\'s specific vision insurance allowances (e.g., EyeMed) before beginning the frame styling journey to establish an accurate budget?',
    maxScore: 5
  },
  {
    id: 'l5',
    category: 'clinical',
    text: 'Patient Privacy Protocol: Are staff discussing sensitive prescription details discreetly, ensuring intake forms and medical records are never left unattended on public counters?',
    maxScore: 5
  },
  {
    id: 'l6',
    category: 'clinical',
    text: 'Waiting Area Flow: Is the dedicated clinical waiting area strictly maintained, and are waiting patients (or those waiting for dilation) checked on periodically by staff rather than being ignored?',
    maxScore: 5
  },
  {
    id: 'l7',
    category: 'clinical',
    text: 'Exam Lane Presentation: Viewing from the hallway, do the active exam lanes look strictly clinical, meticulously organized, and free of personal staff clutter to reinforce medical authority?',
    maxScore: 5
  },
  {
    id: 'l8',
    category: 'clinical',
    text: 'Prescription Value Articulation: When interpreting the doctor\'s prescription, does the associate confidently explain the medical necessity behind premium lens tech (e.g., high-index lenses, progressive mapping) rather than acting as a passive order-taker?',
    maxScore: 5
  }
];
