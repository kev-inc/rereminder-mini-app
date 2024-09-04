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
      <div className="tg-section-bg-color tg-section-header-text-color text-sm uppercase font-medium p-1">
        My Reminders
      </div>
      {tasks.map((task, index) => {
        const isReminderActive =
          task.reminderDate && task.reminderDate < moment().unix();
        return (
          <div
            key={index}
            className={`pr-4 py-2  border-b tg-section-separator-color cursor-pointer ${
              isReminderActive ? "border-l-4 pl-3" : "pl-4"
            } active:opacity-70`}
            onClick={() => navigateToTask(task._id)}
          >
            <div className={`${isReminderActive && "font-bold"} mb-2`}>
              {task.title}
            </div>
            <div className="flex gap-x-2">
              {task.reminderDate &&
                (isReminderActive ? (
                  <span className="text-xs p-1 rounded tg-button-color">
                    {moment.unix(task.reminderDate).fromNow()}
                  </span>
                ) : (
                  <span className="text-xs p-1 rounded tg-section-bg-color">
                    {moment.unix(task.reminderDate).fromNow()}
                  </span>
                ))}
              <span className="text-xs p-1 rounded">{task.userId}</span>
            </div>
          </div>
        );
      })}
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
