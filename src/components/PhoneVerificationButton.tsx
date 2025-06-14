
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, CheckCircle } from 'lucide-react';
import PhoneVerificationModal from './PhoneVerificationModal';

interface PhoneVerificationButtonProps {
  isVerified: boolean;
  phone?: string;
  onVerificationSuccess: () => void;
}

const PhoneVerificationButton: React.FC<PhoneVerificationButtonProps> = ({
  isVerified,
  phone,
  onVerificationSuccess,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle size={16} />
        <span className="text-sm">Phone Verified</span>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2"
      >
        <Phone size={16} />
        Verify Phone
      </Button>
      
      <PhoneVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onVerificationSuccess}
        initialPhone={phone || ''}
      />
    </>
  );
};

export default PhoneVerificationButton;
