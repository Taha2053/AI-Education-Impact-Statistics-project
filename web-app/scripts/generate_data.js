const fs = require('fs');
const path = require('path');

const COUNTRIES = ['India', 'Indonesia', 'Bangladesh', 'Turkey'];
const MAJORS = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Medicine'];
const AI_TOOLS = ['ChatGPT', 'Gemini', 'Copilot', 'Claude', 'None'];

const NUM_STUDENTS = 500;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateStudent(id) {
  const country = randomChoice(COUNTRIES);
  const major = randomChoice(MAJORS);
  
  // Correlate AI usage with GPA slightly (just for fun/simulation)
  // Higher AI usage might correlate with slightly higher efficiency but maybe mixed GPA results
  const aiUsageHours = randomInt(0, 20); 
  const studyHours = randomInt(5, 40);
  
  let gpaBase = 2.5;
  if (studyHours > 20) gpaBase += 0.5;
  if (aiUsageHours > 5 && aiUsageHours < 15) gpaBase += 0.3; // Sweet spot?
  
  let gpa = gpaBase + randomFloat(-0.5, 0.5);
  gpa = Math.max(0, Math.min(4.0, gpa));

  return {
    id: `STU${id}`,
    country,
    major,
    ai_tool: randomChoice(AI_TOOLS),
    ai_usage_hours: aiUsageHours,
    study_hours_per_week: studyHours,
    gpa: parseFloat(gpa.toFixed(2)),
    stress_level: randomInt(1, 10),
    satisfaction_score: randomInt(1, 10)
  };
}

const students = Array.from({ length: NUM_STUDENTS }, (_, i) => generateStudent(i + 1));

// Calculate summaries
const countrySummary = COUNTRIES.map(country => {
  const countryStudents = students.filter(s => s.country === country);
  const avgGpa = countryStudents.reduce((sum, s) => sum + s.gpa, 0) / countryStudents.length;
  const avgAiUsage = countryStudents.reduce((sum, s) => sum + s.ai_usage_hours, 0) / countryStudents.length;
  
  return {
    country,
    student_count: countryStudents.length,
    avg_gpa: parseFloat(avgGpa.toFixed(2)),
    avg_ai_usage: parseFloat(avgAiUsage.toFixed(2))
  };
});

// Mock correlations (hardcoded for simplicity or calculated)
const correlations = {
  "gpa_vs_ai_usage": 0.15,
  "gpa_vs_study_hours": 0.45,
  "stress_vs_ai_usage": -0.1
};

const metadata = {
  description: "Synthetic dataset for AI Study Analytics",
  generated_at: new Date().toISOString(),
  fields: {
    gpa: "Grade Point Average (0.0 - 4.0)",
    ai_usage_hours: "Hours spent using AI tools per week",
    study_hours_per_week: "Hours spent studying per week",
    stress_level: "Self-reported stress level (1-10)"
  }
};

const data = {
  students,
  country_summary: countrySummary,
  correlations,
  metadata
};

const outputPath = path.join(__dirname, '../public/data.json');
// Ensure public dir exists (it should in Vite)
// But we are running this from 'scripts' folder potentially, or root.
// Let's assume we run from root.
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)){
    fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
console.log(`Data generated at ${outputPath}`);
