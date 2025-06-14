
import { supabase } from '@/integrations/supabase/client';

interface SignUpData {
  emailOrPhone: string;
  password: string;
  firstName: string;
  lastName: string;
  inputType: 'email';
  dateOfBirth?: string;
  email?: string;
  phone?: string;
}

interface SignInData {
  emailOrPhone: string;
  password: string;
  inputType: 'email';
}

export const signUpUser = async (data: SignUpData) => {
  const { emailOrPhone, password, firstName, lastName, dateOfBirth, email, phone } = data;

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
};

export const signInUser = async (data: SignInData) => {
  const { emailOrPhone, password } = data;

  console.log('Attempting email signin for:', emailOrPhone);
  const { error } = await supabase.auth.signInWithPassword({
    email: emailOrPhone,
    password,
  });

  if (error) {
    console.error('Email signin error:', error);
    throw error;
  }
};

export const getAuthErrorMessage = (error: any): string => {
  let errorMessage = error.message;
  
  // Handle specific error cases with more user-friendly messages
  if (error.message?.includes('Invalid login credentials')) {
    errorMessage = "Invalid email or password. Please check your credentials and try again.";
  } else if (error.message?.includes('Email not confirmed')) {
    errorMessage = "Please check your email and click the verification link before signing in.";
  } else if (error.message?.includes('Signup requires a valid password')) {
    errorMessage = "Password must be at least 6 characters long.";
  } else if (error.message?.includes('User already registered')) {
    errorMessage = "An account with this email already exists. Try signing in instead.";
  } else if (error.message?.includes('rate limit')) {
    errorMessage = "Too many attempts. Please wait a moment before trying again.";
  }
  
  return errorMessage;
};
