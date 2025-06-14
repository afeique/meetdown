
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto py-6 px-6 border-t bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto text-center">
        <p className="text-sm text-gray-500 mb-2">
          By using this service, you agree to our legal terms
        </p>
        <div className="flex justify-center gap-4 text-xs">
          <Link 
            to="/privacy-policy" 
            className="text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-400">•</span>
          <Link 
            to="/terms" 
            className="text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
