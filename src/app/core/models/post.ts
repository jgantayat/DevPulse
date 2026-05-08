export interface Post {
    id: number;
    title: string;
    body: string; 
    userId: number;  

}

export interface PostPayload {
    title: string;
    body: string; 
    userId: number;  

}