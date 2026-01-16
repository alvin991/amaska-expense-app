import axios from "axios";

export interface PaymentMethod {
    id: number;
    name: string;
    description: string;
    createdBy: number;
    createdAt: string;
    modifiedBy: number;
    modifiedAt: string;
}

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
    const response = await axios.get('/api/payment_methods'); // use relative URL so vite proxy handles it
    return response.data;
};