import clientPromise from "@/lib/mongodb";
import { Task, getAllTasks } from "@/models/tasks";
import moment from "moment";
import { ObjectId } from "mongodb";
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
    const { WebApp } = (window as any).Telegram;
    if (WebApp) {
      WebApp?.MainButton.setText("NEW REREMINDER");
      WebApp?.MainButton.show();
      WebApp?.MainButton.enable();
      WebApp?.MainButton.onClick(() => router.push("/tasks/new"));
      setViewer({
        userId: WebApp?.initDataUnsafe?.user?.id,
      });
    }
    return () => {
      WebApp.MainButton.hide();
    };
  }, []);

  const navigateToTask = (id?: ObjectId) => {
    if (id) router.push("/tasks/" + id);
  };

  return (
    <div className="tg-text-color">
      {tasks.map((task, index) => (
        <div
          key={index}
          className="px-4 py-2 border-b tg-section-separator-color cursor-pointer"
          onClick={() => navigateToTask(task._id)}
        >
          <div>{task.title}</div>
          <div className="flex gap-x-2">
            <span className="text-xs bg-gray-100 text-gray-500 p-1 rounded">
              {task.userId}
            </span>
            {task.reminderDate && (
              <span className="text-xs bg-gray-100 p-1 rounded tg-button-color">
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
  const tasks = await getAllTasks();
  return {
    props: { tasks: JSON.parse(JSON.stringify(tasks)) },
  };
};
