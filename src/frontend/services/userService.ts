import axios from "axios";

export interface User {
    id: number;
    username: string;
    email: string;
    createdAt: string;
    modifiedAt: string;
    settings: string;
}

export const fetchUsers = async (): Promise<User[]> => {
    const response = await axios.get('/api/users');
    return response.data;
};