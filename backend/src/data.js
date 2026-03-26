const now = new Date('2026-03-23T12:00:00.000Z');

const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

export const seedApps = [
  {
    id: 'app-1',
    name: 'Focus Forge',
    type: 'Play Store',
    status: 'Idea',
    category: 'Productivity',
    description: 'Gamified deep-work timer with streaks, focus reports, and reward loops.',
    links: {
      github: 'https://github.com/example/focus-forge',
      playStore: ''
    },
    notes: 'Validate monetization with premium analytics and custom focus plans.',
    tags: ['productivity', 'habit', 'focus'],
    created_at: daysAgo(10),
    updated_at: daysAgo(2)
  },
  {
    id: 'app-2',
    name: 'Pocket PM',
    type: 'Personal',
    status: 'In Progress',
    category: 'Operations',
    description: 'Solo-founder command center for roadmap tracking, priorities, and release notes.',
    links: {
      github: 'https://github.com/example/pocket-pm',
      playStore: ''
    },
    notes: 'Keep it lightweight. No team features for v1.',
    tags: ['planning', 'startup', 'utility'],
    created_at: daysAgo(18),
    updated_at: daysAgo(1)
  },
  {
    id: 'app-3',
    name: 'Fit Pantry',
    type: 'Play Store',
    status: 'Completed',
    category: 'Health',
    description: 'Meal planner that builds recipes from groceries already in the kitchen.',
    links: {
      github: 'https://github.com/example/fit-pantry',
      playStore: 'https://play.google.com/store/apps/details?id=com.example.fitpantry'
    },
    notes: 'Published MVP. Next step is retention experiments and recipe sharing.',
    tags: ['health', 'food', 'ai'],
    created_at: daysAgo(34),
    updated_at: daysAgo(4)
  }
];

export const seedIdeas = [
  {
    id: 'idea-1',
    title: 'Offline family task planner',
    description: 'Shared chores and shopping list app that works well on low-end devices.',
    category: 'Family',
    tags: ['utility', 'offline'],
    created_at: daysAgo(5)
  },
  {
    id: 'idea-2',
    title: 'Voice note to LinkedIn post writer',
    description: 'Turn rambling founder voice notes into polished content drafts.',
    category: 'Creator',
    tags: ['ai', 'content'],
    created_at: daysAgo(1)
  }
];
