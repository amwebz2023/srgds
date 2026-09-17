"use client";

import { ArrowUpRight, Eye, EyeOff, LockKeyhole, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
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
    if (!email) {
      setMobileError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMobileError("Please enter a valid email address.");
      return;
    }
    setMobileError("");
    setLoginError("");
    setProcessing(true);
    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({ email, password: form.password.value }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(response.status === 401 ? "Please Submit valid credentials" : result?.error || "Login is temporarily unavailable.");
      }
      router.push("/dashboard");
    } catch (error) {
      setProcessing(false);
      setEmail("");
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
        <label htmlFor="email">Email address</label>
        <div className="login-input-wrap">
          <Smartphone size={18} aria-hidden="true" />
          <input id="email" name="email" type="email" autoComplete="username" placeholder="Enter your email address" value={email} onChange={(event) => { setEmail(event.target.value.toLowerCase()); setMobileError(""); }} aria-invalid={!!mobileError} aria-describedby={mobileError ? "mobile-error" : undefined} required />
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