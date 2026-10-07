import Link from "next/link";
import { FaqItem } from "@/components/finance/guide-elements";

export function InsuranceFaq() {
  return (
    <div className="mt-4 max-w-prose border-t border-border">
      <FaqItem question="What is car insurance?">
        <p>
          Car (motor vehicle) insurance is a contract between you and an insurer such as ICEA Lion,
          Jubilee, APA, Britam or Directline. You pay a premium and the insurer covers you against
          financial loss from accidents, theft or damage to your vehicle. Third Party cover is the
          legal minimum under the Insurance Act (Cap 487).
        </p>
      </FaqItem>

      <FaqItem question="What affects my premium?">
        <ul>
          <li>
            <strong>Make and model:</strong> expensive or high-performance cars, such as German
            brands, cost more to insure.
          </li>
          <li>
            <strong>Car age:</strong> newer cars attract higher premiums; older cars (not classics)
            are cheaper.
          </li>
          <li>
            <strong>Engine size:</strong> larger engines, such as 3000cc and above, usually cost more.
          </li>
          <li>
            <strong>Usage:</strong> private use costs less than commercial use such as Uber, taxi or
            matatu.
          </li>
          <li>
            <strong>Your age:</strong> drivers under 25 often pay more.
          </li>
          <li>
            <strong>Location:</strong> a guarded compound in Nairobi is rated differently from open
            street parking in a high-theft area.
          </li>
          <li>
            <strong>Claims history:</strong> frequent past claims push your premium up.
          </li>
          <li>
            <strong>Security:</strong> a tracking device (such as LoJack or Cartrack) and an
            immobiliser can bring it down.
          </li>
        </ul>
      </FaqItem>

      <FaqItem question="What is a premium?">
        <p>
          The amount you pay your insurer, monthly, quarterly, every six months or yearly. Most
          Kenyans pay annually, but some insurers and finance partners offer monthly payments.
        </p>
      </FaqItem>

      <FaqItem question="What is an excess?">
        <p>
          An excess (or deductible) is the part of a claim you pay yourself before the insurer pays
          the rest. If repairs cost KES 50,000 and your excess is KES 10,000, the insurer pays
          KES 40,000.
        </p>
        <ul>
          <li>
            <strong>Voluntary excess:</strong> you choose a higher excess to lower your premium.
          </li>
          <li>
            <strong>Compulsory excess:</strong> set by the insurer for young or inexperienced
            drivers and high-risk vehicles.
          </li>
        </ul>
        <p>Policies for matatus and boda bodas often carry higher excesses because of the higher risk.</p>
      </FaqItem>

      <FaqItem question="What does comprehensive cover include?">
        <ul>
          <li>Accidental damage to your car, even if you are at fault</li>
          <li>Theft of the whole car or parts such as side mirrors and wheels (check your policy)</li>
          <li>Fire damage</li>
          <li>Third-party liability for injury, death or property damage to others</li>
          <li>Windscreen and window damage</li>
          <li>Falling objects such as tree branches and billboards</li>
          <li>Natural disasters such as floods and hailstorms</li>
          <li>Political violence and riots (optional on some policies)</li>
        </ul>
      </FaqItem>

      <FaqItem question="What is not covered by comprehensive insurance?">
        <ul>
          <li>Driving under the influence of alcohol or drugs</li>
          <li>Using the car for hire or reward, such as Uber, unless declared</li>
          <li>Racing or off-road driving</li>
          <li>Wear and tear, such as worn brake pads or old tyres</li>
          <li>Driving without a valid licence</li>
          <li>Personal items lost from inside the car, such as a laptop or phone</li>
        </ul>
      </FaqItem>

      <FaqItem question="How can I pay less for car insurance?">
        <ul>
          <li>Choose a higher excess.</li>
          <li>Install a tracking device to cut theft risk.</li>
          <li>Park in a secure location; insurers will ask where you park.</li>
          <li>Build a no-claims discount over claim-free years.</li>
          <li>
            Compare at least 3 to 4 quotes, online or directly with insurers.{" "}
            <Link href="/insurance" className="font-medium text-primary underline-offset-4 hover:underline">
              Request quotes on Autolist
            </Link>
            .
          </li>
          <li>Insure your car and home with the same company for a bundle discount.</li>
          <li>Ask about low-mileage discounts if you drive less.</li>
        </ul>
      </FaqItem>

      <FaqItem question="What is a no-claims discount (NCD)?">
        <p>
          A discount on your renewal premium for every year you do not claim. Typical discounts:
        </p>
        <ul>
          <li>1 claim-free year: 10%</li>
          <li>2 years: 15% to 20%</li>
          <li>3 years: 25% to 30%</li>
          <li>4 years or more: 35% to 40%</li>
        </ul>
        <p>
          Making a claim resets your NCD to zero, although some insurers sell NCD protection at an
          extra cost.
        </p>
      </FaqItem>

      <FaqItem question="How do I make a claim?">
        <ol>
          <li>Take photos and videos of the damage and the accident scene.</li>
          <li>
            Report to the police and get a police abstract, or a P3 form if anyone is injured. This
            step is critical.
          </li>
          <li>Call your insurer&apos;s 24-hour helpline within the time limit, often 24 to 48 hours.</li>
          <li>Take the car to the approved garage your insurer directs you to.</li>
          <li>Wait for the insurer&apos;s assessor to inspect the damage and approve the estimate.</li>
          <li>Pay your excess, if one applies.</li>
          <li>The insurer pays the garage once the claim is approved.</li>
        </ol>
        <p>Keep copies of your policy, ID, driving licence and police abstract.</p>
      </FaqItem>

      <FaqItem question="Are there policies for boda bodas and tuk tuks?">
        <p>
          Yes. Several insurers, including Apollo, GA Insurance and Britam, underwrite specialised
          motorcycle and tuk tuk cover. Options include third party, comprehensive and personal
          accident cover for the rider. Premiums depend on engine size (for example 100cc to 200cc)
          and usage. Some Saccos also offer cheaper group cover for commercial boda bodas.
        </p>
      </FaqItem>

      <FaqItem question="What if an uninsured driver hits me?">
        <p>
          If the other driver is at fault and uninsured, you can claim under your comprehensive
          policy and your insurer may pursue the driver. With third party cover only, you may have
          to sue the driver yourself, which is difficult. Some insurers offer uninsured motorist
          cover as an add-on.
        </p>
      </FaqItem>

      <FaqItem question="How do I choose an insurer?">
        <ul>
          <li>
            <strong>Claim settlement ratio:</strong> ask how many claims are paid versus rejected.
          </li>
          <li>
            <strong>Approved garages:</strong> check there are good ones near you.
          </li>
          <li>
            <strong>Customer service:</strong> do they answer quickly, including at night?
          </li>
          <li>
            <strong>Premium:</strong> compare at least 3 to 4 quotes.
          </li>
          <li>
            <strong>Extras:</strong> free windscreen cover, roadside assistance or ambulance cover.
          </li>
        </ul>
        <p>
          Popular Kenyan insurers include ICEA Lion, Jubilee, Britam, APA, Directline, GA Insurance,
          CIC, Madison, UAP Old Mutual, Sanlam and Takaful Insurance of Africa (Shariah-compliant).
        </p>
      </FaqItem>

      <FaqItem question="What is Takaful car insurance?">
        <p>
          Takaful is Shariah-compliant insurance. You pay a contribution instead of a premium, and
          claims are paid from a shared pool, with no riba (interest) and no gharar (excessive
          uncertainty). Providers in Kenya include Takaful Insurance of Africa, Tijara Takaful
          (under First Assurance) and Lion Takaful (ICEA Lion).
        </p>
      </FaqItem>

      <FaqItem question="Can a foreigner drive my insured car?">
        <p>Yes, with conditions:</p>
        <ul>
          <li>The policy must cover any authorised driver, or any driver over 25.</li>
          <li>
            A foreign licence in English is valid for up to 90 days; otherwise an International
            Driving Permit is required.
          </li>
          <li>Some policies exclude non-residents, so confirm with your insurer.</li>
        </ul>
      </FaqItem>

      <FaqItem question="My renewal price went up. What can I do?">
        <ol>
          <li>Ask why: did you claim, or did the car&apos;s value change?</li>
          <li>Get quotes from other insurers.</li>
          <li>Check your no-claims discount has been applied.</li>
          <li>On an older car, consider switching to Third Party, Fire &amp; Theft.</li>
          <li>Raise your excess to lower the premium.</li>
        </ol>
      </FaqItem>

      <FaqItem question="Is roadside assistance included?">
        <p>
          Sometimes. Many comprehensive policies include basic towing, flat tyre changes, battery
          jump-starts and fuel delivery, while others sell it as a paid add-on. Check your policy
          wording or ask your insurer directly.
        </p>
      </FaqItem>
    </div>
  );
}
