const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Generate a comprehensive social impact report for a project
 */
async function generateReport(project) {
  const prompt = `You are a social impact analyst. Generate a comprehensive social impact report in markdown format for the following project:

**Project Title:** ${project.title}
**Description:** ${project.description}
**Category:** ${project.category}
**Date:** ${project.date ? new Date(project.date).toLocaleDateString() : 'N/A'}
**Location:** ${project.location || 'N/A'}
**Beneficiaries:** ${project.beneficiaries || 0}
**Volunteers:** ${project.volunteers || 0}
**Duration:** ${project.duration || 'N/A'}
**Funding Amount:** ₹${project.fundingAmount || 0}
**SDG Goals Targeted:** ${project.sdgGoals && project.sdgGoals.length > 0 ? project.sdgGoals.join(', ') : 'None specified'}
**Club:** ${project.club}

Please generate a detailed and professional report with the following sections:

1. **Executive Summary** — A concise overview of the project and its impact.
2. **Project Overview** — Detailed description of what the project involved, when and where it took place.
3. **Impact Analysis** — Quantitative and qualitative analysis of the project's social impact.
4. **Key Achievements** — Highlight the major accomplishments and milestones.
5. **Challenges & Learnings** — Discuss any challenges faced and lessons learned.
6. **Recommendations** — Suggestions for future improvement and scaling.
7. **Conclusion** — Summarize the overall impact and future outlook.

Use real data from the project details above. Make the report professional, data-driven, and suitable for stakeholder presentation.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

/**
 * Estimate attendance from an image using Gemini's multimodal capability
 */
async function estimateAttendance(imageBase64, mimeType) {
  const prompt = `Analyze this image and estimate the number of people visible in it. 
Look carefully at the entire image, including people who may be partially visible or in the background.
Respond with ONLY a single integer number representing your best estimate of the total number of people visible. 
Do not include any other text, explanation, or formatting — just the number.`;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType
    }
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = result.response;
  const text = response.text().trim();

  // Extract the number from the response
  const number = parseInt(text.replace(/[^0-9]/g, ''), 10);
  return isNaN(number) ? 0 : number;
}

/**
 * Generate social media captions for three platforms
 */
async function generateSocialMedia(project) {
  const prompt = `Generate social media captions for the following social impact project:

**Project Title:** ${project.title}
**Description:** ${project.description}
**Category:** ${project.category}
**Date:** ${project.date ? new Date(project.date).toLocaleDateString() : 'N/A'}
**Location:** ${project.location || 'N/A'}
**Beneficiaries:** ${project.beneficiaries || 0}
**Volunteers:** ${project.volunteers || 0}
**Club:** ${project.club}
**SDG Goals:** ${project.sdgGoals && project.sdgGoals.length > 0 ? project.sdgGoals.join(', ') : 'None specified'}

Generate captions for three platforms. Respond in EXACTLY this JSON format and nothing else:

{
  "instagram": "Your Instagram caption here (engaging, with relevant emojis, hashtags, max 2200 characters)",
  "twitter": "Your Twitter/X caption here (concise, impactful, max 280 characters)",
  "linkedin": "Your LinkedIn caption here (professional, detailed, with metrics and impact data)"
}

Requirements:
- Instagram: Engaging tone, use emojis, include relevant hashtags at the end, max 2200 characters
- Twitter/X: Concise and impactful, max 280 characters
- LinkedIn: Professional and detailed, mention metrics and impact, suitable for professional audience

Return ONLY valid JSON, no markdown code blocks, no extra text.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  let text = response.text().trim();

  // Strip markdown code fences if present
  text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    // Fallback: return a structured object with the raw text
    return {
      instagram: `🌟 ${project.title} — Making an impact! ${project.description} #SocialImpact #${project.category.replace(/\s+/g, '')} #${project.club.replace(/\s+/g, '')}`,
      twitter: `${project.title}: ${project.description.substring(0, 200)}`,
      linkedin: `${project.title}\n\n${project.description}\n\nImpact: ${project.beneficiaries} beneficiaries reached with ${project.volunteers} volunteers.`
    };
  }
}

/**
 * Analyze SDG alignment for a project
 */
async function analyzeSDGAlignment(project) {
  const prompt = `You are an expert on the United Nations Sustainable Development Goals (SDGs). Analyze the following social impact project and provide a detailed SDG alignment analysis.

**Project Title:** ${project.title}
**Description:** ${project.description}
**Category:** ${project.category}
**Beneficiaries:** ${project.beneficiaries || 0}
**Volunteers:** ${project.volunteers || 0}
**Location:** ${project.location || 'N/A'}
**Funding Amount:** ₹${project.fundingAmount || 0}
**Club:** ${project.club}
**Currently Tagged SDGs:** ${project.sdgGoals && project.sdgGoals.length > 0 ? project.sdgGoals.join(', ') : 'None specified'}

Please provide a comprehensive markdown analysis that includes:

1. **Primary SDG Alignments** — Which SDGs does this project directly contribute to and how?
2. **Secondary SDG Alignments** — Which SDGs does this project indirectly support?
3. **Impact Assessment per SDG** — For each aligned SDG, explain the specific targets and indicators the project addresses.
4. **Recommendations** — Suggest ways to strengthen SDG alignment and maximize impact.
5. **SDG Score** — Rate the overall SDG alignment on a scale of 1-10 with justification.

Reference specific SDG numbers and their full names (e.g., SDG 4: Quality Education).
Be thorough, analytical, and data-driven in your assessment.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

module.exports = {
  generateReport,
  estimateAttendance,
  generateSocialMedia,
  analyzeSDGAlignment
};
