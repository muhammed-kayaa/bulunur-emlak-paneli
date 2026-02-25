export type Consultant = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  commissionRate: number;
  isActive: boolean;
  metrics: {
    monthlySalesCount: number;
    monthlyRevenue: number;
    totalSalesCount: number;
    totalRevenue: number;
  };
};

let consultants: Consultant[] = [
  {
    id: "1",
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@example.com",
    photoUrl: "",
    commissionRate: 5,
    isActive: true,
    metrics: {
      monthlySalesCount: 12,
      monthlyRevenue: 150000,
      totalSalesCount: 120,
      totalRevenue: 1500000,
    },
  },
  {
    id: "2",
    name: "Ayşe Kaya",
    email: "ayse.kaya@example.com",
    photoUrl: "",
    commissionRate: 7,
    isActive: true,
    metrics: {
      monthlySalesCount: 8,
      monthlyRevenue: 100000,
      totalSalesCount: 95,
      totalRevenue: 1200000,
    },
  },
  {
    id: "3",
    name: "Mehmet Demir",
    email: "mehmet.demir@example.com",
    photoUrl: "",
    commissionRate: 6,
    isActive: false,
    metrics: {
      monthlySalesCount: 0,
      monthlyRevenue: 0,
      totalSalesCount: 50,
      totalRevenue: 600000,
    },
  },
  {
    id: "4",
    name: "Fatma Çelik",
    email: "fatma.celik@example.com",
    photoUrl: "",
    commissionRate: 8,
    isActive: true,
    metrics: {
      monthlySalesCount: 15,
      monthlyRevenue: 200000,
      totalSalesCount: 180,
      totalRevenue: 2200000,
    },
  },
  {
    id: "5",
    name: "Ali Öz",
    email: "ali.oz@example.com",
    photoUrl: "",
    commissionRate: 4,
    isActive: true,
    metrics: {
      monthlySalesCount: 10,
      monthlyRevenue: 120000,
      totalSalesCount: 110,
      totalRevenue: 1300000,
    },
  },
  {
    id: "6",
    name: "Zeynep Aydın",
    email: "zeynep.aydin@example.com",
    photoUrl: "",
    commissionRate: 9,
    isActive: false,
    metrics: {
      monthlySalesCount: 0,
      monthlyRevenue: 0,
      totalSalesCount: 70,
      totalRevenue: 900000,
    },
  },
];

export function getAll({ status, q }: { status?: string; q?: string }): Consultant[] {
  let filtered = consultants;

  if (status === "active") {
    filtered = filtered.filter(c => c.isActive);
  } else if (status === "inactive") {
    filtered = filtered.filter(c => !c.isActive);
  }

  if (q) {
    const lowerQ = q.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(lowerQ) ||
      c.email.toLowerCase().includes(lowerQ)
    );
  }

  return filtered;
}

export function updateCommissionRate(id: string, rate: number): Consultant | null {
  if (rate < 0 || rate > 100) return null;
  const index = consultants.findIndex(c => c.id === id);
  if (index === -1) return null;
  consultants[index].commissionRate = rate;
  console.log("COMMISSION_RATE_CHANGED", { id, rate });
  return consultants[index];
}

export function toggleActive(id: string): Consultant | null {
  const index = consultants.findIndex(c => c.id === id);
  if (index === -1) return null;
  consultants[index].isActive = !consultants[index].isActive;
  const isActive = consultants[index].isActive;
  console.log(isActive ? "CONSULTANT_ACTIVATED" : "CONSULTANT_DEACTIVATED", { id });
  return consultants[index];
}

export function softDelete(id: string): boolean {
  const index = consultants.findIndex(c => c.id === id);
  if (index === -1) return false;
  consultants.splice(index, 1);
  console.log("CONSULTANT_SOFT_DELETED", { id });
  return true;
}

export function createConsultant(input: { name: string; email: string; photoUrl?: string; commissionRate: number }): Consultant | null {
  if (!input.name.trim()) return null;
  if (!input.email.includes('@')) return null;
  if (input.commissionRate < 0 || input.commissionRate > 100) return null;

  const id = Date.now().toString();
  const newConsultant: Consultant = {
    id,
    name: input.name,
    email: input.email,
    photoUrl: input.photoUrl || '',
    commissionRate: input.commissionRate,
    isActive: true,
    metrics: {
      monthlySalesCount: 0,
      monthlyRevenue: 0,
      totalSalesCount: 0,
      totalRevenue: 0,
    },
  };
  consultants.push(newConsultant);
  console.log("CONSULTANT_CREATED", { id });
  return newConsultant;
}