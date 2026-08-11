import { LegalLayout, LegalSection } from "@/components/LegalLayout";

const SECTIONS = [
  { id: "general", label: "General Information" },
  { id: "financial", label: "Financial Disclaimer" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "links", label: "External Links" },
];

export default function Disclaimer() {
  return (
    <LegalLayout
      title="Disclaimer"
      description="Important notices about the nature of information provided on the RGSL platform and the limits of our liability."
      sections={SECTIONS}
    >
      <LegalSection id="general" number="1" title="General Information">
        <p>
          The information provided by RGSL on our website and platform is for general informational
          purposes only. All information on the Site is provided in good faith; however, we make no
          representation or warranty of any kind, express or implied, regarding the accuracy, adequacy,
          validity, reliability, availability, or completeness of any information on the Site.
        </p>
      </LegalSection>

      <LegalSection id="financial" number="2" title="Financial Disclaimer">
        <p>
          RGSL acts solely as a technology service provider to its NBFC Partners. Any loan or credit
          facility, if sanctioned, shall be extended solely by the relevant NBFC Partner — being an entity
          regulated by the Reserve Bank of India — and not by RGSL itself.
        </p>
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-900">
          <p className="font-semibold text-sm mb-1">⚠ Important Notice</p>
          <p className="text-sm">
            The RGSL platform does <strong>not</strong> constitute financial, investment, or legal advice.
            Users should always consult qualified advisors for specific guidance.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="liability" number="3" title="Limitation of Liability">
        <p>
          To the maximum extent permitted by Applicable Law, RGSL disclaims all liability for any loss
          or damage arising from reliance on content, outputs, or third-party links referred to in this
          Disclaimer, subject to the fuller limitation of liability and indemnification provisions set out
          in our Terms and Conditions.
        </p>
      </LegalSection>

      <LegalSection id="links" number="4" title="External Links">
        <p>
          Our platform may contain links to external websites that are not provided or maintained by us.
          Please note that RGSL does not guarantee the accuracy, relevance, timeliness, or completeness
          of any information on these external websites.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
