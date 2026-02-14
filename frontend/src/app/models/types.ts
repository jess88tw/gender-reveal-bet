export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt?: Date;
}

export interface Bet {
  id: string;
  userId: string;
  gender: 'BOY' | 'GIRL';
  amount: number;
  ticketCount: number;
  isPaid: boolean;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
    email: string;
  };
}

export interface BetStats {
  boy: {
    totalAmount: number;
    totalTickets: number;
  };
  girl: {
    totalAmount: number;
    totalTickets: number;
  };
  totalUsers: number;
}

export interface Clue {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  clueType: 'ULTRASOUND' | 'SYMPTOM' | 'OTHER';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RevealConfig {
  id: string;
  revealedGender?: 'BOY' | 'GIRL';
  isRevealed: boolean;
  revealDate?: Date;
  winnerId?: string;
  winner?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  id: string;
  name: string;
  avatarUrl?: string;
  gender: 'BOY' | 'GIRL' | null;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}
