import { LegalPage } from "./LegalPage";

export default function Security() {
  return (
    <LegalPage title="Security">
      <p>
        WeFit uses industry-standard cloud security: TLS in transit, provider encryption at
        rest, row-level security on user tables, and Paystack for card payments so we never
        see full card numbers.
      </p>
      <h2 className="text-foreground text-lg font-semibold pt-2">What we do</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Supabase Auth for sessions; passwords are hashed by the auth provider.</li>
        <li>API access to AI features requires a signed-in user and a daily quota.</li>
        <li>Progress photos live in a private storage bucket; only you can read yours.</li>
        <li>Paystack webhooks are verified with HMAC signatures.</li>
      </ul>
      <h2 className="text-foreground text-lg font-semibold pt-2">What we do not claim</h2>
      <p>
        We do not offer end-to-end encryption of health logs (the server must read them to
        generate plans). We do not currently guarantee that all data is hosted physically
        inside Nigeria.
      </p>
      <h2 className="text-foreground text-lg font-semibold pt-2">Report an issue</h2>
      <p>Email security concerns to hello@wefit.ng.</p>
    </LegalPage>
  );
}
