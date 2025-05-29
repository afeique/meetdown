
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="flex items-center p-6 border-b bg-white/80 backdrop-blur-sm">
        <Link to="/">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-red-500 to-orange-500 bg-clip-text text-transparent ml-4">
          meetdown
        </h1>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Messaging Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <p className="text-gray-700 leading-relaxed">
              This Messaging Program Privacy Policy explains how Meetdown, Inc. collects and uses information about you in relation to its text message marketing program (the "Messaging Service"). We use Mobile Text Alerts to provide the Messaging Service to you. For the purposes of the Messaging Service, Mobile Text Alerts acts as our service provider and data processor of your information.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Collection of Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect various information on our behalf from and about you, including information you directly provide when you use the Messaging Service. For example, we collect the phone number and email address you provided when signing up for the Messaging Service. When you send messages via the Messaging Service, we will also collect your messaging history and any information included in those messages.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may also collect information about you using cookies or similar technologies. Cookies are pieces of information that are stored by your browser on the hard drive or memory of your device. Cookies enable personalization of your experience on the Messaging Service (e.g., sending you personalized text messages such as shopping cart reminders).
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you participate in a contest, sweepstakes, research study, or email survey associated with the Messaging Service, we will collect basic contact information and any other information you choose to provide in connection with these activities. We will also collect your contact information if you contact us with questions about the Messaging Service or for customer service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Use of Information</h2>
              <p className="text-gray-700 leading-relaxed">
                We use your information to deliver, analyze, maintain and support the Messaging Service. We may also use your information to enhance the Messaging Service features and customize and personalize your experiences on the Messaging Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sharing of Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share, transfer, or disclose your information, if you consent to us doing so, as well as in the following circumstances:
              </p>
              <div className="ml-4 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Service Providers</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We may share your information with third parties to help us provide the Messaging Service to you.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Legal Requirement and Protection of Mobile Text Alerts and Others</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We may disclose your information as we believe such disclosure is necessary or appropriate to: (i) comply with applicable law and legal processes; (ii) respond to requests from public and government authorities, including public and government authorities outside your country of residence; (iii) enforce a contract with us; (iv) protect our rights, privacy, safety, or property, and/or that of our affiliates, you or others; and (v) allow us to pursue available remedies or limit the damages that we may sustain.
                  </p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                From time to time, we may share aggregate or de-identified information about use of the Messaging Service and such aggregated or de-identified information may be shared with any third party, including advertisers, promotional partners, and sponsors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Protection of Information</h2>
              <p className="text-gray-700 leading-relaxed">
                We take a variety of physical, technical, administrative, and organizational security measures based on the sensitivity of the information we collect to protect your information against accidental or unlawful destruction or accidental loss, alteration, unauthorized disclosure or access. Unfortunately, no online activity can be guaranteed to be 100% secure. While we strive to protect your information against unauthorized use or disclosure, we cannot ensure or warrant the security of any information you provide. We do not accept liability for unintentional disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Retention of Information</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your information for as long as you participate in the Messaging Service or as needed to comply with applicable legal obligations. We will also retain and use your information as necessary to resolve disputes, protect us and our customers, and enforce our agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Choices and Controls</h2>
              <p className="text-gray-700 leading-relaxed">
                Consent to receive automated marketing text messages is not a condition of any purchase. You can opt-out of receiving further commercial text messages via the Messaging Service by responding to any of our text messages with any of the following replies: STOP or UNSUBSCRIBE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Customer Care</h2>
              <p className="text-gray-700 leading-relaxed">
                If you are experiencing any problems with the Messaging Service, please visit{' '}
                <a 
                  href="https://mobile-text-alerts.zendesk.com/hc/en-us/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  https://mobile-text-alerts.zendesk.com/hc/en-us/
                </a>{' '}
                and submit the form with details about your problem or your request for support, or email{' '}
                <a 
                  href="mailto:contact@mobile-text-alerts.com"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  contact@mobile-text-alerts.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
