import type { ExecutiveProfile } from "@/lib/executiveTeamPageContent";

interface ExecutiveProfileCardProps {
  executive: ExecutiveProfile;
}

export function ExecutiveProfileCard({ executive }: ExecutiveProfileCardProps) {
  const { name, title, image, email, phone, linkedinUrl } = executive;
  const hasContact = Boolean(email || phone || linkedinUrl);

  return (
    <article className="executive-profile-card">
      <div className="executive-profile-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="executive-profile-card__img" />
      </div>
      <div className="executive-profile-card__body">
        <p className="executive-profile-card__title">{title}</p>
        <h3 className="executive-profile-card__name">{name}</h3>
        {hasContact ? (
          <>
            <span className="executive-profile-card__divider" aria-hidden />
            <ul className="executive-profile-card__social" aria-label={`Contact ${name}`}>
              {email ? (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="executive-profile-card__social-link"
                    aria-label={`Email ${name}`}
                  >
                    <EmailIcon />
                  </a>
                </li>
              ) : null}
              {phone ? (
                <li>
                  <a
                    href={`tel:${phone.replace(/\D/g, "")}`}
                    className="executive-profile-card__social-link"
                    aria-label={`Call ${name}`}
                  >
                    <PhoneIcon />
                  </a>
                </li>
              ) : null}
              {linkedinUrl ? (
                <li>
                  <a
                    href={linkedinUrl}
                    className="executive-profile-card__social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${name} on LinkedIn`}
                  >
                    <LinkedInIcon />
                  </a>
                </li>
              ) : null}
            </ul>
          </>
        ) : null}
      </div>
    </article>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        d="M4 7.5 12 13l8-5.5M4 7h16v10H4V7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        d="M6.5 4h3l1.5 4-2 1.2a11 11 0 0 0 5.8 5.8L18 13l4 1.5v3a2 2 0 0 1-2 2C9.4 19.5 4.5 14.6 4.5 6.5a2 2 0 0 1 2-2.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.5 8.5a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5zM5 20V9h3v11H5zm5 0V9h2.9v1.5h.05c.4-.75 1.4-1.55 2.9-1.55 3.1 0 3.65 2.05 3.65 4.7V20h-3v-6.2c0-1.5-.05-3.4-2.1-3.4-2.1 0-2.4 1.6-2.4 3.3V20H10z" />
    </svg>
  );
}
