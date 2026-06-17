const { getClient, deployment } = require("../config/azureOpenAI");

const USE_MOCK = process.env.USE_MOCK === "true";

async function analyzeResume(resumeText) {
  if (USE_MOCK) {
    return {
      score: 78,
      strengths: [
        "Clear, well-structured work history",
        "Relevant skills section present",
        "Good use of action verbs",
      ],
      weaknesses: [
        "Summary is generic, not targeted to a role",
        "Few quantified achievements (numbers, %, impact)",
      ],
      suggestions: [
        "Add metrics to bullets (e.g., 'cut load time by 40%')",
        "Tailor the summary to the target role",
        "Keep to one page if under ~10 years experience",
      ],
    };
  }

  const systemPrompt =
    "You are a professional resume reviewer. Analyze the candidate's resume text " +
    "and give constructive, specific feedback. Respond ONLY with valid JSON in this " +
    "exact shape, no markdown: " +
    '{"score": number, "strengths": string[], "weaknesses": string[], "suggestions": string[]}. ' +
    "The score is 0-100 based on clarity, impact, relevance, and completeness.";

  const response = await getClient().chat.completions.create({
    model: deployment,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: resumeText },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { analyzeResume };
