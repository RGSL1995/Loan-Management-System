import { LegalLayout, LegalSection } from "@/components/LegalLayout";

const SECTIONS = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "description", label: "Description of Service" },
  { id: "obligations", label: "User Obligations" },
  { id: "ip", label: "Intellectual Property" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing Law" },
];

export default function TermsAndConditions() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      description="Please read these terms carefully before using the RGSL platform. By accessing our service, you agree to be bound by these terms."
      sections={SECTIONS}
    >
      <LegalSection id="acceptance" number="1" title="Acceptance of Terms">
        <p>
          By accessing and using the RGSL platform ("the Service"), you accept and agree to be bound by
          the terms and provisions of this agreement. In addition, when using these particular services,
          you shall be subject to any posted guidelines or rules applicable to such services.
        </p>
        <p>
          If you do not agree with any part of these terms, you may not use our Service. We reserve the
          right to update these terms at any time, and your continued use of the platform constitutes
          acceptance of any changes.
        </p>
      </LegalSection>

      <LegalSection id="description" number="2" title="Description of Service">
        <p>
          RGSL provides a cloud-hosted Loan Management System (LMS) covering the complete lending
          lifecycle, including borrower onboarding, origination, underwriting, servicing, collections,
          recovery, and full RBI regulatory and Credit Information Company reporting.
        </p>
        <p>
          The platform is accessible entirely through a browser, with a field application for on-ground
          collections staff. RGSL is a technology service provider and does not directly engage in
          any lending activities.
        </p>
      </LegalSection>

      <LegalSection id="obligations" number="3" title="User Obligations">
        <p>
          Users must provide true, accurate, current, and complete information when creating an account
          or interacting with the platform. You are responsible for maintaining the confidentiality of
          your account credentials and for all activities that occur under your account.
        </p>
        <p>
          You agree not to use the service for any unlawful purpose, to transmit any malicious code, or
          to attempt to gain unauthorized access to any part of the platform. Violations may result in
          immediate termination of your account.
        </p>
      </LegalSection>

      <LegalSection id="ip" number="4" title="Intellectual Property">
        <p>
          All content included on the Service — including text, graphics, logos, images, software, and
          the compilation thereof — is the property of RGSL or its suppliers and is protected by
          copyright, trademark, and other intellectual property laws.
        </p>
        <p>
          You are granted a limited, non-exclusive, non-transferable license to access and use the
          platform for your internal business purposes. You may not reproduce, distribute, or create
          derivative works without our express written permission.
        </p>
      </LegalSection>

      <LegalSection id="termination" number="5" title="Termination">
        <p>
          We reserve the right to terminate or suspend your account and access to the Service at our
          sole discretion, without notice, for conduct that we believe violates these Terms or is
          harmful to other users, us, or third parties, or for any other reason.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" number="6" title="Governing Law">
        <p>
          These Terms shall be governed and construed in accordance with the laws of India, without
          regard to its conflict of law provisions. Any disputes arising under these Terms will be
          subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
