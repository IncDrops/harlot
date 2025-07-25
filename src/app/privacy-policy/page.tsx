export default function PrivacyPolicy() {
    return (
      <div className="bg-background text-foreground min-h-screen">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <h1 className="text-4xl font-bold font-heading mb-6 metallic-gradient">Privacy Policy</h1>
          <div className="prose prose-invert text-foreground/80 space-y-4">
            <p>
              This Privacy Policy describes how Pollitago.ai ("we," "us," or "our") handles information when you use our website and services. Your privacy is important to us.
            </p>
            <h2 className="text-2xl font-bold font-heading">1. No User Accounts</h2>
            <p>
              Pollitago.ai is designed to be used without creating an account. We do not require you to sign up, log in, or provide any personal identification information like your name or email address to use our core service.
            </p>
            <h2 className="text-2xl font-bold font-heading">2. Information We Collect</h2>
            <p>
              The only information we actively collect from you is the text you voluntarily submit in the decision input field. This information is used solely to generate the AI-powered second opinion you request.
            </p>
             <ul className="list-disc pl-6 space-y-2">
                <li><strong>Decision Inputs:</strong> We collect the dilemma, question, or context you provide. This data is sent to our AI model to generate a response.</li>
                <li><strong>Anonymized Usage Data:</strong> We may collect anonymous data about interaction with our Service (e.g., which buttons are clicked, session duration) using privacy-focused analytics tools to help us improve our offerings. This data is aggregated and cannot be tied back to an individual.</li>
            </ul>
            <h2 className="text-2xl font-bold font-heading">3. How We Use Information</h2>
            <p>
                Your decision inputs are used for the following purposes:
            </p>
             <ul className="list-disc pl-6 space-y-2">
                <li>To provide, maintain, and improve the Pollitago.ai service.</li>
                <li>To process your request and generate the AI analysis.</li>
                <li>To monitor and analyze trends and usage.</li>
                <li>Your inputs may be used to train and refine our AI models. We take steps to anonymize this data where possible, but we strongly advise you **NOT to submit any personal, sensitive, private, or confidential information.**</li>
            </ul>
             <h2 className="text-2xl font-bold font-heading">4. Data Storage and Security</h2>
             <p>
                We do not permanently store your specific query tied to any session identifier after the analysis is provided. We implement reasonable security measures to protect the information we handle, but no security system is impenetrable.
            </p>
            <h2 className="text-2xl font-bold font-heading">5. Third-Party Services</h2>
             <p>
                We use third-party payment processors (e.g., Stripe, Coinbase Commerce) to handle transactions. When you make a payment, you are providing your information directly to them, and their privacy policies will govern the use of that information. We do not receive or store your credit card or crypto wallet details.
            </p>
            <h2 className="text-2xl font-bold font-heading">6. Your Rights</h2>
            <p>
              Since we do not collect personal data that identifies you, traditional data rights like access or deletion of a personal profile are not applicable. The primary data you provide is your query, which is processed ephemerally for the AI response.
            </p>
            <p>
              For questions about this policy, contact us at <a href="mailto:privacy@pollitago.com" className="text-primary hover:underline">privacy@pollitago.com</a>.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
