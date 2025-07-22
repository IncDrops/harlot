
export default function TermsOfService() {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="mb-2">
          By using Pollitago, you agree to the following:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>You will use our services for lawful and ethical purposes only.</li>
          <li>The strategic advice provided by the AI is for informational purposes and should not be considered a substitute for professional human judgment.</li>
          <li>Do not input sensitive, classified, or personally identifiable information that you are not authorized to share.</li>
          <li>You are responsible for the decisions you make based on the analysis provided by Pollitago.</li>
        </ul>
        <p className="mb-2">
          We reserve the right to suspend or terminate accounts that violate these terms.
        </p>
        <p className="mb-2">
          This service is provided “as is” without warranty. Features and availability are subject to change.
        </p>
        <p className="mb-2">
          For questions, contact us at <a href="mailto:support@pollitago.com" className="text-primary hover:underline">support@pollitago.com</a>.
        </p>
      </div>
    );
  }
  
