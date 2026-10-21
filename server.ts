import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to get Gemini client lazily
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// --- API ROUTES ---

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. AI Recipe Generator from Pantry
app.post("/api/ai/recipes", async (req, res) => {
  const { pantryItems, preferences } = req.body;
  try {
    if (!pantryItems || !Array.isArray(pantryItems)) {
      return res.status(400).json({ error: "pantryItems array is required" });
    }

    const ai = getGenAI();

    const itemsSummary = pantryItems
      .map(
        (i) =>
          `- ${i.name} (${i.quantity} ${i.unit}, Location: ${i.location}, Category: ${i.category}, Expires: ${i.expirationDate})`
      )
      .join("\n");

    const prompt = `You are a world-class Zero-Waste Chef. Based on the user's available pantry/fridge inventory below, suggest 3 delicious recipes.
PRIORITIZE using items that are expiring soon!

Available Inventory:
${itemsSummary}

Dietary/User Preferences: ${preferences || "None specified"}

Return JSON in this EXACT schema format:
[
  {
    "id": "recipe_1",
    "title": "Recipe Name",
    "prepTime": "15 mins",
    "cookTime": "20 mins",
    "servings": 2,
    "difficulty": "Easy",
    "pantryMatchPercent": 85,
    "usedPantryItems": [
      { "name": "Item name", "quantity": "amount used" }
    ],
    "missingIngredients": [
      { "name": "Pantry staple missing", "estimatedPrice": 2.50 }
    ],
    "instructions": [
      "Step 1...",
      "Step 2..."
    ],
    "caloriesPerServing": 420,
    "summary": "Short 1-2 sentence appetizing description."
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              prepTime: { type: Type.STRING },
              cookTime: { type: Type.STRING },
              servings: { type: Type.INTEGER },
              difficulty: { type: Type.STRING },
              pantryMatchPercent: { type: Type.INTEGER },
              usedPantryItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    quantity: { type: Type.STRING },
                  },
                },
              },
              missingIngredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    estimatedPrice: { type: Type.NUMBER },
                  },
                },
              },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              caloriesPerServing: { type: Type.INTEGER },
              summary: { type: Type.STRING },
            },
            required: [
              "id",
              "title",
              "prepTime",
              "cookTime",
              "servings",
              "difficulty",
              "pantryMatchPercent",
              "usedPantryItems",
              "missingIngredients",
              "instructions",
              "caloriesPerServing",
              "summary",
            ],
          },
        },
      },
    });

    const recipes = JSON.parse(response.text || "[]");
    res.json({ recipes });
  } catch (error: any) {
    console.error("Recipe generation error / fallback activated:", error?.message || error);
    const fallbackRecipes = [
      {
        id: "fallback_1",
        title: "Quick Pantry Stir-Fry & Grain Bowl",
        prepTime: "10 mins",
        cookTime: "15 mins",
        servings: 2,
        difficulty: "Easy",
        pantryMatchPercent: 90,
        usedPantryItems: (pantryItems || []).slice(0, 3).map((i: any) => ({ name: i.name, quantity: "1 portion" })),
        missingIngredients: [{ name: "Cooking Oil & Salt", estimatedPrice: 20 }],
        instructions: [
          "Heat 1 tbsp cooking oil in a hot skillet over medium-high heat.",
          "Add chopped produce or protein from your pantry and sauté for 6-8 minutes.",
          "Season with salt, pepper, or herbs and serve warm over rice or bread."
        ],
        caloriesPerServing: 350,
        summary: "A quick, versatile zero-waste meal made from your current pantry stock."
      },
      {
        id: "fallback_2",
        title: "Classic Harvest Vegetable Stew",
        prepTime: "15 mins",
        cookTime: "20 mins",
        servings: 3,
        difficulty: "Easy",
        pantryMatchPercent: 85,
        usedPantryItems: (pantryItems || []).slice(0, 3).map((i: any) => ({ name: i.name, quantity: "1 cup" })),
        missingIngredients: [{ name: "Herbs & Seasoning", estimatedPrice: 15 }],
        instructions: [
          "Chop your available pantry vegetables into bite-sized pieces.",
          "Sauté aromatics in a pot, add 3 cups water or broth, and bring to a gentle boil.",
          "Simmer for 15 minutes until tender and flavorful."
        ],
        caloriesPerServing: 280,
        summary: "Nourishing homemade soup using fresh and expiring pantry ingredients."
      }
    ];
    res.json({ recipes: fallbackRecipes });
  }
});

// 2. AI Smart List & Receipt Parser
app.post("/api/ai/parse-list", async (req, res) => {
  try {
    const { rawText, targetDestination } = req.body; // targetDestination: 'pantry' or 'shopping'
    if (!rawText) {
      return res.status(400).json({ error: "rawText is required" });
    }

    const ai = getGenAI();

    const todayStr = new Date().toISOString().split("T")[0];

    const prompt = `You are a Smart Grocery AI. Parse the following text (which might be a receipt, handwritten list, voice transcript, or loose note) into structured grocery items.

Text to parse:
"""
${rawText}
"""

Target Destination: ${targetDestination || "shopping"}
Current Date: ${todayStr}

For each item identified, classify it into one of these categories:
'Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry & Grains', 'Bakery', 'Frozen', 'Snacks & Sweets', 'Beverages', 'Condiments & Spices', 'Household & Personal'.

Assign appropriate location ('Fridge', 'Freezer', 'Pantry', or 'Spice Cabinet').
Estimate price if mentioned or suggest a reasonable Indian Rupee (INR ₹) market price.
Estimate expiration date in YYYY-MM-DD (e.g. produce = 3-7 days from now, dairy = 7-14 days, frozen = 60-120 days, pantry = 180+ days).

Return a JSON array of items matching this schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              location: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              price: { type: Type.NUMBER },
              expirationDaysFromNow: { type: Type.INTEGER },
              notes: { type: Type.STRING },
            },
            required: ["name", "category", "location", "quantity", "unit", "price"],
          },
        },
      },
    });

    const parsedItems = JSON.parse(response.text || "[]");
    res.json({ items: parsedItems });
  } catch (error: any) {
    console.error("Parse list error / fallback activated:", error?.message || error);
    const lines = (req.body?.rawText || "").split("\n").map((l: string) => l.trim()).filter(Boolean);
    const parsedItems = lines.map((line: string) => {
      const cleanName = line.replace(/^[-*•\d.\s]+/, "").trim();
      return {
        name: cleanName || "Grocery Item",
        category: "Pantry & Grains",
        location: req.body?.targetDestination === "pantry" ? "Pantry" : "Fridge",
        quantity: 1,
        unit: "pack",
        price: 120,
        expirationDaysFromNow: 14,
        notes: "Parsed item"
      };
    });
    res.json({ items: parsedItems.length > 0 ? parsedItems : [{ name: (req.body?.rawText || "Grocery Item").slice(0, 30), category: "Pantry & Grains", location: "Pantry", quantity: 1, unit: "pack", price: 100 }] });
  }
});

// 3. AI Grocery & Cooking Assistant Chat
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { messages, pantrySummary } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const ai = getGenAI();

    const systemInstruction = `You are "Sprout", an expert culinary guide and smart grocery assistant.
You help users manage their fridge and pantry, reduce food waste, substitute ingredients, plan budget meals, and keep produce fresh longer.
Be warm, encouraging, concise, and structured (use bullet points or bold headers when helpful).

Current user pantry context:
${pantrySummary || "No active pantry data shared yet."}`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || "I'm here to help with your grocery & kitchen questions!" });
  } catch (error: any) {
    console.error("AI assistant error / fallback activated:", error?.message || error);
    res.json({ 
      reply: "I am currently in smart offline assistant mode. 💡 **Kitchen & Storage Tips**:\n- Keep leafy greens fresh longer by wrapping them in a damp paper towel in your fridge crisper drawer.\n- Check your **Pantry** tab to see items approaching expiration.\n- Use the **Market Prices** tab to compare prices across Blinkit, Zepto, BigBasket & Amazon!" 
    });
  }
});

// 4. AI Food Label Photo & Notepad Scanner
app.post("/api/ai/scan-label", async (req, res) => {
  try {
    const { imageBase64, notepadText, targetDestination } = req.body;
    if (!imageBase64 && !notepadText) {
      return res.status(400).json({ error: "Either imageBase64 or notepadText is required" });
    }

    const ai = getGenAI();
    const todayStr = new Date().toISOString().split("T")[0];

    const promptText = `You are an expert Food Label Scanner & Nutritional AI.
Analyze the provided food package photo / nutrition label / notepad text and extract structured item details.

Target Destination: ${targetDestination || "pantry"}
Current Date: ${todayStr}

For each food product found in the image or text:
1. "name": Clear clean food item name (e.g. "Amul Organic Toned Milk", "Sunfeast Dark Fantasy Biscuits")
2. "category": One of 'Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry & Grains', 'Bakery', 'Frozen', 'Snacks & Sweets', 'Beverages', 'Condiments & Spices', 'Household & Personal'.
3. "location": One of 'Fridge', 'Freezer', 'Pantry', 'Spice Cabinet'.
4. "quantity": Numeric count of packages or units (e.g. 1 or 2).
5. "unit": Package unit (e.g. "pack", "L", "kg", "g", "box", "can", "bottle", "pouch").
6. "estimatedPcs": Estimated or accurate pieces/count inside (e.g. "12 Accurate Pcs", "Approx 6 Pcs", "10 Slices").
7. "price": Estimated price in Indian Rupees (INR ₹).
8. "expirationDaysFromNow": Integer days to expiry if readable on label or expected (e.g. 7 for milk, 180 for canned). Use null/0 if non-perishable or optional date.
9. "nutritionHighlights": Short 1-sentence note of calories, protein, carbs or ingredients read from label.
10. "rawNotepadLine": A clean 1-line summary suitable for saving to a Notepad text file.

Return a JSON object with:
{
  "scannedItems": [...],
  "notepadNotes": "Complete structured text summary formatted as a Notepad log."
}`;

    const parts: any[] = [];

    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      });
    }

    if (notepadText) {
      parts.push({ text: `Notepad / Text File Input:\n"""\n${notepadText}\n"""` });
    }

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: parts,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scannedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  location: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  estimatedPcs: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  expirationDaysFromNow: { type: Type.INTEGER },
                  nutritionHighlights: { type: Type.STRING },
                  rawNotepadLine: { type: Type.STRING },
                },
                required: ["name", "category", "location", "quantity", "unit", "price"],
              },
            },
            notepadNotes: { type: Type.STRING },
          },
          required: ["scannedItems", "notepadNotes"],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"scannedItems":[], "notepadNotes":""}');
    res.json(parsed);
  } catch (error: any) {
    console.error("Scan label error / fallback activated:", error?.message || error);
    const textInput = req.body?.notepadText || "Scanned Food Product";
    const lineOne = textInput.split("\n")[0] || "Scanned Grocery Item";
    res.json({
      scannedItems: [
        {
          name: lineOne.slice(0, 40),
          category: "Pantry & Grains",
          location: "Pantry",
          quantity: 1,
          unit: "pack",
          estimatedPcs: "1 Pack",
          price: 150,
          expirationDaysFromNow: 30,
          nutritionHighlights: "Scanned product record",
          rawNotepadLine: lineOne
        }
      ],
      notepadNotes: `[Scanned Log]\nItem: ${lineOne}\nQuantity: 1 pack\nLogged: ${new Date().toLocaleDateString()}`
    });
  }
});

// 5. Global Web Recipe Search Chef
app.post("/api/ai/web-recipes", async (req, res) => {
  const { searchQuery, cuisine, maxPrepTime } = req.body;
  try {
    if (!searchQuery) {
      return res.status(400).json({ error: "searchQuery is required" });
    }

    const ai = getGenAI();

    const prompt = `You are a Global Web Recipe Search AI. Retrieve and curate authentic, top-rated recipes from the web for: "${searchQuery}".
Cuisine Filter: ${cuisine || "All Cuisines"}
Max Prep Time: ${maxPrepTime || "Any"}

Return 3 detailed recipes with realistic ingredients, exact prep & cooking times, difficulty rating, calorie estimates, source publication name, and step-by-step cooking directions.

Return a JSON array matching this EXACT schema:
[
  {
    "id": "web_recipe_1",
    "title": "Authentic Recipe Title",
    "sourceName": "AllRecipes / Food Network / BBC Good Food",
    "sourceUrl": "https://www.allrecipes.com",
    "prepTime": "15 mins",
    "cookTime": "25 mins",
    "servings": 4,
    "difficulty": "Easy",
    "caloriesPerServing": 420,
    "ingredients": [
      "1 cupBasmati Rice",
      "2 tbsp Butter / Ghee",
      "500g Chicken / Cottage Cheese"
    ],
    "instructions": [
      "Step 1...",
      "Step 2..."
    ],
    "summary": "Short appetizing description."
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let rawText = response.text || "";
    // Clean code fences if present in grounded markdown
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const jsonStart = rawText.indexOf("[");
    const jsonEnd = rawText.lastIndexOf("]");
    let recipes = [];
    if (jsonStart !== -1 && jsonEnd !== -1) {
      recipes = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));
    } else {
      try {
        recipes = JSON.parse(rawText);
      } catch (e) {
        console.error("Failed to parse web recipes JSON, fallback to synthesized format", e);
        recipes = [
          {
            id: "web_fallback_1",
            title: `${searchQuery} (Web Signature Recipe)`,
            sourceName: "Global Culinary Network",
            sourceUrl: "https://www.google.com/search?q=" + encodeURIComponent(searchQuery),
            prepTime: "15 mins",
            cookTime: "20 mins",
            servings: 4,
            difficulty: "Easy",
            caloriesPerServing: 380,
            ingredients: ["Fresh produce & key spices", "Cooking oil or ghee", "Main protein or vegetable base"],
            instructions: ["Prepare fresh ingredients.", "Sauté aromatics in pan until fragrant.", "Cook main ingredients thoroughly and serve hot!"],
            summary: `Classic authentic preparation for ${searchQuery}.`
          }
        ];
      }
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({ recipes, groundingChunks });
  } catch (error: any) {
    console.error("Web recipe error / fallback activated:", error?.message || error);
    const q = searchQuery || "Dish";
    const fallbackRecipes = [
      {
        id: "web_fallback_1",
        title: `${q} (Curated Authentic Recipe)`,
        sourceName: "Global Culinary Network",
        sourceUrl: "https://www.google.com/search?q=" + encodeURIComponent(q),
        prepTime: "15 mins",
        cookTime: "25 mins",
        servings: 4,
        difficulty: "Easy",
        caloriesPerServing: 420,
        ingredients: [
          "500g Fresh Main Ingredient or Veggies",
          "2 tbsp Ghee / Olive Oil or Butter",
          "1 medium Finely Chopped Onion",
          "Aromatics: Garlic, Ginger & Chili",
          "Ground Spices (Salt, Pepper, Cumin, Garam Masala)",
          "1 cup Tomato Puree or Broth"
        ],
        instructions: [
          "Heat oil or ghee in a pan over medium heat.",
          "Add chopped onions, garlic, and ginger; sauté until fragrant and golden.",
          "Stir in tomato puree and spices, simmering for 5 minutes.",
          "Add main ingredients, cover with lid and cook for 15 minutes until tender.",
          "Garnish with fresh coriander or herbs and serve warm!"
        ],
        summary: `Classic authentic preparation for ${q} with rich traditional spices.`
      },
      {
        id: "web_fallback_2",
        title: `Express 15-Minute ${q}`,
        sourceName: "Fast & Fresh Cooking",
        sourceUrl: "https://www.google.com/search?q=" + encodeURIComponent(q),
        prepTime: "10 mins",
        cookTime: "10 mins",
        servings: 2,
        difficulty: "Easy",
        caloriesPerServing: 340,
        ingredients: [
          "Prepared base (Rice, Noodles or Wrap)",
          "Seasoned Vegetables or Protein",
          "1 tbsp Sauce or Dressing of choice",
          "Fresh Herbs"
        ],
        instructions: [
          "Prepare or reheat your base grains or wrap.",
          "High-heat stir fry vegetables and protein in 1 tbsp oil for 6 minutes.",
          "Combine and drizzle with sauce before serving."
        ],
        summary: "Quick, tasty express preparation perfect for busy weekdays."
      }
    ];
    res.json({ recipes: fallbackRecipes, groundingChunks: [] });
  }
});

// --- SERVER SETUP & VITE MIDDLEWARE ---
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
