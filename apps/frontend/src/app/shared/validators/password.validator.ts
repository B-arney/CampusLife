import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validates that two form controls have matching values.
 * @param password The name of the first form control.
 * @param password2 The second form control to check against.
 * 
 * @returns True if the formControl values are the same, False otherwise
 */
export function passwordMatchValidator(password: string, password2: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(password);
    const matchingControl = formGroup.get(password2);

    if (!control || !matchingControl) {
      return null;
    }

    if (control.value !== matchingControl.value) {
      // könnyebb hibakezeléshez a hibajelzést a második mezőre rakjuk
      matchingControl.setErrors({ ...matchingControl.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // ha egyeznek passwordMismatch hiba eltávolítása a második mezőről
      if (matchingControl.errors) {
        const { passwordMismatch, ...otherErrors } = matchingControl.errors;
        matchingControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      }
    }

    // null ha nincs hiba
    return null;
  };
}

/**
 * Validates that a password meets strength requirements:
 * Min 8 chars, uppercase, lowercase, number, special char, and no '<' or '>'.
 * 
 * @returns True if the formControl passed all checks, False otherwise
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[^A-Za-z0-9\s<>]/.test(value);
    const hasForbiddenChars = /[<>]/.test(value);

    const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && !hasForbiddenChars;

    if (!isValid) {
      return {
        passwordStrength: {
          hasMinLength,
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasSpecialChar,
          hasForbiddenChars
        }
      };
    }
    
    return null;
  };
}