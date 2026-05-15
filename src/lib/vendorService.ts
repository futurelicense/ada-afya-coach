// Nigerian food vendors/restaurants management
export interface Vendor {
  id: string;
  name: string;
  location: string;
  rating: number;
  deliveryTime: string;
  minOrder: number;
  deliveryFee: number;
  cuisine: string[];
  verified: boolean;
  phone: string;
  favorites: number;
}

export interface ScheduledDelivery {
  id: string;
  mealNames: string[];
  vendorId: string;
  scheduledDate: string;
  scheduledTime: string;
  recurring?: 'daily' | 'weekly' | 'none';
  status: 'pending' | 'confirmed' | 'cancelled';
}

class VendorService {
  private readonly FAVORITES_KEY = 'fitnaija_favorite_vendors';
  private readonly SCHEDULED_KEY = 'fitnaija_scheduled_deliveries';

  private vendors: Vendor[] = [
    {
      id: '1',
      name: 'Mama Cass Restaurant',
      location: 'Victoria Island, Lagos',
      rating: 4.8,
      deliveryTime: '30-40 mins',
      minOrder: 1500,
      deliveryFee: 500,
      cuisine: ['Nigerian', 'African'],
      verified: true,
      phone: '+234 802 345 6789',
      favorites: 1240,
    },
    {
      id: '2',
      name: 'Health Kitchen NG',
      location: 'Lekki Phase 1, Lagos',
      rating: 4.9,
      deliveryTime: '25-35 mins',
      minOrder: 2000,
      deliveryFee: 600,
      cuisine: ['Healthy', 'Nigerian'],
      verified: true,
      phone: '+234 803 456 7890',
      favorites: 2100,
    },
    {
      id: '3',
      name: 'Naija Fitness Meals',
      location: 'Ikeja GRA, Lagos',
      rating: 4.7,
      deliveryTime: '35-45 mins',
      minOrder: 1800,
      deliveryFee: 550,
      cuisine: ['Healthy', 'Meal Prep'],
      verified: true,
      phone: '+234 804 567 8901',
      favorites: 890,
    },
    {
      id: '4',
      name: 'Jollof Express',
      location: 'Surulere, Lagos',
      rating: 4.6,
      deliveryTime: '40-50 mins',
      minOrder: 1200,
      deliveryFee: 450,
      cuisine: ['Nigerian', 'Fast Food'],
      verified: true,
      phone: '+234 805 678 9012',
      favorites: 650,
    },
    {
      id: '5',
      name: 'Fit Fusion Kitchen',
      location: 'Yaba, Lagos',
      rating: 4.8,
      deliveryTime: '30-40 mins',
      minOrder: 2500,
      deliveryFee: 700,
      cuisine: ['Healthy', 'International'],
      verified: true,
      phone: '+234 806 789 0123',
      favorites: 1520,
    },
  ];

  getAllVendors(): Vendor[] {
    return this.vendors;
  }

  getVendorById(id: string): Vendor | undefined {
    return this.vendors.find(v => v.id === id);
  }

  getFavoriteVendors(): string[] {
    const data = localStorage.getItem(this.FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  }

  toggleFavorite(vendorId: string): boolean {
    const favorites = this.getFavoriteVendors();
    const index = favorites.indexOf(vendorId);
    
    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
      return false;
    } else {
      favorites.push(vendorId);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    }
  }

  isFavorite(vendorId: string): boolean {
    return this.getFavoriteVendors().includes(vendorId);
  }

  // Scheduled deliveries
  getScheduledDeliveries(): ScheduledDelivery[] {
    const data = localStorage.getItem(this.SCHEDULED_KEY);
    return data ? JSON.parse(data) : [];
  }

  scheduleDelivery(delivery: ScheduledDelivery): void {
    const scheduled = this.getScheduledDeliveries();
    scheduled.push(delivery);
    localStorage.setItem(this.SCHEDULED_KEY, JSON.stringify(scheduled));
  }

  cancelScheduledDelivery(id: string): void {
    const scheduled = this.getScheduledDeliveries();
    const updated = scheduled.map(d => 
      d.id === id ? { ...d, status: 'cancelled' as const } : d
    );
    localStorage.setItem(this.SCHEDULED_KEY, JSON.stringify(updated));
  }

  getUpcomingDeliveries(): ScheduledDelivery[] {
    const scheduled = this.getScheduledDeliveries();
    return scheduled.filter(d => d.status === 'pending' || d.status === 'confirmed');
  }
}

export const vendorService = new VendorService();
