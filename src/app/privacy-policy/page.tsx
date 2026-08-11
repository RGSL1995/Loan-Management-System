import { LegalLayout, LegalSection, LegalList } from "@/components/LegalLayout";

const SECTIONS = [
  { id: "introduction", label: "Introduction" },
  { id: "data-collected", label: "Data We Collect" },
  { id: "how-we-use", label: "How We Use Data" },
  { id: "data-security", label: "Data Security" },
  { id: "your-rights", label: "Your Rights" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="How we collect, use, and protect your personal information on the Finbyx platform."
      sections={SECTIONS}
    >
      <LegalSection id="introduction" number="1" title="Introduction">
        <p>
          Welcome to Finbyx. We respect your privacy and are committed to protecting your personal data.
          This Privacy Policy will inform you as to how we look after your personal data when you visit our
          website or use our platform, and tell you about your privacy rights and how the law protects you.
        </p>
        <p>
          This policy applies to all information collected through our platform, as well as any related
          services, sales, marketing, or events. By using Finbyx, you agree to the collection and use of
          information in accordance with this policy.
        </p>
      </LegalSection>

      <LegalSection id="data-collected" number="2" title="The Data We Collect About You">
        <p>
          Personal data means any information about an individual from which that person can be identified.
          We may collect, use, store, and transfer the following kinds of personal data about you:
        </p>
        <LegalList
          items={[
            { label: "Identity Data", detail: "Includes first name, last name, username or similar identifier, marital status, title, date of birth, and gender." },
            { label: "Contact Data", detail: "Includes billing address, delivery address, email address, and telephone numbers." },
            { label: "Financial Data", detail: "Includes bank account and payment card details required for loan origination and servicing." },
            { label: "Technical Data", detail: "Includes IP address, login data, browser type and version, time zone setting, and location." },
            { label: "Usage Data", detail: "Includes information about how you use our website and services." },
          ]}
        />
      </LegalSection>

      <LegalSection id="how-we-use" number="3" title="How We Use Your Personal Data">
        <p>
          We will only use your personal data when the law allows us to. Most commonly, we will use your
          personal data in the following circumstances:
        </p>
        <LegalList
          items={[
            { label: "Contract Performance", detail: "Where we need to perform the contract we are about to enter into or have entered into with you, e.g., providing loan management services." },
            { label: "Legitimate Interests", detail: "Where it is necessary for our legitimate interests, and your interests and fundamental rights do not override those interests." },
            { label: "Legal Obligation", detail: "Where we need to comply with a legal or regulatory obligation such as RBI reporting requirements." },
          ]}
        />
      </LegalSection>

      <LegalSection id="data-security" number="4" title="Data Security">
        <p>
          We have put in place appropriate security measures to prevent your personal data from being
          accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.
        </p>
        <p>
          In addition, we limit access to your personal data to those employees, agents, contractors, and
          other third parties who have a business need to know. They will only process your personal data on
          our instructions and they are subject to a duty of confidentiality.
        </p>
        <p>
          We have put in place procedures to deal with any suspected personal data breach and will notify
          you and any applicable regulator of a breach where we are legally required to do so.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" number="5" title="Your Legal Rights">
        <p>
          Under applicable data protection laws, you have the following rights in relation to your personal data:
        </p>
        <LegalList
          items={[
            { label: "Right to Access", detail: "You can request a copy of your personal data that we hold." },
            { label: "Right to Correction", detail: "You can request that we correct any inaccurate or incomplete data." },
            { label: "Right to Erasure", detail: "You can request that we delete your personal data where there is no legitimate reason for us to continue processing it." },
            { label: "Right to Object", detail: "You have the right to object to the processing of your data in certain circumstances." },
          ]}
        />
      </LegalSection>

      <LegalSection id="contact" number="6" title="Contact Us">
        <p>
          If you have any questions about this Privacy Policy or our data practices, please contact our
          Data Protection Officer:
        </p>
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5 space-y-2">
          <p className="font-semibold text-gray-900">Finbyx Data Protection Office</p>
          <p>Email: <a href="mailto:privacy@finbyx.com" className="text-brand-700 hover:underline">privacy@finbyx.com</a></p>
          <p>Address: Mumbai, Maharashtra, India</p>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
