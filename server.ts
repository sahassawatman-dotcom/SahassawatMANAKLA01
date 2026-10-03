import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize Gemini API with mandatory headers
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API endpoint: Scan Food Image
app.post('/api/scan-food', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'กรุณาแนบรูปภาพอาหาร' });
    }

    if (!ai) {
      // Graceful fallback if API key is not configured in local environment
      return res.json({
        foodName: 'สลัดอกไก่ย่างควินัว (โหมดจำลอง)',
        calories: 380,
        protein: 34,
        carbs: 32,
        fat: 10,
        zone: '🟢 Green Zone',
        advice: 'อาหารคลีนคุณภาพสูง โปรตีนและไฟเบอร์สูง ช่วยฟื้นฟูกล้ามเนื้อและคุมน้ำตาล',
        ingredients: ['อกไก่ย่าง', 'ผักสลัดรวม', 'ควินัว', 'น้ำสลัดบัลซามิก'],
      });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        },
        {
          text: `คุณคือนักโภชนาการและโค้ชสุขภาพอัจฉริยะ (AI Nutritionist & Fitness Coach) 
โปรดวิเคราะห์อาหารในภาพนี้อย่างละเอียด:
1. ระบุชื่อเมนูอาหารภาษาไทยที่ถูกต้องและเข้าใจง่าย (เช่น ข้าวกะเพราไก่ไข่ดาว, อกไก่ย่างสลัด, ก๋วยเตี๋ยวต้มยำ)
2. ประมาณการแคลอรีทั้งหมด (kcal)
3. สารอาหารหลัก: โปรตีน (g), คาร์โบไฮเดรต (g), ไขมัน (g)
4. กำหนดโซนโภชนาการ (zone):
   - "🟢 Green Zone" (อาหารสุขภาพ แคลอรีเหมาะสม ไขมันต่ำ โปรตีน/ไฟเบอร์ดี)
   - "🟡 Yellow Zone" (ทานได้พอเหมาะ แต่ควรระวังน้ำมัน แป้ง หรือโซเดียม)
   - "🔴 Red Zone" (ของทอด หวานจัด มันจัด โซเดียมสูง ควรหลีกเลี่ยงหรือทานแต่น้อย)
5. คำแนะนำโภชนาการที่เป็นประโยชน์ (advice) สั้นกระชับเข้าใจง่าย
6. วัตถุดิบหลักที่ตรวจพบ (ingredients)`,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: {
              type: Type.STRING,
              description: 'ชื่อเมนูอาหารภาษาไทย',
            },
            calories: {
              type: Type.NUMBER,
              description: 'พลังงานโดยประมาณ (kcal)',
            },
            protein: {
              type: Type.NUMBER,
              description: 'โปรตีน (กรัม)',
            },
            carbs: {
              type: Type.NUMBER,
              description: 'คาร์โบไฮเดรต (กรัม)',
            },
            fat: {
              type: Type.NUMBER,
              description: 'ไขมัน (กรัม)',
            },
            zone: {
              type: Type.STRING,
              description: 'โซนโภชนาการ เช่น "🟢 Green Zone", "🟡 Yellow Zone", "🔴 Red Zone"',
            },
            advice: {
              type: Type.STRING,
              description: 'คำแนะนำด้านสุขภาพและโภชนาการ',
            },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'วัตถุดิบหลัก',
            },
          },
          required: ['foodName', 'calories', 'protein', 'carbs', 'fat', 'zone', 'advice'],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('ไม่สามารถอ่านผลการวิเคราะห์จาก AI ได้');
    }

    const parsedData = JSON.parse(text);
    return res.json(parsedData);
  } catch (err: unknown) {
    console.error('Scan food error:', err);
    return res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการวิเคราะห์อาหารด้วย AI',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// API endpoint: AI Fitness Coach / Personalized Recommendation
app.post('/api/ai-coach', async (req: Request, res: Response) => {
  try {
    const { age, gender, weight, height, activityLevel, bmr, tdee, goal, preferredSport } = req.body;

    if (!ai) {
      return res.json({
        headline: 'แผนสุขภาพและฟิตเนสเฉพาะบุคคล',
        advice: `สำหรับผู้ใช้วัย ${age} ปี เพศ ${gender === 'Male' ? 'ชาย' : 'หญิง'} แนะนำเน้นคาร์ดิโอโซน 2 เพื่อเพิ่มความทนทานของหัวใจและการเผาผลาญไขมัน ร่วมกับเวทเทรนนิ่ง 2-3 วันต่อสัปดาห์`,
        tips: [
          'ดื่มน้ำวันละ 2.5 - 3 ลิตรเพื่อรักษาระดับการเผาผลาญ',
          'รับประทานโปรตีนให้เพียงพอ ประมาณ 1.4-1.8 กรัมต่อน้ำหนักตัว (กก.)',
          'นอนหลับอย่างน้อย 7-8 ชั่วโมงเพื่อให้ฮอร์โมนฟื้นฟูกล้ามเนื้อทำงานเต็มที่',
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `ในฐานะผู้เชี่ยวชาญด้านวิทยาศาสตร์การกีฬาและโภชนาการ (Smart Physical Education Specialist):
ข้อมูลผู้ใช้:
- อายุ: ${age} ปี
- เพศ: ${gender === 'Male' ? 'ชาย' : 'หญิง'}
- น้ำหนัก: ${weight} กก., ส่วนสูง: ${height} ซม.
- ค่า BMR: ${bmr} kcal, TDEE: ${tdee} kcal
- ระดับกิจกรรม: ${activityLevel}
- กีฬาหรือการออกกำลังกายที่สนใจ: ${preferredSport || 'ทั่วไป'}
- เป้าหมาย: ${goal || 'รักษาสุขภาพและรูปร่างที่ดี'}

กรุณาให้คำแนะนำทางวิทยาศาสตร์การกีฬา การบริหารโซนชีพจร (HR Zone 2 สำหรับเผาผลาญไขมัน และ Zone 4 สำหรับ HIIT) พร้อมคำแนะนำโภชนาการและการนอนหลับ`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            advice: { type: Type.STRING },
            hrZoneStrategy: { type: Type.STRING },
            nutritionStrategy: { type: Type.STRING },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['headline', 'advice', 'hrZoneStrategy', 'nutritionStrategy', 'tips'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (err: unknown) {
    console.error('AI Coach error:', err);
    return res.status(500).json({
      error: 'เกิดข้อผิดพลาดในการสร้างคำแนะนำ AI',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
