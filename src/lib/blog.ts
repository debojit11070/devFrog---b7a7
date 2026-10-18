export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  category: string;
  body: string[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "designing-fair-coding-assessments",
    title: "Designing coding assessments that are fair",
    excerpt: "Test cases, time limits and scoring rules decide whether a coding test measures skill or stress tolerance.",
    date: "2026-09-02",
    readMinutes: 5,
    category: "Hiring",
    body: [
      "A coding assessment is only useful if two equally skilled candidates get the same result. That starts with the problem statement: state the input format, the expected output and the constraints in plain words, and give at least one worked example.",
      "Test cases should cover the normal path, the edge cases and one or two larger inputs. Hidden cases keep candidates honest, but the visible ones should be enough to let someone check their understanding before submitting.",
      "Time limits deserve the same care. Set the limit from how long a competent engineer needs for the task, then add a margin. A limit that only the fastest typists can meet measures typing speed, not reasoning.",
      "Finally, publish the scoring rules. When candidates know how points are awarded, they spend their time on the parts that matter.",
    ],
  },
  {
    slug: "mixing-question-types",
    title: "When to use MCQ, written and coding questions",
    excerpt: "Each question type measures something different. Use all three and the picture of a candidate gets much clearer.",
    date: "2026-08-14",
    readMinutes: 4,
    category: "Assessments",
    body: [
      "Multiple-choice questions are fast to answer and instant to score. They are good for breadth: language features, tooling and fundamentals. Their weakness is that guessing can pass a weak question, so write distractors that reflect real misconceptions.",
      "Written questions show how a candidate explains trade-offs. Ask them to justify a design decision or review a short snippet. They take longer to review, so keep them few and focused.",
      "Coding questions show whether someone can turn an idea into working code. Use one or two per assessment and keep them small enough to finish inside the time limit.",
    ],
  },
  {
    slug: "preparing-for-an-online-assessment",
    title: "How to prepare for an online developer assessment",
    excerpt: "A calm setup, a quick read of every question and a plan for your time matter more than last-minute cramming.",
    date: "2026-07-21",
    readMinutes: 4,
    category: "Candidates",
    body: [
      "Before you start, check your connection and close anything that might interrupt you. The timer begins when you start the attempt, so be ready.",
      "Skim every question first. Answer the ones you are sure about to bank points, then return to the harder ones with the time left.",
      "For coding questions, run through the examples by hand before writing code. For written ones, a short structured answer beats a long unfocused one.",
      "Submit before the timer ends. Answers are saved as you go, but only a submitted attempt can be scored.",
    ],
  },
  {
    slug: "reading-assessment-results",
    title: "Reading assessment results without over-weighting them",
    excerpt: "A score is one signal. Pair it with per-question results and your own interview notes.",
    date: "2026-06-30",
    readMinutes: 3,
    category: "Hiring",
    body: [
      "An overall percentage hides a lot. Look at the score per question type: a candidate who is strong on coding and weaker on MCQs tells a different story from the reverse.",
      "Compare against the passing score you set for the role, not against other candidates who took a different assessment.",
      "Use the result to decide where to spend interview time. It should sharpen the conversation, not replace it.",
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((post) => post.slug === slug);
}
