import type { FaqEntry } from "@/lib/constants/faqs";

// Adapted from the supplied Kenya motor-insurance guide; policy benefits vary.
export const INSURANCE_FAQS: FaqEntry[] = [
  {
    question: "What is car insurance in Kenya?",
    answer: [{ p: "Motor insurance is a contract: you pay a premium and the insurer covers the risks described in your policy. What it pays depends on the cover, limits, exclusions and excess you agree to." }],
  },
  {
    question: "What types of car insurance are available?",
    answer: [{ ul: [
      "Third party only covers specified liability to other people. It does not cover damage to your own vehicle. Check whether third-party property damage is included and its limit.",
      "Third party, fire and theft adds cover for insured fire and theft losses to your vehicle.",
      "Comprehensive adds insured accidental damage to your vehicle. Additional benefits and exclusions depend on the policy.",
    ] }],
  },
  {
    question: "Is car insurance mandatory in Kenya?",
    answer: [{ p: "For road use, the Insurance (Motor Vehicles Third Party Risks) Act, Cap. 405 generally requires insurance against specified third-party death or bodily-injury liabilities. Statutory exceptions apply. The legal minimum does not mean every loss, passenger or property-damage claim is covered." }],
  },
  {
    question: "What affects my car insurance premium?",
    answer: [{ p: "Insurers may consider the vehicle’s value, make, model and age; its use and location; driver and claims history; security measures; and the cover and excess selected. The rating method varies, so a newer or older car is not automatically cheaper to insure." }],
  },
  {
    question: "What is an insurance premium?",
    answer: [{ p: "The premium is the price of your insurance. Ask about the payment schedule and when cover starts. If instalments or premium financing are offered, check the total cost and what happens if a payment is missed." }],
  },
  {
    question: "What is an excess or deductible?",
    answer: [{ p: "An excess is the part of an insured claim you pay yourself. It may be a fixed amount, a percentage or both. Check compulsory and voluntary excesses, including any separate theft, young-driver or other conditions, before comparing premiums." }],
  },
  {
    question: "What does comprehensive car insurance cover?",
    answer: [{ p: "It generally combines third-party liability with insured accidental damage, fire and theft losses to your own vehicle. Check limits and excesses. Windscreen, flood, accessories, personal accident, riot and political-violence cover may have separate terms or require an extension." }],
  },
  {
    question: "What may be excluded from comprehensive cover?",
    answer: [{ p: "Read the exclusions for wear and tear, mechanical breakdown, personal belongings, racing and undeclared use. Own-vehicle claims may also be affected by licence requirements or driving under the influence. Do not assume private-use cover permits taxi, ride-hailing or other commercial work." }],
  },
  {
    question: "How can I reduce my insurance costs?",
    answer: [{ p: "Compare quotes with equivalent cover, excesses and limits. Ask whether approved security measures, claim-free history, mileage or combined policies affect your quote. A higher voluntary excess may reduce the premium, but increases what you must pay after a claim; no discount is guaranteed." }],
  },
  {
    question: "What is a no-claims discount?",
    answer: [{ p: "An insurer may recognise claim-free history when pricing renewal. Eligibility, discount levels, transfer rules and the effect of a claim vary. Ask for your insurer’s terms and whether any optional protection applies; there is no universal discount schedule or automatic reset rule." }],
  },
  {
    question: "How do I make a car insurance claim?",
    answer: [{ ul: [
      "Make the scene safe and seek emergency help if needed. When safe, record the incident and exchange relevant details.",
      "Notify the police where required and obtain the incident documents your insurer requests, such as a police abstract.",
      "Contact your insurer promptly, follow its reporting deadlines, and supply the claim form and requested licence, ID and vehicle documents.",
      "Follow its assessment and repair-authorisation process before arranging repairs. Keep copies and confirm any excess or other payment due.",
    ] }],
  },
  {
    question: "Is there insurance for boda bodas and tuk tuks?",
    answer: [{ p: "Ask insurers about motorcycle or three-wheeler policies suitable for your actual use. Disclose passenger transport, delivery or other commercial work. Confirm passenger liability and any rider personal-accident benefit rather than assuming they are included." }],
  },
  {
    question: "What if an uninsured driver hits my car?",
    answer: [{ p: "Notify your insurer and retain incident evidence. A comprehensive policy may cover your insured damage, subject to its terms and excess. Third-party-only cover normally does not repair your own car. Ask your insurer about recovery options and any applicable additional cover." }],
  },
  {
    question: "Can I insure a financed car?",
    answer: [{ p: "Yes. Check your finance agreement: the lender may require comprehensive cover, an agreed insured value and its interest recorded on the policy. Get the lender’s requirements for changing or cancelling cover; they are not identical across all loans." }],
  },
  {
    question: "How do I choose an insurer?",
    answer: [{ p: "Confirm the insurer is authorised to provide motor cover. Compare the written policy, exclusions, excesses, repair network and claims support alongside the premium. Check the limits and conditions of advertised extras. Request the full wording before deciding, rather than choosing on price alone." }],
  },
  {
    question: "What is Takaful car insurance?",
    answer: [{ p: "Takaful is a Shariah-compliant approach in which participants contribute to a shared fund that supports covered losses. For motor cover, check the operator’s terms, fees, benefits and exclusions as carefully as you would any other policy." }],
  },
  {
    question: "Can a foreign licence holder drive an insured Kenyan car?",
    answer: [{ p: "Do not assume cover is automatic. Confirm with the insurer that the driver meets the policy’s authorised-driver, age, residency and use conditions. Check the applicable licence requirements with NTSA; licence recognition and any permit requirements depend on the driver’s circumstances." }],
  },
  {
    question: "What can I do if my renewal premium increases?",
    answer: [{ p: "Ask for the reason and check the vehicle value, claims record, no-claims allowance and benefits on the renewal. Compare equivalent quotes. Discuss an affordable excess or alternative cover with the insurer, and check lender conditions before reducing financed-car cover." }],
  },
  {
    question: "Is roadside assistance included?",
    answer: [{ p: "It may be included, optional or unavailable. Ask about towing, jump-starts and other services, including operating hours, geographical limits, distance limits, approved providers and charges. A comprehensive policy does not guarantee unlimited roadside assistance." }],
  },
  {
    question: "What happens if I drive without required insurance?",
    answer: [{ p: "Using a vehicle on a road without the cover required by Cap. 405 is an offence and can leave you facing prosecution and personal liability for losses. Check the current law and applicable certificate requirements. Do not drive while arranging or renewing cover unless valid cover is already in force." }],
  },
];

export const INSURANCE_FAQ_SOURCES = [
  { label: "Kenya Law: Cap. 405", href: "https://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/Insurance%20MotorVehiclesThirdPartyRisksActCap405.pdf" },
  { label: "Comprehensive cover", href: "https://ke.britam.com/home/personal/protect-what-you-love/britam-motor-insurance/comprehensive-motor-insurance" },
  { label: "Third-party cover", href: "https://ke.britam.com/home/personal/protect-what-you-love/britam-motor-insurance/third-party-car-insurance" },
  { label: "Motor claims", href: "https://ke.britam.com/help/file-a-claim/motor-insurance-claim" },
  { label: "Takaful explained", href: "https://www.takafulafrica.co.ke/" },
] as const;
