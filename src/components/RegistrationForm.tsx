"use client";

import { CheckCircle2, ChevronDown } from "lucide-react";
import { FormEvent, useState } from "react";

type FormData = Record<string, string>;
const initial: FormData = {
  title: "",
  firstName: "",
  lastName: "",
  gender: "",
  mobile: "",
  email: "",
  dob: "",
  blood: "",
  city: "",
  sslcSchool: "",
  sslcYear: "",
  hscSchool: "",
  hscYear: "",
  profession: "",
  otherProfession: "",
  workLocation: "",
  achievements: "",
};
const years = Array.from({ length: 65 }, (_, index) =>
  String(new Date().getFullYear() - index),
);

function Field({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  placeholder,
  children,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children || (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(name, event.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      )}
      {error && (
        <span className="field-error" id={`${name}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
function Select({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
}: {
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="select-wrap">
      <select
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown size={16} />
    </div>
  );
}

export function RegistrationForm() {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState<FormData>({});
  const [submitted, setSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const update = (name: string, value: string) => {
    const normalized =
      name === "firstName" || name === "lastName"
        ? value.replace(/[^a-zA-Z\s]/g, "")
        : name === "mobile"
          ? value.replace(/\D/g, "").slice(0, 10)
          : name === "email"
            ? value.toLowerCase()
            : value;
    setData((prev) => ({ ...prev, [name]: normalized }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: FormData = {};
    const requiredFields = [
      ["title", "Please select a title."],
      ["gender", "Please select your gender."],
      ["email", "Please enter your email address."],
      ["blood", "Please select your blood group."],
      ["city", "Please enter your current city."],
      ["sslcSchool", "Please enter your SSLC school name."],
      ["sslcYear", "Please select your SSLC passing year."],
      ["hscSchool", "Please enter your HSC school name."],
      ["hscYear", "Please select your HSC passing year."],
      ["profession", "Please select your profession."],
      ["otherProfession", "Please enter your profession."],
      ["workLocation", "Please enter your work location."],
    ] as const;
    requiredFields.forEach(([name, message]) => {
      if (!data[name]) next[name] = message;
    });
    if (!data.firstName.trim())
      next.firstName = "Please enter your first name.";
    else if (!/^[a-zA-Z ]+$/.test(data.firstName))
      next.firstName = "Use letters and spaces only.";
    if (!data.lastName.trim()) next.lastName = "Please enter your last name.";
    else if (!/^[a-zA-Z ]+$/.test(data.lastName))
      next.lastName = "Use letters and spaces only.";
    if (!/^[6-9]\d{9}$/.test(data.mobile))
      next.mobile = "Enter a valid 10-digit Indian mobile number.";
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(data.email))
      next.email = "Enter a valid email address.";
    if (!data.dob) next.dob = "Please enter your date of birth.";
    else if (data.dob > new Date().toISOString().split("T")[0])
      next.dob = "Date of birth cannot be in the future.";
    setErrors(next);
    const firstInvalidField = Object.keys(next)[0];
    if (firstInvalidField) {
      requestAnimationFrame(() => {
        const field = document.querySelector<HTMLElement>(
          `[name="${firstInvalidField}"]`,
        );
        field?.scrollIntoView({ behavior: "smooth", block: "center" });
        field?.focus({ preventScroll: true });
      });
      return;
    }
    setProcessing(true);
    setSubmitError("");
    window.setTimeout(async () => {
      try {
        const response = await fetch("/api/registrations", {
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.error || "Registration could not be saved.");
        }

        setData(initial);
        setErrors({});
        setProcessing(false);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        setProcessing(false);
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Registration could not be saved. Please try again.",
        );
      }
    }, 650);
  };
  const reset = () => {
    setData(initial);
    setErrors({});
    setSubmitted(false);
  };
  if (submitted)
    return (
      <div className="success-state">
        <CheckCircle2 size={48} />
        <h2 className="serif">Registration completed successfully.</h2>
        <p>
          Thank you for registering with SRGDS Alumni. We’re glad to have
          you with us.
        </p>
        <button className="button button-dark" onClick={reset}>
          Submit another registration
        </button>
      </div>
    );
  return (
    <form className="registration-form" onSubmit={submit} noValidate>
      {submitError && <p className="field-error">{submitError}</p>}
      <FormSection number="01" title="Personal information">
        <div className="form-grid three">
          <Field
            label="Title"
            name="title"
            value={data.title}
            onChange={update}
          >
            <Select
              name="title"
              value={data.title}
              onChange={update}
              options={["Mr.", "Mrs.", "Ms.", "Dr.", "Other"]}
            />
          </Field>
          <Field
            label="First name"
            name="firstName"
            value={data.firstName}
            onChange={update}
            error={errors.firstName}
            required
            placeholder="Your first name"
          />
          <Field
            label="Last name"
            name="lastName"
            value={data.lastName}
            onChange={update}
            error={errors.lastName}
            required
            placeholder="Your last name"
          />
        </div>
        <div className="form-grid three">
          <Field
            label="Gender"
            name="gender"
            value={data.gender}
            onChange={update}
            error={errors.gender}
            required
          >
            <Select
              name="gender"
              value={data.gender}
              onChange={update}
              options={["Male", "Female", "Other", "Prefer not to say"]}
            />
          </Field>
          <Field
            label="Mobile number"
            name="mobile"
            value={data.mobile}
            onChange={update}
            error={errors.mobile}
            required
            type="tel"
            placeholder="10-digit mobile number"
          />
          <Field
            label="Email address"
            name="email"
            value={data.email}
            onChange={update}
            error={errors.email}
            type="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="form-grid three">
          <Field
            label="Date of birth"
            name="dob"
            value={data.dob}
            onChange={update}
            error={errors.dob}
            required
            type="date"
          />
          <Field
            label="Blood group"
            name="blood"
            value={data.blood}
            onChange={update}
          >
            <Select
              name="blood"
              value={data.blood}
              onChange={update}
              options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
            />
          </Field>
          <Field
            label="Current city"
            name="city"
            value={data.city}
            onChange={update}
            placeholder="e.g. Chennai"
          />
        </div>
      </FormSection>
      <FormSection number="02" title="Educational information">
        <div className="education-card">
          <h3>SSLC details</h3>
          <div className="form-grid">
            <Field
              label="School name"
              name="sslcSchool"
              value={data.sslcSchool}
              onChange={update}
              placeholder="School name"
            />
            <Field
              label="Year of passing"
              name="sslcYear"
              value={data.sslcYear}
              onChange={update}
            >
              <Select
                name="sslcYear"
                value={data.sslcYear}
                onChange={update}
                options={years}
              />
            </Field>
          </div>
        </div>
        <div className="education-card">
          <h3>HSC details</h3>
          <div className="form-grid">
            <Field
              label="School name"
              name="hscSchool"
              value={data.hscSchool}
              onChange={update}
              placeholder="School name"
            />
            <Field
              label="Year of passing"
              name="hscYear"
              value={data.hscYear}
              onChange={update}
            >
              <Select
                name="hscYear"
                value={data.hscYear}
                onChange={update}
                options={years}
              />
            </Field>
          </div>
        </div>
      </FormSection>
      <FormSection number="03" title="Professional information">
        <div className="form-grid">
          <Field
            label="Profession"
            name="profession"
            value={data.profession}
            onChange={update}
          >
            <Select
              name="profession"
              value={data.profession}
              onChange={update}
              options={[
                "Software / IT",
                "Government Employee",
                "Private Employee",
                "Business",
                "Doctor",
                "Engineer",
                "Teacher",
                "Lawyer",
                "Student",
                "Self Employed",
                "Freelancer",
                "Other",
              ]}
            />
          </Field>
          <Field
            label="Tell us your profession"
            name="otherProfession"
            value={data.otherProfession}
            onChange={update}
            error={errors.otherProfession}
            required
            placeholder="Describe your profession"
          />
        </div>
        <Field
          label="Work location"
          name="workLocation"
          value={data.workLocation}
          onChange={update}
          placeholder="Chennai, Tamil Nadu"
        />
      </FormSection>
      <FormSection number="04" title="Sports & achievements">
        <div className="form-field">
          <label htmlFor="achievements">Sports / Achievements</label>
          <span className="helper-text">
            If you are a sports person or have any notable achievements, kindly
            mention them below.
          </span>
          <textarea
            id="achievements"
            name="achievements"
            rows={6}
            value={data.achievements}
            onChange={(event) => update("achievements", event.target.value)}
            placeholder="Mention your sports activities, awards, achievements, certifications, or other accomplishments..."
          />
        </div>
      </FormSection>
      <div className="form-actions">
        <button
          className="button button-primary"
          type="submit"
          disabled={processing}
        >
          {processing ? "Submitting..." : "Submit registration"}{" "}
          {!processing && <span aria-hidden="true">↗</span>}
        </button>
        <button className="button button-ghost" type="button" onClick={reset}>
          Reset form
        </button>
      </div>
    </form>
  );
}
function FormSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="form-section">
      <legend>
        <span>{number}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}
