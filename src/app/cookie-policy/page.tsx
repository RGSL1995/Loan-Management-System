import { LegalLayout } from "@/components/LegalLayout";

export default function CookiePolicy() {
  return (
    <LegalLayout title="Cookie Policy">
      <div className="space-y-6 text-gray-700">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">2. How We Use Cookies</h2>
          <p>
            Finbyx uses cookies to enhance your experience on our platform. The cookies we use generally fall into the following categories:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Strictly Necessary Cookies:</strong> These are essential for you to browse the website and use its features, such as accessing secure areas of the site.</li>
            <li><strong>Performance Cookies:</strong> These cookies collect information about how you use our website, like which pages you visited and which links you clicked on. None of this information can be used to identify you.</li>
            <li><strong>Functional Cookies:</strong> These allow our website to remember choices you make (such as your user name, language, or the region you are in) and provide enhanced, more personal features.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">3. Managing Cookies</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
