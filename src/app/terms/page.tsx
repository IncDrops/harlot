export default function TermsOfService() {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="mb-2">
          By using PollitAGo, you agree to the following:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Respect others when participating in polls or posting content.</li>
          <li>Do not post offensive, illegal, or misleading content.</li>
          <li>Use the service only as intended.</li>
        </ul>
        <p className="mb-2">
          We reserve the right to suspend or terminate accounts that violate these terms.
        </p>
        <p className="mb-2">
          This service is provided “as is” without warranty. Features and availability are subject to change.
        </p>
        <p className="mb-2">
          For questions, contact us at <a href="mailto:support@pollitago.com" className="text-blue-600 underline">support@pollitago.com</a>.
        </p>
      </div>
    );
  }
  