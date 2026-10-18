import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The rules for using DevForge as a company, candidate or administrator.",
};

const SECTIONS = [
  {
    title: "Accounts",
    body: "You are responsible for the activity on your account and for keeping your password private. Provide accurate information and one account per person.",
  },
  {
    title: "Assessments",
    body: "Companies are responsible for the content of the assessments they publish and for how they use results. Candidates must complete attempts on their own, without outside help, unless the assessment says otherwise.",
  },
  {
    title: "Payments",
    body: "Paid assessments are charged through Stripe at the price shown before checkout. A payment grants one attempt at the assessment it was made for.",
  },
  {
    title: "Acceptable use",
    body: "Do not attempt to disrupt the service, access other accounts, or copy assessment content for redistribution. We may suspend accounts that break these rules.",
  },
  {
    title: "Changes",
    body: "We may update these terms as the service evolves. Continued use after a change means you accept the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Terms of service</h1>
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
