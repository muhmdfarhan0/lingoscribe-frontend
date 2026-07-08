# LingoScribe — Frontend

The LingoScribe web interface. Upload audio in any format, receive Urdu/Punjabi transcription with English translation per segment, and explore AI-generated insights about the content.

## Features

- Drag-and-drop or click-to-browse upload for any audio format
- Supports WAV, MP3, OGG, FLAC, M4A, WEBM, OPUS, AAC, WMA, MP4 and more
- Transcription results table with timestamps, original text, and English translation
- Automatic AI insights after transcription: summary, key topics, tone, speech observations
- Ask anything about the transcript — natural language Q&A
- Mobile-responsive, zero dependencies, no build step

## Design

- Warm cream (`#F7F2E9`) background, deep navy (`#0F1E35`) accents
- Cormorant Garamond serif for headings, Inter for UI text
- Wave-loader animation during processing
- Staggered insight card reveal

## Running locally

No build step. Open directly or serve statically:

```bash
# Python
python -m http.server 5500

# Node
npx serve .
```

The backend must be running at `http://localhost:8000`.
See [lingoscribe-backend](https://github.com/muhmdfarhan0/lingoscribe-backend) for setup.

## Deployment (Vercel)

1. Update `API_URL` in `app.js` line 1 to your deployed backend URL
2. Connect this repo to [Vercel](https://vercel.com)
3. Framework: **Other** — no build command needed, output directory is `/`

## Contact

- [GitHub](https://github.com/muhmdfarhan0)
- [LinkedIn](https://www.linkedin.com/in/muhammad-farhan07567)
- [Website](https://www.farhanai.online/contact)
