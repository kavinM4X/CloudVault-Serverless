export function checkPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return "weak";
  if (score === 2) return "medium";
  return "strong";
}

export async function handleLogin(email, password) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }
  return { token: "mock-jwt-token-12345" };
}

export async function handleRegister(name, email, password) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  if (!name || !email || !password) {
    throw new Error("All register fields are required.");
  }
  return { success: true };
}
