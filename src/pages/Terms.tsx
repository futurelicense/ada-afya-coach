import { LegalPage } from "./LegalPage";

export default function Terms() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        By creating a WeFit account you agree to these terms. WeFit provides AI-generated
        fitness and nutrition suggestions. It is not medical advice, diagnosis, or treatment.
        Talk to a qualified clinician before starting a new exercise or diet programme.
      </p>
      <h2 className="text-foreground text-lg font-semibold pt-2">Accounts</h2>
      <p>
        You must be 18 or older. Keep your password private. You are responsible for activity
        on your account. We may suspend accounts that abuse AI quotas, harass others, or
        break the law.
      </p>
      <h2 className="text-foreground text-lg font-semibold pt-2">Subscriptions</h2>
      <p>
        Free, Pro (₦2,500/month), and Elite (₦5,000/month) plans are billed through Paystack.
        Daily AI limits are: Free — 5 requests per feature; Pro — 50; Elite — unlimited.
        Gym directory listings, trainer requests, and meal requests are inquiries to partners,
        not instant paid bookings unless we say otherwise at checkout.
      </p>
      <h2 className="text-foreground text-lg font-semibold pt-2">Content</h2>
      <p>
        You keep rights to photos and logs you upload. You grant us a licence to store and
        display them so the product works. Directory listings of gyms and trainers are
        informational; we do not guarantee availability, prices, or outcomes.
      </p>
      <h2 className="text-foreground text-lg font-semibold pt-2">Contact</h2>
      <p>Questions: hello@wefit.ng</p>
    </LegalPage>
  );
}
