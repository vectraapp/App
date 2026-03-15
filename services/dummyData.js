/**
 * Vectra Dummy Data
 * Used for UI development before backend is connected.
 * All new feature data lives here.
 */

export const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ── Study Streak ──────────────────────────────────────────────────────────────

export const DUMMY_STUDY_STREAK = {
  current_streak: 14,
  longest_streak: 21,
  total_study_days: 47,
  weekly_goal: 5, // days per week
  this_week_days: 4,
  xp_points: 2340,
  level: 8,
  level_name: 'Scholar',
  next_level_name: 'Expert',
  xp_to_next_level: 660,
  badges: [
    { id: 'b1', name: 'First Step', icon: 'award', description: 'Studied for the first time', earned: true, earned_at: '2025-01-05' },
    { id: 'b2', name: '7-Day Streak', icon: 'zap', description: 'Maintained a 7-day streak', earned: true, earned_at: '2025-01-20' },
    { id: 'b3', name: 'Night Owl', icon: 'moon', description: 'Studied after midnight 5 times', earned: true, earned_at: '2025-02-01' },
    { id: 'b4', name: 'Speed Reader', icon: 'book-open', description: 'Read 10 questions in under 5 minutes', earned: true, earned_at: '2025-02-10' },
    { id: 'b5', name: 'Group Leader', icon: 'users', description: 'Created your first study group', earned: true, earned_at: '2025-02-15' },
    { id: 'b6', name: '21-Day Streak', icon: 'star', description: 'Maintained a 21-day streak', earned: true, earned_at: '2025-03-01' },
    { id: 'b7', name: 'Question Master', icon: 'help-circle', description: 'Viewed 100 past questions', earned: false, earned_at: null },
    { id: 'b8', name: 'Lecture Pro', icon: 'mic', description: 'Recorded 20 lectures', earned: false, earned_at: null },
    { id: 'b9', name: 'Month Streak', icon: 'calendar', description: 'Maintained a 30-day streak', earned: false, earned_at: null },
    { id: 'b10', name: 'Top 10', icon: 'trending-up', description: 'Reached top 10 on leaderboard', earned: false, earned_at: null },
  ],
  // Past 35 days activity (today = index 34)
  heatmap: Array.from({ length: 35 }, (_, i) => ({
    day: i,
    date: new Date(Date.now() - (34 - i) * 86400000).toISOString().split('T')[0],
    intensity: [0, 0, 1, 2, 1, 0, 3, 2, 1, 0, 1, 3, 2, 0, 1, 2, 3, 1, 0, 2, 3, 2, 1, 3, 2, 0, 3, 2, 1, 2, 3, 2, 3, 3, 2][i],
    // intensity: 0=none, 1=light, 2=medium, 3=high
  })),
  leaderboard: [
    { rank: 1, name: 'Chukwuemeka O.', department: 'Computer Science', streak: 45, xp: 5200, is_you: false },
    { rank: 2, name: 'Amara B.', department: 'Electrical Eng.', streak: 38, xp: 4800, is_you: false },
    { rank: 3, name: 'Tunde F.', department: 'Civil Engineering', streak: 32, xp: 4100, is_you: false },
    { rank: 4, name: 'Ngozi A.', department: 'Computer Science', streak: 28, xp: 3700, is_you: false },
    { rank: 5, name: 'Babatunde L.', department: 'Architecture', streak: 22, xp: 3200, is_you: false },
    { rank: 6, name: 'Ifeoma O.', department: 'Biochemistry', streak: 19, xp: 2800, is_you: false },
    { rank: 7, name: 'Emeka C.', department: 'Physics', streak: 16, xp: 2500, is_you: false },
    { rank: 8, name: 'You', department: 'Computer Science', streak: 14, xp: 2340, is_you: true },
    { rank: 9, name: 'Sola A.', department: 'Mathematics', streak: 12, xp: 2100, is_you: false },
    { rank: 10, name: 'Kemi D.', department: 'Chemistry', streak: 11, xp: 1950, is_you: false },
  ],
};

// ── Most Repeated Questions ───────────────────────────────────────────────────

export const DUMMY_REPEATED_QUESTIONS = {
  'CSC301': [
    {
      id: 'rq1',
      topic: 'Process Scheduling Algorithms',
      appearances: 8,
      years: ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      sample: 'Explain the differences between Round Robin and Shortest Job First scheduling algorithms with examples.',
      tags: ['OS', 'Scheduling', 'CPU'],
    },
    {
      id: 'rq2',
      topic: 'Memory Management & Virtual Memory',
      appearances: 7,
      years: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      sample: 'Describe the concept of paging and segmentation in memory management.',
      tags: ['OS', 'Memory', 'Paging'],
    },
    {
      id: 'rq3',
      topic: 'Deadlock Detection & Prevention',
      appearances: 6,
      years: ['2019', '2020', '2021', '2022', '2023', '2024'],
      sample: 'Using the Banker\'s Algorithm, determine if a safe state exists for the given resource allocation.',
      tags: ['OS', 'Deadlock', 'Banker'],
    },
    {
      id: 'rq4',
      topic: 'File System Structure',
      appearances: 5,
      years: ['2018', '2020', '2021', '2023', '2024'],
      sample: 'Compare and contrast FAT32 and NTFS file systems.',
      tags: ['OS', 'File System'],
    },
    {
      id: 'rq5',
      topic: 'Semaphores & Mutual Exclusion',
      appearances: 5,
      years: ['2019', '2020', '2021', '2022', '2024'],
      sample: 'Implement the producer-consumer problem using semaphores.',
      tags: ['OS', 'Concurrency', 'Semaphores'],
    },
  ],
  'EEE301': [
    {
      id: 'rq6',
      topic: 'Thevenin & Norton Theorems',
      appearances: 9,
      years: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      sample: 'Find the Thevenin equivalent circuit for the given network.',
      tags: ['Circuit', 'Theorems'],
    },
    {
      id: 'rq7',
      topic: 'AC Circuit Analysis',
      appearances: 7,
      years: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      sample: 'For the given AC circuit, calculate the impedance, current, and power factor.',
      tags: ['AC', 'Impedance', 'Power'],
    },
  ],
};

// ── Analytics (Admin) ─────────────────────────────────────────────────────────

export const DUMMY_ANALYTICS = {
  overview: {
    total_users: 1247,
    active_today: 89,
    active_this_week: 412,
    total_questions: 834,
    total_lectures: 291,
    total_uploads: 156,
    avg_session_minutes: 18,
    questions_viewed_today: 1823,
  },
  dau_trend: [
    { label: 'Mon', value: 65 },
    { label: 'Tue', value: 82 },
    { label: 'Wed', value: 94 },
    { label: 'Thu', value: 71 },
    { label: 'Fri', value: 88 },
    { label: 'Sat', value: 45 },
    { label: 'Sun', value: 38 },
  ],
  mau_trend: [
    { label: 'Sep', value: 320 },
    { label: 'Oct', value: 485 },
    { label: 'Nov', value: 612 },
    { label: 'Dec', value: 440 },
    { label: 'Jan', value: 780 },
    { label: 'Feb', value: 950 },
    { label: 'Mar', value: 1247 },
  ],
  feature_usage: [
    { feature: 'Past Questions', count: 4820, pct: 76 },
    { feature: 'Lectures', count: 2340, pct: 52 },
    { feature: 'AI Chat', count: 1890, pct: 42 },
    { feature: 'Browse', count: 1640, pct: 38 },
    { feature: 'Study Groups', count: 980, pct: 22 },
    { feature: 'Sharing', count: 720, pct: 16 },
    { feature: 'Uploads', count: 430, pct: 10 },
  ],
  top_courses: [
    { code: 'CSC301', name: 'Operating Systems', views: 612, questions: 47 },
    { code: 'EEE301', name: 'Circuit Theory', views: 538, questions: 39 },
    { code: 'ARC201', name: 'Design Studio II', views: 421, questions: 28 },
    { code: 'CSC201', name: 'Data Structures', views: 398, questions: 52 },
    { code: 'PHY101', name: 'Mechanics', views: 371, questions: 34 },
  ],
  top_universities: [
    { name: 'OAU', users: 892, pct: 72 },
    { name: 'UNILAG', users: 187, pct: 15 },
    { name: 'UI', users: 98, pct: 8 },
    { name: 'Others', users: 70, pct: 5 },
  ],
  retention: {
    day1: 68,
    day7: 45,
    day14: 32,
    day30: 24,
  },
  signups_this_week: [
    { day: 'Mon', value: 12 },
    { day: 'Tue', value: 18 },
    { day: 'Wed', value: 24 },
    { day: 'Thu', value: 9 },
    { day: 'Fri', value: 21 },
    { day: 'Sat', value: 7 },
    { day: 'Sun', value: 5 },
  ],
};

// ── Exam Countdowns ───────────────────────────────────────────────────────────

export const DUMMY_EXAM_COUNTDOWNS = [
  {
    id: 'ex1',
    course_code: 'CSC301',
    course_name: 'Operating Systems',
    exam_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    exam_type: 'Final',
    venue: 'Faculty Hall A',
    color: 'primary',
  },
  {
    id: 'ex2',
    course_code: 'EEE301',
    course_name: 'Circuit Theory',
    exam_date: new Date(Date.now() + 12 * 86400000).toISOString(),
    exam_type: 'Final',
    venue: 'Tech Block 2',
    color: 'secondary',
  },
  {
    id: 'ex3',
    course_code: 'CSC303',
    course_name: 'Database Systems',
    exam_date: new Date(Date.now() + 18 * 86400000).toISOString(),
    exam_type: 'Final',
    venue: 'Computer Lab',
    color: 'accent',
  },
];

// ── Recently Viewed ───────────────────────────────────────────────────────────

export const DUMMY_RECENTLY_VIEWED = [
  {
    id: 'rv1',
    type: 'question',
    title: 'CSC301 — 2023 Final',
    subtitle: 'Operating Systems',
    viewed_at: new Date(Date.now() - 15 * 60000).toISOString(),
    route: '/question/q1',
  },
  {
    id: 'rv2',
    type: 'lecture',
    title: 'Memory Management',
    subtitle: 'CSC301 · 45min',
    viewed_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    route: '/lecture/lec1',
  },
  {
    id: 'rv3',
    type: 'question',
    title: 'EEE301 — 2022 Final',
    subtitle: 'Circuit Theory',
    viewed_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    route: '/question/q2',
  },
  {
    id: 'rv4',
    type: 'course',
    title: 'Database Systems',
    subtitle: 'CSC303 · 52 questions',
    viewed_at: new Date(Date.now() - 86400000).toISOString(),
    route: '/course/csc303',
  },
  {
    id: 'rv5',
    type: 'lecture',
    title: 'Scheduling Algorithms',
    subtitle: 'CSC301 · 38min',
    viewed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    route: '/lecture/lec2',
  },
];

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export const DUMMY_BOOKMARKS = [
  {
    id: 'bm1',
    type: 'question',
    title: 'Operating Systems — 2023 Final Exam',
    subtitle: 'CSC301 · 2023/2024 · Section A & B',
    note: 'Focus on Part B questions — scheduling always comes up',
    bookmarked_at: '2025-03-10T08:30:00Z',
    resource_id: 'q1',
  },
  {
    id: 'bm2',
    type: 'question',
    title: 'Circuit Theory — 2022 Final Exam',
    subtitle: 'EEE301 · 2022/2023',
    note: null,
    bookmarked_at: '2025-03-08T14:20:00Z',
    resource_id: 'q2',
  },
  {
    id: 'bm3',
    type: 'lecture',
    title: 'Memory Management Deep Dive',
    subtitle: 'CSC301 · 45 min · Transcribed',
    note: 'Very detailed lecture, review before exam',
    bookmarked_at: '2025-03-05T10:15:00Z',
    resource_id: 'lec1',
  },
  {
    id: 'bm4',
    type: 'question',
    title: 'Data Structures — 2024 Exam',
    subtitle: 'CSC201 · 2023/2024',
    note: null,
    bookmarked_at: '2025-03-03T16:45:00Z',
    resource_id: 'q3',
  },
  {
    id: 'bm5',
    type: 'lecture',
    title: 'Thevenin & Norton Theorems',
    subtitle: 'EEE301 · 32 min · Transcribed',
    note: 'Has worked examples, very helpful',
    bookmarked_at: '2025-02-28T09:00:00Z',
    resource_id: 'lec3',
  },
];

// ── Downloads ─────────────────────────────────────────────────────────────────

export const DUMMY_DOWNLOADS = [
  {
    id: 'dl1',
    type: 'question_pdf',
    title: 'CSC301 — 2023 Final Exam',
    subtitle: 'Past Question',
    size_mb: 1.2,
    downloaded_at: '2025-03-12T10:30:00Z',
    file_path: '/downloads/csc301_2023_final.pdf',
    course_code: 'CSC301',
  },
  {
    id: 'dl2',
    type: 'lecture_pdf',
    title: 'Memory Management Notes',
    subtitle: 'AI-Generated PDF · CSC301',
    size_mb: 0.8,
    downloaded_at: '2025-03-10T15:20:00Z',
    file_path: '/downloads/memory_management_notes.pdf',
    course_code: 'CSC301',
  },
  {
    id: 'dl3',
    type: 'question_pdf',
    title: 'EEE301 — 2022 Final Exam',
    subtitle: 'Past Question',
    size_mb: 2.1,
    downloaded_at: '2025-03-08T09:45:00Z',
    file_path: '/downloads/eee301_2022_final.pdf',
    course_code: 'EEE301',
  },
  {
    id: 'dl4',
    type: 'textbook_pdf',
    title: 'Modern Operating Systems',
    subtitle: 'Textbook · Tanenbaum',
    size_mb: 18.4,
    downloaded_at: '2025-03-05T20:10:00Z',
    file_path: '/downloads/modern_os_tanenbaum.pdf',
    course_code: 'CSC301',
  },
  {
    id: 'dl5',
    type: 'lecture_pdf',
    title: 'Scheduling Algorithms Notes',
    subtitle: 'AI-Generated PDF · CSC301',
    size_mb: 0.6,
    downloaded_at: '2025-03-01T12:00:00Z',
    file_path: '/downloads/scheduling_notes.pdf',
    course_code: 'CSC301',
  },
];

export const DUMMY_DOWNLOAD_STATS = {
  total_files: 5,
  total_size_mb: 23.1,
  storage_limit_mb: 500,
};

// ── Notification Preferences ──────────────────────────────────────────────────

export const DUMMY_NOTIFICATION_PREFS = {
  exam_reminders: true,
  streak_reminders: true,
  new_questions: false,
  group_messages: true,
  share_redeemed: true,
  weekly_summary: true,
};
