"use client";

import { ArrowUpRight, Eye, EyeOff, LockKeyhole, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!loginError) return;
    const timeout = window.setTimeout(() => setLoginError(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [loginError]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!mobile) {
      setMobileError("Please enter your mobile number.");
      return;
    }
    if (!/^\d+$/.test(mobile)) {
      setMobileError("Mobile number must contain numbers only.");
      return;
    }
    setMobileError("");
    setLoginError("");
    setProcessing(true);
    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({ mobile, password: form.password.value }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Please Submit valid credentials");
      }
      router.push("/dashboard");
    } catch (error) {
      setProcessing(false);
      setMobile("");
      form.password.value = "";
      setLoginError(error instanceof Error ? error.message : "Login failed. Please try again.");
    }
  };

  return (
    <>
      {loginError && <div className="login-error-popup" role="alert" aria-live="assertive">{loginError}</div>}
      <form className="login-form" onSubmit={submit}>
      <div className="login-form-heading">
        <span className="login-form-icon" aria-hidden="true"><LockKeyhole size={21} /></span>
        <div>
          <span className="eyebrow">Admin access</span>
          <h2 className="serif">Welcome back.</h2>
        </div>
      </div>
      <p className="login-form-intro">Sign in to stay connected with the people and opportunities in our community.</p>
      <div className="login-field">
        <label htmlFor="mobile">Mobile number</label>
        <div className="login-input-wrap">
          <Smartphone size={18} aria-hidden="true" />
          <input id="mobile" name="mobile" type="tel" inputMode="numeric" autoComplete="tel" placeholder="Enter your mobile number" value={mobile} maxLength={10} onChange={(event) => { setMobile(event.target.value.replace(/\D/g, "").slice(0, 10)); setMobileError(""); }} pattern="[0-9]+" aria-invalid={!!mobileError} aria-describedby={mobileError ? "mobile-error" : undefined} required />
        </div>
        {mobileError && <span className="field-error" id="mobile-error">{mobileError}</span>}
      </div>
      <div className="login-field">
        <label htmlFor="password">Password</label>
        <div className="login-input-wrap">
          <LockKeyhole size={18} aria-hidden="true" />
          <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required />
          <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div className="login-options">
        <label className="remember-me"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> <span>Remember me</span></label>
        <button className="forgot-password" type="button">Forgot password?</button>
      </div>
      <button className="button button-primary login-submit" type="submit" disabled={processing}>{processing ? "Signing in..." : "Login"} {!processing && <ArrowUpRight size={17} />}</button>
      <p className="login-note">New to the network? <a href="/registration">Register with us</a></p>
      </form>
    </>
  );
}