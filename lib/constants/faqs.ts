/**
 * Public FAQ content for /faqs (source: "Autolist Frequently Asked Questions" doc,
 * last updated 24 August 2026).
 *
 * Answer text supports two inline forms, rendered as links by the FAQ page:
 * - `[label](/path)` for internal or external links
 * - bare email addresses
 */

export const FAQ_LAST_UPDATED = "24 August 2026";

export const SUPPORT_EMAIL = "support@autolist.co.ke";
export const SAFETY_EMAIL = "safety@autolist.co.ke";
export const SUPPORT_HOURS = "Monday to Friday, 9:00 AM – 6:00 PM";

export type FaqBlock = { p: string } | { ul: string[] };

export interface FaqEntry {
  question: string;
  answer: FaqBlock[];
}

export interface FaqCategory {
  id: string;
  label: string;
  title: string;
  items: FaqEntry[];
}

const ECITIZEN = "[accounts.ecitizen.go.ke](https://accounts.ecitizen.go.ke)";

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "general",
    label: "General",
    title: "General questions",
    items: [
      {
        question: "What is Autolist Kenya?",
        answer: [
          {
            p: "Autolist Kenya is an online vehicle marketplace that connects car buyers and sellers across the country. We provide a secure platform where individuals and car dealers can advertise vehicles, while buyers can search, compare and contact sellers directly. Our goal is to make buying and selling vehicles in Kenya safer, faster and more transparent.",
          },
        ],
      },
      {
        question: "Is Autolist Kenya a car dealer?",
        answer: [
          {
            p: "No. Autolist Kenya is not a car dealer. We do not own vehicles, import cars or sell inventory. We are a listing platform where private sellers and dealerships advertise their vehicles. All negotiations and agreements happen directly between the buyer and the seller.",
          },
        ],
      },
      {
        question: "Do I need an account to browse vehicles?",
        answer: [
          {
            p: "No. You can browse all vehicle listings without registering. However, you will need to create an account to contact sellers, save your favourite listings or create your own vehicle listing.",
          },
        ],
      },
      {
        question: "Is there a fee to use Autolist Kenya?",
        answer: [
          {
            p: "Browsing listings and contacting sellers is completely free. Fees only apply when you choose to list a vehicle, upgrade to a premium listing or subscribe to a dealer package.",
          },
        ],
      },
    ],
  },
  {
    id: "buyers",
    label: "For buyers",
    title: "For buyers",
    items: [
      {
        question: "How do I find a vehicle on Autolist Kenya?",
        answer: [
          {
            p: "You can search by make, model, price range, location and other filters. Use the search bar on the homepage or browse categories like cars, bikes, trucks, farm and plant equipment. [Start a search](/search).",
          },
        ],
      },
      {
        question: "Can I negotiate the price?",
        answer: [
          {
            p: "Yes. Prices are set by sellers, and negotiation is common in Kenya's car market. You are free to discuss and agree on a final price directly with the seller. Listings show whether the seller marked the price as negotiable.",
          },
        ],
      },
      {
        question: "How do I contact a seller?",
        answer: [
          {
            p: "Each vehicle listing includes a contact form and, in many cases, a phone number. You can message sellers directly from your dashboard once logged in. We encourage clear communication and recommend asking important questions.",
          },
        ],
      },
      {
        question: "Does Autolist Kenya inspect vehicles?",
        answer: [
          {
            p: "No, we do not physically inspect vehicles unless part of a paid third-party inspection service. We strongly recommend:",
          },
          {
            ul: [
              "Viewing the vehicle in person",
              "Verifying the logbook",
              `Confirming NTSA ownership records (${ECITIZEN})`,
              "Checking vehicle history where possible",
            ],
          },
          {
            p: "Buying a used car is a major decision, so take your time and inspect carefully. Read our [security advice](/security-advice) for what to check before you buy.",
          },
        ],
      },
      {
        question: "How do I check if a vehicle is stolen or has outstanding loans?",
        answer: [
          {
            p: `You can perform an official motor vehicle search on the NTSA eCitizen portal (${ECITIZEN}). This will show you the registered owner, logbook status and any existing loans or liens on the vehicle.`,
          },
        ],
      },
      {
        question: "What should I ask the seller before buying?",
        answer: [
          { p: "Key questions to ask:" },
          {
            ul: [
              "Service history and maintenance records",
              "Ownership history: how many previous owners?",
              "Accident history: has the vehicle been in any accidents?",
              "Availability for inspection and a test drive",
              "Reason for selling",
            ],
          },
        ],
      },
      {
        question: "Is it safe to buy a car from a private seller on Autolist?",
        answer: [
          { p: "We recommend following our safety guidelines:" },
          {
            ul: [
              "Always view the vehicle in person before paying",
              "Verify the logbook and NTSA records",
              "Meet in a safe, public location for the viewing and test drive",
              "Bring a mechanic, friend or family member along",
              "Never send money in advance without seeing the vehicle",
              "Have a proper sale agreement drafted and signed by all parties before payment",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "sellers",
    label: "For sellers",
    title: "For sellers",
    items: [
      {
        question: "How do I list my vehicle for sale?",
        answer: [
          { p: "Selling your car is straightforward:" },
          {
            ul: [
              'Click the "Add listing" button',
              "Create an account or log in",
              "Fill in accurate details (make, model, year, mileage, price, condition and so on)",
              "Upload clear, high-quality photos",
              "Submit your listing for review",
            ],
          },
          {
            p: "Listings with complete details and good photos attract more serious buyers and tend to sell faster. [Sell a vehicle](/sell).",
          },
        ],
      },
      {
        question: "How much does it cost to list a vehicle?",
        answer: [
          {
            p: "We offer free listing options for individuals and dealers for a limited period. We also provide premium plans that improve visibility. Premium listings may include homepage exposure, featured placement, highlighted ads and extended listing duration. If you are serious about selling quickly, upgrading your listing can significantly increase views.",
          },
        ],
      },
      {
        question: "How many free listings can I post?",
        answer: [
          {
            p: "Private sellers can post a limited number of free listings. Dealers and businesses can subscribe to dealership packages that allow larger inventory uploads and profile branding. If you operate a car yard or dealership, we recommend upgrading to a [dealer account](/membership) for maximum exposure.",
          },
        ],
      },
      {
        question: "Can I edit or remove my listing after posting?",
        answer: [
          {
            p: "Absolutely. Log in, go to your Dashboard and open My Listings. You can edit details, update the price, upload new photos or remove the listing at any time. Keeping your listing updated improves buyer trust and response rates.",
          },
        ],
      },
      {
        question: "How long does it take for my listing to go live?",
        answer: [
          {
            p: "All new ads are reviewed and approved by our team. We aim to approve all new listings within 2 business hours. If you submit your listing outside business hours, it will be approved the next business day.",
          },
        ],
      },
      {
        question: "What happens when my vehicle is sold?",
        answer: [
          {
            p: 'You can mark your listing as "Sold" from your dashboard. The listing will be removed from active search results but can be archived as a "Sold Status Page" (available on Premium and Enterprise tiers), a permanent page that builds your credibility and helps with SEO.',
          },
        ],
      },
      {
        question: "How do I get paid?",
        answer: [
          {
            p: "Payment is arranged directly between you and the buyer. We do not act as a middleman in payments. You can accept payment via M-Pesa, bank transfer or cash. For added security, we aim to offer an optional escrow service for higher-value transactions in future.",
          },
        ],
      },
    ],
  },
  {
    id: "accounts",
    label: "Accounts",
    title: "Accounts & profiles",
    items: [
      {
        question: "How do I create an account?",
        answer: [
          {
            p: 'Click the "Register" or "Sign up" button on the homepage. As an individual or buyer you will need to provide your name, email address and phone number, and create a password. If you want to sell, you will provide your ID for verification. Dealers will also need to provide their KRA PIN and business registration details for verification. [Create an account](/register).',
          },
        ],
      },
      {
        question: "I've logged in, but I can't see my listing in my account",
        answer: [
          {
            p: "You may be signed in to a different account. Log out and log back in using the correct email address. If you're still having trouble, contact our customer service team.",
          },
        ],
      },
      {
        question: "How do I deactivate or delete my account?",
        answer: [
          {
            p: "You can request account deletion from the Profile section of your account. Please note that you will not receive a confirmation of this change by email. Contact our customer service team if you have any further enquiries.",
          },
        ],
      },
      {
        question: "How do I change my phone number or email address?",
        answer: [
          {
            p: "Log in to your account, go to Settings or Profile, and update your contact details. Changes to phone numbers may require verification for security purposes.",
          },
        ],
      },
      {
        question: "I forgot my password. What should I do?",
        answer: [
          {
            p: 'Click the "Forgot password" link on the login page. Enter your registered email address, and we will send you a password reset link. [Reset your password](/forgot-password).',
          },
        ],
      },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    title: "Payments & pricing",
    items: [
      {
        question: "How do I pay for a premium listing or dealer subscription?",
        answer: [
          {
            p: "We support secure payment options including M-Pesa (via Paybill) and card payments (Visa/Mastercard). All payments are processed through secure integrations to protect your information.",
          },
        ],
      },
      {
        question: "Are premium listing purchases refundable?",
        answer: [
          {
            p: "Premium listing purchases are generally non-refundable. However, refunds may be issued in cases of duplicate payments or verified technical errors. If you believe you were charged incorrectly, contact support immediately for assistance.",
          },
        ],
      },
      {
        question: "Does Autolist Kenya take a commission on vehicle sales?",
        answer: [
          {
            p: "No. Any money paid for a vehicle goes directly to the seller, not to Autolist Kenya. We do not act as a middleman in payments. Our revenue comes from listing fees, premium upgrades and dealer subscriptions.",
          },
        ],
      },
      {
        question: "What are the dealer subscription packages?",
        answer: [
          { p: "We offer tiered plans:" },
          {
            ul: [
              "Starter (KES 5,000/mo): up to 10 listings, basic lead management.",
              "Professional (KES 15,000/mo): up to 80 listings, automated follow-ups, analytics.",
              "Enterprise (KES 35,000/mo): unlimited listings, multi-location management, dedicated account manager.",
            ],
          },
          { p: "[Compare dealer plans](/membership)." },
        ],
      },
    ],
  },
  {
    id: "safety",
    label: "Trust & safety",
    title: "Trust & safety",
    items: [
      {
        question: "How does Autolist Kenya prevent fraud?",
        answer: [
          { p: "We implement multiple security measures:" },
          {
            ul: [
              "Seller verification (KRA PIN, business registration, National ID)",
              "AI-powered fraud detection (price anomalies, image duplication, scam language)",
              "Watermarked photos",
              "User ratings and reviews",
              "Secure in-app messaging",
            ],
          },
        ],
      },
      {
        question: "How do I report a suspicious listing or user?",
        answer: [
          {
            p: 'Use the "Report Listing/Dealer" button on the listing or user profile. Our team will review the report and take appropriate action, including account suspension if necessary.',
          },
        ],
      },
      {
        question: "What should I do if I experience anti-social contact from a buyer or seller?",
        answer: [
          {
            p: `Stop all communication immediately. Report the conversation to us at ${SAFETY_EMAIL}, including any screenshots you have. We take all reports seriously and will investigate.`,
          },
        ],
      },
      {
        question: "How do I verify a seller's identity?",
        answer: [
          {
            ul: [
              "Ask to see their National ID card",
              "For dealers, verify their KRA PIN and business registration, and visit their physical location",
              'Check whether they have a "Verified" badge on their profile',
              "Meet in person before making any payment",
            ],
          },
        ],
      },
      {
        question: "Is it safe to share my personal documents online?",
        answer: [
          {
            p: "Never share scanned copies of your National ID, passport or logbook by email or through our messaging system. Scammers can use these documents for identity theft. It is enough to present these documents in person during the vehicle viewing or when the contract is signed.",
          },
        ],
      },
    ],
  },
  {
    id: "import-export",
    label: "Import & export",
    title: "Import & export questions",
    items: [
      {
        question: "Can I list an imported vehicle on Autolist Kenya?",
        answer: [
          {
            p: "Yes. You can list both locally sourced and imported vehicles. For imported vehicles, we recommend including:",
          },
          {
            ul: [
              "Import documentation (Bill of Lading, Customs Entry)",
              "KRA duty payment receipts",
              "Inspection reports (for example from AA Kenya, Regent Valuers or Carvertical)",
            ],
          },
        ],
      },
      {
        question: "Do I need to pay duty before listing an imported vehicle?",
        answer: [
          {
            p: "Yes. All imported vehicles must have duty paid before they can be legally sold in Kenya. Make sure you have the correct KRA import duty documentation.",
          },
        ],
      },
      {
        question: "How do I check if an imported vehicle is compliant with Kenyan regulations?",
        answer: [
          { p: "You can verify vehicle compliance through:" },
          {
            ul: [
              `NTSA on eCitizen (${ECITIZEN}) for registration status`,
              "KRA for duty payment verification",
              "Inspection companies like AA Kenya for roadworthiness",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "finance-insurance",
    label: "Finance & insurance",
    title: "Finance & insurance",
    items: [
      {
        question: "Does Autolist Kenya offer car financing?",
        answer: [
          {
            p: "We partner with asset finance firms such as banks and microfinance institutions. You can apply for financing directly through our platform or contact our partners. We may earn a commission for each successful referral. Our [car finance guide](/calculator) explains your options and helps you work out a budget.",
          },
        ],
      },
      {
        question: "Can I get a vehicle history report?",
        answer: [
          {
            p: "Not yet. We plan to partner with inspection and history providers like AA Kenya, Regent Valuers and Carvertical to provide comprehensive vehicle history reports. These reports will cover accident history, ownership records and mileage verification.",
          },
        ],
      },
      {
        question: "Do I need insurance before buying a vehicle?",
        answer: [
          {
            p: "Yes. You must insure your vehicle before driving it on Kenyan roads. We recommend arranging insurance before you take delivery of the vehicle. [Get an insurance quote](/insurance).",
          },
        ],
      },
      {
        question: "Can I trade in my current car?",
        answer: [
          {
            p: 'Yes. You can negotiate a trade-in of your current car with the seller or dealer. Listings show whether the seller accepts trade-ins. Soon we will offer a "Trade-In Estimator" tool that gives an instant, AI-driven valuation of your current vehicle, which you can use when negotiating a trade-in with dealers on our platform.',
          },
        ],
      },
      {
        question: "What happens if I buy a vehicle that has an outstanding loan?",
        answer: [
          {
            p: "Always verify the logbook status on the NTSA portal before purchasing. If the vehicle has an outstanding loan, the logbook will show a lien. Do not complete the purchase until the seller provides proof that the loan has been cleared and the lien removed.",
          },
        ],
      },
    ],
  },
  {
    id: "support",
    label: "Support",
    title: "Technical & account support",
    items: [
      {
        question: "Which browser should I use for the best experience?",
        answer: [
          {
            p: "Most major browsers are supported, but we recommend Google Chrome for the best experience with Autolist Kenya.",
          },
        ],
      },
      {
        question: "How do I contact customer support?",
        answer: [
          {
            p: `Email us at ${SUPPORT_EMAIL}. For safety concerns about a buyer, seller or listing, email ${SAFETY_EMAIL}.`,
          },
        ],
      },
      {
        question: "What are your support hours?",
        answer: [{ p: `Our support team is available ${SUPPORT_HOURS}.` }],
      },
      {
        question: "Why can't I find my ad in my account?",
        answer: [
          { p: "Possible reasons:" },
          {
            ul: [
              "You may be logged in to a different account",
              "Your ad may have expired",
              "Your ad may have been removed for a policy violation",
              "There may be a technical issue",
            ],
          },
          { p: "If you're still having trouble, contact our customer service team." },
        ],
      },
      {
        question: "How do I get a VAT receipt?",
        answer: [
          {
            p: "If you are a registered business and have bought a dealer subscription or premium listing, you can request a VAT receipt from your dashboard or contact support.",
          },
        ],
      },
    ],
  },
];

export const FAQ_QUICK_REFERENCE: Array<{ topic: string; takeaway: string }> = [
  {
    topic: "Buying",
    takeaway: "Browse free, inspect in person, verify NTSA records, negotiate directly with the seller",
  },
  {
    topic: "Selling",
    takeaway: "List free (limited), upgrade for visibility, edit anytime, mark as sold when done",
  },
  {
    topic: "Payments",
    takeaway: "M-Pesa and cards accepted; no commission on sales; premium listing fees are non-refundable",
  },
  {
    topic: "Safety",
    takeaway: "Report suspicious activity, never share sensitive documents online, verify in person",
  },
  {
    topic: "Support",
    takeaway: `Email ${SUPPORT_EMAIL}, ${SUPPORT_HOURS}`,
  },
];

const INLINE_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Plain-text version of an answer, for structured data. */
export function faqAnswerToText(blocks: FaqBlock[]) {
  return blocks
    .map((block) => ("p" in block ? block.p : block.ul.map((item) => `- ${item}`).join("\n")))
    .join("\n")
    .replace(INLINE_LINK, "$1");
}
