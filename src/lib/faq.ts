export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
  {
    question: "Who can create assessments?",
    answer:
      "Company accounts build assessments from their own question bank, set a time limit and passing score, and publish them. Candidates and admins cannot create assessments.",
  },
  {
    question: "How do candidates get access to an assessment?",
    answer:
      "A company invites a candidate by email address. The invitation appears in the candidate dashboard, where they can accept or decline before it expires.",
  },
  {
    question: "How are answers scored?",
    answer:
      "Multiple-choice answers are scored automatically on submit. Coding and written answers are reviewed by the company, which scores each one and leaves feedback.",
  },
  {
    question: "Are some assessments paid?",
    answer:
      "Yes. A company can set a price. Candidates pay with Stripe Checkout before starting, and every payment appears in their payment history. This site runs Stripe in test mode.",
  },
  {
    question: "Is my progress saved if I lose connection?",
    answer:
      "Answers are saved as you go. If the page closes, reopen the invitation and continue until the time limit ends. The timer is based on when the attempt started.",
  },
  {
    question: "Can I try the platform without signing up?",
    answer:
      "Yes. The sign-in page has one-click demo logins for the admin, company and candidate roles so you can explore each dashboard.",
  },
];
