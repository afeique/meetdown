
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateOfBirthFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateOfBirthField = ({ value, onChange }: DateOfBirthFieldProps) => {
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
    onChange(event);
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
      onChange(event);
    }
    setIsCalendarOpen(false);
  };

  const selectedDate = value ? new Date(value) : undefined;
  const displayValue = convertFromStorageFormat(value);

  return (
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
  );
};

export default DateOfBirthField;
