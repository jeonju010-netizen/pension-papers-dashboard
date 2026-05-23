import {
  countryCodeToFlag,
  getCountryNameKo,
  resolveCountryCode,
} from "@/lib/country";

interface CountryFlagProps {
  countryCode?: string;
  title: string;
  abstract: string;
  journal: string;
  size?: "sm" | "md";
}

export function CountryFlag({
  countryCode,
  title,
  abstract,
  journal,
  size = "sm",
}: CountryFlagProps) {
  const code = resolveCountryCode({ countryCode, title, abstract, journal });
  if (!code) return null;

  const flag = countryCodeToFlag(code);
  const name = getCountryNameKo(code);
  const sizeClass = size === "md" ? "text-base" : "text-sm";

  return (
    <span
      className={`${sizeClass} leading-none`}
      title={name}
      aria-label={`국가: ${name}`}
      role="img"
    >
      {flag}
    </span>
  );
}
