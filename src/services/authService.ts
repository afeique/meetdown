
import { supabase } from '@/integrations/supabase/client';
import { formatPhoneNumber } from '@/utils/phoneUtils';

interface SignUpData {
  emailOrPhone: string;
  password: string;
  firstName: string;
  lastName: string;
  inputType: 'email' | 'phone';
  dateOfBirth?: string;
  email?: string;
  phone?: string;
}

interface SignInData {
  emailOrPhone: string;
  password: string;
  inputType: 'email' | 'phone';
}

const formatPhoneForAuth = (phoneInput: string) => {
  // Remove all non-digit characters except +
  const cleaned = phoneInput.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, add +1 for US numbers
  if (cleaned.match(/^\d{10}$/)) {
    return formatPhoneNumber('+1', cleaned);
  }
  
  // If it starts with 1 and has 11 digits, add +
  if (cleaned.match(/^1\d{10}$/)) {
    return formatPhoneNumber(`+1`, cleaned.slice(1));
  }
  
  // If it already starts with +, format it properly
  if (cleaned.startsWith('+')) {
    const countryCode = cleaned.match(/^\+\d{1,3}/)?.[0] || '+1';
    const phoneNumber = cleaned.slice(countryCode.length);
    return formatPhoneNumber(countryCode, phoneNumber);
  }
  
  // For other formats, add + if not present
  const defaultCountryCode = '+1';
  return formatPhoneNumber(defaultCountryCode, cleaned);
};

export const signUpUser = async (data: SignUpData) => {
  const { emailOrPhone, password, firstName, lastName, inputType, dateOfBirth, email, phone } = data;

  if (inputType === 'email') {
    console.log('Attempting email signup for:', emailOrPhone);
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: emailOrPhone,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          email: email,
          phone: phone,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    return { data: authData, isEmail: true };
  } else {
    console.log('Attempting phone signup for:', emailOrPhone);
    const formattedPhone = formatPhoneForAuth(emailOrPhone);
    
    const { data: authData, error } = await supabase.auth.signUp({
      phone: formattedPhone,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          email: email,
          phone: phone,
        },
      },
    });

    if (error) {
      console.error('Phone signup error:', error);
      throw error;
    }

    return { data: authData, isEmail: false };
  }
};

export const signInUser = async (data: SignInData) => {
  const { emailOrPhone, password, inputType } = data;

  if (inputType === 'email') {
    console.log('Attempting email signin for:', emailOrPhone);
    const { error } = await supabase.auth.signInWithPassword({
      email: emailOrPhone,
      password,
    });

    if (error) {
      console.error('Email signin error:', error);
      throw error;
    }
  } else {
    console.log('Attempting phone signin for:', emailOrPhone);
    const formattedPhone = formatPhoneForAuth(emailOrPhone);
    
    const { error } = await supabase.auth.signInWithPassword({
      phone: formattedPhone,
      password,
    });

    if (error) {
      console.error('Phone signin error:', error);
      throw error;
    }
  }
};

export const getAuthErrorMessage = (error: any): string => {
  let errorMessage = error.message;
  
  // Handle specific error cases with more user-friendly messages
  if (error.message?.includes('Invalid login credentials')) {
    errorMessage = "Invalid email/phone or password. Please check your credentials and try again.";
  } else if (error.message?.includes('Email not confirmed')) {
    errorMessage = "Please check your email and click the verification link before signing in.";
  } else if (error.message?.includes('Signup requires a valid password')) {
    errorMessage = "Password must be at least 6 characters long.";
  } else if (error.message?.includes('User already registered')) {
    errorMessage = "An account with this email/phone already exists. Try signing in instead.";
  } else if (error.message?.includes('rate limit')) {
    errorMessage = "Too many attempts. Please wait a moment before trying again.";
  } else if (error.message?.includes('Invalid phone number format')) {
    errorMessage = "Please enter a valid phone number with country code (e.g., +1234567890).";
  }
  
  return errorMessage;
};
