
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { validateSignUpForm } from './AuthFormValidation';
import NameFields from './NameFields';
import ContactFields from './ContactFields';
import PersonalInfoFields from './PersonalInfoFields';

interface SignUpFormProps {
  onBack: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: undefined as Date | undefined,
    ageVerified: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Clear errors when form data changes
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [formData]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateSignUpForm(
      formData.email,
      formData.password,
      formData.dateOfBirth,
      formData.ageVerified
    );
    if (!validation.isValid) {
      if (validation.error) {
        toast({
          title: validation.error.title,
          description: validation.error.description,
          variant: "destructive",
        });
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            date_of_birth: formData.dateOfBirth?.toISOString().split('T')[0],
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account.",
      });

    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
      <CardHeader className="text-center space-y-2 pb-6">
        <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
          <UserPlus className="h-6 w-6" />
          Create Account
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-6">
          <NameFields
            firstName={formData.firstName}
            lastName={formData.lastName}
            setFirstName={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
            setLastName={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
          />

          <ContactFields
            email={formData.email}
            setEmail={(value) => setFormData(prev => ({ ...prev, email: value }))}
            password={formData.password}
            setPassword={(value) => setFormData(prev => ({ ...prev, password: value }))}
          />

          <PersonalInfoFields
            dateOfBirth={formData.dateOfBirth}
            setDateOfBirth={(value) => setFormData(prev => ({ ...prev, dateOfBirth: value }))}
            ageVerified={formData.ageVerified}
            setAgeVerified={(value) => setFormData(prev => ({ ...prev, ageVerified: value }))}
          />

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
