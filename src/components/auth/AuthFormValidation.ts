
export const validateAge = (birthDate: Date): boolean => {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 13;
  }
  return age >= 13;
};

export const validateSignUpForm = (
  email: string,
  dateOfBirth: Date | undefined,
  ageVerified: boolean
) => {
  if (!email) {
    return {
      isValid: false,
      error: {
        title: "Email Required",
        description: "Please provide an email address.",
      }
    };
  }

  if (!dateOfBirth) {
    return {
      isValid: false,
      error: {
        title: "Date of Birth Required",
        description: "Please select your date of birth.",
      }
    };
  }

  if (dateOfBirth >= new Date()) {
    return {
      isValid: false,
      error: {
        title: "Invalid Date of Birth",
        description: "Date of birth must be before today.",
      }
    };
  }

  if (!validateAge(dateOfBirth)) {
    return {
      isValid: false,
      error: {
        title: "Age Requirement",
        description: "You must be at least 13 years old to register.",
      }
    };
  }

  if (!ageVerified) {
    return {
      isValid: false,
      error: {
        title: "Age Verification Required",
        description: "Please confirm that you are at least 13 years of age.",
      }
    };
  }

  return { isValid: true };
};

export const validateSignInForm = (emailOrPhone: string) => {
  if (!emailOrPhone) {
    return {
      isValid: false,
      error: {
        title: "Contact Information Required",
        description: "Please provide either an email address or phone number.",
      }
    };
  }

  return { isValid: true };
};
