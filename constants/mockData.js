// Mock universities, faculties, departments, courses - same structure as web Frontend
export const MOCK_USERS = {
  'student@oauife.edu.ng': {
    id: 'user_1',
    email: 'student@oauife.edu.ng',
    displayName: 'Adewale Ogunlade',
    password: 'student123',
    isStudentEmail: true,
    role: ['user'],
    avatarUrl: null,
  },
  'john@gmail.com': {
    id: 'user_2',
    email: 'john@gmail.com',
    displayName: 'John Doe',
    password: 'user123',
    isStudentEmail: false,
    role: ['user'],
    avatarUrl: null,
  },
  'admin@vectra.app': {
    id: 'user_3',
    email: 'admin@vectra.app',
    displayName: 'Admin User',
    password: 'admin123',
    isStudentEmail: false,
    role: ['user', 'admin', 'contributor'],
    avatarUrl: null,
  },
};

export const SESSIONS = ['2021/2022', '2022/2023', '2023/2024', '2024/2025', '2025/2026'];
export const CURRENT_SESSION = '2024/2025';

export const UNIVERSITIES = [
  {
    id: 'oau',
    name: 'Obafemi Awolowo University',
    shortName: 'OAU',
    location: 'Ile-Ife, Osun State',
    faculties: [
      {
        id: 'fac_sci',
        name: 'Faculty of Science',
        departments: [
          {
            id: 'dept_phy',
            name: 'Physics',
            code: 'PHY',
            levels: ['Part 1', 'Part 2', 'Part 3', 'Part 4'],
            courses: {
              'Part 1': [
                { code: 'PHY 101', name: 'General Physics I', units: 3, semesters: ['First Semester'] },
                { code: 'PHY 102', name: 'General Physics II', units: 3, semesters: ['Second Semester'] },
                { code: 'PHY 107', name: 'General Physics Lab I', units: 1, semesters: ['First Semester'] },
                { code: 'PHY 108', name: 'General Physics Lab II', units: 1, semesters: ['Second Semester'] },
              ],
              'Part 2': [
                { code: 'PHY 201', name: 'Mechanics & Properties of Matter', units: 3, semesters: ['First Semester'] },
                { code: 'PHY 202', name: 'Heat and Thermodynamics', units: 3, semesters: ['Second Semester'] },
                { code: 'PHY 203', name: 'Electricity and Magnetism I', units: 3, semesters: ['First Semester'] },
                { code: 'PHY 204', name: 'Electricity and Magnetism II', units: 3, semesters: ['Second Semester'] },
              ],
              'Part 3': [
                { code: 'PHY 301', name: 'Classical Mechanics', units: 3, semesters: ['First Semester'] },
                { code: 'PHY 302', name: 'Quantum Mechanics I', units: 3, semesters: ['Second Semester'] },
                { code: 'PHY 303', name: 'Electromagnetic Theory I', units: 3, semesters: ['First Semester'] },
                { code: 'PHY 305', name: 'Statistical Physics', units: 3, semesters: ['First Semester'] },
                { code: 'PHY 307', name: 'Electronics I', units: 3, semesters: ['First Semester'] },
              ],
              'Part 4': [
                { code: 'PHY 401', name: 'Quantum Mechanics II', units: 3, semesters: ['First Semester'] },
                { code: 'PHY 403', name: 'Nuclear Physics', units: 3, semesters: ['First Semester'] },
                { code: 'PHY 405', name: 'Solid State Physics', units: 3, semesters: ['Second Semester'] },
              ],
            },
          },
          {
            id: 'dept_chem',
            name: 'Chemistry',
            code: 'CHM',
            levels: ['Part 1', 'Part 2', 'Part 3', 'Part 4'],
            courses: {
              'Part 1': [
                { code: 'CHM 101', name: 'General Chemistry I', units: 3, semesters: ['First Semester'] },
                { code: 'CHM 102', name: 'General Chemistry II', units: 3, semesters: ['Second Semester'] },
              ],
              'Part 2': [
                { code: 'CHM 201', name: 'Physical Chemistry I', units: 3, semesters: ['First Semester'] },
                { code: 'CHM 202', name: 'Organic Chemistry I', units: 3, semesters: ['Second Semester'] },
              ],
              'Part 3': [
                { code: 'CHM 301', name: 'Physical Chemistry II', units: 3, semesters: ['First Semester'] },
                { code: 'CHM 302', name: 'Organic Chemistry II', units: 3, semesters: ['Second Semester'] },
              ],
              'Part 4': [
                { code: 'CHM 401', name: 'Advanced Physical Chemistry', units: 3, semesters: ['First Semester'] },
              ],
            },
          },
          {
            id: 'dept_math',
            name: 'Mathematics',
            code: 'MTH',
            levels: ['Part 1', 'Part 2', 'Part 3', 'Part 4'],
            courses: {
              'Part 1': [
                { code: 'MTH 101', name: 'Elementary Mathematics I', units: 3, semesters: ['First Semester'] },
                { code: 'MTH 102', name: 'Elementary Mathematics II', units: 3, semesters: ['Second Semester'] },
              ],
              'Part 2': [
                { code: 'MTH 201', name: 'Mathematical Methods I', units: 3, semesters: ['First Semester'] },
                { code: 'MTH 202', name: 'Linear Algebra I', units: 3, semesters: ['Second Semester'] },
              ],
              'Part 3': [
                { code: 'MTH 301', name: 'Abstract Algebra', units: 3, semesters: ['First Semester'] },
                { code: 'MTH 302', name: 'Complex Analysis', units: 3, semesters: ['Second Semester'] },
              ],
              'Part 4': [
                { code: 'MTH 401', name: 'Functional Analysis', units: 3, semesters: ['First Semester'] },
              ],
            },
          },
        ],
      },
      {
        id: 'fac_eng',
        name: 'Faculty of Engineering',
        departments: [
          {
            id: 'dept_ece',
            name: 'Electronic & Electrical Engineering',
            code: 'EEE',
            levels: ['Part 1', 'Part 2', 'Part 3', 'Part 4', 'Part 5'],
            courses: {
              'Part 1': [
                { code: 'EEE 101', name: 'Intro to Electrical Engineering', units: 2, semesters: ['First Semester'] },
              ],
              'Part 2': [
                { code: 'EEE 201', name: 'Circuit Theory I', units: 3, semesters: ['First Semester'] },
                { code: 'EEE 202', name: 'Circuit Theory II', units: 3, semesters: ['Second Semester'] },
              ],
              'Part 3': [
                { code: 'EEE 301', name: 'Electronics I', units: 3, semesters: ['First Semester'] },
                { code: 'EEE 302', name: 'Electronics II', units: 3, semesters: ['Second Semester'] },
              ],
              'Part 4': [
                { code: 'EEE 401', name: 'Digital Systems', units: 3, semesters: ['First Semester'] },
              ],
              'Part 5': [
                { code: 'EEE 501', name: 'Power Systems', units: 3, semesters: ['First Semester'] },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'unilag',
    name: 'University of Lagos',
    shortName: 'UNILAG',
    location: 'Akoka, Lagos State',
    faculties: [
      {
        id: 'fac_sci_unilag',
        name: 'Faculty of Science',
        departments: [
          {
            id: 'dept_cs_unilag',
            name: 'Computer Science',
            code: 'CSC',
            levels: ['100 Level', '200 Level', '300 Level', '400 Level'],
            courses: {
              '100 Level': [
                { code: 'CSC 101', name: 'Introduction to Computer Science', units: 3, semesters: ['First Semester'] },
                { code: 'CSC 102', name: 'Introduction to Programming', units: 3, semesters: ['Second Semester'] },
              ],
              '200 Level': [
                { code: 'CSC 201', name: 'Data Structures', units: 3, semesters: ['First Semester'] },
                { code: 'CSC 202', name: 'Computer Architecture', units: 3, semesters: ['Second Semester'] },
              ],
              '300 Level': [
                { code: 'CSC 301', name: 'Operating Systems', units: 3, semesters: ['First Semester'] },
                { code: 'CSC 302', name: 'Database Systems', units: 3, semesters: ['Second Semester'] },
              ],
              '400 Level': [
                { code: 'CSC 401', name: 'Artificial Intelligence', units: 3, semesters: ['First Semester'] },
              ],
            },
          },
        ],
      },
    ],
  },
];

// Helper function to get all courses across all universities
export function getAllCourses() {
  const allCourses = [];
  UNIVERSITIES.forEach(university => {
    university.faculties.forEach(faculty => {
      faculty.departments.forEach(department => {
        Object.entries(department.courses).forEach(([level, courses]) => {
          courses.forEach(course => {
            allCourses.push({
              ...course,
              universityId: university.id,
              universityName: university.name,
              universityShortName: university.shortName,
              facultyId: faculty.id,
              facultyName: faculty.name,
              departmentId: department.id,
              departmentName: department.name,
              departmentCode: department.code,
              level,
            });
          });
        });
      });
    });
  });
  return allCourses;
}

// Mock questions
export const MOCK_QUESTIONS = [
  { id: 'q1', courseCode: 'PHY 301', session: '2023/2024', semester: 'First Semester', type: 'Exam', pages: 4, title: 'PHY 301 Exam 2023/2024' },
  { id: 'q2', courseCode: 'PHY 301', session: '2023/2024', semester: 'First Semester', type: 'Test', pages: 2, title: 'PHY 301 Test 1 2023/2024' },
  { id: 'q3', courseCode: 'PHY 301', session: '2022/2023', semester: 'First Semester', type: 'Exam', pages: 5, title: 'PHY 301 Exam 2022/2023' },
  { id: 'q4', courseCode: 'PHY 303', session: '2023/2024', semester: 'First Semester', type: 'Exam', pages: 3, title: 'PHY 303 Exam 2023/2024' },
  { id: 'q5', courseCode: 'PHY 305', session: '2023/2024', semester: 'First Semester', type: 'Exam', pages: 4, title: 'PHY 305 Exam 2023/2024' },
  { id: 'q6', courseCode: 'PHY 302', session: '2023/2024', semester: 'Second Semester', type: 'Exam', pages: 3, title: 'PHY 302 Exam 2023/2024' },
  { id: 'q7', courseCode: 'CHM 201', session: '2023/2024', semester: 'First Semester', type: 'Exam', pages: 4, title: 'CHM 201 Exam 2023/2024' },
  { id: 'q8', courseCode: 'CHM 201', session: '2023/2024', semester: 'First Semester', type: 'Test', pages: 2, title: 'CHM 201 Test 2023/2024' },
  { id: 'q9', courseCode: 'CSC 201', session: '2023/2024', semester: 'First Semester', type: 'Exam', pages: 3, title: 'CSC 201 Exam 2023/2024' },
  { id: 'q10', courseCode: 'MTH 301', session: '2023/2024', semester: 'First Semester', type: 'Exam', pages: 4, title: 'MTH 301 Exam 2023/2024' },
];

// Mock textbooks
export const MOCK_TEXTBOOKS = [
  { id: 'tb1', courseCode: 'PHY 301', title: 'Classical Mechanics', author: 'Herbert Goldstein', edition: '3rd Edition', type: 'Recommended', isbn: '978-0201657029', coverUrl: null },
  { id: 'tb2', courseCode: 'PHY 301', title: 'An Introduction to Mechanics', author: 'Daniel Kleppner', edition: '2nd Edition', type: 'Supplementary', isbn: '978-0521198219', coverUrl: null },
  { id: 'tb3', courseCode: 'PHY 302', title: 'Introduction to Quantum Mechanics', author: 'David J. Griffiths', edition: '3rd Edition', type: 'Recommended', isbn: '978-1107189638', coverUrl: null },
  { id: 'tb4', courseCode: 'PHY 303', title: 'Introduction to Electrodynamics', author: 'David J. Griffiths', edition: '4th Edition', type: 'Recommended', isbn: '978-1108420419', coverUrl: null },
  { id: 'tb5', courseCode: 'CHM 201', title: 'Physical Chemistry', author: 'Peter Atkins', edition: '11th Edition', type: 'Recommended', isbn: '978-0198769866', coverUrl: null },
];

// Mock lectures (for Vectra feature)
export const MOCK_LECTURES = [
  {
    id: 'lec_1',
    courseCode: 'PHY 301',
    courseName: 'Classical Mechanics',
    topic: "Newton's Second Law",
    lecturer: 'Dr. Adeyemi',
    date: '2026-01-21',
    duration: 930,
    status: 'completed',
    isFavorite: true,
    audioUrl: null,
    transcript: "Today we're going to discuss Newton's Second Law of Motion. The second law states that the acceleration of an object is directly proportional to the net force acting on it...",
    structuredMarkdown: "# Newton's Second Law\n\n## Overview\nNewton's Second Law establishes the relationship between force, mass, and acceleration. It is the cornerstone of classical mechanics.\n\n## Main Equation\n$$F = ma$$\n\nWhere:\n- **F** = Net force (Newtons, N)\n- **m** = Mass (kilograms, kg)\n- **a** = Acceleration (m/s²)\n\n## Key Concepts\n- Force is a vector quantity\n- Acceleration is in the direction of the net force\n- Mass is a measure of inertia\n\n## Derivations\n### From momentum:\n$$F = \\frac{dp}{dt} = \\frac{d(mv)}{dt}$$\n\nFor constant mass:\n$$F = m\\frac{dv}{dt} = ma$$\n\n## Examples\n1. A 5 kg block on a frictionless surface with 10 N applied force: a = F/m = 10/5 = 2 m/s²\n2. A 1000 kg car accelerating at 3 m/s²: F = 1000 × 3 = 3000 N",
    photos: [
      { id: 'p1', uri: 'https://via.placeholder.com/300x200', caption: 'Free body diagram', timestamp: 120 },
      { id: 'p2', uri: 'https://via.placeholder.com/300x200', caption: 'Force vectors', timestamp: 340 },
    ],
    createdAt: '2026-01-21T14:00:00Z',
  },
  {
    id: 'lec_2',
    courseCode: 'PHY 301',
    courseName: 'Classical Mechanics',
    topic: 'Conservation of Momentum',
    lecturer: 'Dr. Adeyemi',
    date: '2026-01-23',
    duration: 1350,
    status: 'completed',
    isFavorite: false,
    audioUrl: null,
    transcript: "Let us now discuss the principle of conservation of momentum...",
    structuredMarkdown: "# Conservation of Momentum\n\n## Overview\nThe law of conservation of momentum states that the total momentum of a closed system remains constant.\n\n## Equation\n$$p_{total} = \\sum m_i v_i = \\text{constant}$$\n\n## Key Concepts\n- Momentum is conserved in isolated systems\n- Applies to elastic and inelastic collisions\n- Vector quantity - direction matters\n\n## Types of Collisions\n### Elastic Collision\nBoth momentum and kinetic energy conserved.\n\n### Inelastic Collision\nOnly momentum conserved; kinetic energy is not.",
    photos: [],
    createdAt: '2026-01-23T10:00:00Z',
  },
  {
    id: 'lec_3',
    courseCode: 'PHY 303',
    courseName: 'Electromagnetic Theory I',
    topic: "Gauss's Law",
    lecturer: 'Prof. Okonkwo',
    date: '2026-01-22',
    duration: 1800,
    status: 'completed',
    isFavorite: true,
    audioUrl: null,
    transcript: "Gauss's Law is one of the four Maxwell equations...",
    structuredMarkdown: "# Gauss's Law\n\n## Overview\nGauss's Law relates the electric flux through a closed surface to the charge enclosed.\n\n## Equation\n$$\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{enc}}{\\epsilon_0}$$\n\n## Key Concepts\n- Electric flux is proportional to enclosed charge\n- Works for any closed surface (Gaussian surface)\n- Most useful with symmetric charge distributions",
    photos: [],
    createdAt: '2026-01-22T09:00:00Z',
  },
  {
    id: 'lec_4',
    courseCode: 'PHY 305',
    courseName: 'Statistical Physics',
    topic: 'Boltzmann Distribution',
    lecturer: 'Dr. Nwosu',
    date: '2026-01-24',
    duration: 1200,
    status: 'processing',
    isFavorite: false,
    audioUrl: null,
    transcript: null,
    structuredMarkdown: null,
    photos: [],
    createdAt: '2026-01-24T11:00:00Z',
  },
  {
    id: 'lec_5',
    courseCode: 'CHM 201',
    courseName: 'Physical Chemistry I',
    topic: 'Chemical Equilibrium',
    lecturer: 'Dr. Oladipo',
    date: '2026-01-20',
    duration: 1500,
    status: 'completed',
    isFavorite: false,
    audioUrl: null,
    transcript: "Chemical equilibrium is the state where the rate of forward reaction equals the rate of reverse reaction...",
    structuredMarkdown: "# Chemical Equilibrium\n\n## Overview\nChemical equilibrium occurs when the forward and reverse reaction rates are equal.\n\n## Equilibrium Constant\n$$K = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$$\n\n## Le Chatelier's Principle\nIf a system at equilibrium is disturbed, it shifts to counteract the disturbance.",
    photos: [],
    createdAt: '2026-01-20T13:00:00Z',
  },
];

// Simulated AI responses
export const AI_RESPONSES = {
  recap: (topic) => `Here is a quick recap of "${topic}":\n\nThis lecture covered the fundamental principles and equations related to ${topic}. The key takeaway is understanding how these concepts apply to real-world physical phenomena.\n\nKey Points:\n1. The main governing equations were derived from first principles\n2. Several worked examples demonstrated practical applications\n3. The relationship between theoretical predictions and experimental observations was emphasized`,
  explain: (concept) => `Let me explain ${concept} in simpler terms:\n\nThink of it this way - ${concept} is essentially about understanding how physical quantities relate to each other. The key idea is that when one quantity changes, it affects others in predictable ways described by mathematical equations.\n\nA good analogy: imagine pushing a shopping cart. The harder you push (more force), the faster it accelerates. A heavier cart (more mass) requires more force to achieve the same acceleration.`,
  quiz: (topic) => `Here are some practice questions on "${topic}":\n\n1. Define the key equation discussed in this lecture and explain each variable.\n\n2. If the force applied to an object doubles while mass remains constant, what happens to acceleration?\n\n3. Explain the physical significance of the relationship between the variables.\n\n4. Provide a real-world example that demonstrates this concept.\n\nTry answering these on your own first, then ask me to check your answers!`,
  flashcards: (topic) => `Flashcards for "${topic}":\n\n---\nCard 1 - Front: What is the main equation?\nCard 1 - Back: F = ma (Force equals mass times acceleration)\n\n---\nCard 2 - Front: What are the SI units of force?\nCard 2 - Back: Newton (N) = kg*m/s²\n\n---\nCard 3 - Front: What happens to acceleration if mass doubles?\nCard 3 - Back: Acceleration halves (assuming constant force)\n\n---\nCard 4 - Front: Is force a scalar or vector quantity?\nCard 4 - Back: Vector - it has both magnitude and direction`,
  summarizeQuestions: (courseCode, count) => `Summary of ${count} past questions for ${courseCode}:\n\n**Key Topics Covered:**\n1. Fundamental principles and definitions\n2. Mathematical derivations and proofs\n3. Numerical problems and calculations\n4. Conceptual understanding questions\n\n**Common Question Types:**\n- Define and explain key terms (20%)\n- Derive equations from first principles (25%)\n- Solve numerical problems (40%)\n- Short answer conceptual questions (15%)\n\n**Recommended Preparation:**\n- Focus on understanding core equations\n- Practice numerical problem solving\n- Review lecture notes for definitions`,
  solveQuestion: (questionTitle) => `**Solution for: ${questionTitle}**\n\n**Step 1: Identify Given Information**\nList all known values and what we need to find.\n\n**Step 2: Select Relevant Equations**\nBased on the problem type, identify which formulas apply.\n\n**Step 3: Substitute and Solve**\nPlug in the known values and solve for unknowns.\n\n**Step 4: Verify Units**\nEnsure the final answer has correct units.\n\n**Final Answer:** [Calculated result with units]\n\n**Key Concepts Used:**\n- Relevant principle or law\n- Mathematical relationships`,
};
