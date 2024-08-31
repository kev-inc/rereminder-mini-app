export interface Task {
  title: string;
  description: string;
  chatId: number;
  userId: number;
  reminderDate: number;
  repeatInterval: string;
  status: string;
}

export const validateTask = (task: Task) => {
  if (task.title == null || task.title == "") {
    throw new Error("Title missing");
  }
  if (task.chatId == null) {
    throw new Error("chatId missing");
  }
  if (task.userId == null) {
    throw new Error("userId missing");
  }
};
