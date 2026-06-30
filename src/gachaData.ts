export interface CatItem {
  id: string;
  name: string;
  jpName: string;
  description: string;
  rarity: "Common" | "Rare" | "Epic";
  price: number;
  emoji: string;
  bgGradient: string;
  textColor: string;
  bonus: string;
}

export const catList: CatItem[] = [
  {
    id: "calico",
    name: "เจ้าสามสี (Calico)",
    jpName: "ミケ (Mike)",
    description: "น้องแมวสามสีนำโชค ขี้อ้อน ชอบซูชิแซลมอนเป็นชีวิตจิตใจ",
    rarity: "Common",
    price: 50,
    emoji: "🐱",
    bgGradient: "linear-gradient(135deg, #FFE8D6 0%, #FFCAD4 100%)",
    textColor: "#8A5A44",
    bonus: "เริ่มต้น: ไม่มีโบนัสพิเศษ (แต่น่ารักมาก!)"
  },
  {
    id: "black",
    name: "เนโกะคุโระ (Kuro)",
    jpName: "クロ (Kuro)",
    description: "แมวดำขี้เล่น นำพาความโชคดี ลึกลับแต่รักสงบ ชอบนอนกลางวัน",
    rarity: "Common",
    price: 50,
    emoji: "🐈‍⬛",
    bgGradient: "linear-gradient(135deg, #2B2D42 0%, #8D99AE 100%)",
    textColor: "#FFFFFF",
    bonus: "โบนัส: เพิ่มโอกาสได้ดาวระดับ 3 ดาว +10%"
  },
  {
    id: "samurai",
    name: "โชกุนเหมียว (Samurai Cat)",
    jpName: "武士 (Bushi)",
    description: "นักดาบเหมียวผู้พิทักษ์คาเฟ่ มีระเบียบวินัยและชอบกินชาเขียวมัทฉะเข้ม ๆ",
    rarity: "Rare",
    price: 100,
    emoji: "😸",
    bgGradient: "linear-gradient(135deg, #D62828 0%, #F77F00 100%)",
    textColor: "#FFFFFF",
    bonus: "พลังดาบ: เพิ่มหัวใจสำรองให้ 1 ดวงในทุกการเล่น!"
  },
  {
    id: "matcha",
    name: "โมจิมัทฉะ (Matcha Mochi)",
    jpName: "抹茶 (Matcha)",
    description: "น้องแมวตัวนุ่มฟูสีเขียวมัทฉะ อ้วนกลม ชอบกินขนมโมจิแป้งยืด",
    rarity: "Rare",
    price: 100,
    emoji: "🐱‍👤",
    bgGradient: "linear-gradient(135deg, #D8F3DC 0%, #52B788 100%)",
    textColor: "#1B4332",
    bonus: "พลังหวาน: ได้เหรียญโบนัสเพิ่ม +2 เหรียญเมื่อเล่นชนะระดับ 3 ดาว"
  },
  {
    id: "neko_shikansen",
    name: "ชินคันเซ็นแคท (Bullet Cat)",
    jpName: "新幹線 (Shinkansen)",
    description: "น้องแมวความเร็วสูง สวมหมวกพนักงานขับรถไฟ วิ่งเร็วปานจรวด",
    rarity: "Epic",
    price: 150,
    emoji: "⚡",
    bgGradient: "linear-gradient(135deg, #A0C4FF 0%, #CBD5E1 100%)",
    textColor: "#03045E",
    bonus: "ซูเปอร์สปีด: ขยายเวลาการกดตอบในกรณีจำกัดเวลา 20%"
  },
  {
    id: "sakura_princess",
    name: "เจ้าหญิงซากุระ (Sakura Hime)",
    jpName: "桜姫 (Sakura)",
    description: "แมวเปอร์เซียสีชมพูฟูฟ่อง สง่างามและหรูหราดั่งกลีบซากุระปลิวไสวในฤดูใบไม้ผลิ",
    rarity: "Epic",
    price: 200,
    emoji: "👑",
    bgGradient: "linear-gradient(135deg, #FFC6FF 0%, #FDFFB6 100%)",
    textColor: "#590D22",
    bonus: "พรแห่งซากุระ: ได้รับเหรียญ x2 ตลอดเวลาที่พาน้องออกเดินทาง!"
  }
];
