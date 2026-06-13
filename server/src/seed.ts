import { PrismaClient } from '@prisma/client';
import { generatePrediction } from './predictor';

const prisma = new PrismaClient();

const TEAMS_DATA = [
  // Group A
  { name: 'Mexico', code: 'MEX', flag: 'mx', group: 'A', rank: 15, elo: 1840, val: 240.5, att: 79, def: 78, mid: 78 },
  { name: 'Nam Phi', code: 'RSA', flag: 'za', group: 'A', rank: 59, elo: 1570, val: 30.0, att: 68, def: 67, mid: 68 },
  { name: 'Hàn Quốc', code: 'KOR', flag: 'kr', group: 'A', rank: 22, elo: 1780, val: 170.0, att: 78, def: 74, mid: 76 },
  { name: 'Cộng hòa Séc', code: 'CZE', flag: 'cz', group: 'A', rank: 35, elo: 1750, val: 190.0, att: 75, def: 76, mid: 75 },
  // Group B
  { name: 'Canada', code: 'CAN', flag: 'ca', group: 'B', rank: 38, elo: 1710, val: 180.0, att: 77, def: 72, mid: 74 },
  { name: 'Bosnia và Herzegovina', code: 'BIH', flag: 'ba', group: 'B', rank: 65, elo: 1580, val: 70.0, att: 70, def: 69, mid: 70 },
  { name: 'Qatar', code: 'QAT', flag: 'qa', group: 'B', rank: 46, elo: 1550, val: 18.0, att: 66, def: 64, mid: 65 },
  { name: 'Thụy Sĩ', code: 'SUI', flag: 'ch', group: 'B', rank: 19, elo: 1850, val: 280.0, att: 79, def: 81, mid: 81 },
  // Group C
  { name: 'Brazil', code: 'BRA', flag: 'br', group: 'C', rank: 5, elo: 2120, val: 1050.0, att: 89, def: 88, mid: 87 },
  { name: 'Maroc', code: 'MAR', flag: 'ma', group: 'C', rank: 13, elo: 1860, val: 350.0, att: 80, def: 84, mid: 82 },
  { name: 'Haiti', code: 'HAI', flag: 'ht', group: 'C', rank: 86, elo: 1420, val: 12.0, att: 62, def: 60, mid: 61 },
  { name: 'Scotland', code: 'SCO', flag: 'gb-sct', group: 'C', rank: 39, elo: 1695, val: 210.0, att: 73, def: 74, mid: 75 },
  // Group D
  { name: 'Mỹ', code: 'USA', flag: 'us', group: 'D', rank: 16, elo: 1810, val: 320.0, att: 79, def: 77, mid: 80 },
  { name: 'Paraguay', code: 'PAR', flag: 'py', group: 'D', rank: 56, elo: 1630, val: 95.0, att: 71, def: 73, mid: 71 },
  { name: 'Úc', code: 'AUS', flag: 'au', group: 'D', rank: 24, elo: 1720, val: 50.0, att: 72, def: 73, mid: 72 },
  { name: 'Thổ Nhĩ Kỳ', code: 'TUR', flag: 'tr', group: 'D', rank: 26, elo: 1790, val: 330.0, att: 81, def: 76, mid: 80 },
  // Group E
  { name: 'Đức', code: 'GER', flag: 'de', group: 'E', rank: 9, elo: 1960, val: 890.0, att: 86, def: 83, mid: 89 },
  { name: 'Curaçao', code: 'CUW', flag: 'cw', group: 'E', rank: 88, elo: 1410, val: 10.0, att: 61, def: 60, mid: 61 },
  { name: 'Bờ Biển Ngà', code: 'CIV', flag: 'ci', group: 'E', rank: 33, elo: 1730, val: 280.0, att: 77, def: 76, mid: 75 },
  { name: 'Ecuador', code: 'ECU', flag: 'ec', group: 'E', rank: 31, elo: 1755, val: 150.0, att: 75, def: 78, mid: 76 },
  // Group F
  { name: 'Hà Lan', code: 'NED', flag: 'nl', group: 'F', rank: 6, elo: 1990, val: 720.0, att: 85, def: 86, mid: 86 },
  { name: 'Nhật Bản', code: 'JPN', flag: 'jp', group: 'F', rank: 17, elo: 1830, val: 260.0, att: 80, def: 79, mid: 81 },
  { name: 'Thụy Điển', code: 'SWE', flag: 'se', group: 'F', rank: 28, elo: 1800, val: 290.0, att: 79, def: 78, mid: 78 },
  { name: 'Tunisia', code: 'TUN', flag: 'tn', group: 'F', rank: 41, elo: 1660, val: 45.0, att: 71, def: 70, mid: 71 },
  // Group G
  { name: 'Bỉ', code: 'BEL', flag: 'be', group: 'G', rank: 8, elo: 1950, val: 580.0, att: 83, def: 78, mid: 85 },
  { name: 'Ai Cập', code: 'EGY', flag: 'eg', group: 'G', rank: 32, elo: 1715, val: 120.0, att: 77, def: 71, mid: 72 },
  { name: 'Iran', code: 'IRN', flag: 'ir', group: 'G', rank: 20, elo: 1740, val: 60.0, att: 75, def: 73, mid: 72 },
  { name: 'New Zealand', code: 'NZL', flag: 'nz', group: 'G', rank: 85, elo: 1450, val: 20.0, att: 63, def: 63, mid: 62 },
  // Group H
  { name: 'Cape Verde', code: 'CPV', flag: 'cv', group: 'H', rank: 62, elo: 1565, val: 22.0, att: 67, def: 66, mid: 67 },
  { name: 'Ả Rập Xê Út', code: 'KSA', flag: 'sa', group: 'H', rank: 53, elo: 1590, val: 25.0, att: 67, def: 66, mid: 67 },
  { name: 'Tây Ban Nha', code: 'ESP', flag: 'es', group: 'H', rank: 3, elo: 2070, val: 950.0, att: 88, def: 87, mid: 91 },
  { name: 'Uruguay', code: 'URU', flag: 'uy', group: 'H', rank: 11, elo: 1930, val: 450.0, att: 83, def: 82, mid: 84 },
  // Group I
  { name: 'Pháp', code: 'FRA', flag: 'fr', group: 'I', rank: 2, elo: 2090, val: 1100.0, att: 91, def: 88, mid: 87 },
  { name: 'Iraq', code: 'IRQ', flag: 'iq', group: 'I', rank: 55, elo: 1560, val: 14.0, att: 67, def: 65, mid: 66 },
  { name: 'Na Uy', code: 'NOR', flag: 'no', group: 'I', rank: 44, elo: 1745, val: 380.0, att: 81, def: 74, mid: 77 },
  { name: 'Senegal', code: 'SEN', flag: 'sn', group: 'I', rank: 21, elo: 1765, val: 320.0, att: 77, def: 78, mid: 76 },
  // Group J
  { name: 'Algeria', code: 'ALG', flag: 'dz', group: 'J', rank: 43, elo: 1680, val: 160.0, att: 74, def: 73, mid: 74 },
  { name: 'Argentina', code: 'ARG', flag: 'ar', group: 'J', rank: 1, elo: 2140, val: 820.0, att: 89, def: 86, mid: 88 },
  { name: 'Áo', code: 'AUT', flag: 'at', group: 'J', rank: 23, elo: 1815, val: 260.0, att: 79, def: 78, mid: 80 },
  { name: 'Jordan', code: 'JOR', flag: 'jo', group: 'J', rank: 68, elo: 1545, val: 12.0, att: 66, def: 64, mid: 65 },
  // Group K
  { name: 'Colombia', code: 'COL', flag: 'co', group: 'K', rank: 12, elo: 1910, val: 280.0, att: 82, def: 81, mid: 82 },
  { name: 'Cộng hòa Dân chủ Congo', code: 'COD', flag: 'cd', group: 'K', rank: 58, elo: 1575, val: 65.0, att: 71, def: 70, mid: 70 },
  { name: 'Bồ Đào Nha', code: 'POR', flag: 'pt', group: 'K', rank: 7, elo: 1985, val: 980.0, att: 87, def: 85, mid: 88 },
  { name: 'Uzbekistan', code: 'UZB', flag: 'uz', group: 'K', rank: 60, elo: 1610, val: 35.0, att: 71, def: 70, mid: 71 },
  // Group L
  { name: 'Croatia', code: 'CRO', flag: 'hr', group: 'L', rank: 12, elo: 1905, val: 350.0, att: 79, def: 80, mid: 87 },
  { name: 'Anh', code: 'ENG', flag: 'gb-eng', group: 'L', rank: 4, elo: 2020, val: 1200.0, att: 89, def: 85, mid: 90 },
  { name: 'Ghana', code: 'GHA', flag: 'gh', group: 'L', rank: 64, elo: 1595, val: 200.0, att: 74, def: 71, mid: 73 },
  { name: 'Panama', code: 'PAN', flag: 'pa', group: 'L', rank: 42, elo: 1625, val: 18.0, att: 68, def: 68, mid: 67 }
];

const PLAYERS_DATA: { [teamCode: string]: Array<{ name: string; pos: string; val: number; status: string; details?: string; goals?: number; assists?: number; rating?: number }> } = {
  ARG: [
    { name: 'Emiliano Martínez', pos: 'GK', val: 28.0, status: 'FIT', rating: 7.5 },
    { name: 'Nahuel Molina', pos: 'DEF', val: 28.0, status: 'FIT', rating: 7.1 },
    { name: 'Cristian Romero', pos: 'DEF', val: 65.0, status: 'FIT', goals: 0, assists: 0, rating: 7.6 },
    { name: 'Nicolás Otamendi', pos: 'DEF', val: 3.0, status: 'FIT', rating: 7.0 },
    { name: 'Nicolás Tagliafico', pos: 'DEF', val: 8.0, status: 'FIT', rating: 7.1 },
    { name: 'Rodrigo De Paul', pos: 'MID', val: 30.0, status: 'FIT', rating: 7.4 },
    { name: 'Enzo Fernández', pos: 'MID', val: 75.0, status: 'FIT', goals: 0, assists: 0, rating: 7.3 },
    { name: 'Alexis Mac Allister', pos: 'MID', val: 70.0, status: 'FIT', rating: 7.4 },
    { name: 'Lionel Messi', pos: 'FWD', val: 30.0, status: 'FIT', goals: 1, assists: 1, rating: 8.0 },
    { name: 'Lautaro Martínez', pos: 'FWD', val: 110.0, status: 'FIT', goals: 0, assists: 0, rating: 7.1 },
    { name: 'Julián Álvarez', pos: 'FWD', val: 90.0, status: 'FIT', rating: 7.5 }
  ],
  BRA: [
    { name: 'Alisson Becker', pos: 'GK', val: 28.0, status: 'FIT', rating: 7.5 },
    { name: 'Danilo', pos: 'DEF', val: 12.0, status: 'FIT', rating: 7.0 },
    { name: 'Marquinhos', pos: 'DEF', val: 45.0, status: 'FIT', rating: 7.4 },
    { name: 'Gabriel Magalhães', pos: 'DEF', val: 70.0, status: 'FIT', rating: 7.6 },
    { name: 'Guilherme Arana', pos: 'DEF', val: 10.0, status: 'FIT', rating: 7.1 },
    { name: 'Bruno Guimarães', pos: 'MID', val: 85.0, status: 'FIT', rating: 7.5 },
    { name: 'Casemiro', pos: 'MID', val: 20.0, status: 'FIT', rating: 7.2 },
    { name: 'Lucas Paquetá', pos: 'MID', val: 55.0, status: 'FIT', rating: 7.3 },
    { name: 'Rodrygo', pos: 'FWD', val: 110.0, status: 'FIT', goals: 1, assists: 1, rating: 7.8 },
    { name: 'Vinícius Júnior', pos: 'FWD', val: 180.0, status: 'FIT', goals: 2, assists: 1, rating: 8.3 },
    { name: 'Endrick', pos: 'FWD', val: 60.0, status: 'FIT', goals: 0, assists: 0, rating: 7.0 },
    { name: 'Neymar', pos: 'FWD', val: 30.0, status: 'INJURED', details: 'Chấn thương bắp chân (Calf Injury)', rating: 8.0 },
    { name: 'Wesley Franca', pos: 'DEF', val: 4.0, status: 'INJURED', details: 'Chấn thương cơ (Muscle Injury)', rating: 6.8 }
  ],
  MAR: [
    { name: 'Yassine Bounou', pos: 'GK', val: 12.0, status: 'FIT', rating: 7.6 },
    { name: 'Achraf Hakimi', pos: 'DEF', val: 65.0, status: 'FIT', rating: 7.9 },
    { name: 'Romain Saïss', pos: 'DEF', val: 5.0, status: 'FIT', rating: 7.1 },
    { name: 'Noussair Mazraoui', pos: 'DEF', val: 30.0, status: 'FIT', rating: 7.4 },
    { name: 'Sofyan Amrabat', pos: 'MID', val: 28.0, status: 'FIT', rating: 7.5 },
    { name: 'Azzedine Ounahi', pos: 'MID', val: 15.0, status: 'FIT', rating: 7.3 },
    { name: 'Bilal El Khannouss', pos: 'MID', val: 22.0, status: 'FIT', rating: 7.2 },
    { name: 'Hakim Ziyech', pos: 'FWD', val: 12.0, status: 'FIT', rating: 7.5 },
    { name: 'Youssef En-Nesyri', pos: 'FWD', val: 25.0, status: 'FIT', rating: 7.4 },
    { name: 'Amine Adli', pos: 'FWD', val: 25.0, status: 'FIT', rating: 7.3 },
    { name: 'Nayef Aguerd', pos: 'DEF', val: 35.0, status: 'INJURED', details: 'Chấn thương háng (Groin Injury)', rating: 7.3 },
    { name: 'Abde Ezzalzouli', pos: 'FWD', val: 12.0, status: 'INJURED', details: 'Chấn thương đầu gối (Knee Injury)', rating: 7.0 }
  ],
  QAT: [
    { name: 'Meshaal Barsham', pos: 'GK', val: 1.2, status: 'FIT', rating: 6.8 },
    { name: 'Ro-Ro', pos: 'DEF', val: 0.8, status: 'FIT', rating: 6.5 },
    { name: 'Bassam Al-Rawi', pos: 'DEF', val: 1.0, status: 'FIT', rating: 6.6 },
    { name: 'Boualem Khoukhi', pos: 'DEF', val: 0.8, status: 'FIT', rating: 6.7 },
    { name: 'Lucas Mendes', pos: 'DEF', val: 1.5, status: 'FIT', rating: 6.8 },
    { name: 'Jassem Gaber', pos: 'MID', val: 1.2, status: 'FIT', rating: 6.6 },
    { name: 'Ahmed Fathy', pos: 'MID', val: 0.9, status: 'FIT', rating: 6.5 },
    { name: 'Hassan Al-Haydos', pos: 'MID', val: 1.0, status: 'FIT', rating: 7.0 },
    { name: 'Akram Afif', pos: 'FWD', val: 6.0, status: 'FIT', goals: 1, assists: 1, rating: 7.6 },
    { name: 'Almoez Ali', pos: 'FWD', val: 3.5, status: 'FIT', goals: 1, assists: 0, rating: 7.2 },
    { name: 'Yusuf Abdurisag', pos: 'FWD', val: 0.8, status: 'FIT', rating: 6.5 }
  ],
  SUI: [
    { name: 'Yann Sommer', pos: 'GK', val: 5.0, status: 'FIT', rating: 7.4 },
    { name: 'Silvan Widmer', pos: 'DEF', val: 4.5, status: 'FIT', rating: 7.0 },
    { name: 'Manuel Akanji', pos: 'DEF', val: 45.0, status: 'FIT', rating: 7.7 },
    { name: 'Nico Elvedi', pos: 'DEF', val: 18.0, status: 'FIT', rating: 7.2 },
    { name: 'Ricardo Rodríguez', pos: 'DEF', val: 3.5, status: 'FIT', rating: 7.1 },
    { name: 'Remo Freuler', pos: 'MID', val: 15.0, status: 'FIT', rating: 7.3 },
    { name: 'Granit Xhaka', pos: 'MID', val: 20.0, status: 'FIT', rating: 7.8 },
    { name: 'Denis Zakaria', pos: 'MID', val: 25.0, status: 'FIT', rating: 7.4 },
    { name: 'Xherdan Shaqiri', pos: 'FWD', val: 3.0, status: 'FIT', rating: 7.2 },
    { name: 'Dan Ndoye', pos: 'FWD', val: 22.0, status: 'FIT', rating: 7.3 },
    { name: 'Breel Embolo', pos: 'FWD', val: 12.0, status: 'FIT', rating: 7.2 }
  ],
  KOR: [
    { name: 'Jo Hyeon-woo', pos: 'GK', val: 1.5, status: 'FIT', rating: 7.2 },
    { name: 'Kim Min-jae', pos: 'DEF', val: 55.0, status: 'FIT', rating: 7.8 },
    { name: 'Kim Young-gwon', pos: 'DEF', val: 0.8, status: 'FIT', rating: 6.9 },
    { name: 'Seol Young-woo', pos: 'DEF', val: 1.5, status: 'FIT', rating: 7.0 },
    { name: 'Kim Jin-su', pos: 'DEF', val: 1.0, status: 'FIT', rating: 6.8 },
    { name: 'Hwang In-beom', pos: 'MID', val: 10.0, status: 'FIT', rating: 7.3 },
    { name: 'Lee Kang-in', pos: 'MID', val: 25.0, status: 'FIT', rating: 7.6 },
    { name: 'Lee Jae-sung', pos: 'MID', val: 3.0, status: 'FIT', rating: 7.1 },
    { name: 'Son Heung-min', pos: 'FWD', val: 45.0, status: 'FIT', goals: 2, assists: 0, rating: 8.0 },
    { name: 'Cho Gue-sung', pos: 'FWD', val: 3.5, status: 'FIT', rating: 7.0 },
    { name: 'Hwang Hee-chan', pos: 'FWD', val: 25.0, status: 'FIT', rating: 7.4 }
  ],
  CZE: [
    { name: 'Jindřich Staněk', pos: 'GK', val: 3.5, status: 'FIT', rating: 7.1 },
    { name: 'Vladimír Coufal', pos: 'DEF', val: 4.0, status: 'FIT', rating: 7.2 },
    { name: 'Tomáš Holeš', pos: 'DEF', val: 3.0, status: 'FIT', rating: 7.0 },
    { name: 'Robin Hranáč', pos: 'DEF', val: 5.0, status: 'FIT', rating: 7.1 },
    { name: 'David Douděra', pos: 'DEF', val: 2.5, status: 'FIT', rating: 6.9 },
    { name: 'Tomáš Souček', pos: 'MID', val: 35.0, status: 'FIT', rating: 7.6 },
    { name: 'Lukáš Provod', pos: 'MID', val: 6.0, status: 'FIT', rating: 7.3 },
    { name: 'Antonín Barák', pos: 'MID', val: 8.0, status: 'FIT', rating: 7.1 },
    { name: 'Václav Černý', pos: 'FWD', val: 7.0, status: 'FIT', rating: 7.2 },
    { name: 'Jan Kuchta', pos: 'FWD', val: 4.5, status: 'FIT', rating: 6.9 },
    { name: 'Patrik Schick', pos: 'FWD', val: 22.0, status: 'FIT', goals: 1, assists: 0, rating: 7.5 }
  ],
  RSA: [
    { name: 'Ronwen Williams', pos: 'GK', val: 1.5, status: 'FIT', rating: 7.5 },
    { name: 'Khuliso Mudau', pos: 'DEF', val: 1.2, status: 'FIT', rating: 6.9 },
    { name: 'Mothobi Mvala', pos: 'DEF', val: 1.0, status: 'FIT', rating: 6.8 },
    { name: 'Grant Kekana', pos: 'DEF', val: 0.9, status: 'FIT', rating: 6.8 },
    { name: 'Aubrey Modiba', pos: 'DEF', val: 1.0, status: 'FIT', rating: 6.9 },
    { name: 'Teboho Mokoena', pos: 'MID', val: 2.2, status: 'FIT', rating: 7.4 },
    { name: 'Sphephelo Sithole', pos: 'MID', val: 1.5, status: 'FIT', rating: 7.0 },
    { name: 'Themba Zwane', pos: 'MID', val: 0.5, status: 'FIT', rating: 7.2 },
    { name: 'Percy Tau', pos: 'FWD', val: 2.5, status: 'FIT', rating: 7.1 },
    { name: 'Evidence Makgopa', pos: 'FWD', val: 1.0, status: 'FIT', rating: 6.8 },
    { name: 'Thapelo Maseko', pos: 'FWD', val: 0.8, status: 'FIT', rating: 6.7 }
  ],
  BIH: [
    { name: 'Kenan Pirić', pos: 'GK', val: 1.0, status: 'FIT', rating: 6.9 },
    { name: 'Jusuf Gazibegović', pos: 'DEF', val: 4.0, status: 'FIT', rating: 7.1 },
    { name: 'Anel Ahmedhodžić', pos: 'DEF', val: 18.0, status: 'FIT', rating: 7.3 },
    { name: 'Dennis Hadžikadunić', pos: 'DEF', val: 3.5, status: 'FIT', rating: 7.0 },
    { name: 'Sead Kolašinac', pos: 'DEF', val: 8.0, status: 'FIT', rating: 7.2 },
    { name: 'Rade Krunić', pos: 'MID', val: 8.5, status: 'FIT', rating: 7.3 },
    { name: 'Benjamin Tahirović', pos: 'MID', val: 6.0, status: 'FIT', rating: 6.9 },
    { name: 'Haris Hajradinović', pos: 'MID', val: 4.5, status: 'FIT', rating: 7.1 },
    { name: 'Edin Džeko', pos: 'FWD', val: 2.5, status: 'FIT', goals: 1, assists: 0, rating: 7.6 },
    { name: 'Ermedin Demirović', pos: 'FWD', val: 28.0, status: 'FIT', rating: 7.4 },
    { name: 'Amar Rahmanović', pos: 'FWD', val: 1.5, status: 'FIT', rating: 6.8 }
  ],
  PAR: [
    { name: 'Carlos Coronel', pos: 'GK', val: 2.0, status: 'FIT', rating: 7.0 },
    { name: 'Gustavo Gómez', pos: 'DEF', val: 8.5, status: 'FIT', rating: 7.4 },
    { name: 'Júnior Alonso', pos: 'DEF', val: 7.0, status: 'FIT', rating: 7.1 },
    { name: 'Fabián Balbuena', pos: 'DEF', val: 3.0, status: 'FIT', rating: 7.0 },
    { name: 'Matías Espinoza', pos: 'DEF', val: 1.5, status: 'FIT', rating: 6.8 },
    { name: 'Andrés Cubas', pos: 'MID', val: 4.5, status: 'FIT', rating: 7.2 },
    { name: 'Richard Sánchez', pos: 'MID', val: 5.5, status: 'FIT', rating: 7.1 },
    { name: 'Diego Gómez', pos: 'MID', val: 8.0, status: 'FIT', rating: 7.3 },
    { name: 'Miguel Almirón', pos: 'FWD', val: 30.0, status: 'FIT', goals: 1, assists: 0, rating: 7.5 },
    { name: 'Julio Enciso', pos: 'FWD', val: 22.0, status: 'FIT', rating: 7.4 },
    { name: 'Antonio Sanabria', pos: 'FWD', val: 9.5, status: 'FIT', rating: 7.2 }
  ],
  MEX: [
    { name: 'Guillermo Ochoa', pos: 'GK', val: 1.5, status: 'FIT', rating: 7.3 },
    { name: 'Jorge Sánchez', pos: 'DEF', val: 4.0, status: 'FIT', rating: 7.0 },
    { name: 'César Montes', pos: 'DEF', val: 15.0, status: 'INJURED', details: 'Chấn thương đùi', rating: 7.0 },
    { name: 'Johan Vásquez', pos: 'DEF', val: 10.0, status: 'FIT', rating: 7.2 },
    { name: 'Gerardo Arteaga', pos: 'DEF', val: 6.0, status: 'FIT', rating: 7.1 },
    { name: 'Edson Álvarez', pos: 'MID', val: 35.0, status: 'FIT', goals: 0, assists: 1, rating: 7.6 },
    { name: 'Luis Chávez', pos: 'MID', val: 10.0, status: 'FIT', goals: 1, assists: 0, rating: 7.3 },
    { name: 'Érick Sánchez', pos: 'MID', val: 10.0, status: 'FIT', rating: 7.1 },
    { name: 'Uriel Antuna', pos: 'FWD', val: 4.0, status: 'FIT', rating: 7.2 },
    { name: 'Santiago Giménez', pos: 'FWD', val: 40.0, status: 'FIT', goals: 1, assists: 0, rating: 7.5 },
    { name: 'Alexis Vega', pos: 'FWD', val: 5.5, status: 'FIT', rating: 7.0 }
  ],
  CAN: [
    { name: 'Maxime Crépeau', pos: 'GK', val: 2.0, status: 'FIT', rating: 7.2 },
    { name: 'Alistair Johnston', pos: 'DEF', val: 8.0, status: 'FIT', rating: 7.3 },
    { name: 'Moïse Bombito', pos: 'DEF', val: 4.5, status: 'FIT', rating: 7.1 },
    { name: 'Derek Cornelius', pos: 'DEF', val: 3.5, status: 'FIT', rating: 7.0 },
    { name: 'Alphonso Davies', pos: 'DEF', val: 50.0, status: 'FIT', goals: 0, assists: 1, rating: 7.8 },
    { name: 'Stephen Eustáquio', pos: 'MID', val: 12.0, status: 'FIT', rating: 7.2 },
    { name: 'Ismaël Koné', pos: 'MID', val: 11.0, status: 'FIT', rating: 7.1 },
    { name: 'Jonathan Osorio', pos: 'MID', val: 2.5, status: 'FIT', rating: 7.0 },
    { name: 'Tajon Buchanan', pos: 'FWD', val: 8.0, status: 'SUSPENDED', details: 'Nhận đủ số thẻ vàng (treo giò)' },
    { name: 'Jonathan David', pos: 'FWD', val: 50.0, status: 'FIT', goals: 1, assists: 0, rating: 7.6 },
    { name: 'Cyle Larin', pos: 'FWD', val: 9.0, status: 'FIT', rating: 7.2 }
  ],
  FRA: [
    { name: 'Mike Maignan', pos: 'GK', val: 38.0, status: 'FIT', rating: 7.6 },
    { name: 'Jules Koundé', pos: 'DEF', val: 50.0, status: 'FIT', rating: 7.5 },
    { name: 'Dayot Upamecano', pos: 'DEF', val: 45.0, status: 'FIT', rating: 7.2 },
    { name: 'William Saliba', pos: 'DEF', val: 80.0, status: 'FIT', rating: 7.8 },
    { name: 'Theo Hernandez', pos: 'DEF', val: 60.0, status: 'FIT', rating: 7.6 },
    { name: 'N\'Golo Kanté', pos: 'MID', val: 15.0, status: 'FIT', rating: 7.8 },
    { name: 'Aurelien Tchouaméni', pos: 'MID', val: 100.0, status: 'FIT', rating: 7.6 },
    { name: 'Adrien Rabiot', pos: 'MID', val: 35.0, status: 'FIT', rating: 7.3 },
    { name: 'Ousmane Dembélé', pos: 'FWD', val: 60.0, status: 'FIT', rating: 7.5 },
    { name: 'Marcus Thuram', pos: 'FWD', val: 65.0, status: 'FIT', rating: 7.2 },
    { name: 'Kylian Mbappé', pos: 'FWD', val: 180.0, status: 'FIT', goals: 0, assists: 0, rating: 8.2 }
  ],
  ENG: [
    { name: 'Jordan Pickford', pos: 'GK', val: 20.0, status: 'FIT', rating: 7.1 },
    { name: 'Kyle Walker', pos: 'DEF', val: 15.0, status: 'FIT', rating: 7.3 },
    { name: 'John Stones', pos: 'DEF', val: 30.0, status: 'FIT', rating: 7.2 },
    { name: 'Marc Guéhi', pos: 'DEF', val: 38.0, status: 'FIT', rating: 7.4 },
    { name: 'Kieran Trippier', pos: 'DEF', val: 10.0, status: 'FIT', rating: 7.0 },
    { name: 'Trent Alexander-Arnold', pos: 'MID', val: 70.0, status: 'FIT', rating: 7.6 },
    { name: 'Declan Rice', pos: 'MID', val: 120.0, status: 'FIT', rating: 7.8 },
    { name: 'Jude Bellingham', pos: 'MID', val: 180.0, status: 'FIT', rating: 8.4 },
    { name: 'Bukayo Saka', pos: 'FWD', val: 140.0, status: 'FIT', rating: 8.0 },
    { name: 'Harry Kane', pos: 'FWD', val: 95.0, status: 'FIT', rating: 7.9 },
    { name: 'Phil Foden', pos: 'FWD', val: 150.0, status: 'FIT', rating: 8.1 }
  ],
  USA: [
    { name: 'Matt Turner', pos: 'GK', val: 7.0, status: 'FIT', rating: 6.9 },
    { name: 'Sergiño Dest', pos: 'DEF', val: 18.0, status: 'FIT', rating: 7.2 },
    { name: 'Chris Richards', pos: 'DEF', val: 12.0, status: 'FIT', rating: 7.0 },
    { name: 'Tim Ream', pos: 'DEF', val: 1.0, status: 'FIT', rating: 6.8 },
    { name: 'Antonee Robinson', pos: 'DEF', val: 25.0, status: 'FIT', goals: 1, assists: 0, rating: 7.6 },
    { name: 'Weston McKennie', pos: 'MID', val: 28.0, status: 'FIT', goals: 0, assists: 1, rating: 7.4 },
    { name: 'Yunus Musah', pos: 'MID', val: 22.0, status: 'FIT', rating: 7.1 },
    { name: 'Giovanni Reyna', pos: 'MID', val: 20.0, status: 'FIT', rating: 7.3 },
    { name: 'Christian Pulisic', pos: 'FWD', val: 40.0, status: 'FIT', goals: 1, assists: 1, rating: 7.9 },
    { name: 'Folarin Balogun', pos: 'FWD', val: 30.0, status: 'FIT', goals: 1, assists: 0, rating: 7.2 },
    { name: 'Timothy Weah', pos: 'FWD', val: 14.0, status: 'FIT', rating: 7.1 },
    { name: 'Tyler Adams', pos: 'MID', val: 15.0, status: 'INJURED', details: 'Căng cơ đùi sau (Hamstring Strain)', rating: 7.1 }
  ],
  HAI: [
    { name: 'Jhony Placide', pos: 'GK', val: 0.2, status: 'FIT', rating: 6.5 },
    { name: 'Carlens Arcus', pos: 'DEF', val: 1.5, status: 'FIT', rating: 6.6 },
    { name: 'Ricardo Adé', pos: 'DEF', val: 0.8, status: 'FIT', rating: 6.8 },
    { name: 'Garven Metusala', pos: 'DEF', val: 0.5, status: 'FIT', rating: 6.5 },
    { name: 'Alex Christian', pos: 'DEF', val: 0.4, status: 'FIT', rating: 6.4 },
    { name: 'Bryan Alceus', pos: 'MID', val: 0.5, status: 'FIT', rating: 6.3 },
    { name: 'Leverton Pierre', pos: 'MID', val: 0.6, status: 'FIT', rating: 6.4 },
    { name: 'Danley Jean Jacques', pos: 'MID', val: 2.5, status: 'FIT', rating: 6.8 },
    { name: 'Duckens Nazon', pos: 'FWD', val: 1.2, status: 'FIT', rating: 7.0 },
    { name: 'Frantzdy Pierrot', pos: 'FWD', val: 3.5, status: 'FIT', rating: 7.2 },
    { name: 'Louicius Don Deedson', pos: 'FWD', val: 0.8, status: 'FIT', rating: 6.6 }
  ],
  SCO: [
    { name: 'Angus Gunn', pos: 'GK', val: 4.5, status: 'FIT', rating: 7.0 },
    { name: 'Anthony Ralston', pos: 'DEF', val: 2.0, status: 'FIT', rating: 6.5 },
    { name: 'Grant Hanley', pos: 'DEF', val: 0.8, status: 'FIT', rating: 6.6 },
    { name: 'Jack Hendry', pos: 'DEF', val: 3.0, status: 'FIT', rating: 6.8 },
    { name: 'Andrew Robertson', pos: 'DEF', val: 30.0, status: 'FIT', rating: 7.6 },
    { name: 'John McGinn', pos: 'MID', val: 30.0, status: 'FIT', rating: 7.5 },
    { name: 'Callum McGregor', pos: 'MID', val: 8.5, status: 'FIT', rating: 7.2 },
    { name: 'Billy Gilmour', pos: 'MID', val: 18.0, status: 'FIT', rating: 7.3 },
    { name: 'Scott McTominay', pos: 'FWD', val: 32.0, status: 'FIT', rating: 7.5 },
    { name: 'Che Adams', pos: 'FWD', val: 15.0, status: 'FIT', rating: 7.1 },
    { name: 'Lawrence Shankland', pos: 'FWD', val: 4.0, status: 'FIT', rating: 7.0 }
  ],
  AUS: [
    { name: 'Mathew Ryan', pos: 'GK', val: 1.5, status: 'FIT', rating: 7.1 },
    { name: 'Gethin Jones', pos: 'DEF', val: 0.8, status: 'FIT', rating: 6.5 },
    { name: 'Harry Souttar', pos: 'DEF', val: 8.0, status: 'FIT', rating: 7.2 },
    { name: 'Kye Rowles', pos: 'DEF', val: 2.5, status: 'FIT', rating: 6.7 },
    { name: 'Aziz Behich', pos: 'DEF', val: 0.4, status: 'FIT', rating: 6.6 },
    { name: 'Keanu Baccus', pos: 'MID', val: 1.5, status: 'FIT', rating: 6.8 },
    { name: 'Jackson Irvine', pos: 'MID', val: 2.0, status: 'FIT', rating: 7.1 },
    { name: 'Connor Metcalfe', pos: 'MID', val: 2.0, status: 'FIT', rating: 6.7 },
    { name: 'Craig Goodwin', pos: 'FWD', val: 1.5, status: 'FIT', rating: 7.2 },
    { name: 'Mitchell Duke', pos: 'FWD', val: 0.8, status: 'FIT', rating: 6.8 },
    { name: 'Martin Boyle', pos: 'FWD', val: 1.5, status: 'FIT', rating: 6.9 }
  ],
  TUR: [
    { name: 'Mert Günok', pos: 'GK', val: 1.2, status: 'FIT', rating: 7.2 },
    { name: 'Zeki Çelik', pos: 'DEF', val: 6.0, status: 'FIT', rating: 6.9 },
    { name: 'Samet Akaydin', pos: 'DEF', val: 2.5, status: 'FIT', rating: 6.7 },
    { name: 'Abdülkerim Bardakcı', pos: 'DEF', val: 8.5, status: 'FIT', rating: 7.3 },
    { name: 'Ferdi Kadıoğlu', pos: 'DEF', val: 30.0, status: 'FIT', rating: 7.8 },
    { name: 'Hakan Çalhanoğlu', pos: 'MID', val: 45.0, status: 'FIT', rating: 7.9 },
    { name: 'Kaan Ayhan', pos: 'MID', val: 4.5, status: 'FIT', rating: 7.1 },
    { name: 'Orkun Kökçü', pos: 'MID', val: 28.0, status: 'FIT', rating: 7.3 },
    { name: 'Arda Güler', pos: 'FWD', val: 45.0, status: 'FIT', rating: 7.8 },
    { name: 'Kenan Yıldız', pos: 'FWD', val: 40.0, status: 'FIT', rating: 7.5 },
    { name: 'Barış Alper Yılmaz', pos: 'FWD', val: 20.0, status: 'FIT', rating: 7.4 }
  ],
  GER: [
    { name: 'Manuel Neuer', pos: 'GK', val: 4.0, status: 'FIT', rating: 7.4 },
    { name: 'Joshua Kimmich', pos: 'DEF', val: 50.0, status: 'FIT', rating: 7.7 },
    { name: 'Jonathan Tah', pos: 'DEF', val: 30.0, status: 'FIT', rating: 7.4 },
    { name: 'Antonio Rüdiger', pos: 'DEF', val: 25.0, status: 'FIT', rating: 7.5 },
    { name: 'Maximilian Mittelstädt', pos: 'DEF', val: 17.0, status: 'FIT', rating: 7.2 },
    { name: 'Robert Andrich', pos: 'MID', val: 17.0, status: 'FIT', rating: 7.3 },
    { name: 'Toni Kroos', pos: 'MID', val: 10.0, status: 'FIT', rating: 8.0 },
    { name: 'İlkay Gündoğan', pos: 'MID', val: 15.0, status: 'FIT', rating: 7.5 },
    { name: 'Jamal Musiala', pos: 'FWD', val: 120.0, status: 'FIT', rating: 8.2 },
    { name: 'Florian Wirtz', pos: 'FWD', val: 130.0, status: 'FIT', rating: 8.3 },
    { name: 'Kai Havertz', pos: 'FWD', val: 70.0, status: 'FIT', rating: 7.6 }
  ],
  CUW: [
    { name: 'Eloy Room', pos: 'GK', val: 0.5, status: 'FIT', rating: 6.8 },
    { name: 'Jurien Gaari', pos: 'DEF', val: 0.4, status: 'FIT', rating: 6.4 },
    { name: 'Cuco Martina', pos: 'DEF', val: 0.2, status: 'FIT', rating: 6.5 },
    { name: 'Roshon van Eijma', pos: 'DEF', val: 0.3, status: 'FIT', rating: 6.3 },
    { name: 'Sherel Floranus', pos: 'DEF', val: 0.6, status: 'FIT', rating: 6.4 },
    { name: 'Vurnon Anita', pos: 'MID', val: 0.2, status: 'FIT', rating: 6.4 },
    { name: 'Juninho Bacuna', pos: 'MID', val: 4.5, status: 'FIT', rating: 7.0 },
    { name: 'Leandro Bacuna', pos: 'MID', val: 0.8, status: 'FIT', rating: 6.6 },
    { name: 'Brandley Kuwas', pos: 'FWD', val: 0.6, status: 'FIT', rating: 6.5 },
    { name: 'Rangelo Janga', pos: 'FWD', val: 0.4, status: 'FIT', rating: 6.7 },
    { name: 'Kenji Gorré', pos: 'FWD', val: 0.5, status: 'FIT', rating: 6.5 }
  ],
  CIV: [
    { name: 'Yahia Fofana', pos: 'GK', val: 8.0, status: 'FIT', rating: 7.2 },
    { name: 'Wilfried Singo', pos: 'DEF', val: 25.0, status: 'FIT', rating: 7.3 },
    { name: 'Ousmane Diomande', pos: 'DEF', val: 40.0, status: 'FIT', rating: 7.5 },
    { name: 'Evan Ndicka', pos: 'DEF', val: 40.0, status: 'FIT', rating: 7.4 },
    { name: 'Ghislain Konan', pos: 'DEF', val: 6.0, status: 'FIT', rating: 7.0 },
    { name: 'Franck Kessié', pos: 'MID', val: 20.0, status: 'FIT', rating: 7.5 },
    { name: 'Seko Fofana', pos: 'MID', val: 16.0, status: 'FIT', rating: 7.4 },
    { name: 'Ibrahim Sangaré', pos: 'MID', val: 30.0, status: 'FIT', rating: 7.2 },
    { name: 'Simon Adingra', pos: 'FWD', val: 30.0, status: 'FIT', rating: 7.5 },
    { name: 'Sébastien Haller', pos: 'FWD', val: 18.0, status: 'FIT', rating: 7.3 },
    { name: 'Nicolas Pépé', pos: 'FWD', val: 9.0, status: 'FIT', rating: 6.9 }
  ],
  ECU: [
    { name: 'Alexander Domínguez', pos: 'GK', val: 0.4, status: 'FIT', rating: 7.0 },
    { name: 'Angelo Preciado', pos: 'DEF', val: 7.0, status: 'FIT', rating: 7.0 },
    { name: 'Félix Torres', pos: 'DEF', val: 6.0, status: 'FIT', rating: 7.1 },
    { name: 'Willian Pacho', pos: 'DEF', val: 35.0, status: 'FIT', rating: 7.4 },
    { name: 'Piero Hincapié', pos: 'DEF', val: 40.0, status: 'FIT', rating: 7.6 },
    { name: 'João Ortiz', pos: 'MID', val: 2.0, status: 'FIT', rating: 6.8 },
    { name: 'Moisés Caicedo', pos: 'MID', val: 75.0, status: 'FIT', rating: 7.7 },
    { name: 'Alan Franco', pos: 'MID', val: 3.5, status: 'FIT', rating: 6.9 },
    { name: 'Kendry Páez', pos: 'FWD', val: 12.0, status: 'FIT', rating: 7.3 },
    { name: 'Enner Valencia', pos: 'FWD', val: 2.5, status: 'FIT', rating: 7.2 },
    { name: 'Jeremy Sarmiento', pos: 'FWD', val: 4.5, status: 'FIT', rating: 7.0 }
  ],
  NED: [
    { name: 'Bart Verbruggen', pos: 'GK', val: 18.0, status: 'FIT', rating: 7.3 },
    { name: 'Denzel Dumfries', pos: 'DEF', val: 24.0, status: 'FIT', rating: 7.4 },
    { name: 'Stefan de Vrij', pos: 'DEF', val: 8.0, status: 'FIT', rating: 7.2 },
    { name: 'Virgil van Dijk', pos: 'DEF', val: 30.0, status: 'FIT', rating: 7.7 },
    { name: 'Nathan Aké', pos: 'DEF', val: 40.0, status: 'FIT', rating: 7.5 },
    { name: 'Jerdy Schouten', pos: 'MID', val: 28.0, status: 'FIT', rating: 7.4 },
    { name: 'Tijjani Reijnders', pos: 'MID', val: 30.0, status: 'FIT', rating: 7.5 },
    { name: 'Xavi Simons', pos: 'MID', val: 80.0, status: 'FIT', rating: 7.9 },
    { name: 'Steven Bergwijn', pos: 'FWD', val: 18.0, status: 'FIT', rating: 7.0 },
    { name: 'Memphis Depay', pos: 'FWD', val: 10.0, status: 'FIT', rating: 7.3 },
    { name: 'Cody Gakpo', pos: 'FWD', val: 50.0, status: 'FIT', rating: 7.8 }
  ],
  JPN: [
    { name: 'Zion Suzuki', pos: 'GK', val: 2.5, status: 'FIT', rating: 6.9 },
    { name: 'Yukinari Sugawara', pos: 'DEF', val: 12.0, status: 'FIT', rating: 7.1 },
    { name: 'Ko Itakura', pos: 'DEF', val: 15.0, status: 'FIT', rating: 7.3 },
    { name: 'Shogo Taniguchi', pos: 'DEF', val: 1.5, status: 'FIT', rating: 6.9 },
    { name: 'Hiroki Ito', pos: 'DEF', val: 30.0, status: 'FIT', rating: 7.4 },
    { name: 'Wataru Endo', pos: 'MID', val: 13.0, status: 'FIT', rating: 7.6 },
    { name: 'Hidemasa Morita', pos: 'MID', val: 15.0, status: 'FIT', rating: 7.4 },
    { name: 'Daichi Kamada', pos: 'MID', val: 18.0, status: 'FIT', rating: 7.2 },
    { name: 'Junya Ito', pos: 'FWD', val: 8.0, status: 'FIT', rating: 7.3 },
    { name: 'Ayase Ueda', pos: 'FWD', val: 8.0, status: 'FIT', rating: 7.1 },
    { name: 'Takumi Minamino', pos: 'FWD', val: 15.0, status: 'FIT', rating: 7.4 }
  ],
  SWE: [
    { name: 'Robin Olsen', pos: 'GK', val: 1.0, status: 'FIT', rating: 7.0 },
    { name: 'Emil Krafth', pos: 'DEF', val: 2.5, status: 'FIT', rating: 6.8 },
    { name: 'Victor Lindelöf', pos: 'DEF', val: 15.0, status: 'FIT', rating: 7.2 },
    { name: 'Isak Hien', pos: 'DEF', val: 20.0, status: 'FIT', rating: 7.3 },
    { name: 'Ludwig Augustinsson', pos: 'DEF', val: 3.0, status: 'FIT', rating: 6.8 },
    { name: 'Jens Cajuste', pos: 'MID', val: 10.0, status: 'FIT', rating: 7.0 },
    { name: 'Hugo Larsson', pos: 'MID', val: 28.0, status: 'FIT', rating: 7.2 },
    { name: 'Emil Forsberg', pos: 'MID', val: 4.5, status: 'FIT', rating: 7.1 },
    { name: 'Dejan Kulusevski', pos: 'FWD', val: 55.0, status: 'FIT', rating: 7.6 },
    { name: 'Alexander Isak', pos: 'FWD', val: 75.0, status: 'FIT', rating: 7.9 },
    { name: 'Viktor Gyökeres', pos: 'FWD', val: 65.0, status: 'FIT', rating: 8.1 }
  ],
  TUN: [
    { name: 'Bechir Ben Saïd', pos: 'GK', val: 1.0, status: 'FIT', rating: 6.8 },
    { name: 'Wajdi Kechrida', pos: 'DEF', val: 1.2, status: 'FIT', rating: 6.6 },
    { name: 'Dylan Bronn', pos: 'DEF', val: 1.5, status: 'FIT', rating: 6.7 },
    { name: 'Montassar Talbi', pos: 'DEF', val: 8.0, status: 'FIT', rating: 7.1 },
    { name: 'Ali Abdi', pos: 'DEF', val: 3.0, status: 'FIT', rating: 7.0 },
    { name: 'Ellyes Skhiri', pos: 'MID', val: 13.0, status: 'FIT', rating: 7.4 },
    { name: 'Aïssa Laïdouni', pos: 'MID', val: 6.0, status: 'FIT', rating: 7.1 },
    { name: 'Hamza Rafia', pos: 'MID', val: 4.0, status: 'FIT', rating: 6.9 },
    { name: 'Naïm Sliti', pos: 'FWD', val: 1.5, status: 'FIT', rating: 6.8 },
    { name: 'Seifeddine Jaziri', pos: 'FWD', val: 1.5, status: 'FIT', rating: 6.9 },
    { name: 'Youssef Msakni', pos: 'FWD', val: 1.0, status: 'FIT', rating: 7.2 }
  ],
  BEL: [
    { name: 'Koen Casteels', pos: 'GK', val: 8.0, status: 'FIT', rating: 7.2 },
    { name: 'Timothy Castagne', pos: 'DEF', val: 17.0, status: 'FIT', rating: 7.1 },
    { name: 'Wout Faes', pos: 'DEF', val: 20.0, status: 'FIT', rating: 7.0 },
    { name: 'Jan Vertonghen', pos: 'DEF', val: 1.5, status: 'FIT', rating: 7.2 },
    { name: 'Arthur Theate', pos: 'DEF', val: 20.0, status: 'FIT', rating: 7.1 },
    { name: 'Amadou Onana', pos: 'MID', val: 50.0, status: 'FIT', rating: 7.6 },
    { name: 'Orel Mangala', pos: 'MID', val: 20.0, status: 'FIT', rating: 7.2 },
    { name: 'Kevin De Bruyne', pos: 'MID', val: 50.0, status: 'FIT', rating: 8.3 },
    { name: 'Jérémy Doku', pos: 'FWD', val: 65.0, status: 'FIT', rating: 7.8 },
    { name: 'Romelu Lukaku', pos: 'FWD', val: 30.0, status: 'FIT', rating: 7.5 },
    { name: 'Leandro Trossard', pos: 'FWD', val: 35.0, status: 'FIT', rating: 7.4 }
  ],
  EGY: [
    { name: 'Mohamed El Shenawy', pos: 'GK', val: 1.5, status: 'FIT', rating: 7.3 },
    { name: 'Mohamed Hany', pos: 'DEF', val: 1.2, status: 'FIT', rating: 6.8 },
    { name: 'Mohamed Abdelmonem', pos: 'DEF', val: 3.0, status: 'FIT', rating: 7.4 },
    { name: 'Ahmed Hegazi', pos: 'DEF', val: 2.0, status: 'FIT', rating: 7.1 },
    { name: 'Mohamed Hamdy', pos: 'DEF', val: 1.0, status: 'FIT', rating: 6.7 },
    { name: 'Marwan Attia', pos: 'MID', val: 1.5, status: 'FIT', rating: 7.0 },
    { name: 'Mohamed Elneny', pos: 'MID', val: 3.5, status: 'FIT', rating: 7.1 },
    { name: 'Hamdi Fathi', pos: 'MID', val: 3.0, status: 'FIT', rating: 7.2 },
    { name: 'Mohamed Salah', pos: 'FWD', val: 55.0, status: 'FIT', goals: 2, assists: 1, rating: 8.2 },
    { name: 'Mostafa Mohamed', pos: 'FWD', val: 15.0, status: 'FIT', rating: 7.3 },
    { name: 'Trezeguet', pos: 'FWD', val: 6.0, status: 'FIT', rating: 7.2 }
  ],
  IRN: [
    { name: 'Alireza Beiranvand', pos: 'GK', val: 1.2, status: 'FIT', rating: 7.3 },
    { name: 'Ramin Rezaeian', pos: 'DEF', val: 1.0, status: 'FIT', rating: 7.0 },
    { name: 'Hossein Kanaani', pos: 'DEF', val: 2.0, status: 'FIT', rating: 7.1 },
    { name: 'Shojae Khalilzadeh', pos: 'DEF', val: 0.5, status: 'FIT', rating: 6.8 },
    { name: 'Milad Mohammadi', pos: 'DEF', val: 1.5, status: 'FIT', rating: 6.9 },
    { name: 'Saeid Ezatolahi', pos: 'MID', val: 2.5, status: 'FIT', rating: 7.1 },
    { name: 'Saman Ghoddos', pos: 'MID', val: 2.0, status: 'FIT', rating: 7.2 },
    { name: 'Alireza Jahanbakhsh', pos: 'MID', val: 2.5, status: 'FIT', rating: 7.1 },
    { name: 'Mehdi Taremi', pos: 'FWD', val: 10.0, status: 'FIT', rating: 7.5 },
    { name: 'Sardar Azmoun', pos: 'FWD', val: 8.0, status: 'FIT', rating: 7.4 },
    { name: 'Mehdi Ghayedi', pos: 'FWD', val: 2.5, status: 'FIT', rating: 7.1 }
  ],
  NZL: [
    { name: 'Oliver Sail', pos: 'GK', val: 0.5, status: 'FIT', rating: 6.6 },
    { name: 'Niko Kirwan', pos: 'DEF', val: 0.4, status: 'FIT', rating: 6.3 },
    { name: 'Michael Boxall', pos: 'DEF', val: 0.3, status: 'FIT', rating: 6.5 },
    { name: 'Nando Pijnaker', pos: 'DEF', val: 0.5, status: 'FIT', rating: 6.6 },
    { name: 'Liberato Cacace', pos: 'DEF', val: 2.5, status: 'FIT', rating: 7.1 },
    { name: 'Joe Bell', pos: 'MID', val: 1.5, status: 'FIT', rating: 6.8 },
    { name: 'Marko Stamenic', pos: 'MID', val: 5.0, status: 'FIT', rating: 7.1 },
    { name: 'Clayton Lewis', pos: 'MID', val: 0.8, status: 'FIT', rating: 6.5 },
    { name: 'Sarpreet Singh', pos: 'FWD', val: 1.0, status: 'FIT', rating: 6.8 },
    { name: 'Chris Wood', pos: 'FWD', val: 7.0, status: 'FIT', goals: 1, assists: 0, rating: 7.4 },
    { name: 'Ben Waine', pos: 'FWD', val: 0.8, status: 'FIT', rating: 6.6 }
  ],
  CPV: [
    { name: 'Vozinha', pos: 'GK', val: 0.2, status: 'FIT', rating: 6.7 },
    { name: 'Steven Moreira', pos: 'DEF', val: 1.5, status: 'FIT', rating: 6.8 },
    { name: 'Logan Costa', pos: 'DEF', val: 8.0, status: 'FIT', rating: 7.2 },
    { name: 'Roberto Lopes', pos: 'DEF', val: 0.6, status: 'FIT', rating: 6.6 },
    { name: 'João Paulo', pos: 'DEF', val: 0.8, status: 'FIT', rating: 6.5 },
    { name: 'Kevin Pina', pos: 'MID', val: 2.5, status: 'FIT', rating: 6.9 },
    { name: 'Jamiro Monteiro', pos: 'MID', val: 2.0, status: 'FIT', rating: 7.0 },
    { name: 'Kenny Rocha', pos: 'MID', val: 1.8, status: 'FIT', rating: 6.7 },
    { name: 'Ryan Mendes', pos: 'FWD', val: 1.0, status: 'FIT', rating: 7.1 },
    { name: 'Bebé', pos: 'FWD', val: 0.5, status: 'FIT', rating: 6.8 },
    { name: 'Jovane Cabral', pos: 'FWD', val: 3.5, status: 'FIT', rating: 7.0 }
  ],
  KSA: [
    { name: 'Mohammed Al-Owais', pos: 'GK', val: 1.0, status: 'FIT', rating: 7.0 },
    { name: 'Saud Abdulhamid', pos: 'DEF', val: 4.0, status: 'FIT', rating: 7.3 },
    { name: 'Ali Lajami', pos: 'DEF', val: 2.0, status: 'FIT', rating: 6.8 },
    { name: 'Ali Al-Bulaihi', pos: 'DEF', val: 0.8, status: 'FIT', rating: 6.9 },
    { name: 'Yasir Al-Shahrani', pos: 'DEF', val: 1.2, status: 'FIT', rating: 6.9 },
    { name: 'Abdullah Otayf', pos: 'MID', val: 0.6, status: 'FIT', rating: 6.6 },
    { name: 'Mohamed Kanno', pos: 'MID', val: 1.5, status: 'FIT', rating: 7.0 },
    { name: 'Salman Al-Faraj', pos: 'MID', val: 1.0, status: 'FIT', rating: 7.1 },
    { name: 'Firas Al-Buraikan', pos: 'FWD', val: 6.0, status: 'FIT', rating: 7.2 },
    { name: 'Saleh Al-Shehri', pos: 'FWD', val: 1.5, status: 'FIT', rating: 6.9 },
    { name: 'Salem Al-Dawsari', pos: 'FWD', val: 2.0, status: 'FIT', goals: 1, assists: 0, rating: 7.5 }
  ],
  ESP: [
    { name: 'Unai Simón', pos: 'GK', val: 35.0, status: 'FIT', rating: 7.5 },
    { name: 'Dani Carvajal', pos: 'DEF', val: 12.0, status: 'FIT', rating: 7.8 },
    { name: 'Robin Le Normand', pos: 'DEF', val: 40.0, status: 'FIT', rating: 7.4 },
    { name: 'Aymeric Laporte', pos: 'DEF', val: 25.0, status: 'FIT', rating: 7.5 },
    { name: 'Marc Cucurella', pos: 'DEF', val: 30.0, status: 'FIT', rating: 7.5 },
    { name: 'Pedri', pos: 'MID', val: 80.0, status: 'FIT', rating: 7.9 },
    { name: 'Rodri', pos: 'MID', val: 120.0, status: 'FIT', rating: 8.5 },
    { name: 'Fabián Ruiz', pos: 'MID', val: 35.0, status: 'FIT', rating: 7.7 },
    { name: 'Lamine Yamal', pos: 'FWD', val: 120.0, status: 'FIT', goals: 1, assists: 2, rating: 8.4 },
    { name: 'Álvaro Morata', pos: 'FWD', val: 16.0, status: 'FIT', rating: 7.3 },
    { name: 'Nico Williams', pos: 'FWD', val: 60.0, status: 'FIT', rating: 7.9 }
  ],
  URU: [
    { name: 'Sergio Rochet', pos: 'GK', val: 3.5, status: 'FIT', rating: 7.2 },
    { name: 'Nahitan Nández', pos: 'DEF', val: 5.0, status: 'FIT', rating: 7.1 },
    { name: 'Ronald Araújo', pos: 'DEF', val: 70.0, status: 'FIT', rating: 7.8 },
    { name: 'José María Giménez', pos: 'DEF', val: 22.0, status: 'FIT', rating: 7.3 },
    { name: 'Mathías Olivera', pos: 'DEF', val: 15.0, status: 'FIT', rating: 7.2 },
    { name: 'Federico Valverde', pos: 'MID', val: 120.0, status: 'FIT', rating: 8.1 },
    { name: 'Manuel Ugarte', pos: 'MID', val: 45.0, status: 'FIT', rating: 7.5 },
    { name: 'Nicolás de la Cruz', pos: 'MID', val: 18.0, status: 'FIT', rating: 7.6 },
    { name: 'Facundo Pellistri', pos: 'FWD', val: 10.0, status: 'FIT', rating: 7.0 },
    { name: 'Darwin Núñez', pos: 'FWD', val: 70.0, status: 'FIT', goals: 2, assists: 0, rating: 7.8 },
    { name: 'Maximiliano Araújo', pos: 'FWD', val: 8.5, status: 'FIT', rating: 7.2 }
  ],
  IRQ: [
    { name: 'Jalal Hassan', pos: 'GK', val: 0.3, status: 'FIT', rating: 6.9 },
    { name: 'Hussein Ali', pos: 'DEF', val: 0.8, status: 'FIT', rating: 6.6 },
    { name: 'Rebin Sulaka', pos: 'DEF', val: 0.4, status: 'FIT', rating: 6.5 },
    { name: 'Saad Natiq', pos: 'DEF', val: 0.3, status: 'FIT', rating: 6.5 },
    { name: 'Merchas Doski', pos: 'DEF', val: 0.8, status: 'FIT', rating: 6.7 },
    { name: 'Amir Al-Ammari', pos: 'MID', val: 1.2, status: 'FIT', rating: 7.0 },
    { name: 'Osama Rashid', pos: 'MID', val: 0.4, status: 'FIT', rating: 6.6 },
    { name: 'Ibrahim Bayesh', pos: 'MID', val: 1.0, status: 'FIT', rating: 6.9 },
    { name: 'Ali Jasim', pos: 'FWD', val: 2.0, status: 'FIT', rating: 7.2 },
    { name: 'Aymen Hussein', pos: 'FWD', val: 2.5, status: 'FIT', goals: 1, assists: 0, rating: 7.5 },
    { name: 'Zidane Iqbal', pos: 'FWD', val: 1.0, status: 'FIT', rating: 7.0 }
  ],
  NOR: [
    { name: 'Ørjan Nyland', pos: 'GK', val: 0.8, status: 'FIT', rating: 6.9 },
    { name: 'Julian Ryerson', pos: 'DEF', val: 20.0, status: 'FIT', rating: 7.3 },
    { name: 'Andreas Hanche-Olsen', pos: 'DEF', val: 6.0, status: 'FIT', rating: 7.0 },
    { name: 'Leo Østigård', pos: 'DEF', val: 10.0, status: 'FIT', rating: 7.1 },
    { name: 'David Møller Wolfe', pos: 'DEF', val: 4.5, status: 'FIT', rating: 6.8 },
    { name: 'Martin Ødegaard', pos: 'MID', val: 110.0, status: 'FIT', rating: 8.2 },
    { name: 'Patrick Berg', pos: 'MID', val: 4.5, status: 'FIT', rating: 7.0 },
    { name: 'Sander Berge', pos: 'MID', val: 20.0, status: 'FIT', rating: 7.2 },
    { name: 'Oscar Bobb', pos: 'FWD', val: 25.0, status: 'FIT', rating: 7.4 },
    { name: 'Erling Haaland', pos: 'FWD', val: 180.0, status: 'FIT', goals: 3, assists: 0, rating: 8.5 },
    { name: 'Alexander Sørloth', pos: 'FWD', val: 25.0, status: 'FIT', rating: 7.5 }
  ],
  SEN: [
    { name: 'Édouard Mendy', pos: 'GK', val: 10.0, status: 'FIT', rating: 7.3 },
    { name: 'Kalidou Koulibaly', pos: 'DEF', val: 11.0, status: 'FIT', rating: 7.4 },
    { name: 'Abdou Diallo', pos: 'DEF', val: 8.5, status: 'FIT', rating: 7.1 },
    { name: 'Moussa Niakhaté', pos: 'DEF', val: 16.0, status: 'FIT', rating: 7.2 },
    { name: 'Ismail Jakobs', pos: 'DEF', val: 8.0, status: 'FIT', rating: 7.0 },
    { name: 'Idrissa Gueye', pos: 'MID', val: 1.0, status: 'FIT', rating: 7.0 },
    { name: 'Lamine Camara', pos: 'MID', val: 10.0, status: 'FIT', rating: 7.4 },
    { name: 'Pape Matar Sarr', pos: 'MID', val: 40.0, status: 'FIT', rating: 7.5 },
    { name: 'Ismaïla Sarr', pos: 'FWD', val: 18.0, status: 'FIT', rating: 7.2 },
    { name: 'Nicolas Jackson', pos: 'FWD', val: 35.0, status: 'FIT', rating: 7.3 },
    { name: 'Sadio Mané', pos: 'FWD', val: 20.0, status: 'FIT', goals: 1, assists: 1, rating: 7.8 }
  ],
  ALG: [
    { name: 'Anthony Mandrea', pos: 'GK', val: 2.0, status: 'FIT', rating: 7.0 },
    { name: 'Youcef Atal', pos: 'DEF', val: 4.5, status: 'FIT', rating: 7.0 },
    { name: 'Aïssa Mandi', pos: 'DEF', val: 1.8, status: 'FIT', rating: 7.1 },
    { name: 'Mohamed Amine Tougai', pos: 'DEF', val: 1.5, status: 'FIT', rating: 6.9 },
    { name: 'Rayan Aït-Nouri', pos: 'DEF', val: 32.0, status: 'FIT', rating: 7.6 },
    { name: 'Nabil Bentaleb', pos: 'MID', val: 8.0, status: 'FIT', rating: 7.2 },
    { name: 'Ismaël Bennacer', pos: 'MID', val: 30.0, status: 'FIT', rating: 7.5 },
    { name: 'Houssem Aouar', pos: 'MID', val: 10.0, status: 'FIT', rating: 7.2 },
    { name: 'Riyad Mahrez', pos: 'FWD', val: 12.0, status: 'FIT', rating: 7.5 },
    { name: 'Baghdad Bounedjah', pos: 'FWD', val: 1.5, status: 'FIT', rating: 7.1 },
    { name: 'Saïd Benrahma', pos: 'FWD', val: 18.0, status: 'FIT', rating: 7.2 }
  ],
  AUT: [
    { name: 'Patrick Pentz', pos: 'GK', val: 2.5, status: 'FIT', rating: 7.1 },
    { name: 'Stefan Lainer', pos: 'DEF', val: 1.5, status: 'FIT', rating: 6.8 },
    { name: 'Philipp Lienhart', pos: 'DEF', val: 15.0, status: 'FIT', rating: 7.2 },
    { name: 'Kevin Danso', pos: 'DEF', val: 22.0, status: 'FIT', rating: 7.4 },
    { name: 'Phillipp Mwene', pos: 'DEF', val: 2.5, status: 'FIT', rating: 6.9 },
    { name: 'Nicolas Seiwald', pos: 'MID', val: 16.0, status: 'FIT', rating: 7.3 },
    { name: 'Konrad Laimer', pos: 'MID', val: 30.0, status: 'FIT', rating: 7.5 },
    { name: 'Marcel Sabitzer', pos: 'MID', val: 20.0, status: 'FIT', rating: 7.8 },
    { name: 'Patrick Wimmer', pos: 'FWD', val: 15.0, status: 'FIT', rating: 7.1 },
    { name: 'Michael Gregoritsch', pos: 'FWD', val: 5.0, status: 'FIT', rating: 7.2 },
    { name: 'Christoph Baumgartner', pos: 'FWD', val: 18.0, status: 'FIT', rating: 7.5 }
  ],
  JOR: [
    { name: 'Yazeed Abulaila', pos: 'GK', val: 0.5, status: 'FIT', rating: 7.0 },
    { name: 'Ehsan Haddad', pos: 'DEF', val: 0.4, status: 'FIT', rating: 6.6 },
    { name: 'Yazan Al-Arab', pos: 'DEF', val: 0.5, status: 'FIT', rating: 6.8 },
    { name: 'Abdallah Nasib', pos: 'DEF', val: 0.4, status: 'FIT', rating: 6.7 },
    { name: 'Salem Al-Ajalin', pos: 'DEF', val: 0.3, status: 'FIT', rating: 6.5 },
    { name: 'Nizar Al-Rashdan', pos: 'MID', val: 0.4, status: 'FIT', rating: 6.6 },
    { name: 'Noor Al-Rawabdeh', pos: 'MID', val: 0.5, status: 'FIT', rating: 6.7 },
    { name: 'Mahmoud Al-Mardi', pos: 'MID', val: 0.4, status: 'FIT', rating: 6.8 },
    { name: 'Mousa Al-Tamari', pos: 'FWD', val: 8.0, status: 'FIT', rating: 7.7 },
    { name: 'Yazan Al-Naimat', pos: 'FWD', val: 2.5, status: 'FIT', rating: 7.4 },
    { name: 'Ali Olwan', pos: 'FWD', val: 1.0, status: 'FIT', rating: 6.9 }
  ],
  COL: [
    { name: 'Camilo Vargas', pos: 'GK', val: 1.5, status: 'FIT', rating: 7.3 },
    { name: 'Daniel Muñoz', pos: 'DEF', val: 18.0, status: 'FIT', rating: 7.5 },
    { name: 'Davinson Sánchez', pos: 'DEF', val: 17.0, status: 'FIT', rating: 7.3 },
    { name: 'Carlos Cuesta', pos: 'DEF', val: 15.0, status: 'FIT', rating: 7.2 },
    { name: 'Johan Mojica', pos: 'DEF', val: 2.5, status: 'FIT', rating: 7.0 },
    { name: 'Richard Ríos', pos: 'MID', val: 5.0, status: 'FIT', rating: 7.3 },
    { name: 'Jefferson Lerma', pos: 'MID', val: 20.0, status: 'FIT', rating: 7.5 },
    { name: 'Jhon Arias', pos: 'MID', val: 15.0, status: 'FIT', rating: 7.4 },
    { name: 'James Rodríguez', pos: 'FWD', val: 5.0, status: 'FIT', rating: 7.9 },
    { name: 'Jhon Córdoba', pos: 'FWD', val: 12.0, status: 'FIT', rating: 7.3 },
    { name: 'Luis Díaz', pos: 'FWD', val: 75.0, status: 'FIT', goals: 1, assists: 1, rating: 8.1 }
  ],
  COD: [
    { name: 'Lionel Mpasi', pos: 'GK', val: 0.8, status: 'FIT', rating: 6.9 },
    { name: 'Gédéon Kalulu', pos: 'DEF', val: 2.5, status: 'FIT', rating: 6.8 },
    { name: 'Chancel Mbemba', pos: 'DEF', val: 15.0, status: 'FIT', rating: 7.4 },
    { name: 'Henoc Inonga', pos: 'DEF', val: 1.5, status: 'FIT', rating: 6.8 },
    { name: 'Arthur Masuaku', pos: 'DEF', val: 5.0, status: 'FIT', rating: 7.1 },
    { name: 'Samuel Moutoussamy', pos: 'MID', val: 4.0, status: 'FIT', rating: 7.0 },
    { name: 'Charles Pickel', pos: 'MID', val: 4.0, status: 'FIT', rating: 6.9 },
    { name: 'Gaël Kakuta', pos: 'MID', val: 1.5, status: 'FIT', rating: 7.0 },
    { name: 'Theo Bongonda', pos: 'FWD', val: 4.5, status: 'FIT', rating: 7.1 },
    { name: 'Cédric Bakambu', pos: 'FWD', val: 2.5, status: 'FIT', rating: 7.0 },
    { name: 'Yoane Wissa', pos: 'FWD', val: 12.0, status: 'FIT', rating: 7.4 }
  ],
  POR: [
    { name: 'Diogo Costa', pos: 'GK', val: 45.0, status: 'FIT', rating: 7.5 },
    { name: 'João Cancelo', pos: 'DEF', val: 25.0, status: 'FIT', rating: 7.6 },
    { name: 'Rúben Dias', pos: 'DEF', val: 80.0, status: 'FIT', rating: 7.9 },
    { name: 'Pepe', pos: 'DEF', val: 0.5, status: 'FIT', rating: 7.5 },
    { name: 'Nuno Mendes', pos: 'DEF', val: 55.0, status: 'FIT', rating: 7.6 },
    { name: 'João Palhinha', pos: 'MID', val: 55.0, status: 'FIT', rating: 7.6 },
    { name: 'Vitinha', pos: 'MID', val: 50.0, status: 'FIT', rating: 7.8 },
    { name: 'Bruno Fernandes', pos: 'MID', val: 70.0, status: 'FIT', rating: 8.1 },
    { name: 'Bernardo Silva', pos: 'FWD', val: 70.0, status: 'FIT', rating: 7.9 },
    { name: 'Cristiano Ronaldo', pos: 'FWD', val: 15.0, status: 'FIT', goals: 2, assists: 0, rating: 8.0 },
    { name: 'Rafael Leão', pos: 'FWD', val: 90.0, status: 'FIT', rating: 7.9 }
  ],
  UZB: [
    { name: 'Utkir Yusupov', pos: 'GK', val: 0.8, status: 'FIT', rating: 6.9 },
    { name: 'Sherzod Nasrullaev', pos: 'DEF', val: 0.7, status: 'FIT', rating: 6.6 },
    { name: 'Rustam Ashurmatov', pos: 'DEF', val: 1.0, status: 'FIT', rating: 6.7 },
    { name: 'Abdukodir Khusanov', pos: 'DEF', val: 2.5, status: 'FIT', rating: 7.0 },
    { name: 'Farrukh Sayfiev', pos: 'DEF', val: 0.6, status: 'FIT', rating: 6.5 },
    { name: 'Otabek Shukurov', pos: 'MID', val: 2.5, status: 'FIT', rating: 7.1 },
    { name: 'Odiljon Hamrobekov', pos: 'MID', val: 1.2, status: 'FIT', rating: 6.9 },
    { name: 'Jaloliddin Masharipov', pos: 'MID', val: 1.5, status: 'FIT', rating: 7.1 },
    { name: 'Abbosbek Fayzullaev', pos: 'FWD', val: 6.0, status: 'FIT', rating: 7.4 },
    { name: 'Eldor Shomurodov', pos: 'FWD', val: 5.0, status: 'FIT', goals: 1, assists: 0, rating: 7.5 },
    { name: 'Oston Urunov', pos: 'FWD', val: 1.5, status: 'FIT', rating: 6.8 }
  ],
  CRO: [
    { name: 'Dominik Livaković', pos: 'GK', val: 11.0, status: 'FIT', rating: 7.3 },
    { name: 'Josip Stanišić', pos: 'DEF', val: 28.0, status: 'FIT', rating: 7.3 },
    { name: 'Josip Šutalo', pos: 'DEF', val: 15.0, status: 'FIT', rating: 7.2 },
    { name: 'Joško Gvardiol', pos: 'DEF', val: 75.0, status: 'FIT', rating: 7.8 },
    { name: 'Borna Sosa', pos: 'DEF', val: 8.0, status: 'FIT', rating: 6.9 },
    { name: 'Luka Modrić', pos: 'MID', val: 6.0, status: 'FIT', rating: 8.0 },
    { name: 'Mateo Kovačić', pos: 'MID', val: 30.0, status: 'FIT', rating: 7.6 },
    { name: 'Marcelo Brozović', pos: 'MID', val: 16.0, status: 'FIT', rating: 7.3 },
    { name: 'Andrej Kramarić', pos: 'FWD', val: 5.0, status: 'FIT', rating: 7.4 },
    { name: 'Bruno Petković', pos: 'FWD', val: 5.0, status: 'FIT', rating: 7.1 },
    { name: 'Ivan Perišić', pos: 'FWD', val: 2.0, status: 'FIT', rating: 7.2 }
  ],
  GHA: [
    { name: 'Lawrence Ati-Zigi', pos: 'GK', val: 2.5, status: 'FIT', rating: 7.1 },
    { name: 'Alidu Seidu', pos: 'DEF', val: 7.0, status: 'FIT', rating: 6.9 },
    { name: 'Alexander Djiku', pos: 'DEF', val: 8.0, status: 'FIT', rating: 7.1 },
    { name: 'Mohammed Salisu', pos: 'DEF', val: 15.0, status: 'FIT', rating: 7.0 },
    { name: 'Gideon Mensah', pos: 'DEF', val: 2.5, status: 'FIT', rating: 6.8 },
    { name: 'Salis Abdul Samed', pos: 'MID', val: 8.0, status: 'FIT', rating: 7.0 },
    { name: 'Thomas Partey', pos: 'MID', val: 18.0, status: 'FIT', rating: 7.4 },
    { name: 'Mohammed Kudus', pos: 'MID', val: 50.0, status: 'FIT', goals: 1, assists: 1, rating: 7.9 },
    { name: 'Ernest Nuamah', pos: 'FWD', val: 18.0, status: 'FIT', rating: 7.1 },
    { name: 'Antoine Semenyo', pos: 'FWD', val: 20.0, status: 'FIT', rating: 7.2 },
    { name: 'Jordan Ayew', pos: 'FWD', val: 4.0, status: 'FIT', rating: 7.0 }
  ],
  PAN: [
    { name: 'Orlando Mosquera', pos: 'GK', val: 1.0, status: 'FIT', rating: 7.0 },
    { name: 'Michael Murillo', pos: 'DEF', val: 3.0, status: 'FIT', rating: 7.2 },
    { name: 'José Córdoba', pos: 'DEF', val: 3.5, status: 'FIT', rating: 7.0 },
    { name: 'Edgardo Fariña', pos: 'DEF', val: 0.8, status: 'FIT', rating: 6.8 },
    { name: 'Eric Davis', pos: 'DEF', val: 0.5, status: 'FIT', rating: 6.8 },
    { name: 'Aníbal Godoy', pos: 'MID', val: 0.4, status: 'FIT', rating: 6.9 },
    { name: 'Adalberto Carrasquilla', pos: 'MID', val: 4.5, status: 'FIT', rating: 7.5 },
    { name: 'Cristian Martínez', pos: 'MID', val: 0.6, status: 'FIT', rating: 6.8 },
    { name: 'Édgar Bárcenas', pos: 'FWD', val: 1.2, status: 'FIT', rating: 7.1 },
    { name: 'José Fajardo', pos: 'FWD', val: 0.8, status: 'FIT', rating: 7.0 },
    { name: 'Ismael Díaz', pos: 'FWD', val: 1.2, status: 'FIT', rating: 7.1 }
  ]
};

async function main() {
  console.log('Cleaning up database...');
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();
  await prisma.h2HRecord.deleteMany();
  await prisma.team.deleteMany();

  console.log('Seeding Teams (48 countries, Groups A-L)...');
  const teamsMap: { [code: string]: any } = {};

  for (const t of TEAMS_DATA) {
    const created = await prisma.team.create({
      data: {
        name: t.name,
        code: t.code,
        flagUrl: `https://flagcdn.com/w320/${t.flag}.png`,
        group: t.group,
        fifaRanking: t.rank,
        eloRating: t.elo,
        squadValueEur: t.val,
        attackRating: t.att,
        defenseRating: t.def,
        midfieldRating: t.mid
      }
    });
    teamsMap[t.code] = created;
  }

  console.log('Seeding Players...');
  for (const code of Object.keys(teamsMap)) {
    const team = teamsMap[code];
    const playersList = PLAYERS_DATA[code] || [];
    
    // Add custom stars
    for (const p of playersList) {
      await prisma.player.create({
        data: {
          name: p.name,
          position: p.pos,
          teamId: team.id,
          marketValueEur: p.val,
          status: p.status,
          injuryDetails: p.details || null,
          goals: p.goals || 0,
          assists: p.assists || 0,
          rating: p.rating || 6.5
        }
      });
    }

    // Auto-generate remaining players to complete roster
    const currentCount = playersList.length;
    const positions = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD'];
    for (let i = currentCount; i < 11; i++) {
      const pos = positions[i % positions.length];
      const name = pos === 'GK' ? `Thủ môn ${team.name}` : `Cầu thủ ${team.name} ${i + 1}`;
      
      await prisma.player.create({
        data: {
          name,
          position: pos,
          teamId: team.id,
          marketValueEur: Math.round((team.squadValueEur / 12) * 10) / 10 || 4.5,
          status: 'FIT',
          goals: 0,
          assists: 0,
          rating: Math.round((6.0 + Math.random() * 1.5) * 10) / 10
        }
      });
    }
  }

  console.log('Seeding H2H Records...');
  const majorFixtures = [
    { t1: 'ARG', t2: 'ALG', s1: 1, s2: 1, date: new Date('2002-06-12'), comp: 'World Cup' },
    { t1: 'BRA', t2: 'MAR', s1: 3, s2: 0, date: new Date('1998-06-16'), comp: 'World Cup' },
    { t1: 'MEX', t2: 'RSA', s1: 1, s2: 1, date: new Date('2010-06-11'), comp: 'World Cup' },
    { t1: 'FRA', t2: 'IRQ', s1: 2, s2: 2, date: new Date('2018-03-23'), comp: 'Giao hữu' }
  ];

  for (const f of majorFixtures) {
    const team1 = teamsMap[f.t1];
    const team2 = teamsMap[f.t2];
    if (team1 && team2) {
      await prisma.h2HRecord.create({
        data: {
          homeTeamId: team1.id,
          awayTeamId: team2.id,
          homeScore: f.s1,
          awayScore: f.s2,
          date: f.date,
          competition: f.comp
        }
      });
    }
  }

  console.log('Seeding World Cup 2026 Match Schedule (June 11-17, 2026)...');
  const scheduleData = [
    // June 11, 2026 (Completed)
    { h: 'MEX', a: 'RSA', date: '2026-06-11T12:00:00Z', stage: 'GROUP', grp: 'A', status: 'FINISHED', hs: 2, as: 0, min: 90 },
    { h: 'KOR', a: 'CZE', date: '2026-06-11T15:00:00Z', stage: 'GROUP', grp: 'A', status: 'FINISHED', hs: 2, as: 1, min: 90 },
    
    // June 12, 2026 (Completed)
    { h: 'CAN', a: 'BIH', date: '2026-06-12T12:00:00Z', stage: 'GROUP', grp: 'B', status: 'FINISHED', hs: 1, as: 1, min: 90 },
    { h: 'USA', a: 'PAR', date: '2026-06-12T15:00:00Z', stage: 'GROUP', grp: 'D', status: 'FINISHED', hs: 4, as: 1, min: 90 },
    
    // June 13, 2026 (Today! Match is SCHEDULED)
    { h: 'QAT', a: 'SUI', date: '2026-06-13T19:00:00Z', stage: 'GROUP', grp: 'B', status: 'SCHEDULED' },
    { h: 'BRA', a: 'MAR', date: '2026-06-13T22:00:00Z', stage: 'GROUP', grp: 'C', status: 'SCHEDULED' },
    { h: 'HAI', a: 'SCO', date: '2026-06-14T01:00:00Z', stage: 'GROUP', grp: 'C', status: 'SCHEDULED' },
    { h: 'AUS', a: 'TUR', date: '2026-06-14T04:00:00Z', stage: 'GROUP', grp: 'D', status: 'SCHEDULED' },
    
    // June 14, 2026 (Tomorrow)
    { h: 'GER', a: 'CUW', date: '2026-06-14T09:00:00Z', stage: 'GROUP', grp: 'E', status: 'SCHEDULED' },
    { h: 'NED', a: 'JPN', date: '2026-06-14T12:00:00Z', stage: 'GROUP', grp: 'F', status: 'SCHEDULED' },
    { h: 'CIV', a: 'ECU', date: '2026-06-14T14:00:00Z', stage: 'GROUP', grp: 'E', status: 'SCHEDULED' },
    { h: 'SWE', a: 'TUN', date: '2026-06-14T16:00:00Z', stage: 'GROUP', grp: 'F', status: 'SCHEDULED' },
    
    // June 15, 2026
    { h: 'ESP', a: 'CPV', date: '2026-06-15T12:00:00Z', stage: 'GROUP', grp: 'H', status: 'SCHEDULED' },
    { h: 'BEL', a: 'EGY', date: '2026-06-15T15:00:00Z', stage: 'GROUP', grp: 'G', status: 'SCHEDULED' },
    { h: 'KSA', a: 'URU', date: '2026-06-15T18:00:00Z', stage: 'GROUP', grp: 'H', status: 'SCHEDULED' },
    { h: 'IRN', a: 'NZL', date: '2026-06-15T21:00:00Z', stage: 'GROUP', grp: 'G', status: 'SCHEDULED' },

    // June 16, 2026
    { h: 'FRA', a: 'SEN', date: '2026-06-16T12:00:00Z', stage: 'GROUP', grp: 'I', status: 'SCHEDULED' },
    { h: 'IRQ', a: 'NOR', date: '2026-06-16T15:00:00Z', stage: 'GROUP', grp: 'I', status: 'SCHEDULED' },
    { h: 'ARG', a: 'ALG', date: '2026-06-16T18:00:00Z', stage: 'GROUP', grp: 'J', status: 'SCHEDULED' },
    { h: 'AUT', a: 'JOR', date: '2026-06-16T21:00:00Z', stage: 'GROUP', grp: 'J', status: 'SCHEDULED' },
    // June 17, 2026
    { h: 'POR', a: 'COD', date: '2026-06-17T12:00:00Z', stage: 'GROUP', grp: 'K', status: 'SCHEDULED' },
    { h: 'ENG', a: 'CRO', date: '2026-06-17T15:00:00Z', stage: 'GROUP', grp: 'L', status: 'SCHEDULED' },
    { h: 'GHA', a: 'PAN', date: '2026-06-17T18:00:00Z', stage: 'GROUP', grp: 'L', status: 'SCHEDULED' },
    { h: 'UZB', a: 'COL', date: '2026-06-17T21:00:00Z', stage: 'GROUP', grp: 'K', status: 'SCHEDULED' }
  ];

  // Generate Matchday 2 and Matchday 3 matches dynamically
  const grps = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const grpTeams: { [g: string]: string[] } = {};
  for (const t of TEAMS_DATA) {
    if (!grpTeams[t.group]) grpTeams[t.group] = [];
    grpTeams[t.group].push(t.code);
  }

  // Matchday 2 matches (June 18 - June 23)
  grps.forEach((g, idx) => {
    const teams = grpTeams[g];
    if (!teams || teams.length < 4) return;
    const dayOffset = Math.floor(idx / 2); // 0 to 5 days after June 18
    const dateStr = `2026-06-${18 + dayOffset}`;
    
    // T0 vs T2
    scheduleData.push({
      h: teams[0],
      a: teams[2],
      date: `${dateStr}T15:00:00Z`,
      stage: 'GROUP',
      grp: g,
      status: 'SCHEDULED'
    });
    // T1 vs T3
    scheduleData.push({
      h: teams[1],
      a: teams[3],
      date: `${dateStr}T18:00:00Z`,
      stage: 'GROUP',
      grp: g,
      status: 'SCHEDULED'
    });
  });

  // Matchday 3 matches (June 24 - June 29)
  grps.forEach((g, idx) => {
    const teams = grpTeams[g];
    if (!teams || teams.length < 4) return;
    const dayOffset = Math.floor(idx / 2); // 0 to 5 days after June 24
    const dateStr = `2026-06-${24 + dayOffset}`;
    
    // T3 vs T0
    scheduleData.push({
      h: teams[3],
      a: teams[0],
      date: `${dateStr}T15:00:00Z`,
      stage: 'GROUP',
      grp: g,
      status: 'SCHEDULED'
    });
    // T1 vs T2
    scheduleData.push({
      h: teams[1],
      a: teams[2],
      date: `${dateStr}T18:00:00Z`,
      stage: 'GROUP',
      grp: g,
      status: 'SCHEDULED'
    });
  });


  for (const s of scheduleData) {
    const homeTeam = teamsMap[s.h];
    const awayTeam = teamsMap[s.a];
    if (!homeTeam || !awayTeam) continue;

    let liveStats = null;
    let liveTicker = null;
    if (s.status === 'LIVE' || s.status === 'FINISHED') {
      const hs = s.hs ?? 0;
      const as = s.as ?? 0;
      const possessionHome = 45 + Math.floor(Math.random() * 11); // 45% - 55%
      liveStats = JSON.stringify({
        possession: [possessionHome, 100 - possessionHome],
        shots: [hs + 5 + Math.floor(Math.random() * 5), as + 3 + Math.floor(Math.random() * 4)],
        shotsOnTarget: [hs + Math.floor(Math.random() * 2), as + Math.floor(Math.random() * 2)],
        corners: [4 + Math.floor(Math.random() * 4), 3 + Math.floor(Math.random() * 4)],
        fouls: [8 + Math.floor(Math.random() * 5), 9 + Math.floor(Math.random() * 5)],
        yellowCards: [1 + Math.floor(Math.random() * 2), 1 + Math.floor(Math.random() * 2)],
        redCards: [0, 0],
        xG: [Math.round((hs * 0.5 + 0.3) * 100) / 100, Math.round((as * 0.5 + 0.2) * 100) / 100]
      });
      
      const tickerEvents: any[] = [];
      tickerEvents.push({ min: 18 + Math.floor(Math.random() * 10), type: 'YELLOW', team: 'home', player: 'Hậu vệ ' + homeTeam.code });
      tickerEvents.push({ min: 32 + Math.floor(Math.random() * 10), type: 'YELLOW', team: 'away', player: 'Hậu vệ ' + awayTeam.code });

      // Generate goal events for home team
      for (let i = 0; i < hs; i++) {
        const min = Math.min(89, Math.floor(10 + (i * 75) / hs + Math.random() * 10));
        tickerEvents.push({
          min,
          type: 'GOAL',
          team: 'home',
          player: 'Tiền đạo ' + homeTeam.code
        });
      }

      // Generate goal events for away team
      for (let i = 0; i < as; i++) {
        const min = Math.min(89, Math.floor(15 + (i * 75) / as + Math.random() * 10));
        tickerEvents.push({
          min,
          type: 'GOAL',
          team: 'away',
          player: 'Tiền đạo ' + awayTeam.code
        });
      }

      // Sort ticker by minute
      tickerEvents.sort((a, b) => a.min - b.min);

      // Re-calculate details of goals in chronological order
      let currentHome = 0;
      let currentAway = 0;
      tickerEvents.forEach(evt => {
        if (evt.type === 'GOAL') {
          if (evt.team === 'home') {
            currentHome++;
            evt.detail = `[${currentHome}] - ${currentAway}`;
          } else {
            currentAway++;
            evt.detail = `${currentHome} - [${currentAway}]`;
          }
        }
      });

      liveTicker = JSON.stringify(tickerEvents);
    }

    const match = await prisma.match.create({
      data: {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        stage: s.stage,
        groupName: s.grp,
        date: new Date(s.date),
        status: s.status,
        homeScore: s.hs ?? 0,
        awayScore: s.as ?? 0,
        minute: s.min ?? 0,
        liveStats,
        liveTicker
      }
    });

    const homePlayers = await prisma.player.findMany({ where: { teamId: homeTeam.id } });
    const awayPlayers = await prisma.player.findMany({ where: { teamId: awayTeam.id } });
    const h2h = await prisma.h2HRecord.findMany({
      where: {
        OR: [
          { homeTeamId: homeTeam.id, awayTeamId: awayTeam.id },
          { homeTeamId: awayTeam.id, awayTeamId: homeTeam.id }
        ]
      }
    });
    
    const h2hMapped = h2h.map(record => ({
      homeScore: record.homeScore,
      awayScore: record.awayScore,
      isHome: record.homeTeamId === homeTeam.id
    }));

    const pred = generatePrediction(
      {
        id: homeTeam.id,
        name: homeTeam.name,
        code: homeTeam.code,
        eloRating: homeTeam.eloRating,
        fifaRanking: homeTeam.fifaRanking,
        attackRating: homeTeam.attackRating,
        defenseRating: homeTeam.defenseRating,
        midfieldRating: homeTeam.midfieldRating,
        squadValueEur: homeTeam.squadValueEur
      },
      {
        id: awayTeam.id,
        name: awayTeam.name,
        code: awayTeam.code,
        eloRating: awayTeam.eloRating,
        fifaRanking: awayTeam.fifaRanking,
        attackRating: awayTeam.attackRating,
        defenseRating: awayTeam.defenseRating,
        midfieldRating: awayTeam.midfieldRating,
        squadValueEur: awayTeam.squadValueEur
      },
      homePlayers.map(p => ({ position: p.position, status: p.status, marketValueEur: p.marketValueEur })),
      awayPlayers.map(p => ({ position: p.position, status: p.status, marketValueEur: p.marketValueEur })),
      h2hMapped
    );

    await prisma.prediction.create({
      data: {
        matchId: match.id,
        homeWinProb: pred.homeWinProb,
        drawProb: pred.drawProb,
        awayWinProb: pred.awayWinProb,
        expectedHomeGoals: pred.expectedHomeGoals,
        expectedAwayGoals: pred.expectedAwayGoals,
        predictedHomeScore: pred.predictedHomeScore,
        predictedAwayScore: pred.predictedAwayScore,
        secondaryHomeScore: pred.secondaryHomeScore,
        secondaryAwayScore: pred.secondaryAwayScore,
        scoreProbabilities: JSON.stringify(pred.scoreProbabilities),
        bettingTips: JSON.stringify(pred.bettingTips),
        confidenceScore: pred.confidenceScore,
        riskLevel: pred.riskLevel
      }
    });
  }

  console.log('FIFA World Cup 2026 Seeding Complete! Official 48 teams, player rosters, and math predictions successfully loaded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
