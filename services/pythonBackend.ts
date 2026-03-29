import { Question, AssessmentScores } from "../types";

declare global {
  interface Window {
    loadPyodide: any;
  }
}

let pyodideInstance: any = null;

/**
 * Initializes the Python environment in the browser.
 */
export async function initPython(): Promise<void> {
  if (pyodideInstance) return;
  
  if (typeof window.loadPyodide === 'undefined') {
    throw new Error("Pyodide script not loaded. Check index.html.");
  }

  pyodideInstance = await window.loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"
  });
}

/**
 * Executes scoring logic using Python 3.11.
 * This runs in a dedicated WASM context for maximum precision and institutional validity.
 */
export async function calculateScoresInPython(questions: Question[], answers: Record<number, string>): Promise<AssessmentScores> {
  await initPython();

  const pythonScript = `
import json

def calculate_assessment_scores(questions_json, answers_json):
    questions = json.loads(questions_json)
    answers = json.loads(answers_json)
    
    raw_totals = {"knowledge": 0.0, "attitude": 0.0, "engagement": 0.0, "exposure": 0.0}
    type_counts = {"knowledge": 0, "attitude": 0, "engagement": 0, "exposure": 0}
    
    for q in questions:
        # Normalize type to lowercase to avoid KeyError if AI title-cases labels
        q_type = str(q.get('type', 'knowledge')).lower()
        
        # Safeguard: if the AI returned a type not in our scoring keys, ignore or treat as knowledge
        if q_type not in raw_totals:
            q_type = 'knowledge'
            
        type_counts[q_type] += 1
        user_answer = answers.get(str(q['id']))
        
        if user_answer:
            if q_type == 'knowledge':
                if user_answer == q.get('correctAnswer'):
                    raw_totals['knowledge'] += 1.0
            else:
                # Calculate based on option index (assuming 4 options, highest index is least sustainable)
                try:
                    options = q['options']
                    idx = options.index(user_answer)
                    # 0=25pts, 1=16.6pts, 2=8.3pts, 3=0pts (scaled to 1.0)
                    score_multiplier = max(0.0, 3.0 - float(idx)) / 3.0
                    raw_totals[q_type] += score_multiplier
                except (ValueError, IndexError):
                    pass
                    
    # Final normalized scores (0-25 per category)
    results = {
        "knowledge": round((raw_totals['knowledge'] / max(1, type_counts['knowledge'])) * 25),
        "attitude": round((raw_totals['attitude'] / max(1, type_counts['attitude'])) * 25),
        "engagement": round((raw_totals['engagement'] / max(1, type_counts['engagement'])) * 25),
        "exposure": round((raw_totals['exposure'] / max(1, type_counts['exposure'])) * 25)
    }
    
    results['total'] = int(sum(results.values()))
    return json.dumps(results)

# Execute via globally exposed bridge
calculate_assessment_scores(questions_input, answers_input)
`;

  // Inject raw data into Python globals
  pyodideInstance.globals.set("questions_input", JSON.stringify(questions));
  pyodideInstance.globals.set("answers_input", JSON.stringify(answers));

  try {
    const jsonResult = await pyodideInstance.runPythonAsync(pythonScript);
    return JSON.parse(jsonResult) as AssessmentScores;
  } catch (err) {
    console.error("Python Execution Error:", err);
    throw new Error("Python Backend Failed to process data.");
  }
}
