"use client";

import { useState, type FormEvent } from "react";
import { CONTACT_THE_CAVENDERS_LOCATIONS } from "@/lib/contactTheCavendersLocations";
import type { ContactTheCavendersPageContent } from "@/lib/contactTheCavendersPageContent";

type FieldErrors = Partial<
  Record<"location" | "firstName" | "lastName" | "phone" | "email" | "message", string>
>;

export function ContactCavendersForm({
  formContent,
}: {
  formContent: ContactTheCavendersPageContent["form"];
}) {
  const [location, setLocation] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact-the-cavenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          firstName,
          lastName,
          phone,
          email,
          message,
          website,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        errors?: Array<{ field: string; message: string }>;
      };

      if (!res.ok) {
        if (data.errors?.length) {
          const next: FieldErrors = {};
          for (const err of data.errors) {
            const key = err.field as keyof FieldErrors;
            if (key) next[key] = err.message;
          }
          setFieldErrors(next);
        } else {
          setFormError(data.error ?? "Unable to send your message. Please try again.");
        }
        return;
      }

      setSuccess(true);
      setLocation("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch {
      setFormError("Unable to send your message. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="contact-cavenders-form-card" role="status">
        <div className="contact-cavenders-form__alert contact-cavenders-form__alert--success">
          <p className="contact-cavenders-form__success-title">{formContent.successTitle}</p>
          <p className="m-0">{formContent.successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-cavenders-form-card">
      <h2 className="contact-cavenders-form-card__heading">{formContent.cardHeading}</h2>

      <form className="contact-cavenders-form" onSubmit={(e) => void handleSubmit(e)} noValidate>
        <div className="contact-cavenders-form__hp" aria-hidden>
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {formError ? (
          <div
            className="contact-cavenders-form__alert contact-cavenders-form__alert--error"
            role="alert"
          >
            {formError}
          </div>
        ) : null}

        <div className="contact-cavenders-field">
          <label className="contact-cavenders-field__label" htmlFor="contact-location">
            Preferred Location
          </label>
          <select
            id="contact-location"
            className="contact-cavenders-field__select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            aria-invalid={Boolean(fieldErrors.location)}
            aria-describedby={fieldErrors.location ? "contact-location-error" : undefined}
          >
            <option value="">Select a location</option>
            {CONTACT_THE_CAVENDERS_LOCATIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {fieldErrors.location ? (
            <p id="contact-location-error" className="contact-cavenders-field__error">
              {fieldErrors.location}
            </p>
          ) : null}
        </div>

        <div className="contact-cavenders-form__row">
          <div className="contact-cavenders-field">
            <label className="contact-cavenders-field__label" htmlFor="contact-first-name">
              First Name
            </label>
            <input
              id="contact-first-name"
              type="text"
              className="contact-cavenders-field__input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
              aria-invalid={Boolean(fieldErrors.firstName)}
            />
            {fieldErrors.firstName ? (
              <p className="contact-cavenders-field__error">{fieldErrors.firstName}</p>
            ) : null}
          </div>
          <div className="contact-cavenders-field">
            <label className="contact-cavenders-field__label" htmlFor="contact-last-name">
              Last Name
            </label>
            <input
              id="contact-last-name"
              type="text"
              className="contact-cavenders-field__input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
              aria-invalid={Boolean(fieldErrors.lastName)}
            />
            {fieldErrors.lastName ? (
              <p className="contact-cavenders-field__error">{fieldErrors.lastName}</p>
            ) : null}
          </div>
        </div>

        <div className="contact-cavenders-field">
          <label className="contact-cavenders-field__label" htmlFor="contact-phone">
            Phone Number
          </label>
          <input
            id="contact-phone"
            type="tel"
            className="contact-cavenders-field__input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
            aria-invalid={Boolean(fieldErrors.phone)}
          />
          {fieldErrors.phone ? (
            <p className="contact-cavenders-field__error">{fieldErrors.phone}</p>
          ) : null}
        </div>

        <div className="contact-cavenders-field">
          <label className="contact-cavenders-field__label" htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            className="contact-cavenders-field__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email ? (
            <p className="contact-cavenders-field__error">{fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="contact-cavenders-field">
          <label className="contact-cavenders-field__label" htmlFor="contact-message">
            Message
          </label>
          <textarea
            id="contact-message"
            className="contact-cavenders-field__textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            aria-invalid={Boolean(fieldErrors.message)}
          />
          {fieldErrors.message ? (
            <p className="contact-cavenders-field__error">{fieldErrors.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          className="contact-cavenders-form__submit"
          disabled={submitting}
        >
          {submitting ? "Sending…" : formContent.submitLabel}
        </button>

        <p className="contact-cavenders-form__trust">{formContent.trustNote}</p>
      </form>
    </div>
  );
}
