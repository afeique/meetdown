
import { supabase } from '@/integrations/supabase/client';
import { formatPhoneNumber } from '@/utils/phoneUtils';

interface SignUpData {
  emailOrPhone: string;
  password: string;
  firstName: string;
  lastName: string;
  inputType: 'email' | 'phone';
}

interface SignInData {
  emailOrPhone: string;
  password: string;
  inputType: 'email' | 'phone';
}

export const signUpUser = async (data: SignUpData) => {
  const { emailOrPhone, password, firstName, lastName, inputType } = data;

  if (inputType === 'email') {
    console.log('Attempting email signup for:', emailOrPhone);
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: emailOrPhone,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
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
    const formattedPhone = formatPhoneNumber(emailOrPhone);
    
    const { data: authData, error } = await supabase.auth.signUp({
      phone: formattedPhone,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
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
    const formattedPhone = formatPhoneNumber(emailOrPhone);
    
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
