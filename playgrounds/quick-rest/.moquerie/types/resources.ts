export interface Message {
    id: string;
    text: string;
    user: User;
}

export interface MyObject {
    id: string;
    count: number;
    title: string;
}

export interface User {
    id: string;
    email: string;
    messages: Message;
    name: string;
}