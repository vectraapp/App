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

// ── Courses ───────────────────────────────────────────────────────────────────

export const DUMMY_COURSES = [
  { id: 'c1', code: 'CSC301', title: 'Operating Systems', level: '300', semester: 1, units: 3, department_id: 'dept1', department: 'Computer Science', question_count: 47 },
  { id: 'c2', code: 'CSC303', title: 'Database Systems', level: '300', semester: 1, units: 3, department_id: 'dept1', department: 'Computer Science', question_count: 52 },
  { id: 'c3', code: 'CSC305', title: 'Computer Networks', level: '300', semester: 2, units: 3, department_id: 'dept1', department: 'Computer Science', question_count: 31 },
  { id: 'c4', code: 'CSC201', title: 'Data Structures & Algorithms', level: '200', semester: 1, units: 3, department_id: 'dept1', department: 'Computer Science', question_count: 38 },
  { id: 'c5', code: 'CSC207', title: 'Discrete Mathematics', level: '200', semester: 2, units: 2, department_id: 'dept1', department: 'Computer Science', question_count: 22 },
  { id: 'c6', code: 'EEE301', title: 'Circuit Theory', level: '300', semester: 1, units: 3, department_id: 'dept2', department: 'Electrical Engineering', question_count: 39 },
];

// ── Lectures ──────────────────────────────────────────────────────────────────

export const DUMMY_LECTURES = [
  {
    id: 'lec1',
    topic: 'Memory Management & Paging',
    courseCode: 'CSC301',
    courseName: 'Operating Systems',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    duration: 2700,
    status: 'processed',
    transcription: 'Memory management is a critical function of the operating system. In this lecture, we covered paging, segmentation, and virtual memory concepts. Paging divides the logical address space into fixed-size blocks called pages. The physical memory is divided into frames of the same size. The OS maintains a page table to map logical pages to physical frames. Virtual memory allows processes to use more memory than physically available by keeping only active pages in RAM and swapping others to disk.',
    summary: 'Covered paging, segmentation, and virtual memory. Key topics: page tables, TLB, demand paging, page replacement algorithms (LRU, FIFO, Optimal).',
    pdfUrl: 'https://example.com/pdf/lec1.pdf',
    audioUrl: 'https://example.com/audio/lec1.m4a',
    lecturer: 'Prof. Adeyemi',
    images: [],
  },
  {
    id: 'lec2',
    topic: 'CPU Scheduling Algorithms',
    courseCode: 'CSC301',
    courseName: 'Operating Systems',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    duration: 2280,
    status: 'processed',
    transcription: 'CPU scheduling is the basis of multiprogrammed operating systems. We discussed FCFS, SJF, Round Robin, and Priority scheduling. Each algorithm has trade-offs between throughput, turnaround time, and response time. Round Robin is commonly used in time-sharing systems with a quantum of 10-100ms.',
    summary: 'CPU scheduling algorithms: FCFS, SJF, Priority, Round Robin. Convoy effect in FCFS, starvation in Priority scheduling, quantum selection in RR.',
    pdfUrl: 'https://example.com/pdf/lec2.pdf',
    audioUrl: 'https://example.com/audio/lec2.m4a',
    lecturer: 'Prof. Adeyemi',
    images: [],
  },
  {
    id: 'lec3',
    topic: 'Thevenin & Norton Equivalents',
    courseCode: 'EEE301',
    courseName: 'Circuit Theory',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    duration: 1920,
    status: 'processed',
    transcription: 'Thevenin\'s theorem states that any linear circuit can be replaced by an equivalent circuit consisting of a voltage source in series with a resistance. Norton\'s theorem uses a current source in parallel with a resistance. We worked through several examples finding Vth, Rth, In, and Rn for various network configurations.',
    summary: 'Thevenin and Norton equivalent circuits. Methods to find Vth, Rth (test source, short-circuit current). Source transformation between Thevenin and Norton.',
    pdfUrl: 'https://example.com/pdf/lec3.pdf',
    audioUrl: 'https://example.com/audio/lec3.m4a',
    lecturer: 'Dr. Ogunleye',
    images: [],
  },
  {
    id: 'lec4',
    topic: 'SQL Joins & Query Optimization',
    courseCode: 'CSC303',
    courseName: 'Database Systems',
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    duration: 3000,
    status: 'processed',
    transcription: 'SQL joins allow combining data from multiple tables. We covered INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN. Query optimization involves understanding execution plans, proper indexing strategies, and writing efficient WHERE clauses. The query optimizer uses statistics to choose the best execution plan.',
    summary: 'SQL join types and query optimization. Index strategies, execution plans, avoiding full table scans. Normalization (1NF, 2NF, 3NF, BCNF).',
    pdfUrl: 'https://example.com/pdf/lec4.pdf',
    audioUrl: 'https://example.com/audio/lec4.m4a',
    lecturer: 'Dr. Fasanya',
    images: [],
  },
];

// ── Questions ─────────────────────────────────────────────────────────────────

export const DUMMY_QUESTIONS = [
  {
    id: 'q1',
    courseCode: 'CSC301',
    courseName: 'Operating Systems',
    session: '2023/2024',
    examType: 'Final',
    year: '2023',
    fileUrl: 'https://example.com/questions/csc301_2023.pdf',
    imageUrls: [],
    uploadedBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'approved',
    sections: [
      {
        title: 'Section A — Answer ALL Questions (40 marks)',
        questions: [
          { number: 1, text: 'Explain the concept of process scheduling. What are the criteria used for evaluating scheduling algorithms?' },
          { number: 2, text: 'Differentiate between internal and external fragmentation. How does paging solve external fragmentation?' },
          { number: 3, text: 'What is a deadlock? State the four necessary conditions for a deadlock to occur.' },
          { number: 4, text: 'Define the critical section problem. List the three requirements any solution must satisfy.' },
        ],
      },
      {
        title: 'Section B — Answer THREE Questions (60 marks)',
        questions: [
          { number: 5, text: 'a) Describe the Round Robin scheduling algorithm. b) Given the following processes with burst times: P1=10ms, P2=4ms, P3=5ms, P4=3ms, quantum=4ms — draw a Gantt chart and calculate average turnaround time and waiting time.' },
          { number: 6, text: 'a) Explain virtual memory and describe how demand paging works. b) A page reference string is: 1,2,3,4,1,2,5,1,2,3,4,5. With 3 frames, show page faults using FIFO and LRU.' },
          { number: 7, text: 'a) Describe Banker\'s Algorithm for deadlock avoidance. b) For a system with 5 processes and 3 resource types with given allocation/max matrices, find the safe sequence.' },
        ],
      },
    ],
  },
  {
    id: 'q2',
    courseCode: 'EEE301',
    courseName: 'Circuit Theory',
    session: '2022/2023',
    examType: 'Final',
    year: '2022',
    fileUrl: 'https://example.com/questions/eee301_2022.pdf',
    imageUrls: [],
    uploadedBy: 'admin',
    createdAt: '2023-01-20T11:00:00Z',
    status: 'approved',
    sections: [
      {
        title: 'Section A — Compulsory (40 marks)',
        questions: [
          { number: 1, text: 'State and explain Thevenin\'s theorem. Under what conditions can it be applied?' },
          { number: 2, text: 'Define impedance. For a series RLC circuit, derive the expression for total impedance.' },
          { number: 3, text: 'What is power factor? Distinguish between leading and lagging power factor.' },
          { number: 4, text: 'Explain superposition theorem with a suitable example.' },
        ],
      },
      {
        title: 'Section B — Answer THREE (60 marks)',
        questions: [
          { number: 5, text: 'Find the Thevenin equivalent circuit of the network at terminals A-B. Given: Vs=20V, R1=4Ω, R2=6Ω, R3=8Ω.' },
          { number: 6, text: 'For a series RLC circuit with R=5Ω, L=0.1H, C=100μF connected to 230V 50Hz supply, find: (a) impedance (b) current (c) power factor (d) voltage across each element.' },
          { number: 7, text: 'Using mesh analysis, find the current in each branch of the given network.' },
        ],
      },
    ],
  },
  {
    id: 'q3',
    courseCode: 'CSC201',
    courseName: 'Data Structures & Algorithms',
    session: '2023/2024',
    examType: 'Final',
    year: '2023',
    fileUrl: 'https://example.com/questions/csc201_2023.pdf',
    imageUrls: [],
    uploadedBy: 'admin',
    createdAt: '2024-02-01T09:00:00Z',
    status: 'approved',
    sections: [
      {
        title: 'Section A — Answer ALL (40 marks)',
        questions: [
          { number: 1, text: 'Define a linked list. Compare singly linked and doubly linked lists.' },
          { number: 2, text: 'What is a binary search tree (BST)? Write an algorithm to search for a key in a BST.' },
          { number: 3, text: 'Explain the concept of hashing. What are collision resolution techniques?' },
          { number: 4, text: 'What is the time complexity of quicksort in best, average, and worst cases? Explain.' },
        ],
      },
    ],
  },
  {
    id: 'q4',
    courseCode: 'CSC303',
    courseName: 'Database Systems',
    session: '2023/2024',
    examType: 'Final',
    year: '2023',
    fileUrl: 'https://example.com/questions/csc303_2023.pdf',
    imageUrls: [],
    uploadedBy: 'admin',
    createdAt: '2024-01-28T08:00:00Z',
    status: 'approved',
    sections: [
      {
        title: 'Section A — Answer ALL (40 marks)',
        questions: [
          { number: 1, text: 'Distinguish between a DBMS and a traditional file system. What are the advantages of a DBMS?' },
          { number: 2, text: 'Define normalization. Explain 1NF, 2NF, and 3NF with examples.' },
          { number: 3, text: 'What is the difference between INNER JOIN and OUTER JOIN?' },
          { number: 4, text: 'What is a transaction? Explain the ACID properties.' },
        ],
      },
    ],
  },
];

// ── Textbooks ─────────────────────────────────────────────────────────────────

export const DUMMY_TEXTBOOKS = [
  {
    id: 'tb1',
    title: 'Modern Operating Systems',
    author: 'Andrew S. Tanenbaum',
    edition: '4th Edition',
    courseCode: 'CSC301',
    courseName: 'Operating Systems',
    fileUrl: 'https://example.com/textbooks/modern_os.pdf',
    coverUrl: null,
    pages: 1101,
    uploadedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tb2',
    title: 'Operating System Concepts (Silberschatz)',
    author: 'Abraham Silberschatz, Peter Galvin',
    edition: '10th Edition',
    courseCode: 'CSC301',
    courseName: 'Operating Systems',
    fileUrl: 'https://example.com/textbooks/os_concepts.pdf',
    coverUrl: null,
    pages: 944,
    uploadedAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'tb3',
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz, Henry Korth',
    edition: '7th Edition',
    courseCode: 'CSC303',
    courseName: 'Database Systems',
    fileUrl: 'https://example.com/textbooks/db_concepts.pdf',
    coverUrl: null,
    pages: 1376,
    uploadedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'tb4',
    title: 'Introduction to Algorithms',
    author: 'Cormen, Leiserson, Rivest, Stein',
    edition: '4th Edition',
    courseCode: 'CSC201',
    courseName: 'Data Structures & Algorithms',
    fileUrl: 'https://example.com/textbooks/clrs.pdf',
    coverUrl: null,
    pages: 1312,
    uploadedAt: '2024-01-12T00:00:00Z',
  },
  {
    id: 'tb5',
    title: 'Electric Circuits',
    author: 'James W. Nilsson, Susan Riedel',
    edition: '12th Edition',
    courseCode: 'EEE301',
    courseName: 'Circuit Theory',
    fileUrl: 'https://example.com/textbooks/electric_circuits.pdf',
    coverUrl: null,
    pages: 880,
    uploadedAt: '2024-01-15T00:00:00Z',
  },
];

// ── My Uploads ────────────────────────────────────────────────────────────────

export const DUMMY_MY_UPLOADS = [
  {
    id: 'up1',
    upload_type: 'past_question',
    title: 'CSC301 — 2023/2024 Final Exam',
    course_code: 'CSC301',
    academic_session: '2023/2024',
    exam_type: 'Final',
    status: 'approved',
    file_size: 1245184,
    rejection_reason: null,
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'up2',
    upload_type: 'past_question',
    title: 'EEE301 — 2022/2023 Final Exam',
    course_code: 'EEE301',
    academic_session: '2022/2023',
    exam_type: 'Final',
    status: 'pending',
    file_size: 2201600,
    rejection_reason: null,
    created_at: '2024-02-10T14:30:00Z',
  },
  {
    id: 'up3',
    upload_type: 'past_question',
    title: 'CSC303 — 2021/2022 Midterm',
    course_code: 'CSC303',
    academic_session: '2021/2022',
    exam_type: 'Midterm',
    status: 'rejected',
    file_size: 983040,
    rejection_reason: 'Image quality is too low to read questions clearly. Please upload a clearer scan.',
    created_at: '2024-01-20T09:15:00Z',
  },
];

// ── Admin Dashboard Stats ─────────────────────────────────────────────────────

export const DUMMY_ADMIN_DASHBOARD = {
  totalUsers: 1247,
  totalQuestions: 834,
  totalLectures: 291,
  pendingApprovals: 14,
  activeToday: 89,
  newUsersThisWeek: 96,
  recentActivity: [
    { id: 'act1', type: 'user_signup', message: 'New user registered: chidera.obi@student.oau.edu.ng', created_at: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 'act2', type: 'question_upload', message: 'New past question uploaded for CSC301 (2023/2024)', created_at: new Date(Date.now() - 18 * 60000).toISOString() },
    { id: 'act3', type: 'question_approved', message: 'Admin approved EEE301 — 2022/2023 Final Exam', created_at: new Date(Date.now() - 32 * 60000).toISOString() },
    { id: 'act4', type: 'user_signup', message: 'New user registered: tunde.falola@student.oau.edu.ng', created_at: new Date(Date.now() - 45 * 60000).toISOString() },
    { id: 'act5', type: 'lecture_processed', message: 'Lecture processed: Memory Management & Paging (CSC301)', created_at: new Date(Date.now() - 72 * 60000).toISOString() },
  ],
};

// ── Admin Pending Questions ───────────────────────────────────────────────────

export const DUMMY_PENDING_QUESTIONS = [
  {
    id: 'pq1',
    course_code: 'CSC305',
    course_name: 'Computer Networks',
    academic_session: '2023/2024',
    exam_type: 'Final',
    file_url: 'https://example.com/questions/csc305_2024.pdf',
    uploaded_by_email: 'student@oau.edu.ng',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'pq2',
    course_code: 'CSC207',
    course_name: 'Discrete Mathematics',
    academic_session: '2022/2023',
    exam_type: 'Final',
    file_url: 'https://example.com/questions/csc207_2023.pdf',
    uploaded_by_email: 'another.student@oau.edu.ng',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'pq3',
    course_code: 'EEE301',
    course_name: 'Circuit Theory',
    academic_session: '2023/2024',
    exam_type: 'Midterm',
    file_url: 'https://example.com/questions/eee301_2024_mid.pdf',
    uploaded_by_email: 'ee.student@oau.edu.ng',
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
];

// ── Admin Pending Uploads ─────────────────────────────────────────────────────

export const DUMMY_PENDING_UPLOADS = [
  {
    id: 'pu1',
    upload_type: 'past_question',
    title: 'CSC305 — 2023/2024 Final',
    course_code: 'CSC305',
    academic_session: '2023/2024',
    exam_type: 'Final',
    file_url: 'https://example.com/uploads/csc305_2024.pdf',
    submitted_by_email: 'student@oau.edu.ng',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'pu2',
    upload_type: 'textbook',
    title: 'Computer Networks — Tanenbaum 5th Ed.',
    course_code: 'CSC305',
    academic_session: null,
    exam_type: null,
    file_url: 'https://example.com/uploads/cn_tanenbaum.pdf',
    submitted_by_email: 'another@oau.edu.ng',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

// ── Admin Users List ──────────────────────────────────────────────────────────

export const DUMMY_USERS = [
  { id: 'u1', email: 'chidera.obi@student.oau.edu.ng', display_name: 'Chidera Obi', role: 'user', is_suspended: false, created_at: '2025-01-10T08:00:00Z', last_active: new Date(Date.now() - 3 * 60000).toISOString() },
  { id: 'u2', email: 'tunde.falola@student.oau.edu.ng', display_name: 'Tunde Falola', role: 'user', is_suspended: false, created_at: '2025-01-15T09:30:00Z', last_active: new Date(Date.now() - 25 * 60000).toISOString() },
  { id: 'u3', email: 'amara.bello@student.oau.edu.ng', display_name: 'Amara Bello', role: 'user', is_suspended: false, created_at: '2025-01-20T11:00:00Z', last_active: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'u4', email: 'ngozi.adeola@student.oau.edu.ng', display_name: 'Ngozi Adeola', role: 'user', is_suspended: true, created_at: '2025-02-01T10:00:00Z', last_active: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'u5', email: 'admin@vectra.app', display_name: 'Vectra Admin', role: 'admin', is_suspended: false, created_at: '2024-12-01T00:00:00Z', last_active: new Date(Date.now() - 10 * 60000).toISOString() },
  { id: 'u6', email: 'kemi.dada@student.oau.edu.ng', display_name: 'Kemi Dada', role: 'user', is_suspended: false, created_at: '2025-02-05T14:00:00Z', last_active: new Date(Date.now() - 86400000).toISOString() },
];

// ── Study Groups ──────────────────────────────────────────────────────────────

export const DUMMY_GROUPS = [
  {
    id: 'g1',
    name: 'CSC301 Study Gang',
    description: 'For 300 level CSC students preparing for OS exams. Share notes, ask questions, discuss concepts.',
    course_code: 'CSC301',
    member_count: 24,
    max_members: 50,
    created_by: 'Chidera Obi',
    invite_code: 'CSC301A',
    created_at: '2025-02-15T08:00:00Z',
    is_member: true,
  },
  {
    id: 'g2',
    name: 'Database Masters',
    description: 'CSC303 study group. SQL, normalization, transactions — let\'s crack it together!',
    course_code: 'CSC303',
    member_count: 18,
    max_members: 30,
    created_by: 'Tunde Falola',
    invite_code: 'DBMST1',
    created_at: '2025-02-20T10:00:00Z',
    is_member: true,
  },
  {
    id: 'g3',
    name: 'EEE Circuit Breakers',
    description: 'Electrical engineering study group. Circuit theory, power systems, and more.',
    course_code: 'EEE301',
    member_count: 15,
    max_members: 30,
    created_by: 'Amara Bello',
    invite_code: 'EEECRK',
    created_at: '2025-03-01T12:00:00Z',
    is_member: false,
  },
];

// ── Group Messages ────────────────────────────────────────────────────────────

export const DUMMY_GROUP_MESSAGES = [
  { id: 'gm1', group_id: 'g1', sender_name: 'Chidera Obi', sender_email: 'chidera@oau.edu.ng', message: 'Has anyone seen the 2023 past question? The scheduling question on section B is tough', created_at: new Date(Date.now() - 4 * 3600000).toISOString(), is_mine: false },
  { id: 'gm2', group_id: 'g1', sender_name: 'Tunde Falola', sender_email: 'tunde@oau.edu.ng', message: 'Yeah, I uploaded it yesterday. Round Robin with quantum 4ms. I got avg waiting time of 5.5ms.', created_at: new Date(Date.now() - 3.5 * 3600000).toISOString(), is_mine: false },
  { id: 'gm3', group_id: 'g1', sender_name: 'You', sender_email: 'me@oau.edu.ng', message: 'I got 5ms actually. Let me re-check the Gantt chart', created_at: new Date(Date.now() - 3 * 3600000).toISOString(), is_mine: true },
  { id: 'gm4', group_id: 'g1', sender_name: 'Kemi Dada', sender_email: 'kemi@oau.edu.ng', message: 'Prof said the exam will focus heavily on memory management and deadlocks this year. Check the AI recap on Vectra, it\'s really helpful!', created_at: new Date(Date.now() - 2 * 3600000).toISOString(), is_mine: false },
  { id: 'gm5', group_id: 'g1', sender_name: 'Ngozi Adeola', sender_email: 'ngozi@oau.edu.ng', message: 'Does anyone have notes on Banker\'s Algorithm? I\'m struggling with the safe state detection.', created_at: new Date(Date.now() - 1 * 3600000).toISOString(), is_mine: false },
  { id: 'gm6', group_id: 'g1', sender_name: 'Chidera Obi', sender_email: 'chidera@oau.edu.ng', message: 'I\'ll share my notes after lecture today. Also reminder: group study session tomorrow at 4pm in the library!', created_at: new Date(Date.now() - 30 * 60000).toISOString(), is_mine: false },
];

// ── My Shares ─────────────────────────────────────────────────────────────────

export const DUMMY_MY_SHARES = [
  {
    id: 'sh1',
    code: 'MEM301',
    resource_type: 'lecture',
    resource_title: 'Memory Management & Paging',
    course_code: 'CSC301',
    current_uses: 7,
    max_uses: null,
    is_active: true,
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'sh2',
    code: 'EEQ022',
    resource_type: 'past_question',
    resource_title: 'EEE301 — 2022 Final Exam',
    course_code: 'EEE301',
    current_uses: 12,
    max_uses: 20,
    is_active: true,
    expires_at: null,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'sh3',
    code: 'DBSQL3',
    resource_type: 'lecture',
    resource_title: 'SQL Joins & Query Optimization',
    course_code: 'CSC303',
    current_uses: 3,
    max_uses: null,
    is_active: false,
    expires_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

// ── Shared With Me ────────────────────────────────────────────────────────────

export const DUMMY_SHARED_WITH_ME = [
  {
    id: 'swm1',
    code: 'CPU301',
    resource_type: 'lecture',
    resource_title: 'CPU Scheduling Algorithms',
    course_code: 'CSC301',
    shared_by_email: 'chidera.obi@student.oau.edu.ng',
    redeemed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    resource_id: 'lec2',
  },
  {
    id: 'swm2',
    code: 'DBMQ23',
    resource_type: 'past_question',
    resource_title: 'CSC303 — 2023/2024 Final Exam',
    course_code: 'CSC303',
    shared_by_email: 'tunde.falola@student.oau.edu.ng',
    redeemed_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    resource_id: 'q4',
  },
];

// ── AI Messages (Chat History Seed) ──────────────────────────────────────────

export const DUMMY_AI_MESSAGES = [
  { id: 'ai_seed_1', role: 'user', content: 'What is the difference between paging and segmentation?' },
  { id: 'ai_seed_2', role: 'assistant', content: 'Great question! Here\'s the key difference:\n\n**Paging** divides memory into fixed-size blocks. The logical address space is split into pages, and physical memory into frames of the same size. This eliminates external fragmentation but can cause internal fragmentation.\n\n**Segmentation** divides memory into variable-size segments based on logical divisions (code, data, stack). This matches the programmer\'s view of memory but suffers from external fragmentation.\n\nKey comparison:\n- Paging: fixed size, OS perspective, no external fragmentation\n- Segmentation: variable size, programmer perspective, no internal fragmentation\n\nModern systems often combine both (segmented paging).' },
];

// ── Academic Sessions ─────────────────────────────────────────────────────────

export const DUMMY_SESSIONS = [
  { id: 's1', label: '2024/2025', value: '2024/2025' },
  { id: 's2', label: '2023/2024', value: '2023/2024' },
  { id: 's3', label: '2022/2023', value: '2022/2023' },
  { id: 's4', label: '2021/2022', value: '2021/2022' },
  { id: 's5', label: '2020/2021', value: '2020/2021' },
  { id: 's6', label: '2019/2020', value: '2019/2020' },
  { id: 's7', label: '2018/2019', value: '2018/2019' },
  { id: 's8', label: '2017/2018', value: '2017/2018' },
];
