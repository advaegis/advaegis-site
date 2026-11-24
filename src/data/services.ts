/**
 * Consulting practice areas, ordered from the core outwards.
 * The order matters: the layered shield on the home page draws
 * one layer per entry, first entry innermost.
 */
export interface Service {
  /** Short label used on the shield graphic. Keep it under ~22 characters. */
  short: string;
  title: string;
  summary: string;
}

export const services: Service[] = [
  {
    short: 'Architecture',
    title: 'Enterprise architecture',
    summary:
      'Target architectures, capability maps and roadmaps that tie technology decisions to what the business needs to do.',
  },
  {
    short: 'Infrastructure',
    title: 'Infrastructure engineering',
    summary:
      'Cloud and hybrid infrastructure designed, automated and documented so teams can change it safely.',
  },
  {
    short: 'Platform',
    title: 'Platform engineering',
    summary:
      'Internal platforms and golden paths that let product teams ship without reinventing the plumbing.',
  },
  {
    short: 'Observability',
    title: 'Observability',
    summary:
      'Logs, metrics and traces that answer real questions about production, with alerts people trust.',
  },
  {
    short: 'Reliability',
    title: 'Site reliability engineering',
    summary:
      'Service levels, incident practice and capacity planning that keep systems dependable as they grow.',
  },
  {
    short: 'GenAI enablement',
    title: 'GenAI enablement',
    summary:
      'Rolling out tools such as Claude Code and taking GenAI projects from first use case to a working, governed pilot.',
  },
];
