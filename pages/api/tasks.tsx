import { Task, validateTask } from "@/models/tasks";
import clientPromise from "../../lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const client = await clientPromise;
    const db = client.db("rereminder");
    const tasks = await db.collection("tasks").find({}).toArray();
    res.json(tasks);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error");
  }
};

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.headers["content-type"] === "application/json") {
    try {
      const task: Task = req.body;
      validateTask(task);
      task.status = "ACTIVE";
      const client = await clientPromise;
      const db = client.db("rereminder");
      const inserted = await db.collection("tasks").insertOne(task);
      res.status(201).json(inserted);
    } catch (e: any) {
      console.error(e);
      res.status(500).send(e.message);
    }
  } else {
    res.status(400).send("Invalid content type");
  }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    case "POST":
      return handlePOST(req, res);
    default:
      return res.status(400).send("Invalid method");
  }
};
