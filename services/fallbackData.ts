import { Question, QuestionType } from "../types";

export const GUEST_QUESTIONS: Question[] = [
  { id: 101, text: "Which SDG focuses on 'Quality Education'?", type: QuestionType.KNOWLEDGE, options: ["SDG 1", "SDG 4", "SDG 10", "SDG 17"], correctAnswer: "SDG 4" },
  { id: 102, text: "What is the primary goal of SDG 13?", type: QuestionType.KNOWLEDGE, options: ["Life Below Water", "Climate Action", "Zero Hunger", "Gender Equality"], correctAnswer: "Climate Action" },
  { id: 103, text: "Sustainable development meets the needs of the present without compromising ______.", type: QuestionType.KNOWLEDGE, options: ["Past generations", "Future generations", "Current governments", "Large corporations"], correctAnswer: "Future generations" },
  { id: 104, text: "How often do you consider the environmental impact of your daily choices?", type: QuestionType.ATTITUDE, options: ["Always", "Frequently", "Occasionally", "Never"], correctAnswer: "Always" },
  { id: 105, text: "I believe individual actions can significantly contribute to global sustainability.", type: QuestionType.ATTITUDE, options: ["Strongly Agree", "Agree", "Disagree", "Strongly Disagree"], correctAnswer: "Strongly Agree" },
  { id: 106, text: "How often do you participate in sustainability-related events?", type: QuestionType.ENGAGEMENT, options: ["Weekly", "Monthly", "Yearly", "Never"], correctAnswer: "Weekly" },
  { id: 107, text: "Do you actively look for ways to reduce waste at home?", type: QuestionType.ENGAGEMENT, options: ["Yes, always", "Often", "Sometimes", "Rarely"], correctAnswer: "Yes, always" },
  { id: 108, text: "Are you aware of the UN Sustainable Development Goals?", type: QuestionType.EXPOSURE, options: ["Very Aware", "Somewhat Aware", "Vaguely Aware", "Not Aware"], correctAnswer: "Very Aware" },
  { id: 109, text: "How often do you see SDG-related content in your daily life?", type: QuestionType.EXPOSURE, options: ["Regularly", "Occasionally", "Rarely", "Never"], correctAnswer: "Regularly" },
  { id: 110, text: "Which SDG aims to 'End hunger, achieve food security and improved nutrition'?", type: QuestionType.KNOWLEDGE, options: ["SDG 1", "SDG 2", "SDG 3", "SDG 4"], correctAnswer: "SDG 2" },
  { id: 111, text: "SDG 5 focuses on achieving ______ equality.", type: QuestionType.KNOWLEDGE, options: ["Economic", "Gender", "Social", "Racial"], correctAnswer: "Gender" },
  { id: 112, text: "Which goal targets 'Clean Water and Sanitation'?", type: QuestionType.KNOWLEDGE, options: ["SDG 6", "SDG 7", "SDG 8", "SDG 9"], correctAnswer: "SDG 6" },
  { id: 113, text: "I am willing to change my consumption habits to help the environment.", type: QuestionType.ATTITUDE, options: ["Strongly Agree", "Agree", "Neutral", "Disagree"], correctAnswer: "Strongly Agree" },
  { id: 114, text: "Sustainability is a priority in my personal life.", type: QuestionType.ATTITUDE, options: ["Strongly Agree", "Agree", "Disagree", "Strongly Disagree"], correctAnswer: "Strongly Agree" },
  { id: 115, text: "Do you recycle your household waste?", type: QuestionType.ENGAGEMENT, options: ["Always", "Mostly", "Sometimes", "Never"], correctAnswer: "Always" },
  { id: 116, text: "Do you use reusable bags when shopping?", type: QuestionType.ENGAGEMENT, options: ["Always", "Frequently", "Occasionally", "Never"], correctAnswer: "Always" },
  { id: 117, text: "Have you ever seen an SDG logo in a public space?", type: QuestionType.EXPOSURE, options: ["Yes, many times", "A few times", "Once", "Never"], correctAnswer: "Yes, many times" },
  { id: 118, text: "How familiar are you with the concept of 'Circular Economy'?", type: QuestionType.EXPOSURE, options: ["Expert", "Familiar", "Heard of it", "Never heard of it"], correctAnswer: "Expert" },
  { id: 119, text: "Which SDG is about 'Life Below Water'?", type: QuestionType.KNOWLEDGE, options: ["SDG 12", "SDG 13", "SDG 14", "SDG 15"], correctAnswer: "SDG 14" },
  { id: 120, text: "SDG 17 is about ______ for the Goals.", type: QuestionType.KNOWLEDGE, options: ["Funding", "Partnerships", "Technology", "Education"], correctAnswer: "Partnerships" }
];

// Helper to generate repetitive but valid questions for large pools
const generatePool = (role: string, startId: number, count: number, difficulty: string): Question[] => {
  const types = [QuestionType.KNOWLEDGE, QuestionType.ATTITUDE, QuestionType.ENGAGEMENT, QuestionType.EXPOSURE];
  const pool: Question[] = [];
  const sdgs = [
    "No Poverty", "Zero Hunger", "Good Health", "Quality Education", "Gender Equality", 
    "Clean Water", "Affordable Energy", "Decent Work", "Industry & Innovation", "Reduced Inequalities",
    "Sustainable Cities", "Responsible Consumption", "Climate Action", "Life Below Water", "Life on Land",
    "Peace & Justice", "Partnerships"
  ];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const sdg = sdgs[i % sdgs.length];
    const id = startId + i;

    if (type === QuestionType.KNOWLEDGE) {
      pool.push({
        id,
        text: `[${difficulty}] Regarding ${sdg}, which of the following is a key target for 2030?`,
        type,
        options: ["Universal access", "Partial implementation", "Research phase", "Status quo"],
        correctAnswer: "Universal access"
      });
    } else if (type === QuestionType.ATTITUDE) {
      pool.push({
        id,
        text: `[${difficulty}] How strongly do you value the integration of ${sdg} into your ${role === 'Student' ? 'studies' : 'professional'} life?`,
        type,
        options: ["Extremely High", "High", "Moderate", "Low"],
        correctAnswer: "Extremely High"
      });
    } else if (type === QuestionType.ENGAGEMENT) {
      pool.push({
        id,
        text: `[${difficulty}] In the last month, how often have you taken action related to ${sdg}?`,
        type,
        options: ["Daily", "Weekly", "Once", "Never"],
        correctAnswer: "Daily"
      });
    } else {
      pool.push({
        id,
        text: `[${difficulty}] How often do you encounter institutional discussions regarding ${sdg} in your department?`,
        type,
        options: ["Very Frequently", "Frequently", "Occasionally", "Never"],
        correctAnswer: "Very Frequently"
      });
    }
  }
  return pool;
};

export const STUDENT_QUESTIONS: Question[] = generatePool('Student', 2000, 100, 'Medium');
export const FACULTY_QUESTIONS: Question[] = generatePool('Faculty/Staff', 3000, 100, 'Hard');
