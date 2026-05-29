import type { DealershipDepartmentContact } from "@/lib/dealershipDirectoryTypes";

export function DealershipDepartmentList({
  departments,
  className = "",
}: {
  departments: DealershipDepartmentContact[];
  className?: string;
}) {
  if (!departments.length) return null;

  return (
    <ul className={`dealership-dept-list ${className}`.trim()}>
      {departments.map((dept) => (
        <li key={dept.key} className="dealership-dept-list__item">
          <span className="dealership-dept-list__label">{dept.label}</span>
          <div className="dealership-dept-list__actions">
            {dept.phone && dept.phoneTel ? (
              <a href={dept.phoneTel} className="dealership-dept-list__phone">
                {dept.phone}
              </a>
            ) : dept.phone ? (
              <span className="dealership-dept-list__phone">{dept.phone}</span>
            ) : null}
            {dept.ctaUrl ? (
              <a
                href={dept.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dealership-dept-list__link"
              >
                {dept.ctaLabel || dept.label}
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
