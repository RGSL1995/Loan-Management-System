import { LegalLayout } from "@/components/LegalLayout";

export default function ServiceLevelAgreement() {
  return (
    <LegalLayout title="Service Level Agreement">
      <div className="space-y-6 text-gray-700">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">1. Overview</h2>
          <p>
            This Master Service Agreement ("Agreement") governs the use of the Finbyx technology platform ("Platform"). The Platform is a Loan Management System comprising loan origination, credit underwriting, sanction, disbursement, servicing, collections, and regulatory-reporting modules.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">2. Service Availability</h2>
          <p>
            The Company shall use commercially reasonable efforts to ensure that the Platform is available 99.9% of the time, excluding scheduled maintenance. "Business Hours" refer to standard operating times, excluding public holidays. Customers must provide prior written notice for support outside Business Hours.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">3. Customer Responsibilities</h2>
          <p>
            The Customer is responsible for securely managing "Access Keys" including developer IDs, certificate IDs, and application passwords. The Customer agrees to use the Application Programming Interfaces (APIs) solely in compliance with Applicable Law, including regulations issued by the RBI and the Digital Personal Data Protection Act, 2023.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">4. Support and Maintenance</h2>
          <p>
            The Company provides ongoing technical support and maintenance for the Platform. Any critical issues impacting business operations will be addressed based on the severity and response times detailed in the applicable Statement of Work (SOW).
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
