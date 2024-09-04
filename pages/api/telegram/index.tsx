import { sendTelegramMessage } from "@/lib/telegram";
import { getTasksPastReminderDate } from "@/models/tasks";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const handleGET = async () => {
    const tasks = await getTasksPastReminderDate();
    let msg = "Reminders\n\n";
    tasks.forEach((task) => {
      msg += "- " + task.title + "\n";
    });
    const resp = await sendTelegramMessage("217018241", msg);
    res.status(200).send(JSON.stringify(resp));
  };
  switch (req.method) {
    case "GET":
      return await handleGET();
    default:
      return res.status(400).send("Invalid method");
  }
};
