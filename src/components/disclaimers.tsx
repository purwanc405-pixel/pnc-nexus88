import { Alert } from "./ui";
import {
  GOV_DISCLAIMER_BANNER,
  KERJA_DISCLAIMER,
  KOMODITI_DISCLAIMER,
} from "@/lib/constants";

export function GovDisclaimerBanner() {
  const lines = GOV_DISCLAIMER_BANNER.split("\n");
  return (
    <Alert tone="warn">
      <p className="font-semibold">{lines[0]}</p>
      {lines.slice(1).map((line, i) => (
        <p key={i} className="mt-2">
          {line}
        </p>
      ))}
    </Alert>
  );
}

export function KerjaDisclaimer() {
  return <Alert tone="info">{KERJA_DISCLAIMER}</Alert>;
}

export function KomoditiDisclaimer() {
  return <Alert tone="info">{KOMODITI_DISCLAIMER}</Alert>;
}
