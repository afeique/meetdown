
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Upload, Save, AlertCircle, CheckCircle, CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const formatDateInput = (value: string) => {
    // Remove all non-numeric characters
    const numbersOnly = value.replace(/\D/g, '');
    
    // Add slashes automatically
    if (numbersOnly.length >= 5) {
      return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}/${numbersOnly.slice(4, 8)}`;
    } else if (numbersOnly.length >= 3) {
      return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2)}`;
    } else if (numbersOnly.length >= 1) {
      return numbersOnly;
    }
    return '';
  };

  const convertToStorageFormat = (mmddyyyy: string) => {
    // Convert MM/DD/YYYY to YYYY-MM-DD for storage
    const parts = mmddyyyy.split('/');
    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[0]}-${parts[1]}`;
    }
    return mmddyyyy;
  };

  const convertFromStorageFormat = (yyyymmdd: string) => {
    // Convert YYYY-MM-DD to MM/DD/YYYY for display
    if (yyyymmdd && yyyymmdd.includes('-')) {
      const parts = yyyymmdd.split('-');
      if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
      }
    }
    return yyyymmdd;
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    const storageFormat = convertToStorageFormat(formatted);
    
    const event = {
      target: {
        name: 'date_of_birth',
        value: storageFormat
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(event);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const event = {
        target: {
          name: 'date_of_birth',
          value: formattedDate
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(event);
    }
    setIsCalendarOpen(false);
  };

  const selectedDate = formData.date_of_birth ? new Date(formData.date_of_birth) : undefined;
  const displayValue = convertFromStorageFormat(formData.date_of_birth);

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

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <div className="flex gap-2">
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="text"
                value={displayValue}
                onChange={handleDateInputChange}
                placeholder="MM/DD/YYYY"
                className="flex-1"
                maxLength={10}
              />
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    className="shrink-0"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
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
