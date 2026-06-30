export interface VocabItem {
  id: string;
  word: string;
  kana: string;
  romaji: string;
  meaningEn: string;
  meaningTh: string;
  hint: string;
  emoji: string;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  vocab: VocabItem[];
}

export const levelsData: Level[] = [
  {
    id: 1,
    title: "Hiragana Basics (あ - こ)",
    description: "ฝึกฝนตัวอักษรฮิรางานะพื้นฐานและการออกเสียงเบื้องต้น",
    icon: "BookOpen",
    vocab: [
      { id: "1-1", word: "あさ", kana: "あさ", romaji: "asa", meaningEn: "Morning", meaningTh: "เช้า", hint: "ตอนเริ่มต้นของวันใหม่", emoji: "🌅" },
      { id: "1-2", word: "いぬ", kana: "いぬ", romaji: "inu", meaningEn: "Dog", meaningTh: "สุนัข", hint: "เพื่อนรักสี่ขาของมนุษย์", emoji: "🐕" },
      { id: "1-3", word: "ねこ", kana: "ねこ", romaji: "neko", meaningEn: "Cat", meaningTh: "แมว", hint: "เจ้านายตัวน้อยในคาเฟ่", emoji: "🐱" },
      { id: "1-4", word: "うみ", kana: "うみ", romaji: "umi", meaningEn: "Sea / Ocean", meaningTh: "ทะเล", hint: "น้ำสีครามกว้างใหญ่", emoji: "🌊" },
      { id: "1-5", word: "えき", kana: "えき", romaji: "eki", meaningEn: "Station", meaningTh: "สถานีรถไฟ", hint: "สถานที่สำหรับขึ้นรถไฟชินคันเซ็น", emoji: "🚉" },
      { id: "1-6", word: "おいしい", kana: "おいしい", romaji: "oishii", meaningEn: "Delicious", meaningTh: "อร่อย", hint: "คำพูดเมื่อทานของอร่อย", emoji: "😋" },
      { id: "1-7", word: "かさ", kana: "かさ", romaji: "kasa", meaningEn: "Umbrella", meaningTh: "ร่ม", hint: "ใช้กันฝนหรือกันแดด", emoji: "☂️" },
      { id: "1-8", word: "こころ", kana: "こころ", romaji: "kokoro", meaningEn: "Heart / Soul", meaningTh: "หัวใจ / จิตใจ", hint: "ความรู้สึกที่อยู่ในอก", emoji: "💖" },
      { id: "1-9", word: "くつ", kana: "くつ", romaji: "kutsu", meaningEn: "Shoes", meaningTh: "รองเท้า", hint: "สวมใส่ก่อนก้าวออกจากบ้าน", emoji: "👟" },
      { id: "1-10", word: "かお", kana: "かお", romaji: "kao", meaningEn: "Face", meaningTh: "ใบหน้า", hint: "รอยยิ้มของคุณแสดงอยู่บนนี้", emoji: "😊" }
    ]
  },
  {
    id: 2,
    title: "Katakana Words (ア - コ)",
    description: "ทับศัพท์ภาษาต่างประเทศด้วยตัวอักษรคาตาคานะสุดชิค",
    icon: "Sparkles",
    vocab: [
      { id: "2-1", word: "カメラ", kana: "かめら", romaji: "kamera", meaningEn: "Camera", meaningTh: "กล้องถ่ายรูป", hint: "ใช้สำหรับบันทึกภาพความทรงจำ", emoji: "📷" },
      { id: "2-2", word: "ケーキ", kana: "けーき", romaji: "kēki", meaningEn: "Cake", meaningTh: "เค้ก", hint: "ขนมหวานยอดฮิตในวันเกิด", emoji: "🎂" },
      { id: "2-3", word: "ココア", kana: "ここあ", romaji: "kokoa", meaningEn: "Cocoa", meaningTh: "โกโก้", hint: "เครื่องดื่มอุ่น ๆ หวานมัน", emoji: "🍫" },
      { id: "2-4", word: "アイス", kana: "あいす", romaji: "aisu", meaningEn: "Ice Cream", meaningTh: "ไอศกรีม", hint: "ของหวานเย็น ๆ ดับร้อน", emoji: "🍦" },
      { id: "2-5", word: "イチゴ", kana: "いちご", romaji: "ichigo", meaningEn: "Strawberry", meaningTh: "สตรอว์เบอร์รี", hint: "ผลไม้สีแดงรสหวานอมเปรี้ยว", emoji: "🍓" },
      { id: "2-6", word: "カレー", kana: "かれー", romaji: "karē", meaningEn: "Curry", meaningTh: "แกงกะหรี่", hint: "อาหารยอดนิยมหน้าตาเข้มข้นรสเผ็ดร้อน", emoji: "🍛" },
      { id: "2-7", word: "カップ", kana: "かっぷ", romaji: "kappu", meaningEn: "Cup / Mug", meaningTh: "ถ้วย / แก้วมีหู", hint: "ภาชนะสำหรับใส่เครื่องดื่มร้อน", emoji: "☕" },
      { id: "2-8", word: "エアコン", kana: "えあこん", romaji: "eakon", meaningEn: "Air Conditioner", meaningTh: "เครื่องปรับอากาศ", hint: "ช่วยให้ห้องเย็นสบายในฤดูร้อน", emoji: "❄️" },
      { id: "2-9", word: "コップ", kana: "こっぷ", romaji: "koppu", meaningEn: "Glass / Cup", meaningTh: "แก้วน้ำ", hint: "ภาชนะทรงกระบอกสำหรับใส่น้ำดื่ม", emoji: "🥤" },
      { id: "2-10", word: "アニメ", kana: "あにめ", romaji: "anime", meaningEn: "Anime", meaningTh: "อนิเมะ / การ์ตูน", hint: "วัฒนธรรมป๊อปยอดฮิตของญี่ปุ่น", emoji: "✨" }
    ]
  },
  {
    id: 3,
    title: "Oishii Food (อาหารญี่ปุ่น)",
    description: "เรียนรู้ชื่อเมนูอาหารญี่ปุ่นยอดฮิตที่เห็นแล้วต้องน้ำลายไหล",
    icon: "Utensils",
    vocab: [
      { id: "3-1", word: "すし", kana: "すし", romaji: "sushi", meaningEn: "Sushi", meaningTh: "ซูชิ", hint: "ข้าวปั้นหน้าปลาดิบป้ายวาซาบิ", emoji: "🍣" },
      { id: "3-2", word: "らーめん", kana: "らーめん", romaji: "rāmen", meaningEn: "Ramen", meaningTh: "ราเมน", hint: "บะหมี่น้ำซุปกระดูกหมูรสเข้มข้น", emoji: "🍜" },
      { id: "3-3", word: "てんぷら", kana: "てんぷら", romaji: "tenpura", meaningEn: "Tempura", meaningTh: "เทมปุระ", hint: "ของชุบแป้งทอดกรอบสีทองอร่าม", emoji: "🍤" },
      { id: "3-4", word: "たこやき", kana: "たこやき", romaji: "takoyaki", meaningEn: "Takoyaki", meaningTh: "ทาโกะยากิ", hint: "ขนมครกญี่ปุ่นลูกกลม ๆ สอดไส้ปลาหมึกยักษ์", emoji: "🐙" },
      { id: "3-5", word: "おにぎり", kana: "おにぎり", romaji: "onigiri", meaningEn: "Rice Ball", meaningTh: "ข้าวปั้นสามเหลี่ยม", hint: "ข้าวปั้นห่อสาหร่าย พกพาสะดวก", emoji: "🍙" },
      { id: "3-6", word: "みそしる", kana: "みそしる", romaji: "misoshiru", meaningEn: "Miso Soup", meaningTh: "ซุปเต้าเจี้ยว / ซุปมิโซะ", hint: "ซุปร้อน ๆ ที่มักจะเสิร์ฟพร้อมข้าวสวย", emoji: "🍵" },
      { id: "3-7", word: "さしみ", kana: "さしみ", romaji: "sashimi", meaningEn: "Sashimi", meaningTh: "ปลาดิบ", hint: "เนื้อปลาแล่สด ๆ ทานคู่กับโชยุ", emoji: "🐟" },
      { id: "3-8", word: "うどん", kana: "うどん", romaji: "udon", meaningEn: "Udon", meaningTh: "อูด้ง", hint: "เส้นสีขาวอวบอ้วนในน้ำซุปรสเบา ๆ", emoji: "🍢" },
      { id: "3-9", word: "まっちゃ", kana: "まっちゃ", romaji: "maccha", meaningEn: "Matcha Green Tea", meaningTh: "ชาเขียวมัทฉะ", hint: "ผงชาเขียวญี่ปุ่นบดละเอียดแบบดั้งเดิม", emoji: "🍵" },
      { id: "3-10", word: "もち", kana: "もち", romaji: "mochi", meaningEn: "Mochi", meaningTh: "โมจิ", hint: "ขนมแป้งข้าวเหนียวเหนียวนุ่มยืดหยุ่น", emoji: "🍡" }
    ]
  },
  {
    id: 4,
    title: "Kawaii Animals (สัตว์โลกน่ารัก)",
    description: "คำศัพท์เกี่ยวกับสัตว์น้อยใหญ่ที่เป็นเพื่อนรักของเรา",
    icon: "PawPrint",
    vocab: [
      { id: "4-1", word: "うさぎ", kana: "うさぎ", romaji: "usagi", meaningEn: "Rabbit", meaningTh: "กระต่าย", hint: "หูยาว กระโดดหยอง ๆ ชอบกินแครอท", emoji: "🐰" },
      { id: "4-2", word: "くま", kana: "くま", romaji: "kuma", meaningEn: "Bear", meaningTh: "หมี", hint: "สัตว์ตัวใหญ่ขนหนาน่ากอด ชอบกินน้ำผึ้ง", emoji: "🐻" },
      { id: "4-3", word: "ぱんだ", kana: "ぱんだ", romaji: "panda", meaningEn: "Panda", meaningTh: "แพนด้า", hint: "หมีสีขาวดำชอบแทะไผ่สุดขี้เกียจ", emoji: "🐼" },
      { id: "4-4", word: "さる", kana: "さる", romaji: "saru", meaningEn: "Monkey", meaningTh: "ลิง", hint: "สัตว์แสนซนชอบปีนต้นไม้และกินกล้วย", emoji: "🐒" },
      { id: "4-5", word: "とり", kana: "とり", romaji: "tori", meaningEn: "Bird", meaningTh: "นก", hint: "สัตว์มีปีกที่โบยบินบนฟ้ากว้าง", emoji: "🐦" },
      { id: "4-6", word: "きつね", kana: "きつね", romaji: "kitsune", meaningEn: "Fox", meaningTh: "สุนัขจิ้งจอก", hint: "เจ้าแห่งปัญญาในตำนานญี่ปุ่น (มีหลายหาง)", emoji: "🦊" },
      { id: "4-7", word: "ぺんぎん", kana: "ぺんぎん", romaji: "pengin", meaningEn: "Penguin", meaningTh: "เพนกวิน", hint: "นกบินไม่ได้ที่เดินเตาะแตะบนน้ำแข็งขั้วโลก", emoji: "🐧" },
      { id: "4-8", word: "はむすたー", kana: "はむすたー", romaji: "hamusutā", meaningEn: "Hamster", meaningTh: "แฮมสเตอร์", hint: "หนูตัวจิ๋วแก้มป่องชอบวิ่งบนวงล้อ", emoji: "🐹" },
      { id: "4-9", word: "しばいぬ", kana: "しばいぬ", romaji: "shibainu", meaningEn: "Shiba Inu", meaningTh: "สุนัขชิบะ", hint: "หมาสายพันธุ์ญี่ปุ่นหน้าง่วงหางม้วนสุดกวน", emoji: "🐕" },
      { id: "4-10", word: "かえる", kana: "かえる", romaji: "kaeru", meaningEn: "Frog", meaningTh: "กบ", hint: "ส่งเสียงร้องอบ ๆ ในวันฝนพรำ", emoji: "🐸" }
    ]
  },
  {
    id: 5,
    title: "Everyday Greetings (ทักทายชีวิตประจำวัน)",
    description: "ฝึกฝนประโยคพูดและคำทักทายภาษาญี่ปุ่นที่ต้องใช้อยู่เสมอ",
    icon: "MessageCircle",
    vocab: [
      { id: "5-1", word: "こんにちは", kana: "こんにちは", romaji: "konnichiwa", meaningEn: "Hello / Good afternoon", meaningTh: "สวัสดี (ช่วงกลางวัน)", hint: "คำทักทายมาตรฐานทั่วไป", emoji: "👋" },
      { id: "5-2", word: "ありがとう", kana: "ありがとう", romaji: "arigatou", meaningEn: "Thank you", meaningTh: "ขอบคุณ", hint: "กล่าวเพื่อแสดงความซาบซึ้งใจ", emoji: "🙏" },
      { id: "5-3", word: "おはよう", kana: "おはよう", romaji: "ohayou", meaningEn: "Good morning", meaningTh: "สวัสดีตอนเช้า", hint: "ทักทายคนอื่นในยามเช้าตรู่", emoji: "🌞" },
      { id: "5-4", word: "こんばんは", kana: "こんばんは", romaji: "konbanwa", meaningEn: "Good evening", meaningTh: "สวัสดีตอนเย็น", hint: "ใช้ทักทายกันเมื่ออาทิตย์ลับขอบฟ้าแล้ว", emoji: "🌙" },
      { id: "5-5", word: "さようなら", kana: "さようなら", romaji: "sayounara", meaningEn: "Goodbye", meaningTh: "ลาก่อน", hint: "เอ่ยบอกเมื่อต้องแยกจากกันเป็นเวลานาน", emoji: "👋" },
      { id: "5-6", word: "すみません", kana: "すみません", romaji: "sumimasen", meaningEn: "Excuse me / Sorry", meaningTh: "ขอโทษ / ขออนุญาต", hint: "ใช้เรียกพนักงานหรือขอโทษเวลาเดินชนคนอื่น", emoji: "🙇" },
      { id: "5-7", word: "はい", kana: "はい", romaji: "hai", meaningEn: "Yes", meaningTh: "ใช่ / ครับ / ค่ะ", hint: "คำตอบรับอย่างสุภาพ", emoji: "✅" },
      { id: "5-8", word: "いいえ", kana: "いいえ", romaji: "iie", meaningEn: "No", meaningTh: "ไม่ / ไม่ใช่", hint: "คำปฏิเสธอย่างนุ่มนวล", emoji: "❌" },
      { id: "5-9", word: "いただきます", kana: "いただきます", romaji: "itadakimasu", meaningEn: "Thank you for the food (before meal)", meaningTh: "จะทานแล้วนะครับ/ค่ะ", hint: "พูดพนมมือก่อนเริ่มทานอาหารเพื่อขอบคุณวัตถุดิบ", emoji: "🍱" },
      { id: "5-10", word: "ごちそうさま", kana: "ごちそうさま", romaji: "gochisousama", meaningEn: "Thank you for the meal (after meal)", meaningTh: "ขอบคุณสำหรับอาหารมื้อนี้", hint: "พูดหลังจากทานอาหารเสร็จเรียบร้อยแล้ว", emoji: "😌" }
    ]
  },
  {
    id: 6,
    title: "Numbers & Colors (ตัวเลขและสีสัน)",
    description: "เรียนรู้การนับจำนวนเบื้องต้นและเฉดสีสันต่าง ๆ รอบตัวเรา",
    icon: "Palette",
    vocab: [
      { id: "6-1", word: "いち", kana: "いち", romaji: "ichi", meaningEn: "One (1)", meaningTh: "หนึ่ง", hint: "เลขเริ่มต้นตัวแรกสุด", emoji: "1️⃣" },
      { id: "6-2", word: "に", kana: "に", romaji: "ni", meaningEn: "Two (2)", meaningTh: "สอง", hint: "เลขถัดจากเลขหนึ่ง", emoji: "2️⃣" },
      { id: "6-3", word: "さん", kana: "さん", romaji: "san", meaningEn: "Three (3)", meaningTh: "สาม", hint: "มี 3 มุม (เช่น สามเหลี่ยม)", emoji: "3️⃣" },
      { id: "6-4", word: "よん", kana: "よん", romaji: "yon / shi", meaningEn: "Four (4)", meaningTh: "สี่", hint: "คนญี่ปุ่นบางทีหลีกเลี่ยงการออกเสียง 'ชิ' เพราะพ้องเสียงคำว่าตาย", emoji: "4️⃣" },
      { id: "6-5", word: "ご", kana: "ご", romaji: "go", meaningEn: "Five (5)", meaningTh: "ห้า", hint: "ครึ่งหนึ่งของเลขสิบพอดี", emoji: "5️⃣" },
      { id: "6-6", word: "あか", kana: "あか", romaji: "aka", meaningEn: "Red", meaningTh: "สีแดง", hint: "สีของลูกแอปเปิ้ลและมะเขือเทศสุก", emoji: "🔴" },
      { id: "6-7", word: "あお", kana: "あお", romaji: "ao", meaningEn: "Blue", meaningTh: "สีฟ้า / สีน้ำเงิน", hint: "สีของท้องฟ้าสดใสและท้องทะเล", emoji: "🔵" },
      { id: "6-8", word: "きいろ", kana: "きいろ", romaji: "kiiro", meaningEn: "Yellow", meaningTh: "สีเหลือง", hint: "สีของกล้วยหอมและดอกทานตะวัน", emoji: "🌕" },
      { id: "6-9", word: "みどり", kana: "みどり", romaji: "midori", meaningEn: "Green", meaningTh: "สีเขียว", hint: "สีของใบไม้และธรรมชาติป่าเขา", emoji: "🟢" },
      { id: "6-10", word: "しろ", kana: "しろ", romaji: "shiro", meaningEn: "White", meaningTh: "สีขาว", hint: "สีของปุยหิมะและเมฆลอยฟ้า", emoji: "⬜" }
    ]
  }
];
