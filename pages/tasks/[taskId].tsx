import { Task, getOneTask } from "@/models/tasks";
import { parseDT, parseMmt, parseNow, parseUnix } from "@/utils/utils";
import moment from "moment";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface TaskProps {
  task: Task;
}

const TaskDetail: React.FC<TaskProps> = ({ task }) => {
  const router = useRouter();
  const { date: dateNow, time: timeNow } = parseNow();
  const { date: reminderDate, time: reminderTime } = parseUnix(
    task.reminderDate
  );

  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    date: reminderDate || dateNow,
    time: reminderTime || timeNow,
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
      WebApp?.MainButton.setText("SAVE");
      WebApp?.MainButton.show();
      WebApp?.MainButton.enable();
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
    const handler = () => handleEdit(formData);
    WebApp?.MainButton.onClick(handler);
    return () => WebApp?.MainButton.offClick(handler);
  }, [formData, setFormData, showDTPicker, setShowDTPicker, viewer, setViewer]);

  const putNewTask = async (newTask: Task) => {
    const resp = await fetch("/api/tasks/" + task._id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    return resp.status;
  };

  const handleEdit = async (data: any) => {
    const { WebApp } = (window as any).Telegram;
    const task: Task = {
      title: data.title,
      description: data.description,
      chatId: 0,
      userId: viewer.userId || 0,
      status: "ACTIVE",
    };
    if (data.title == "") {
      WebApp?.showAlert("Please enter the task title!");
      return;
    }
    if (showDTPicker) {
      const { unix: reminderUnix } = parseDT(data.date, data.time);
      task.reminderDate = reminderUnix;
      task.repeatInterval = data.interval;
    }
    const res = await putNewTask(task);
    if (res == 201) {
      router.push("/tasks");
    } else {
      WebApp?.showAlert("Error updating task");
    }
  };

  const handleDelete = async () => {
    const { WebApp } = (window as any).Telegram;
    WebApp?.showPopup(
      {
        title: "Delete task?",
        message: `Are you sure you want to delete '${formData.title}'?`,
        buttons: [
          { id: "delete", type: "destructive", text: "Yes, delete" },
          { type: "cancel" },
        ],
      },
      async (btn: string) => {
        if (btn == "delete") {
          const resp = await fetch("/api/tasks/" + task._id, {
            method: "DELETE",
          });
          if (resp.status == 201) {
            router.push("/tasks");
          } else {
            WebApp?.showAlert("Error deleting task");
          }
        }
      }
    );
  };

  const snoozeTask = (snoozeBy: string) => {
    const now = parseNow();
    if (snoozeBy == "tonight") {
      const tonight = now.mmt.hour(22).minute(0).second(0).millisecond(0);
      const { date, time } = parseMmt(tonight);
      setFormData((prev) => ({ ...prev, date, time }));
      return;
    } else if (snoozeBy == "morning") {
      const morning = now.mmt
        .add(1, "days")
        .hour(8)
        .minute(0)
        .second(0)
        .millisecond(0);
      const { date, time } = parseMmt(morning);
      setFormData((prev) => ({ ...prev, date, time }));
      return;
    }

    const { mmt: reminderMmt } = parseDT(formData.date, formData.time);

    if (snoozeBy == "day") {
      reminderMmt.add(1, "days");
    } else if (snoozeBy == "week") {
      reminderMmt.add(1, "weeks");
    } else if (snoozeBy == "month") {
      reminderMmt.add(1, "months");
    }
    const { date, time } = parseMmt(reminderMmt);
    setFormData((prev) => ({ ...prev, date, time }));
  };

  return (
    <form
      className="tg-text-color tg-bg-color"
      onSubmit={(e) => e.preventDefault()}
    >
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
                onChange={() => setShowDTPicker((prev) => !prev)}
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
                  value={formData.date ? formData.date : ""}
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
                  value={formData.time ? formData.time : ""}
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
              Reminder Interval
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

        {showDTPicker && (
          <div>
            <label className="block mb-2 text-sm font-medium">
              Snooze Reminder
            </label>
            <div className="flex tg-secondary-bg-color text-xs justify-around rounded-lg py-3 mb-2">
              <div
                className="active:opacity-70 cursor-pointer"
                onClick={() => snoozeTask("tonight")}
              >
                10pm
              </div>
              <div
                className="active:opacity-70 cursor-pointer"
                onClick={() => snoozeTask("morning")}
              >
                Next 8am
              </div>
              <div
                className="active:opacity-70 cursor-pointer"
                onClick={() => snoozeTask("day")}
              >
                1 day
              </div>
              <div
                className="active:opacity-70 cursor-pointer"
                onClick={() => snoozeTask("week")}
              >
                1 week
              </div>
              <div
                className="active:opacity-70 cursor-pointer"
                onClick={() => snoozeTask("month")}
              >
                1 month
              </div>
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
