export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

export interface DashboardData {
  totalPosts: number;
  totalUsers: number;
  completedTodos: number;
  pendingTodos: number;
}