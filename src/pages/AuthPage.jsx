import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  checkPasswordStrength,
  handleLogin,
  handleRegister,
} from "../services/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alertError, setAlertError] = useState("");
  const [shakeField, setShakeField] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const passwordStrength = useMemo(
    () => checkPasswordStrength(form.password),
    [form.password]
  );
  const confirmMatch =
    activeTab === "register" &&
    form.confirmPassword &&
    form.confirmPassword === form.password;

  function togglePasswordVisibility(target = "password") {
    if (target === "confirm") {
      setShowConfirmPassword((prev) => !prev);
      return;
    }
    setShowPassword((prev) => !prev);
  }

  function validateForm() {
    const nextErrors = {};
    if (activeTab === "register" && !form.name.trim()) {
      nextErrors.name = "Full name is required";
    }
    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(form.email)) {
      nextErrors.email = "Please enter a valid email address";
    }
    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }
    if (activeTab === "register") {
      if (!form.confirmPassword) {
        nextErrors.confirmPassword = "Please confirm your password";
      } else if (form.confirmPassword !== form.password) {
        nextErrors.confirmPassword = "Passwords do not match";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setAlertError("");
    setSuccess(false);

    if (!validateForm()) {
      const firstInvalid = Object.keys(errors)[0] || "email";
      setShakeField(firstInvalid);
      setTimeout(() => setShakeField(""), 400);
      return;
    }

    setLoading(true);
    try {
      if (activeTab === "login") {
        const result = await handleLogin(form.email, form.password);
        localStorage.setItem("token", result.token);
      } else {
        await handleRegister(form.name, form.email, form.password);
        localStorage.setItem("token", "mock-jwt-token-registered");
      }
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (error) {
      setAlertError(error.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function onFieldChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  const tabTranslate = activeTab === "login" ? "0%" : "100%";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-5">
        <aside className="relative overflow-hidden lg:col-span-2">
          <div className="absolute inset-0 animated-gradient bg-[length:200%_200%]" />
          <FloatingIcons />
          <div className="relative z-10 flex h-full flex-col justify-end p-8 sm:p-12">
            <p className="text-sm uppercase tracking-[0.35em] text-white/75">
              Serverless Platform
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
              File Upload System
            </h1>
            <p className="mt-4 max-w-md text-white/80">
              Secure cloud-native uploads powered by AWS Lambda, API Gateway,
              S3, and DynamoDB.
            </p>
          </div>
        </aside>

        <main className="flex items-center justify-center px-5 py-8 sm:px-10 lg:col-span-3 lg:px-12">
          <section
            className={`w-full max-w-xl rounded-3xl border border-white/25 bg-white/10 p-6 shadow-glow backdrop-blur-2xl transition-all duration-500 sm:p-8 ${
              success ? "scale-95 opacity-0" : "animate-card-enter"
            }`}
          >
            {alertError && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-300/30 bg-red-500/20 px-4 py-3 text-sm text-red-100 animate-slideDown">
                <span className="text-base">⚠</span>
                <p>{alertError}</p>
              </div>
            )}

            <div className="relative mb-6 grid grid-cols-2 rounded-xl bg-white/10 p-1">
              <span
                className="pointer-events-none absolute left-1 top-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-lg bg-primary/80 transition-transform duration-300"
                style={{ transform: `translateX(${tabTranslate})` }}
              />
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`relative z-10 rounded-lg py-2 text-sm font-semibold transition ${
                  activeTab === "login" ? "text-white" : "text-white/75"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`relative z-10 rounded-lg py-2 text-sm font-semibold transition ${
                  activeTab === "register" ? "text-white" : "text-white/75"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {activeTab === "register" && (
                <FloatingLabelInput
                  id="name"
                  label="Full Name"
                  value={form.name}
                  onChange={(v) => onFieldChange("name", v)}
                  error={errors.name}
                  shake={shakeField === "name"}
                />
              )}

              <FloatingLabelInput
                id="email"
                label="Email"
                value={form.email}
                onChange={(v) => onFieldChange("email", v)}
                error={errors.email}
                shake={shakeField === "email"}
              />

              <FloatingLabelInput
                id="password"
                label="Password"
                value={form.password}
                onChange={(v) => onFieldChange("password", v)}
                error={errors.password}
                type={showPassword ? "text" : "password"}
                onToggleVisibility={() => togglePasswordVisibility("password")}
                showToggle
                shake={shakeField === "password"}
              />

              {activeTab === "register" && (
                <PasswordStrength strength={passwordStrength} />
              )}

              {activeTab === "register" && (
                <FloatingLabelInput
                  id="confirmPassword"
                  label="Confirm Password"
                  value={form.confirmPassword}
                  onChange={(v) => onFieldChange("confirmPassword", v)}
                  error={errors.confirmPassword}
                  type={showConfirmPassword ? "text" : "password"}
                  onToggleVisibility={() => togglePasswordVisibility("confirm")}
                  showToggle
                  shake={shakeField === "confirmPassword"}
                  rightAdornment={
                    confirmMatch ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-300 animate-check-in">
                        ✓
                      </span>
                    ) : null
                  }
                />
              )}

              {activeTab === "login" && (
                <div className="flex items-center justify-between pt-1 text-sm text-white/80">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/30 bg-transparent text-primary focus:ring-primary/40"
                      checked={form.rememberMe}
                      onChange={(e) =>
                        onFieldChange("rememberMe", e.target.checked)
                      }
                    />
                    <span>Remember Me</span>
                  </label>
                  <button
                    type="button"
                    className="text-indigo-200 transition hover:text-white"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <RippleButton
                disabled={loading}
                className="mt-3 w-full rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-semibold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing...
                  </span>
                ) : activeTab === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </RippleButton>
            </form>
          </section>

          {success && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85">
              <div className="rounded-full border border-emerald-300/40 bg-emerald-500/20 p-6 text-4xl text-emerald-300 animate-success-pop">
                ✓
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FloatingLabelInput({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  showToggle = false,
  onToggleVisibility,
  shake = false,
  rightAdornment = null,
}) {
  return (
    <div className={shake ? "animate-shake" : ""}>
      <label className="group relative block">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`peer w-full rounded-xl border bg-white/5 px-4 pb-2.5 pt-5 text-sm text-white outline-none transition placeholder:text-transparent focus:bg-white/10 ${
            error
              ? "border-red-300/60 focus:border-red-300"
              : "border-white/25 focus:border-indigo-300/70"
          } ${showToggle || rightAdornment ? "pr-20" : ""}`}
          placeholder={label}
        />
        <span className="pointer-events-none absolute left-4 top-4 origin-left text-sm text-white/60 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-200 peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs">
          {label}
        </span>

        {showToggle && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-indigo-200 transition hover:text-white"
            onClick={onToggleVisibility}
          >
            {type === "password" ? "Show" : "Hide"}
          </button>
        )}
        {rightAdornment && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            {rightAdornment}
          </div>
        )}
      </label>
      {error && <p className="mt-1 text-xs text-red-200">{error}</p>}
    </div>
  );
}

function PasswordStrength({ strength }) {
  const widthByStrength = {
    weak: "w-1/3 bg-red-400",
    medium: "w-2/3 bg-yellow-400",
    strong: "w-full bg-emerald-400",
  };
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-white/70">Password Strength</span>
        <span className="font-medium capitalize text-white">{strength}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/20">
        <div
          className={`h-full transition-all duration-300 ${widthByStrength[strength]}`}
        />
      </div>
    </div>
  );
}

function FloatingIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <svg
        className="absolute left-12 top-16 h-12 w-12 text-white/30 animate-float"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M19.35 10.04A7.49 7.49 0 005.5 7.5 5.5 5.5 0 006 18h13a4 4 0 00.35-7.96z" />
      </svg>
      <svg
        className="absolute right-16 top-28 h-10 w-10 text-white/30 animate-float [animation-delay:1.5s]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M4 4h10l6 6v10a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm10 1.5V10h4.5L14 5.5z" />
      </svg>
      <svg
        className="absolute bottom-20 left-24 h-14 w-14 text-white/20 animate-float [animation-delay:2.7s]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5c0-1.1-.9-2-2-2zm-1 14H6v-2h12v2zm0-4H6V7h12v6z" />
      </svg>
    </div>
  );
}

function RippleButton({ children, className, disabled }) {
  const [ripple, setRipple] = useState(null);

  function createRipple(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    setRipple({ x, y, size, key: Date.now() });
    setTimeout(() => setRipple(null), 600);
  }

  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={createRipple}
      className={`relative overflow-hidden ${className}`}
    >
      {ripple && (
        <span
          key={ripple.key}
          className="pointer-events-none absolute rounded-full bg-white/40 animate-ripple"
          style={{
            width: ripple.size,
            height: ripple.size,
            left: ripple.x,
            top: ripple.y,
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
