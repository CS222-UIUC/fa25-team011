import { NextResponse } from "next/server";

export async function POST(req) {
  const form = await req.formData();
  const file = form.get("image");

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  if (!process.env.HF_TOKEN) {
    console.error("HF_TOKEN environment variable is not set");
    return NextResponse.json({ error: "Hugging Face token not configured" }, { status: 500 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // HuggingFace API base URL - using router.huggingface.co (api-inference is deprecated)
  const HF_BASE_URL = "https://router.huggingface.co/hf-inference";
  const HF_HEADERS_IMAGE = {
    Authorization: `Bearer ${process.env.HF_TOKEN}`,
    "Content-Type": "application/octet-stream",
  };
  const HF_HEADERS_JSON = {
    Authorization: `Bearer ${process.env.HF_TOKEN}`,
    "Content-Type": "application/json",
  };

  console.log("Starting image analysis...");

  // 1. IMAGE CLASSIFICATION — Get objects/labels
  let objects = [];
  try {
    console.log("Calling image classification model...");
    const vitRes = await fetch(
      `${HF_BASE_URL}/models/google/vit-base-patch16-224`,
      {
        method: "POST",
        headers: HF_HEADERS_IMAGE,
        body: buffer,
      }
    );
    
    console.log("Classification response status:", vitRes.status);
    
    if (!vitRes.ok) {
      const errorText = await vitRes.text();
      console.error("Classification error:", vitRes.status, errorText);
      if (vitRes.status === 503) {
        const retryAfter = vitRes.headers.get("x-wait-for-model");
        console.log(`Model is loading, retry after: ${retryAfter}`);
      }
    } else {
      const vitData = await vitRes.json();
      console.log("Classification response:", JSON.stringify(vitData).substring(0, 500));
      
      if (Array.isArray(vitData)) {
        // Get top labels and clean them up
        objects = vitData
          .slice(0, 15) // Get more candidates
          .map((x) => {
            let label = x.label || x.class || x.class_name || "";
            
            // Clean up ImageNet-style labels
            // Remove class IDs like "n02119789"
            label = label.replace(/^n\d+/, "");
            
            // Remove prefixes like "Egyptian cat" -> "cat"
            const prefixes = ["egyptian", "tabby", "persian", "siamese", "maltese", "english", "french", "american"];
            for (const prefix of prefixes) {
              if (label.toLowerCase().startsWith(prefix + " ")) {
                label = label.substring(prefix.length + 1);
              }
            }
            
            // Remove common suffixes
            label = label.replace(/\s+(dog|cat|bird|fish|tree|flower)$/i, "");
            
            // Clean up and normalize
            label = label.trim().toLowerCase();
            
            // Filter out very generic or unhelpful labels
            const skipLabels = ["image", "picture", "photo", "object", "thing", "item", "stuff"];
            if (skipLabels.includes(label) || label.length < 2) {
              return null;
            }
            
            return label;
          })
          .filter(Boolean)
          .filter((label, index, self) => self.indexOf(label) === index) // Remove duplicates
          .slice(0, 8); // Keep top 8 unique objects
        console.log("Extracted objects:", objects);
      }
    }
  } catch (e) {
    console.error("Classification error:", e.message, e.stack);
    objects = [];
  }

  // 2. CAPTION MODEL — Get image description
  let caption = "";
  try {
    console.log("Calling caption model...");
    const captionRes = await fetch(
      `${HF_BASE_URL}/models/nlpconnect/vit-gpt2-image-captioning`,
      {
        method: "POST",
        headers: HF_HEADERS_IMAGE,
        body: buffer,
      }
    );
    
    console.log("Caption response status:", captionRes.status);
    
    if (!captionRes.ok) {
      const errorText = await captionRes.text();
      console.error("Caption error:", captionRes.status, errorText);
      if (captionRes.status === 503) {
        const retryAfter = captionRes.headers.get("x-wait-for-model");
        console.log(`Caption model is loading, retry after: ${retryAfter}`);
      }
    } else {
      const captionData = await captionRes.json();
      console.log("Caption response:", JSON.stringify(captionData).substring(0, 200));
      
      if (Array.isArray(captionData) && captionData[0]?.generated_text) {
        caption = captionData[0].generated_text;
      } else if (captionData.generated_text) {
        caption = captionData.generated_text;
      } else if (typeof captionData === "string") {
        caption = captionData;
      }
      console.log("Extracted caption:", caption);
      
      // Extract objects from caption (common nouns)
      if (caption) {
        const captionLower = caption.toLowerCase();
        // Common object keywords to look for
        const objectKeywords = [
          "person", "people", "man", "woman", "child", "boy", "girl",
          "dog", "cat", "bird", "fish", "animal", "pet",
          "car", "vehicle", "truck", "bus", "bike", "bicycle",
          "tree", "flower", "plant", "grass", "leaf",
          "building", "house", "door", "window", "wall",
          "table", "chair", "desk", "bed", "sofa",
          "phone", "computer", "laptop", "screen", "keyboard",
          "book", "paper", "pen", "pencil",
          "food", "plate", "cup", "bottle", "glass",
          "sky", "cloud", "sun", "moon", "star",
          "water", "ocean", "sea", "lake", "river",
          "mountain", "hill", "rock", "stone",
          "road", "street", "path", "sidewalk",
          "shirt", "pants", "dress", "shoes", "hat",
          "bag", "backpack", "purse",
          "ball", "toy", "game"
        ];
        
        const foundObjects = objectKeywords.filter(keyword => 
          captionLower.includes(keyword)
        );
        
        // Add found objects to the list (avoid duplicates)
        foundObjects.forEach(obj => {
          if (!objects.includes(obj)) {
            objects.push(obj);
          }
        });
        
        // Also try to extract nouns from the caption (simple heuristic)
        const words = caption.split(/\s+/);
        const commonNouns = words.filter(word => {
          const w = word.toLowerCase().replace(/[.,!?;:]/g, "");
          return w.length > 3 && !["the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "in", "on", "at", "to", "for", "of", "with", "from"].includes(w);
        });
        
        // Add unique nouns that aren't already in objects
        commonNouns.forEach(noun => {
          const n = noun.toLowerCase().replace(/[.,!?;:]/g, "");
          if (n.length > 2 && !objects.includes(n) && n.length < 20) {
            objects.push(n);
          }
        });
        
        // Limit to top objects
        objects = objects.slice(0, 10);
        console.log("Objects after caption extraction:", objects);
      }
    }
  } catch (e) {
    console.error("Caption model error:", e.message, e.stack);
    caption = "";
  }

  // 3. Use a vision-language model to extract colors and mood directly
  // Try using BLIP-2 or a similar model that can answer questions about the image
  let colors = [];
  let mood = "unknown";
  
  // If we have a caption, use it to infer colors and mood
  // Otherwise, try to use an LLM with the available data
  const hasData = objects.length > 0 || caption.length > 0;
  
  if (hasData) {
    try {
      console.log("Calling LLM to extract colors and mood...");
      
      // Create a more detailed prompt
      const llmPrompt = `Analyze this image description and extract information:

Objects detected: ${objects.length > 0 ? objects.join(", ") : "none"}
Image caption: "${caption || "no caption available"}"

Based on this information, provide a JSON response with:
1. A list of 3-5 dominant colors in the image (e.g., ["blue", "green", "white"])
2. The mood/atmosphere of the image (e.g., "peaceful", "energetic", "melancholic", "vibrant", "calm", "mysterious")

Return ONLY valid JSON in this exact format:
{
  "colors": ["color1", "color2", "color3"],
  "mood": "mood description"
}

Do not include any other text, explanations, or markdown formatting. Only return the JSON object.`;

      const llmRes = await fetch(
        `${HF_BASE_URL}/models/mistralai/Mistral-7B-Instruct-v0.2`,
        {
          method: "POST",
          headers: HF_HEADERS_JSON,
          body: JSON.stringify({ 
            inputs: llmPrompt,
            parameters: {
              max_new_tokens: 200,
              return_full_text: false,
              temperature: 0.3,
            }
          })
        }
      );

      console.log("LLM response status:", llmRes.status);

      if (!llmRes.ok) {
        const errorText = await llmRes.text();
        console.error("LLM error:", llmRes.status, errorText);
      } else {
        const llmData = await llmRes.json();
        console.log("LLM response:", JSON.stringify(llmData).substring(0, 300));
        
        // Handle different response formats
        let raw = "";
        if (Array.isArray(llmData) && llmData[0]?.generated_text) {
          raw = llmData[0].generated_text.trim();
        } else if (llmData.generated_text) {
          raw = llmData.generated_text.trim();
        } else if (typeof llmData === "string") {
          raw = llmData.trim();
        }
        
        console.log("LLM raw output:", raw.substring(0, 200));

        // Extract JSON from response
        const jsonStart = raw.indexOf("{");
        const jsonEnd = raw.lastIndexOf("}");
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = raw.slice(jsonStart, jsonEnd + 1);
          try {
            const parsed = JSON.parse(jsonString);
            colors = Array.isArray(parsed.colors) ? parsed.colors : [];
            mood = parsed.mood || "unknown";
            console.log("Parsed colors:", colors, "mood:", mood);
          } catch (parseError) {
            console.error("JSON parse error:", parseError.message);
          }
        }
      }
    } catch (e) {
      console.error("LLM processing error:", e.message, e.stack);
    }
  }

  // Fallback: If we still don't have colors/mood, infer from objects and caption
  if (colors.length === 0 && objects.length > 0) {
    // Simple color inference from common object colors
    const colorMap = {
      sky: "blue", cloud: "white", sun: "yellow", tree: "green",
      grass: "green", ocean: "blue", water: "blue", flower: ["pink", "red", "yellow"],
      building: "gray", car: ["red", "blue", "black"], person: "skin"
    };
    
    for (const obj of objects) {
      for (const [key, value] of Object.entries(colorMap)) {
        if (obj.includes(key)) {
          if (Array.isArray(value)) {
            colors.push(...value);
          } else {
            colors.push(value);
          }
        }
      }
    }
    colors = [...new Set(colors)].slice(0, 5);
  }

  if (mood === "unknown" && caption) {
    // Simple mood inference from caption
    const captionLower = caption.toLowerCase();
    if (captionLower.includes("sunny") || captionLower.includes("bright") || captionLower.includes("vibrant")) {
      mood = "energetic";
    } else if (captionLower.includes("peaceful") || captionLower.includes("calm") || captionLower.includes("serene")) {
      mood = "peaceful";
    } else if (captionLower.includes("dark") || captionLower.includes("gloomy") || captionLower.includes("sad")) {
      mood = "melancholic";
    } else {
      mood = "neutral";
    }
  }

  const result = {
    objects: objects.length > 0 ? objects : [],
    colors: colors.length > 0 ? colors : [],
    mood: mood !== "unknown" ? mood : (objects.length > 0 || caption ? "neutral" : "unknown"),
  };

  console.log("Final result:", JSON.stringify(result));
  return NextResponse.json(result);
}
