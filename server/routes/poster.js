const express = require('express');
const router = express.Router();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "dummy-key"
);

router.post('/generate-poster', async (req, res) => {

  const { eventTitle, eventType, date } = req.body;

  try {

    let caption =
      `Join Rotaract Club Pune for ${eventTitle} on ${date}! 🎉`;

    try {

      if (process.env.GEMINI_API_KEY) {

        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash"
        });

        const result = await model.generateContent(`
Create Instagram caption.

Event: ${eventTitle}
Type: ${eventType}
Date: ${date}
`);

        caption = result.response.text();

      }

    } catch (err) {

      console.log(err.message);

    }

    const imageUrl =
      `https://placehold.co/1080x1080/0f111a/00f2fe.png?text=${encodeURIComponent(eventTitle)}`;

    res.json({
      success: true,
      caption,
      imageUrl
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

module.exports = router;