const express = require('express');
const router = express.Router();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "dummy-key"
);

const clubEvents = [
  {
    id: 1,
    title: "Blood Donation Camp",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      15
    ).toISOString().split('T')[0],
    type: "club",
    description: "Annual blood donation drive at City Hospital."
  },
  {
    id: 2,
    title: "Tree Plantation Drive",
    date: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      22
    ).toISOString().split('T')[0],
    type: "club",
    description: "Planting 100 trees at the local park."
  }
];

router.get('/events', async (req, res) => {
  const { year, month } = req.query;

  try {
    const targetMonthStr = `${year}-${String(month).padStart(2, '0')}`;

    const filteredClubEvents = clubEvents.filter(event =>
      event.date.startsWith(targetMonthStr)
    );

    let aiEvents = [
      {
        date: `${targetMonthStr}-05`,
        title: "Local Cricket Match",
        type: "sports",
        description: "State level T20 cricket tournament."
      },
      {
        date: `${targetMonthStr}-18`,
        title: "Cultural Festival",
        type: "festival",
        description: "State wide cultural celebration."
      }
    ];

    try {
      if (process.env.GEMINI_API_KEY) {

        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash"
        });

        const result = await model.generateContent(`
List 3 major Indian events in ${targetMonthStr}.

Return ONLY JSON array.
`);

        const text = result.response.text();

        aiEvents = JSON.parse(
          text.replace(/```json/g, '')
              .replace(/```/g, '')
              .trim()
        );
      }
    } catch (err) {
      console.log("Gemini event fetch failed:", err.message);
    }

    res.json({
      success: true,
      events: [...filteredClubEvents, ...aiEvents]
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

module.exports = router;