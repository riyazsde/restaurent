import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../common/Loader";
import { useNotifications } from "../../hooks/queries/useNotifications";

function formatTime(dateStr) {
  const date = new Date(dateStr);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}

function getNotificationGroup(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const isToday =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate();
  if (isToday) return "Today";

  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diffDays = Math.round(
    (startOfNow.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  if (diffDays >= 7 && diffDays < 30) return "a week ago";
  if (diffDays >= 30) return "a month ago";
  return null;
}

function groupNotifications(notifications) {
  const groups = {};
  notifications.forEach((notif) => {
    const group = getNotificationGroup(notif.createdAt);
    if (!group) return;
    if (!groups[group]) groups[group] = [];
    groups[group].push(notif);
  });
  
  const order = [
    "Today",
    "Yesterday",
    ...Object.keys(groups)
      .filter((g) => /\d+ days ago/.test(g))
      .sort((a, b) => parseInt(a) - parseInt(b)),
    "a week ago",
    "a month ago",
  ];
  
  return order
    .filter((g) => groups[g])
    .map((g) => ({ group: g, notifications: groups[g] }));
}

const NotificationList = () => {
  const navigate = useNavigate();
  const [isMobile] = useState(window.innerWidth <= 640);
  const { data: notifications = [], isLoading } = useNotifications();
  const [readIds, setReadIds] = useState(new Set());

  const markAsRead = (id) => {
    setReadIds(prev => new Set(prev).add(id));
  };

  const onBack = () => {
    navigate(-1);
  };

  const displayNotifications = notifications.map(n => ({
    ...n,
    isRead: readIds.has(n.id)
  }));

  const grouped = groupNotifications(displayNotifications);

  return (
    <div
      className={`${
        isMobile ? "bg-white min-h-screen" : "p-8 min-h-screen bg-white"
      }`}
    >
      {isMobile ? (
        <div
          className="relative w-full h-20"
          style={{
            background: "linear-gradient(90deg, #D32F2F 0%, #6A1B9A 100%)",
          }}
        >
          <div className="flex items-center justify-between px-4 pt-6">
            <div className="flex gap-4">
              <button className="text-white text-2xl" onClick={onBack}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-white text-2xl font-bold text-left">
                Notifications
              </span>
            </div>
          </div>
        </div>
      ) : (
        <h1 className="text-2xl font-bold mb-8">Notifications</h1>
      )}
      
      <div
        className={
          isMobile ? "flex flex-col gap-2 p-4 pt-2 pb-4" : "flex flex-col gap-6"
        }
      >
        {isLoading ? (
          <Loader text="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No notifications found
          </div>
        ) : (
          grouped.map(({ group, notifications }) => (
          <div key={group}>
            <div className="text-lg font-bold text-gray-800 mt-6 mb-2">
              {group}
            </div>
            {notifications.map((notif) => {
              const timeLabel =
                group === "Today" ? formatTime(notif.createdAt) : group;
              return (
                <div
                  key={notif.id}
                  className={
                    isMobile
                      ? "flex items-start gap-3 rounded-lg shadow py-2 px-1 cursor-pointer"
                      : "flex items-start gap-4 bg-white rounded-xl shadow-md px-6 py-4 cursor-pointer hover:shadow-lg transition-all"
                  }
                  style={{ opacity: notif.isRead ? 0.6 : 1 }}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div
                    className={
                      isMobile
                        ? "w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold mt-1"
                        : "w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold mt-1"
                    }
                  >
                    {notif.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={
                        isMobile
                          ? "flex items-center gap-2 text-sm"
                          : "flex flex-wrap items-center gap-2 text-base"
                      }
                    >
                      <span className="font-semibold text-black">
                        {notif.title}
                      </span>
                    </div>
                    <div
                      className={
                        isMobile ? "text-xs text-gray-600" : "text-gray-600"
                      }
                    >
                      {notif.message}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {timeLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;
