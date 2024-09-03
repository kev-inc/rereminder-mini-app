import { Task, getOneTask } from "@/models/tasks";
import moment from "moment";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface TaskProps {
  task: Task;
}

const TaskDetail: React.FC<TaskProps> = ({ task }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    date:
      task.reminderDate &&
      moment.unix(task.reminderDate).utcOffset(8).format("YYYY-MM-DD"),
    time:
      task.reminderDate &&
      moment.unix(task.reminderDate).utcOffset(8).format("HH:mm"),
    interval: task.repeatInterval,
  });
  const [showDTPicker, setShowDTPicker] = useState(task.reminderDate != null);
  const [viewer, setViewer] = useState({
    userId: null,
  });

  useEffect(() => {
    const { WebApp } = (window as any).Telegram;
    if (WebApp) {
      WebApp?.BackButton.onClick(() => router.replace("/tasks"));
      WebApp?.BackButton.show();
      //   WebApp?.MainButton.setText("SAVE");
      //   WebApp?.MainButton.show();
      //   WebApp?.MainButton.enable();
      setViewer({
        userId: WebApp?.initDataUnsafe?.user?.id,
      });
    }
    return () => {
      WebApp?.BackButton.hide();
      WebApp?.MainButton.hide();
    };
  }, []);

  useEffect(() => {
    const { WebApp } = (window as any).Telegram;
    if (isFormModified()) {
      WebApp?.MainButton.setText("Save changes");
      WebApp?.MainButton.show();
      WebApp?.MainButton.enable();
    } else {
      WebApp?.MainButton.hide();
    }
  }, [formData, setFormData]);

  const isFormModified = () => {
    return (
      formData.title !== task.title ||
      formData.description !== task.description ||
      formData.interval !== task.repeatInterval
      // add date and time checks here
    );
  };

  const handleDelete = async () => {
    const { WebApp } = (window as any).Telegram;

    const resp = await fetch("/api/tasks/" + task._id, {
      method: "DELETE",
    });
    if (resp.status == 201) {
      router.push("/tasks");
    } else {
      WebApp?.showAlert("Error deleting task");
    }
  };

  return (
    <form className="tg-text-color" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-y-4 p-2.5">
        <div>
          <label className="block mb-2 text-sm font-medium">Title</label>
          <input
            type="text"
            className="block w-full p-2.5 tg-secondary-bg-color rounded-lg"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Description</label>
          <textarea
            rows={5}
            className="block w-full p-2.5 tg-secondary-bg-color rounded-lg"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <div className="flex mb-2">
            <label className="flex-1 block text-sm font-medium">
              Reminder Date & Time
            </label>
            <label>
              <input
                type="checkbox"
                checked={showDTPicker}
                onClick={() => setShowDTPicker((prev) => !prev)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {showDTPicker && (
            <>
              <div className="flex tg-secondary-bg-color rounded-lg py-2 mb-2">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="block flex-1 p-2.5 tg-secondary-bg-color rounded-lg"
                  suppressHydrationWarning
                />
              </div>
              <div className="flex tg-secondary-bg-color rounded-lg py-2 mb-2">
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
                  }
                  className="block flex-1 p-2.5 tg-secondary-bg-color"
                  suppressHydrationWarning
                />
                <select
                  name="tz"
                  className="block flex-1 p-2.5 tg-secondary-bg-color"
                >
                  <option>+08:00</option>
                </select>
              </div>
            </>
          )}
        </div>

        {showDTPicker && (
          <div>
            <label className="block mb-2 text-sm font-medium">
              Rereminder Interval
            </label>
            <div className="flex tg-secondary-bg-color rounded-lg py-2 mb-2">
              <select
                name="interval"
                className="block w-full p-2.5 tg-secondary-bg-color"
                value={formData.interval}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    interval: e.target.value,
                  }))
                }
              >
                <option value="once">Once</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex flex-col">
          <button
            className="p-2 tg-secondary-bg-color tg-destructive-text-color rounded-lg active:opacity-70"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </form>
  );
};

export default TaskDetail;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { taskId } = context.params as any;
  const task = await getOneTask(taskId);
  return { props: { task: JSON.parse(JSON.stringify(task)) } };
};
