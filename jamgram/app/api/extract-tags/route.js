import { NextResponse } from "next/server";

export async function POST(req) {
  const form = await req.formData();
  const file = form.get("image");

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // HuggingFace API auth header
  const HF_HEADERS = {
    Authorization: `Bearer ${process.env.HF_TOKEN}`,
    "Content-Type": "application/octet-stream"
  };

  // 1. GOOGLE ViT — OBJECT LABELS
  let objects = [];
  try {
    const vitRes = await fetch(
      "https://router.huggingface.co/hf-inference/google/vit-base-patch16-224",
      {
        method: "POST",
        headers: HF_HEADERS,
        body: buffer
      }
    );
    
    if (!vitRes.ok) {
      const errorText = await vitRes.text();
      console.error("ViT error:", vitRes.status, errorText);
      throw new Error(`ViT failed: ${vitRes.status}`);
    }
    
    const vitData = await vitRes.json();
    if (Array.isArray(vitData)) {
      objects = vitData.map((x) => x.label.toLowerCase());
    }
  } catch (e) {
    console.error("ViT model error:", e.message);
    objects = [];
  }

  // 2. CAPTION MODEL — VIT-GPT2
  let caption = "";
  try {
    const captionRes = await fetch(
      "https://router.huggingface.co/hf-inference/nlpconnect/vit-gpt2-image-captioning",
      {
        method: "POST",
        headers: HF_HEADERS,
        body: buffer
      }
    );
    
    if (!captionRes.ok) {
      const errorText = await captionRes.text();
      console.error("Caption error:", captionRes.status, errorText);
      throw new Error(`Caption failed: ${captionRes.status}`);
    }
    
    const captionData = await captionRes.json();
    caption = captionData?.[0]?.generated_text || "";
  } catch (e) {
    console.error("Caption model error:", e.message);
    caption = "";
  }

  // 3. FINAL LLM — STRUCTURE OBJECTS / COLORS / MOOD
  const llmPrompt = `
You are an image understanding assistant.  
Given the following:

Objects: ${JSON.stringify(objects)}
Caption: "${caption}"

Produce ONLY valid JSON in this structure:

{
  "objects": [...],
  "colors": [...],
  "mood": "..."
}

Do NOT add explanations. JSON ONLY.
`;

  try {
    const llmRes = await fetch(
      "https://router.huggingface.co/hf-inference/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HF_TOKEN}`
        },
        body: JSON.stringify({ 
          inputs: llmPrompt,
          parameters: {
            max_new_tokens: 250,
            return_full_text: false
          }
        })
      }
    );

    if (!llmRes.ok) {
      const errorText = await llmRes.text();
      console.error("LLM error:", llmRes.status, errorText);
      throw new Error(`LLM failed: ${llmRes.status}`);
    }

    const llmData = await llmRes.json();
    const raw = llmData[0].generated_text.trim();

    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const jsonString = raw.slice(jsonStart, jsonEnd + 1);

    const finalJson = JSON.parse(jsonString);
    return NextResponse.json(finalJson);
    
  } catch (e) {
    console.error("LLM error:", e.message);
    return NextResponse.json({ 
      error: "Failed to process with LLM", 
      details: e.message,
      objects,
      caption
    }, { status: 500 });
  }
}
