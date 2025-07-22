
export default function PrivacyPolicy() {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-2">
          This policy outlines how Pollitago handles your information when you use our strategic analysis services.
        </p>
        <h2 className="text-2xl font-bold mt-6 mb-3">Information We Collect</h2>
        <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Account Information:</strong> When you sign up, we collect your email address and basic profile information (like your name) to create and manage your account.</li>
            <li><strong>Analysis Inputs:</strong> We collect the decision questions, context, and any other data you provide when you create a new analysis. This information is necessary to generate the strategic recommendations.</li>
            <li><strong>Usage Data:</strong> We may collect anonymized data about how you interact with our application to help us improve our services.</li>
        </ul>
        <h2 className="text-2xl font-bold mt-6 mb-3">How We Use Information</h2>
         <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>To provide, maintain, and improve the Pollitago service.</li>
            <li>To generate strategic analyses and recommendations as requested by you.</li>
            <li>Your analysis inputs may be used to train and refine our AI models, but we will take steps to anonymize this data where possible to protect your privacy.</li>
        </ul>
        <p className="mb-2">
          We do not sell, rent, or share your personal data with third parties for their marketing purposes.
        </p>
        <p className="mb-2">
          You may request the deletion of your account and associated data at any time by emailing us at <a href="mailto:support@pollitago.com" className="text-primary hover:underline">support@pollitago.com</a>.
        </p>
      </div>
    );
  }
  
