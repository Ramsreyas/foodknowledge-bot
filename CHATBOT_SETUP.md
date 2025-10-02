# Nutritional RAG-Chatbot Setup Guide

## 🎯 Overview

This is a **Retrieval-Augmented Generation (RAG)** chatbot powered by:
- **Supabase** - Vector database storing nutritional knowledge embeddings
- **Hugging Face Transformers** - Browser-based embedding generation (all-MiniLM-L6-v2)
- **Fireworks AI** - LLM inference using Llama 3.1 8B Instruct
- **React + Vite** - Fast, modern frontend

## 🚀 Accessing Your Chatbot

### 1. **Live Preview (Development)**
Your chatbot is currently running at:
```
https://lovable.dev/projects/9502745b-a46b-4643-8299-0d9ba0d6bcfb
```

### 2. **Published App**
To make your chatbot publicly accessible:
1. Click the **"Publish"** button in the top-right of Lovable
2. Your app will be deployed to: `https://[your-app-name].lovable.app`
3. Share this URL with anyone!

### 3. **Custom Domain (Optional)**
For a professional domain like `nutrition.yourdomain.com`:
1. Navigate to **Project > Settings > Domains**
2. Click **"Connect Domain"**
3. Follow the DNS configuration steps

## 📋 Prerequisites

### ✅ Already Configured
- ✅ Supabase database with vector embeddings
- ✅ `chunks` table populated with nutritional data
- ✅ `match_documents` function for similarity search
- ✅ Fireworks API key (stored in Supabase secrets)

### 🔍 Verify Your Setup

1. **Check Database Data**
   - Open [Supabase SQL Editor](https://supabase.com/dashboard/project/zyiuakbijmxrtwvrjded/sql/new)
   - Run: `SELECT COUNT(*) FROM chunks;`
   - You should see the number of document chunks (from your `ingest.py` script)

2. **Check Edge Function**
   - Open [Edge Functions Dashboard](https://supabase.com/dashboard/project/zyiuakbijmxrtwvrjded/functions)
   - Confirm `rag-chat` function is deployed and active

3. **Check Secrets**
   - Open [Function Secrets](https://supabase.com/dashboard/project/zyiuakbijmxrtwvrjded/settings/functions)
   - Verify `FIREWORKS_API_KEY` is set

## 💡 How to Use the Chatbot

### Basic Usage
1. Open the chatbot interface
2. Type your nutrition-related question in the text area
3. Press **Enter** or click the **Send** button
4. Wait for the AI to generate a response (you'll see "Thinking..." with animated dots)

### Example Questions
Try asking:
- "What are the best sources of vitamin D?"
- "How much protein do I need daily?"
- "What foods are high in omega-3 fatty acids?"
- "Tell me about the benefits of fiber"
- "What's the difference between saturated and unsaturated fats?"

### Understanding Citations
- Responses include **clickable citation numbers** like `[1]`, `[2]`, `[3]`
- Click any citation to see:
  - The **original text** from the knowledge base
  - The **page number** where it was found
  - The **relevance score** (similarity percentage)

## 🎨 Features

### UI/UX
- ✨ **Dark theme** inspired by arcprize.org
- 🎵 **Sound effects** during loading and response generation
- 📱 **Responsive design** works on mobile and desktop
- 🔄 **Real-time typing** with smooth animations
- 🎯 **Citation popups** showing source material

### Technical
- 🧠 **Browser-based embeddings** using Hugging Face Transformers
- ⚡ **Fast vector search** with pgvector and IVFFlat indexing
- 🔒 **Secure** - API keys stored as Supabase secrets
- 📊 **Source tracking** - see exactly where information comes from

## 🛠️ Architecture

```
User Query
    ↓
Frontend (React)
    ↓
Generate Embedding (Hugging Face in Browser)
    ↓
Edge Function (Supabase)
    ├─→ Vector Search (match_documents)
    │   └─→ Returns top 5 most similar chunks
    └─→ LLM Call (Fireworks AI - Llama 3.1)
        └─→ Generates answer using retrieved context
    ↓
Response + Citations
    ↓
User sees answer with clickable sources
```

## 🔧 Troubleshooting

### "Could not find relevant information"
- Verify your `chunks` table has data
- Check if the question is related to your ingested PDF content
- Try rephrasing your question

### Edge Function Errors
1. Check [Function Logs](https://supabase.com/dashboard/project/zyiuakbijmxrtwvrjded/functions/rag-chat/logs)
2. Common issues:
   - Missing `FIREWORKS_API_KEY` secret
   - Fireworks API rate limits
   - Empty database

### Slow Response Times
- First query may be slow (embedding model loads in browser)
- Subsequent queries are faster
- Check your internet connection

## 📊 Monitoring

### Edge Function Logs
View detailed logs at:
https://supabase.com/dashboard/project/zyiuakbijmxrtwvrjded/functions/rag-chat/logs

Look for:
- `Received query:` - Confirms request received
- `Found X matching documents` - Confirms vector search works
- `Calling Fireworks AI...` - Confirms LLM request
- `Successfully generated answer` - Confirms success

### Database Queries
Monitor vector search performance:
```sql
SELECT 
  COUNT(*) as total_chunks,
  COUNT(DISTINCT doc_id) as unique_documents
FROM chunks;
```

## 🔐 Security

- ✅ API keys stored securely in Supabase secrets
- ✅ Edge function handles all API calls (no exposed keys)
- ✅ CORS properly configured
- ✅ No authentication required for public chatbot

## 📝 Updating Knowledge Base

To add more nutritional data:

1. Update your PDF or add new PDFs
2. Run your `ingest.py` script:
   ```bash
   python ingest.py
   ```
3. The chatbot automatically uses the new data (no code changes needed!)

## 🎓 Next Steps

### Enhancements to Consider
- **User Authentication** - Track user chat history
- **Conversation Memory** - Remember previous messages in the session
- **Export Conversations** - Let users save their chats
- **Advanced Filtering** - Filter by food type, nutrient, etc.
- **Multi-language Support** - Translate questions and answers
- **Voice Input** - Ask questions by speaking
- **Favorite Responses** - Bookmark helpful answers

### Scaling
- Add more documents to your knowledge base
- Implement caching for common questions
- Use different LLM models for different query types
- Add rate limiting to prevent abuse

## 📞 Support

If you encounter issues:
1. Check the [Lovable Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
2. Review [Lovable Documentation](https://docs.lovable.dev/)
3. Check [Supabase Documentation](https://supabase.com/docs)

---

**Built with ❤️ using Lovable, Supabase, and Fireworks AI**
