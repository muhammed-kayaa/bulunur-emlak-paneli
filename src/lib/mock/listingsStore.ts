export type AuthorizationType = "YETKILI" | "YETKISIZ"

export type PortfolioType = "SATILIK" | "KIRALIK"

export type PropertyType = "EV" | "ARSA" | "DİĞER"

export type ListingStatus = "ACTIVE" | "SOLD"

export type Listing = {
  id: string;
  title: string;
  portfolioType: PortfolioType;
  propertyType: PropertyType;
  price: number;
  rooms?: number;
  sqm?: number;
  location: { city: string; district: string; neighborhood?: string };
  consultantId: string;
  authorizationType: AuthorizationType;
  status: ListingStatus;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  soldAt?: string;
};

let listings: Listing[] = [
  {
    id: "1",
    title: "Modern 3+1 Ev Kadıköy'de",
    portfolioType: "SATILIK",
    propertyType: "EV",
    price: 2500000,
    rooms: 4,
    sqm: 120,
    location: { city: "İstanbul", district: "Kadıköy", neighborhood: "Caferağa" },
    consultantId: "1",
    authorizationType: "YETKILI",
    status: "ACTIVE",
    isDeleted: false,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Şişli'de 2+1 Kiralık Daire",
    portfolioType: "KIRALIK",
    propertyType: "EV",
    price: 15000,
    rooms: 3,
    sqm: 80,
    location: { city: "İstanbul", district: "Şişli", neighborhood: "Mecidiyeköy" },
    consultantId: "2",
    authorizationType: "YETKISIZ",
    status: "ACTIVE",
    isDeleted: false,
    createdAt: "2024-02-10T14:30:00Z",
  },
  {
    id: "3",
    title: "Beşiktaş'ta Satılık Arsa",
    portfolioType: "SATILIK",
    propertyType: "ARSA",
    price: 5000000,
    sqm: 500,
    location: { city: "İstanbul", district: "Beşiktaş", neighborhood: "Arnavutköy" },
    consultantId: "3",
    authorizationType: "YETKILI",
    status: "SOLD",
    isDeleted: false,
    createdAt: "2024-03-05T09:15:00Z",
    soldAt: "2024-05-20T16:45:00Z",
  },
  {
    id: "4",
    title: "Üsküdar'da 4+1 Villa",
    portfolioType: "SATILIK",
    propertyType: "EV",
    price: 4500000,
    rooms: 5,
    sqm: 200,
    location: { city: "İstanbul", district: "Üsküdar", neighborhood: "Çengelköy" },
    consultantId: "4",
    authorizationType: "YETKILI",
    status: "ACTIVE",
    isDeleted: false,
    createdAt: "2024-04-12T11:20:00Z",
  },
  {
    id: "5",
    title: "Bakırköy'de Kiralık Ofis",
    portfolioType: "KIRALIK",
    propertyType: "DİĞER",
    price: 25000,
    sqm: 150,
    location: { city: "İstanbul", district: "Bakırköy", neighborhood: "Ataköy" },
    consultantId: "5",
    authorizationType: "YETKISIZ",
    status: "ACTIVE",
    isDeleted: false,
    createdAt: "2024-05-08T13:45:00Z",
  },
  {
    id: "6",
    title: "Maltepe'de Satılık Daire",
    portfolioType: "SATILIK",
    propertyType: "EV",
    price: 1800000,
    rooms: 3,
    sqm: 100,
    location: { city: "İstanbul", district: "Maltepe", neighborhood: "Altayçeşme" },
    consultantId: "6",
    authorizationType: "YETKILI",
    status: "SOLD",
    isDeleted: false,
    createdAt: "2024-06-01T08:30:00Z",
    soldAt: "2024-07-15T12:00:00Z",
  },
  {
    id: "7",
    title: "Kartal'da Kiralık Depo",
    portfolioType: "KIRALIK",
    propertyType: "DİĞER",
    price: 30000,
    sqm: 300,
    location: { city: "İstanbul", district: "Kartal", neighborhood: "Yakacık" },
    consultantId: "1",
    authorizationType: "YETKISIZ",
    status: "ACTIVE",
    isDeleted: false,
    createdAt: "2024-07-10T15:00:00Z",
  },
  {
    id: "8",
    title: "Beyoğlu'nda Satılık Tarihi Konak",
    portfolioType: "SATILIK",
    propertyType: "EV",
    price: 7500000,
    rooms: 6,
    sqm: 250,
    location: { city: "İstanbul", district: "Beyoğlu", neighborhood: "Cihangir" },
    consultantId: "2",
    authorizationType: "YETKILI",
    status: "ACTIVE",
    isDeleted: false,
    createdAt: "2024-08-05T10:45:00Z",
  },
  {
    id: "9",
    title: "Pendik'te Satılık Arsa",
    portfolioType: "SATILIK",
    propertyType: "ARSA",
    price: 1200000,
    sqm: 200,
    location: { city: "İstanbul", district: "Pendik", neighborhood: "Kaynarca" },
    consultantId: "3",
    authorizationType: "YETKILI",
    status: "ACTIVE",
    isDeleted: true,
    deletedAt: "2024-09-01T14:20:00Z",
    deletedBy: "admin1",
    createdAt: "2024-08-20T09:00:00Z",
  },
  {
    id: "10",
    title: "Ataşehir'de Kiralık Daire",
    portfolioType: "KIRALIK",
    propertyType: "EV",
    price: 20000,
    rooms: 3,
    sqm: 90,
    location: { city: "İstanbul", district: "Ataşehir", neighborhood: "Barbaros" },
    consultantId: "4",
    authorizationType: "YETKISIZ",
    status: "ACTIVE",
    isDeleted: true,
    deletedAt: "2024-10-05T11:30:00Z",
    deletedBy: "admin2",
    createdAt: "2024-09-15T16:15:00Z",
  },
];

export function getAll(filters: {
  q?: string;
  status?: "all" | "ACTIVE" | "SOLD";
  auth?: "all" | "YETKILI" | "YETKISIZ";
  portfolio?: "all" | "SATILIK" | "KIRALIK";
  deleted?: "hide" | "showOnlyDeleted" | "showAll";
}): Listing[] {
  let filtered = listings;

  if (filters.q) {
    const lowerQ = filters.q.toLowerCase();
    filtered = filtered.filter(l =>
      l.title.toLowerCase().includes(lowerQ) ||
      l.location.city.toLowerCase().includes(lowerQ) ||
      l.location.district.toLowerCase().includes(lowerQ) ||
      (l.location.neighborhood && l.location.neighborhood.toLowerCase().includes(lowerQ))
    );
  }

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter(l => l.status === filters.status);
  }

  if (filters.auth && filters.auth !== "all") {
    filtered = filtered.filter(l => l.authorizationType === filters.auth);
  }

  if (filters.portfolio && filters.portfolio !== "all") {
    filtered = filtered.filter(l => l.portfolioType === filters.portfolio);
  }

  if (filters.deleted === "hide") {
    filtered = filtered.filter(l => !l.isDeleted);
  } else if (filters.deleted === "showOnlyDeleted") {
    filtered = filtered.filter(l => l.isDeleted);
  }
  // showAll does nothing, includes all

  return filtered;
}

export function softDelete(id: string, actor: { role: "ADMIN" | "CONSULTANT"; id: string }): boolean {
  const index = listings.findIndex(l => l.id === id);
  if (index === -1) return false;
  listings[index].isDeleted = true;
  listings[index].deletedAt = new Date().toISOString();
  listings[index].deletedBy = actor.id;
  console.log("LISTING_DELETED", { actor, listingId: id });
  return true;
}

export function updateAuthorizationType(id: string, newType: AuthorizationType): boolean {
  const index = listings.findIndex(l => l.id === id);
  if (index === -1) return false;
  listings[index].authorizationType = newType;
  return true;
}

export function createListing(input: {
  title: string;
  portfolioType: PortfolioType;
  propertyType: PropertyType;
  price: number;
  rooms?: number;
  sqm?: number;
  location: { city: string; district: string; neighborhood?: string };
  authorizationType: AuthorizationType;
  consultantId: string;
}): Listing {
  // Validate required fields
  if (!input.title || !input.portfolioType || !input.propertyType || typeof input.price !== 'number' || !input.location.city || !input.location.district || !input.authorizationType || !input.consultantId) {
    throw new Error("Missing required fields");
  }

  const newListing: Listing = {
    id: (listings.length + 1).toString(), // Simple id generation
    title: input.title,
    portfolioType: input.portfolioType,
    propertyType: input.propertyType,
    price: input.price,
    rooms: input.rooms,
    sqm: input.sqm,
    location: input.location,
    consultantId: input.consultantId,
    authorizationType: input.authorizationType,
    status: "ACTIVE",
    isDeleted: false,
    createdAt: new Date().toISOString(),
  };

  listings.push(newListing);
  return newListing;
}

export function getByConsultantId(consultantId: string, filters: {
  q?: string;
  status?: "all" | "ACTIVE" | "SOLD";
  auth?: "all" | "YETKILI" | "YETKISIZ";
  portfolio?: "all" | "SATILIK" | "KIRALIK";
  deleted?: "hide" | "showOnlyDeleted" | "showAll";
}): Listing[] {
  let filtered = listings.filter(l => l.consultantId === consultantId);

  if (filters.q) {
    const lowerQ = filters.q.toLowerCase();
    filtered = filtered.filter(l =>
      l.title.toLowerCase().includes(lowerQ) ||
      l.location.city.toLowerCase().includes(lowerQ) ||
      l.location.district.toLowerCase().includes(lowerQ) ||
      (l.location.neighborhood && l.location.neighborhood.toLowerCase().includes(lowerQ))
    );
  }

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter(l => l.status === filters.status);
  }

  if (filters.auth && filters.auth !== "all") {
    filtered = filtered.filter(l => l.authorizationType === filters.auth);
  }

  if (filters.portfolio && filters.portfolio !== "all") {
    filtered = filtered.filter(l => l.portfolioType === filters.portfolio);
  }

  if (filters.deleted === "hide") {
    filtered = filtered.filter(l => !l.isDeleted);
  } else if (filters.deleted === "showOnlyDeleted") {
    filtered = filtered.filter(l => l.isDeleted);
  }
  // showAll does nothing, includes all

  return filtered;
}