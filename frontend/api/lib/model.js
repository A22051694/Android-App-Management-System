export const timestamp = () => new Date().toISOString();

export const createId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const parseTags = (value) => {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

export const normalizeAppPayload = (payload = {}) => ({
  name: payload.name?.trim(),
  type: payload.type?.trim() || 'Personal',
  status: payload.status?.trim() || 'Idea',
  category: payload.category?.trim() || 'General',
  description: payload.description?.trim() || '',
  links: {
    github: payload.links?.github?.trim() || '',
    playStore: payload.links?.playStore?.trim() || ''
  },
  notes: payload.notes?.trim() || '',
  tags: parseTags(payload.tags)
});

export const normalizeIdeaPayload = (payload = {}) => ({
  title: payload.title?.trim(),
  description: payload.description?.trim() || '',
  category: payload.category?.trim() || 'General',
  tags: parseTags(payload.tags)
});

export const validateAppPayload = (payload) => {
  if (!payload.name) {
    return 'App name is required.';
  }

  if (!payload.status) {
    return 'Status is required.';
  }

  return null;
};

export const validateIdeaPayload = (payload) => {
  if (!payload.title) {
    return 'Idea title is required.';
  }

  return null;
};
