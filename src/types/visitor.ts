export interface Visitor {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  serviceDate: string;
  serviceTime: string;
  observations?: string;
  createdAt: string;
}

export interface VisitorFormData {
  fullName: string;
  phone: string;
  city: string;
  serviceDate: string;
  serviceTime: string;
  observations?: string;
}