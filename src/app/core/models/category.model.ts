export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  budget?: number;
}

export interface CategoryRequest {
  name: string;
  color: string;
  icon: string;
  budget?: number;
}