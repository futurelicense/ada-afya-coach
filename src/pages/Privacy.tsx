import { LegalPage } from "./LegalPage";

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        WeFit (“we”) is an AI fitness and nutrition app for people in Nigeria. This policy
        explains what we collect and how we use it. We do not sell your personal health data.
      </p>
      <h2 className="text-foreground text-lg font-semibold pt-2">What we collect</h2>
      <p>
        Account details (name, email), profile stats you enter (age, weight, height, goals,
        diet preference), workouts and meals you log, progress photos you upload, AI chat
        messages, payment references from Paystack, and optional push-notification tokens.
      </p>
      <h2 className="text-foreground text-lg font-semibold pt-2">How we use it</h2>
      <p>
        To run your account, generate workout and meal suggestions, enforce plan limits,
        process subscriptions, and improve the product. Coach Ada and food-scan features
        send relevant context to Anthropic (Claude) so the model can reply. We do not use
        your photos or chat for advertising.
      </p>
      <h2 className="text-foreground text-lg font-semibold pt-2">Where data is stored</h2>
      <p>
        Application data is stored with Supabase (hosted cloud database and file storage).
        Payments are processed by Paystack. We encrypt data in transit (HTTPS/TLS) and at
        rest using our providers’ standard encryption. This is not end-to-end encryption:
        we can read data needed to operate the service (for example, your meal log).
      </p>
      <h2 className="text-foreground text-lg font-semibold pt-2">Your rights</h2>
      <p>
        You can update profile fields in the app, export a progress summary from Profile,
        and delete photos you uploaded. To delete your account and associated data, email
        hello@wefit.ng. Under the Nigeria Data Protection Act 2023 you may also request
        access, correction, or erasure of personal data we hold.
      </p>
      <h2 className="text-foreground text-lg font-semibold pt-2">Contact</h2>
      <p>Privacy questions: hello@wefit.ng</p>
    </LegalPage>
  );
}
