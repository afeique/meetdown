
import ProfileForm from './ProfileForm';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  date_of_birth: string;
}

interface ProfileFormSectionProps {
  formData: ProfileFormData;
  profile: {
    email_verified: boolean;
  } | null;
  saving: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ProfileFormSection = ({
  formData,
  profile,
  saving,
  onInputChange,
  onSubmit
}: ProfileFormSectionProps) => {
  return (
    <ProfileForm
      formData={formData}
      profile={profile}
      saving={saving}
      onInputChange={onInputChange}
      onSubmit={onSubmit}
    />
  );
};

export default ProfileFormSection;
