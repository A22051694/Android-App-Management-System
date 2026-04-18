insert into public.apps (name, type, status, category, description, links, notes, tags)
values
  (
    'Focus Forge',
    'Play Store',
    'Idea',
    'Productivity',
    'Gamified deep-work timer with streaks, focus reports, and reward loops.',
    '{"github":"https://github.com/example/focus-forge","playStore":""}'::jsonb,
    'Validate monetization with premium analytics and custom focus plans.',
    array['productivity','habit','focus']
  ),
  (
    'Pocket PM',
    'Personal',
    'In Progress',
    'Operations',
    'Solo-founder command center for roadmap tracking, priorities, and release notes.',
    '{"github":"https://github.com/example/pocket-pm","playStore":""}'::jsonb,
    'Keep it lightweight. No team features for v1.',
    array['planning','startup','utility']
  )
on conflict do nothing;

insert into public.ideas (title, description, category, tags)
values
  (
    'Offline family task planner',
    'Shared chores and shopping list app that works well on low-end devices.',
    'Family',
    array['utility','offline']
  ),
  (
    'Voice note to LinkedIn post writer',
    'Turn rambling founder voice notes into polished content drafts.',
    'Creator',
    array['ai','content']
  )
on conflict do nothing;
