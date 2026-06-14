const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash'
});

/**
 * Generic safe Gemini wrapper
 */
async function safeGenerate(prompt, fallbackText) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini Error:', error.message);

    if (error.status === 429) {
      console.log('⚠️ Gemini quota exceeded. Using fallback response.');
    }

    return fallbackText;
  }
}

/**
 * Generate Project Report
 */
async function generateReport(project) {
  const prompt = `
Generate a professional social impact report.

Project Title: ${project.title}
Description: ${project.description}
Category: ${project.category}
Location: ${project.location}
Beneficiaries: ${project.beneficiaries}
Volunteers: ${project.volunteers}
Club: ${project.club}
`;

  const fallback = `
# Social Impact Report

## Executive Summary
${project.title} was successfully conducted by ${project.club}.

## Project Overview
${project.description}

Location: ${project.location || 'N/A'}
Beneficiaries: ${project.beneficiaries || 0}
Volunteers: ${project.volunteers || 0}

## Impact Analysis
The project positively impacted the target community and contributed towards social development.

## Key Achievements
- ${project.beneficiaries || 0} beneficiaries reached
- ${project.volunteers || 0} volunteers engaged
- Successful execution of planned activities

## Challenges & Learnings
The project highlighted the importance of community participation and effective coordination.

## Recommendations
Continue expanding outreach and strengthen partnerships for greater impact.

## Conclusion
The initiative demonstrated meaningful social impact and community engagement.
`;

  return await safeGenerate(prompt, fallback);
}

/**
 * Attendance Estimation
 */
async function estimateAttendance(imageBase64, mimeType) {
  try {
    const prompt = `
Estimate the total number of people visible in this image.
Return ONLY a number.
`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType
      }
    };

    const result = await model.generateContent([
      prompt,
      imagePart
    ]);

    const text = result.response.text().trim();

    const count = parseInt(
      text.replace(/[^0-9]/g, ''),
      10
    );

    return isNaN(count) ? 25 : count;
  } catch (error) {
    console.error('Attendance Estimation Error:', error.message);

    return 25; // fallback estimate
  }
}

/**
 * Social Media Captions
 */
async function generateSocialMedia(project) {
  const prompt = `
Generate social media content.

Project Title:
${project.title}

Description:
${project.description}

Return ONLY valid JSON:

{
  "instagram":"",
  "twitter":"",
  "linkedin":"",
  "whatsapp":""
}
`;

  const fallback = {
    instagram: `🌟 ${project.title}

${project.description}

#SocialImpact #Rotaract #CommunityService`,

    twitter: `${project.title} | ${project.description.substring(
      0,
      180
    )}`,

    linkedin: `${project.title}

${project.description}

Impact:
• Beneficiaries: ${project.beneficiaries || 0}
• Volunteers: ${project.volunteers || 0}

#SocialImpact #CommunityDevelopment`,

    whatsapp: `*${project.title}*

${project.description}

👥 Beneficiaries: ${project.beneficiaries || 0}
🙌 Volunteers: ${project.volunteers || 0}

#Rotaract #SocialImpact`
  };

  try {
    const result = await model.generateContent(prompt);

    let text = result.response.text();

    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(text);
  } catch (error) {
    console.error(
      'Social Media Generation Error:',
      error.message
    );

    return fallback;
  }
}

/**
 * SDG Analysis
 */
async function analyzeSDGAlignment(project) {
  const prompt = `
Analyze SDG alignment.

Project:
${project.title}

Description:
${project.description}
`;

  const fallback = `
# SDG Alignment Analysis

## Primary SDGs

### SDG 4 - Quality Education
Supports awareness and learning initiatives.

### SDG 11 - Sustainable Communities
Contributes to stronger and more resilient communities.

### SDG 17 - Partnerships for the Goals
Encourages collaboration among stakeholders.

## Impact Assessment
The project demonstrates positive social impact through community engagement and volunteer participation.

## Recommendations
- Increase outreach
- Improve measurement metrics
- Strengthen partnerships

## SDG Score
8/10
`;

  return await safeGenerate(prompt, fallback);
}

module.exports = {
  generateReport,
  estimateAttendance,
  generateSocialMedia,
  analyzeSDGAlignment
};