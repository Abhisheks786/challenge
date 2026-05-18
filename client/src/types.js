// WidgetType values used throughout the app (replaces TS enum)
export const WidgetType = {
  TIMELINE:    'TIMELINE',
  CHECKLIST:   'CHECKLIST',
  COUNTDOWN:   'COUNTDOWN',
  QUICK_CHIPS: 'QUICK_CHIPS',
  LOCATION:    'LOCATION',
  TEXT:        'TEXT',
};

export const SSEEventType = {
  CHUNK:     'chunk',
  WIDGET:    'widget',
  DONE:      'done',
  ERROR:     'error',
  DASHBOARD: 'dashboard',
};