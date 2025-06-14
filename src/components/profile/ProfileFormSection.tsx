
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Save, AlertCircle, CheckCircle } from 'lucide-react';
import PhoneInput from '@/components/ui/phone-input';
import PhoneVerificationButton from '../PhoneVerificationButton';
import { formatPhoneForDisplay } from '@/utils/phoneUtils';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
  date_of_birth: string;
}

interface ProfileFormSectionProps {
  formData: ProfileFormData;
  profile: {
    email_verified: boolean;
    phone_verified: boolean;
  } | null;
  saving: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPhoneVerificationSuccess: () => void;
  getFullPhoneNumber: () => string;
}

const ProfileFormSection = ({
  formData,
  profile,
  saving,
  onInputChange,
  onPhoneChange,
  onSubmit,
  onPhoneVerificationSuccess,
  getFullPhoneNumber
}: ProfileFormSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={onInputChange}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={onInputChange}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              Email Address
              {profile?.email_verified ? (
                <div title="Email verified">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              ) : (
                <div title="Email not verified">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                </div>
              )}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onInputChange}
              placeholder="john.doe@example.com"
            />
            {!profile?.email_verified && formData.email && (
              <p className="text-xs text-yellow-600">
                Email verification required. You'll need to verify your email after updating.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label className="flex items-center gap-2">
                Phone Number
                {profile?.phone_verified ? (
                  <div title="Phone verified">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                ) : (
                  <div title="Phone not verified">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  </div>
                )}
              </Label>
              <PhoneInput
                phoneNumber={formatPhoneForDisplay(formData.phone)}
                onPhoneNumberChange={onPhoneChange}
                label=""
                placeholder="(555) 555-5555"
              />
              <PhoneVerificationButton
                isVerified={profile?.phone_verified || false}
                fullPhoneNumber={getFullPhoneNumber()}
                onVerificationSuccess={onPhoneVerificationSuccess}
              />
              {!profile?.phone_verified && formData.phone && (
                <p className="text-xs text-yellow-600">
                  Click "Verify Phone" to verify your phone number.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={onInputChange}
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {saving ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileFormSection;
