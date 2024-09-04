import clientPromise from "@/lib/mongodb";
import moment from "moment";
import { ObjectId } from "mongodb";

const DB_NAME = "rereminder";
const COLLECTION_NAME = "tasks";

export interface Task {
  _id?: ObjectId;
  title: string;
  description: string;
  chatId: number;
  userId: number;
  reminderDate?: number;
  repeatInterval?: string;
  status: string;
}

export const getAllTasks = async () => {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const tasks = await db
      .collection(COLLECTION_NAME)
      .find({})
      .sort({ reminderDate: 1 })
      .toArray();
    return tasks;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getOneTask = async (id: number) => {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const task = await db.collection(COLLECTION_NAME).findOne(new ObjectId(id));
    return task;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getTasksPastReminderDate = async () => {
  const nowUnix = moment().unix();
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const tasks = await db
      .collection(COLLECTION_NAME)
      .find({ reminderDate: { $lt: nowUnix } })
      .toArray();
    return tasks;
  } catch (e) {
    console.error(e);
    return [];
  }
};

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
