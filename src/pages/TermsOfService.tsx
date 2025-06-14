
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <p className="text-gray-700 leading-relaxed">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Meetdown, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed">
                Meetdown is a social platform that allows users to create, discover, and attend local events. Our service enables 
                users to connect with like-minded individuals in their community through various activities and gatherings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Accounts</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times.</p>
                <p>You are responsible for safeguarding the password and for maintaining the confidentiality of your account.</p>
                <p>You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. User Content and Conduct</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>You are solely responsible for any content you post, upload, or share through our service.</p>
                <p>You agree not to use the service to:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Post content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable</li>
                  <li>Impersonate any person or entity or falsely state your affiliation with a person or entity</li>
                  <li>Interfere with or disrupt the service or servers or networks connected to the service</li>
                  <li>Spam, solicit, or harass other users</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Events and Meetups</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>Event organizers are responsible for the accuracy of event information and the safety of attendees.</p>
                <p>Meetdown is not responsible for the conduct of event organizers or attendees at events.</p>
                <p>Users attend events at their own risk and should exercise proper judgment and caution.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, 
                to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The service and its original content, features, and functionality are and will remain the exclusive property of 
                Meetdown and its licensors. The service is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, 
                under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                The information on this service is provided on an "as is" basis. To the fullest extent permitted by law, 
                Meetdown excludes all representations, warranties, and conditions relating to our service and the use of this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall Meetdown, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable 
                for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of 
                profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is 
                material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at support@meetdown.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
