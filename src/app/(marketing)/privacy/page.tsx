import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What DevForge collects, why, and the choices you have.",
};

const SECTIONS = [
  {
    title: "What we collect",
    body: "Account details you provide (name, email, role, optional profile fields), the answers you submit during assessments, and payment status for paid assessments. Card details are handled by Stripe and never reach our servers.",
  },
  {
    title: "How we use it",
    body: "To run your account, deliver invitations and assessments, score attempts, process payments and keep an audit trail of sensitive administrative changes.",
  },
  {
    title: "Who can see it",
    body: "Companies see the attempts of candidates they invited. Administrators see account records and audit logs. Candidates see only their own invitations, attempts and payments.",
  },
  {
    title: "Cookies",
    body: "We use strictly necessary cookies to keep you signed in and a local preference for light or dark mode. We do not use advertising cookies.",
  },
  {
    title: "Your choices",
    body: "You can edit your profile at any time. To request deletion of your account, contact us and an administrator will process it.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Privacy policy</h1>
      <div className="mt-8 flex flex-col gap-6">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
