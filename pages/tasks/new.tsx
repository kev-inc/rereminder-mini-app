import clientPromise from "@/lib/mongodb";
import { Task } from "@/models/tasks";
import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const NewTask: React.FC = () => {
  const dateNow = moment().format("YYYY-MM-DD");
  const timeNow = moment().format("HH:mm");

  const [showDTPicker, setShowDTPicker] = useState(false);
  const [viewer, setViewer] = useState({
    userId: null,
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: dateNow,
    time: timeNow,
    interval: "once",
  });
  const router = useRouter();
  useEffect(() => {
    // @ts-ignore
    if (window.Telegram.WebApp) {
      // @ts-ignore
      window.Telegram.WebApp.BackButton.onClick(() => router.back()); // @ts-ignore
      window.Telegram.WebApp.BackButton.show(); // @ts-ignore
      window.Telegram.WebApp.MainButton.setText("SAVE"); // @ts-ignore
      window.Telegram.WebApp.MainButton.show(); // @ts-ignore
      window.Telegram.WebApp.MainButton.enable(); // @ts-ignore
      window.Telegram.WebApp.MainButton.onClick(() => handleSubmit());
      setViewer({
        // @ts-ignore
        userId: window.Telegram.WebApp.initDataUnsafe.user.id,
      });
    }
    return () => {
      // @ts-ignore
      window.Telegram.WebApp.BackButton.hide(); // @ts-ignore
      window.Telegram.WebApp.MainButton.hide();
    };
  }, []);

  const postNewTask = async (task: Task) => {
    const resp = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    return resp.status;
  };
  const handleSubmit = async () => {
    const task: Task = {
      title: formData.title,
      description: formData.description,
      chatId: 0,
      userId: viewer.userId || 0,
      status: "ACTIVE",
    };
    if (task.title == "") {
      // @ts-ignore
      window.Telegram.WebApp.showAlert("Please enter the task title!");
      return;
    }
    if (showDTPicker) {
      const reminderDT = moment(
        `${formData.date} ${formData.time}`,
        "YYYY-MM-DD HH:mm"
      ).utcOffset(8);
      task.reminderDate = reminderDT.unix();
      task.repeatInterval = formData.interval;
    }
    const res = await postNewTask(task);
    if (res == 201) {
      router.push("/tasks");
    } else {
      // @ts-ignore
      window.Telegram.WebApp.showAlert("Error creating task");
    }
  };

  return (
    <form className="tg-text-color" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-y-4 p-2">
        <div>
          <label className="block mb-2 text-sm font-medium">Title</label>
          <input
            type="text"
            className="block w-full p-2.5 tg-secondary-bg-color"
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
            className="block w-full p-2.5 tg-secondary-bg-color"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
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
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="block w-full p-2.5 tg-secondary-bg-color"
              />
              <div className="flex">
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
                  }
                  className="block w-full p-2.5 tg-secondary-bg-color"
                />
                <select
                  name="tz"
                  className="block w-full p-2.5 tg-secondary-bg-color"
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
            <select
              name="interval"
              className="block w-full p-2.5 tg-secondary-bg-color"
              value={formData.interval}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, interval: e.target.value }))
              }
            >
              <option value="once">Once</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}
        <pre>{JSON.stringify(formData)}</pre>

        <div>
          <input
            type="submit"
            value="Save"
            className="bg-blue-500 text-gray-50 p-2 cursor-pointer hover:bg-blue-600 active:bg-blue-700"
          />
        </div>
      </div>
    </form>
  );
};

export default NewTask;
