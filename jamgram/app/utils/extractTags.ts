export const extractTags = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch("/api/extract-tags", {
      method: "POST",
      body: formData,
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      console.error("Full API error response:", data);
      // If we have partial results (objects/caption), return them
      if (data.objects || data.caption) {
        console.log("Got partial results:", data);
        return data; // Return partial results instead of throwing
      }
      throw new Error(data.error || data.details || "Failed to extract tags");
    }
    return data;
  } catch (err: any) {
    console.error("Error extracting tags:", err);
    throw err;
  }
};