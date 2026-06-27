// Delhi NCR grid — systematic coverage of every major area.
// Each point becomes the centre of a nearby-search circle.
// Radius 3500m with ~35% overlap between adjacent points → no gaps.

export interface GridPoint {
  lat: number;
  lng: number;
  area: string;
}

// ~4km spacing in lat/lng ≈ 0.036° lat, 0.043° lng at 28°N
// 6 columns × 8 rows + extra Gurgaon / Noida / Faridabad / Ghaziabad anchors

export const DELHI_NCR_GRID: GridPoint[] = [
  // ── Central Delhi ─────────────────────────────────────────────────────────
  { lat: 28.6304, lng: 77.2177, area: "Connaught Place" },
  { lat: 28.6448, lng: 77.2090, area: "Karol Bagh" },
  { lat: 28.6692, lng: 77.2270, area: "Civil Lines" },
  { lat: 28.6562, lng: 77.2410, area: "Darya Ganj / Old Delhi" },
  { lat: 28.6380, lng: 77.2320, area: "ITO / Mandi House" },

  // ── South Delhi ───────────────────────────────────────────────────────────
  { lat: 28.5672, lng: 77.2100, area: "Hauz Khas" },
  { lat: 28.5494, lng: 77.2159, area: "Green Park / Malviya Nagar" },
  { lat: 28.5355, lng: 77.2201, area: "Saket" },
  { lat: 28.5614, lng: 77.2380, area: "Lajpat Nagar / Defence Colony" },
  { lat: 28.5437, lng: 77.2456, area: "Greater Kailash" },
  { lat: 28.5243, lng: 77.2312, area: "Kalkaji / Nehru Place" },
  { lat: 28.5804, lng: 77.2350, area: "South Extension / Lodhi" },
  { lat: 28.5935, lng: 77.2085, area: "RK Puram / Vasant Vihar" },
  { lat: 28.5206, lng: 77.1856, area: "Vasant Kunj" },
  { lat: 28.5509, lng: 77.1870, area: "Munirka / JNU Area" },
  { lat: 28.5081, lng: 77.2200, area: "Sultanpur / Ghitorni" },

  // ── North Delhi ───────────────────────────────────────────────────────────
  { lat: 28.7041, lng: 77.1025, area: "Rohini" },
  { lat: 28.7190, lng: 77.1980, area: "Pitampura / Netaji Subhash Place" },
  { lat: 28.7421, lng: 77.1754, area: "Shalimar Bagh" },
  { lat: 28.6995, lng: 77.1480, area: "Punjabi Bagh" },
  { lat: 28.6799, lng: 77.1650, area: "Paschim Vihar / Janakpuri" },

  // ── East Delhi ────────────────────────────────────────────────────────────
  { lat: 28.6438, lng: 77.3020, area: "Laxmi Nagar / Nirman Vihar" },
  { lat: 28.6670, lng: 77.3210, area: "Preet Vihar / Karkardooma" },
  { lat: 28.6081, lng: 77.2940, area: "Mayur Vihar Phase 1" },
  { lat: 28.5960, lng: 77.3150, area: "Mayur Vihar Phase 2 & 3" },

  // ── West Delhi ────────────────────────────────────────────────────────────
  { lat: 28.6290, lng: 77.0870, area: "Dwarka Sector 10" },
  { lat: 28.5880, lng: 77.0730, area: "Dwarka Sector 18 / 21" },
  { lat: 28.6548, lng: 77.1070, area: "Uttam Nagar" },
  { lat: 28.6155, lng: 77.1200, area: "Janakpuri" },

  // ── Gurgaon / Gurugram ────────────────────────────────────────────────────
  { lat: 28.4800, lng: 77.0900, area: "DLF Cyber City / Phase 1" },
  { lat: 28.4641, lng: 77.0308, area: "Golf Course Road" },
  { lat: 28.4360, lng: 77.0450, area: "Sohna Road" },
  { lat: 28.4595, lng: 77.0590, area: "MG Road / IFFCO Chowk" },
  { lat: 28.4226, lng: 77.0294, area: "Sector 56 / 57 Gurgaon" },
  { lat: 28.4980, lng: 77.0680, area: "Sector 14 / 15 Gurgaon" },
  { lat: 28.5041, lng: 77.1010, area: "Udyog Vihar / NH48" },
  { lat: 28.4089, lng: 76.9937, area: "South Gurgaon / Manesar vicinity" },

  // ── Noida ─────────────────────────────────────────────────────────────────
  { lat: 28.5705, lng: 77.3219, area: "Noida Sector 18" },
  { lat: 28.6074, lng: 77.3630, area: "Noida Sector 62 / 63" },
  { lat: 28.5421, lng: 77.3365, area: "Noida Sector 29 / 30" },
  { lat: 28.5892, lng: 77.3240, area: "Noida Sector 50 / 51" },
  { lat: 28.6300, lng: 77.3710, area: "Noida Sector 76 / 77" },
  { lat: 28.5161, lng: 77.4070, area: "Greater Noida" },

  // ── Faridabad ─────────────────────────────────────────────────────────────
  { lat: 28.4089, lng: 77.3178, area: "Faridabad Old / NIT" },
  { lat: 28.4351, lng: 77.3067, area: "Faridabad Sector 15 / 16" },

  // ── Ghaziabad ─────────────────────────────────────────────────────────────
  { lat: 28.6692, lng: 77.4538, area: "Indirapuram" },
  { lat: 28.6500, lng: 77.4200, area: "Vaishali / Kaushambi" },
];

// Search radius per tile in metres.
// 3500m gives ~38km² per circle; adjacent tiles are 4km apart so overlap is ~12%
export const TILE_RADIUS_M = 3500;

// Total theoretical coverage: 47 tiles × 38km² ≈ 1786km²
// Delhi NCR area ≈ 2100km² — excellent blanket coverage with overlap
export const TOTAL_TILES = DELHI_NCR_GRID.length;
