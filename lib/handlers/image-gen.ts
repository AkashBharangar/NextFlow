/**
 * Hugging Face Inference API: stabilityai/stable-diffusion-xl-base-1.0
 *
 * NOTE: The first call after a period of inactivity can take 20–40 seconds
 * because Hugging Face may cold-start the model on their infrastructure.
 */
const HF_SDXL_URL =
  "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0";

export async function imageGenHandler(
  _config: Record<string, unknown>,
  inputs: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token?.trim()) {
    throw new Error("HUGGINGFACE_API_TOKEN is not set");
  }

  const prompt =
    typeof inputs.prompt === "string" ? inputs.prompt : String(inputs.prompt ?? "");
  if (!prompt.trim()) {
    throw new Error("image-gen handler requires a non-empty inputs.prompt string");
  }

  const res = await fetch(HF_SDXL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Hugging Face SDXL inference failed (${res.status} ${res.statusText}): ${text}`,
    );
  }

  const imageBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(imageBuffer).toString("base64");

  return {
    image_url: `data:image/jpeg;base64,${base64}`,
  };
}
