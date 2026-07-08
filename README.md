# LingoScribe — Frontend

The LingoScribe web interface. Upload audio in any format, receive Urdu/Punjabi transcription with English translation, and surface AI-generated insights from your recordings.

## Features

- Drag-and-drop or browse upload for any audio format (WAV, MP3, OGG, FLAC, M4A, WEBM, OPUS, AAC, WMA, MP4 and more)
- Transcription results table with timestamps and English translation per segment
- Automatic insights: summary, key topics, tone, and speech observations powered by Groq
- "Ask about this transcript" — natural language Q&A over the transcribed content
- Mobile-responsive, dark-on-cream typography built with Cormorant Garamond serif

## Running locally

No build step required. Open `index.html` directly or serve with any static server:

```bash
# Python
python -m http.server 5500

# Node
npx serve .
```

The backend must be running at `http://localhost:8000` (see [lingoscribe-backend](https://github.com/muhmdfarhan0/lingoscribe-backend)).

## Deployment

Deploy to Vercel in one step:

```bash
vercel --prod
```

Before deploying, update `API_URL` in `app.js` line 1 to your Render backend URL.

## Contact

- [GitHub](https://github.com/muhmdfarhan0)
- [LinkedIn](https://www.linkedin.com/in/muhammad-farhan07567)
- [Website](https://www.farhanai.online/contact)
