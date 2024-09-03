import { Task, validateTask } from "@/models/tasks";
import clientPromise from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { taskId } = req.query;
  const id: string = String(taskId);

  const handleDELETE = async () => {
    try {
      const client = await clientPromise;
      const db = client.db("rereminder");
      const deleted = await db
        .collection("tasks")
        .deleteOne({ _id: new ObjectId(id) });
      res.status(201).json(deleted);
    } catch (e: any) {
      console.error(e);
      res.status(404).send(e.message);
    }
  };
  switch (req.method) {
    case "GET":
      return res.json({ hi: taskId });
    case "DELETE":
      return handleDELETE();
    default:
      return res.status(400).send("Invalid method");
  }
};
