import clientPromise from "@/lib/mongodb";
import { Task } from "@/models/tasks";
import moment from "moment";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface TasksProps {
  tasks: Task[];
}

const Tasks: React.FC<TasksProps> = ({ tasks }) => {
  const [viewer, setViewer] = useState({
    userId: null,
  });
  const router = useRouter();
  useEffect(() => {
    // @ts-ignore
    if (window.Telegram.WebApp) {
      // @ts-ignore
      window.Telegram.WebApp.MainButton.setText("NEW REREMINDER"); // @ts-ignore
      window.Telegram.WebApp.MainButton.show(); // @ts-ignore
      window.Telegram.WebApp.MainButton.enable(); // @ts-ignore
      window.Telegram.WebApp.MainButton.onClick(() =>
        router.push("/tasks/new")
      );
      setViewer({
        // @ts-ignore
        userId: window.Telegram.WebApp.initDataUnsafe.user.id,
      });
    }
    return () => {
      // @ts-ignore
      window.Telegram.WebApp.MainButton.hide();
    };
  }, []);

  return (
    <div className="tg-text-color">
      <div>Showing tasks for user {viewer.userId}</div>
      {tasks.map((task, index) => (
        <div
          key={index}
          className="px-4 py-2 border-b tg-section-separator-color"
        >
          <div>{task.title}</div>
          <div className="flex gap-x-2">
            <span className="text-xs bg-gray-100 text-gray-500 p-1 rounded">
              {task.userId}
            </span>
            {task.reminderDate && (
              <span className="text-xs bg-gray-100 text-gray-500 p-1 rounded">
                {moment.unix(task.reminderDate).fromNow()}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Tasks;

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("rereminder");
    const tasks = await db.collection("tasks").find({}).toArray();
    return {
      props: { tasks: JSON.parse(JSON.stringify(tasks)) },
    };
  } catch (e) {
    console.error(e);
    return { props: { tasks: [] } };
  }
};
