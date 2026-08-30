export interface PackageOffer {
  id: string;
  name: string;
  badge?: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  features: string[];
  isPopular?: boolean;
  videoUrl?: string;
  shortDescription: string;
}

export interface ShadeOption {
  id: string;
  name: string;
  category: string;
  colorHex?: string;
  description?: string;
}

export interface LuckyPrize {
  id: string;
  name: string;
  iconName: string;
  color: string;
  badge?: string;
  description: string;
}

export interface StoreSettings {
  storeName: string;
  salonOwner: string;
  whatsappNumber: string;
  whatsappDepositNumber: string;
  instapayUsername: string;
  depositAmount: number;
  hairWashPrice: number;
  facebookUrl: string;
  googleSheetUrl: string;
  metaPixelId: string;
  adminPasswordHash?: string;
  adminPasswordPlainText?: string;
  currency: string;
  daysRemainingText: string;
}

export interface OrderItem {
  packageId: string;
  packageName: string;
  packagePrice: number;
  selectedShade?: string;
  hairLength?: string;
  addHairWash: boolean;
  hairWashPrice: number;
  wonPrize?: string;
  chosenGift?: string;
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  phone1: string;
  phone2?: string;
  governorate: string;
  branch: string;
  address: string;
  notes?: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  addHairWash: boolean;
  hairWashPrice: number;
  selectedShade?: string;
  hairTypeNotes?: string;
  wonPrize?: string;
  depositAmount: number;
  remainingAmount: number;
  totalPrice: number;
  status: 'new' | 'deposit_pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  cairoFormattedDate: string;
  createdAt: string;
  syncedToGoogleSheet?: boolean;
}

export interface BranchInfo {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  spotsLeft: number;
  mapEmbedOrDirections?: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  branch: string;
  service: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  dateStr: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalSales: number;
  totalDeposits: number;
  newOrders: number;
  confirmedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}
