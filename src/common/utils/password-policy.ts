// password-policy.ts

/** Throws an error if password does not meet policy */
export function assertPasswordPolicy(password: string): void {
  const errors: string[] = [];
  if (password.length < 6) errors.push('Password must be at least 6 characters long');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain at least one number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain at least one special character (!@#$%^&*)');

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
}
