
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Save, AlertCircle, CheckCircle } from 'lucide-react';
import DateOfBirthField from './DateOfBirthField';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  date_of_birth: string;
}

interface ProfileFormProps {
  formData: ProfileFormData;
  profile: {
    email_verified: boolean;
  } | null;
  saving: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ProfileForm = ({
  formData,
  profile,
  saving,
  onInputChange,
  onSubmit
}: ProfileFormProps) => {
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
              <Label htmlFor="email" className="text-xs text-yellow-600">
                Email verification required. You'll need to verify your email after updating.
              </Label>
            )}
          </div>

          <DateOfBirthField
            value={formData.date_of_birth}
            onChange={onInputChange}
          />

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

export default ProfileForm;
