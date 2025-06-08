
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PersonalInfoFieldsProps {
  dateOfBirth: Date | undefined;
  setDateOfBirth: (date: Date | undefined) => void;
  ageVerified: boolean;
  setAgeVerified: (verified: boolean) => void;
}

const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
  dateOfBirth,
  setDateOfBirth,
  ageVerified,
  setAgeVerified,
}) => {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
          Date of Birth <span className="text-red-500">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal border-gray-200 focus:border-blue-500 focus:ring-blue-500",
                !dateOfBirth && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateOfBirth ? format(dateOfBirth, "PPP") : "Select your date of birth"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateOfBirth}
              onSelect={setDateOfBirth}
              disabled={(date) => date > today}
              initialFocus
              captionLayout="dropdown-buttons"
              fromYear={1900}
              toYear={today.getFullYear()}
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-gray-500">
          You must be at least 13 years old to register
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="ageVerification"
          checked={ageVerified}
          onCheckedChange={(checked) => setAgeVerified(checked as boolean)}
        />
        <Label
          htmlFor="ageVerification"
          className="text-sm text-gray-700 cursor-pointer"
        >
          I confirm that I am at least 13 years of age <span className="text-red-500">*</span>
        </Label>
      </div>
    </div>
  );
};

export default PersonalInfoFields;
