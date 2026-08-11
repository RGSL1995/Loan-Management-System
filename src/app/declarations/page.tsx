import { LegalLayout } from "@/components/LegalLayout";

export default function Declarations() {
  return (
    <LegalLayout title="Declarations">
      <div className="space-y-6 text-gray-700">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">1. Eligibility, Location and Risk Declaration</h2>
          <p>
            By accessing and using this site, you hereby declare and confirm that:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>You are at least eighteen (18) years of age and possess the legal capacity to enter into a binding contract.</li>
            <li>You are accessing this Site from within India, and are not located in any jurisdiction where access to this Site would be contrary to applicable law.</li>
            <li>You understand that availing of a loan or credit facility involves financial risk, and you are solely responsible for evaluating such risk prior to proceeding.</li>
            <li>All information, documents, and data furnished by you on the Site are true, accurate, complete, and current as of the date of submission.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">2. Data Privacy and Consent Declaration</h2>
          <p>
            You hereby declare, acknowledge, and consent as follows:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>You have read and understood the Privacy Policy of Finbyx and consent to the collection, storage, processing, and disclosure of your Personal Data.</li>
            <li>You consent to Finbyx sharing your Personal Data with its NBFC Partners, Credit Information Companies (including CIBIL, Experian, Equifax), and KYC/e-KYC service providers for processing purposes.</li>
            <li>You consent to being contacted through SMS, electronic mail, telephone calls, WhatsApp, or other electronic modes for purposes connected with your loan account.</li>
          </ul>
        </section>
      </div>
    </LegalLayout>
  );
}
