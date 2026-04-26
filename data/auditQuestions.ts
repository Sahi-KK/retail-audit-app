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
    text: 'Fixture & Asset Maintenance: Are all physical assets (Capacity, Lit Gogos, tables, styling trays) structurally intact and free of chipped paint, broken hinges, scratched glass, or peeling laminate?',
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
    text: 'Primary Front Store & Campaign: Is the primary front store window and Celebration Table (displaying alternative articles) featuring the mandated Tone of Voice Campaign, with zero expired marketing visible?',
    maxScore: 5
  },
  {
    id: 'm2',
    category: 'merchandising',
    text: 'Key Equity Placements & NPIs: Are the highest-volume anchor brands and New Product Introductions (NPIs) positioned strictly in the designated eye-level zones?',
    maxScore: 5
  },
  {
    id: 'm4',
    category: 'merchandising',
    text: 'Price Tags Compliance: Are all frame price tags present and correctly positioned? (Scoring: 0 for No/Missing, 5 for Yes/Perfect)',
    maxScore: 5
  },
  {
    id: 'm5',
    category: 'merchandising',
    text: 'VM Mapping: Do the physical frames placed on acrylic glorifiers exactly match the specific model featured in the VM Mapping graphic positioned behind them?',
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
  {
    id: 'm9',
    category: 'merchandising',
    text: 'Format Specific Branding: If Old Format, are all 10x10 tools perfect? If Skin Format, is all brand-specific branding flawless? (Scoring: 0 for No, 5 for Yes)',
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
    text: 'The Meta Choice: Does the staff offer a clear choice between standard sunglasses and Ray-Ban Meta AI during the initial greeting?',
    maxScore: 5
  },
  {
    id: 'rm2',
    category: 'rayban_meta',
    text: 'Style-First Fit: Does the associate prioritize finding the correct frame style and fit BEFORE introducing the smart features?',
    maxScore: 5
  },
  {
    id: 'rm3',
    category: 'rayban_meta',
    text: 'The Rule of Three: Does the staff group the pitch into 3 clear benefits: AI Help, Hands-free Capture, and All-day Convenience?',
    maxScore: 5
  },
  {
    id: 'rm4',
    category: 'rayban_meta',
    text: 'Lifestyle Discovery: Did the staff identify a specific customer need (Travel, Work, or Content Creation) to match features?',
    maxScore: 5
  },
  {
    id: 'rm5',
    category: 'rayban_meta',
    text: 'Advanced AI Demo: Does the staff mention or demonstrate high-value AI features like Live Translation or Hindi Interaction?',
    maxScore: 5
  },
  {
    id: 'rm6',
    category: 'rayban_meta',
    text: 'POV Capture Pitch: Was the 12MP camera and 3K video pitched specifically for hands-free "Point-of-View" memories?',
    maxScore: 5
  },
  {
    id: 'rm7',
    category: 'rayban_meta',
    text: 'Hardware Readiness: Is the Ray-Ban Meta demo unit fully functional, clean, and sufficiently charged for customer trial?',
    maxScore: 5
  },
  {
    id: 'rm8',
    category: 'rayban_meta',
    text: 'Objection Handling: For technical or price objections, did staff simplify the product or link value back to the customer\'s lifestyle?',
    maxScore: 5
  },
  {
    id: 'rm9',
    category: 'rayban_meta',
    text: 'Value Defense: Did staff frame the product as "3 products in one" (Premium Ray-Ban + AI Assistant + Hands-free Tool)?',
    maxScore: 5
  },
  {
    id: 'rm10',
    category: 'rayban_meta',
    text: 'Onboarding Assurance: Does the staff commit to a post-purchase setup walkthrough (Meta AI App & Charging Case)?',
    maxScore: 5
  },
  {
    id: 'rm11',
    category: 'rayban_meta',
    text: 'Staff Identity Hook: Does the staff introduce themselves and Sunglass Hut properly before diving into the product?',
    maxScore: 5
  },
  {
    id: 'rm12',
    category: 'rayban_meta',
    text: 'Curiosity Positioning: Was the product introduced as an "Advanced AI Wearable" and a "one-of-a-kind product"?',
    maxScore: 5
  },
  {
    id: 'rm13',
    category: 'rayban_meta',
    text: 'Live AI Context: Did staff explain that Meta AI understands the "context" around the user and responds naturally?',
    maxScore: 5
  },
  {
    id: 'rm14',
    category: 'rayban_meta',
    text: 'Text Actions Mastery: Did staff pitch "Text Actions" (reading signs, calling numbers, or scanning QR codes) as a core benefit?',
    maxScore: 5
  },
  {
    id: 'rm15',
    category: 'rayban_meta',
    text: 'Contextual Reminders: Did staff mention AI reminders, such as remembering where a car is parked or a grocery list?',
    maxScore: 5
  },
  {
    id: 'rm16',
    category: 'rayban_meta',
    text: 'Open-Ear Audio: Was the audio experience (open-ear speakers and built-in microphones) pitched for daily convenience?',
    maxScore: 5
  },
  {
    id: 'rm17',
    category: 'rayban_meta',
    text: 'Practicality Pitch: Did staff mention the extra power from the charging case and the 8-hour battery life?',
    maxScore: 5
  },
  {
    id: 'rm18',
    category: 'rayban_meta',
    text: 'The Soft Close: Did the staff move toward a decision by linking the preferred frame back to the specific AI value?',
    maxScore: 5
  }
];
