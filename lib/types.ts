export interface Seller {
  id: number
  firstName: string
  lastName: string
  email: string
  password?: string
  birthDate: string | null
  phoneNumber: string | null
  createdAt?: string
}

export interface Client {
  id: number
  firstName: string
  lastName: string
  email: string
  birthDate?: string | null
  phoneNumber: string | null
  createdAt?: string
}

export interface Product {
  id: number
  serialNumber: string
  name: string
  description: string | null
  image: string | null
  price: number | null
  isValid: boolean
  locationName: string | null
  latitude: number | null
  longitude: number | null
  canReview: boolean
  seller: Seller
}

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  birthDate?: string | null
  phoneNumber?: string | null
  userType: 'ADMIN' | 'SELLER' | 'CLIENT'
}
