import React, { useEffect, useState } from "react";
import { useWorkflow } from "@/context/WorkflowContext";
import { User, Activity, Clock } from "lucide-react";

const MEMBERS = ["Misaki", "Hsin", "瑞鐘", "Will", "Jasmine"];

export const UserSelectorModal = () => {
  const { currentUser, setCurrentUser } = useWorkflow();

  if (currentUser) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0b1120] border border-[#1e293b] p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <User className="text-indigo-400" />
          請選擇您的身份
        </h2>
        <p className="text-sm text-stone-400 mb-6">
          為了記錄團隊協作軌跡，請先選擇您在系統中的身份：
        </p>
        <div className="flex flex-col gap-3">
          {MEMBERS.map((member) => (
            <button
              key={member}
              onClick={() => setCurrentUser(member)}
              className="w-full text-left px-4 py-3 rounded-lg bg-[#1e293b]/50 hover:bg-indigo-600/20 hover:border-indigo-500 border border-transparent transition-all text-stone-200 font-medium"
            >
              {member}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ActivityFeed = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch("/api/notion/get-activities");
        const data = await res.json();
        if (data.activities) {
          setActivities(data.activities);
        }
      } catch (error) {
        console.error("Failed to fetch activities", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0b1120] border border-[#1e293b] rounded-2xl p-6 shadow-xl mb-8">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="text-emerald-400" />
        團隊即時動態 (System Log)
      </h3>
      
      {loading ? (
        <div className="text-stone-500 text-sm animate-pulse">載入中...</div>
      ) : activities.length === 0 ? (
        <div className="text-stone-500 text-sm">尚無動態紀錄。</div>
      ) : (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {activities.map((act) => {
            const date = new Date(act.createdAt);
            const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            return (
              <div key={act.id} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center border border-stone-800">
                  <Clock size={14} className="text-stone-400" />
                </div>
                <div>
                  <div className="text-stone-300 text-sm">{act.message}</div>
                  <div className="text-xs text-stone-600 mt-1">{date.toLocaleDateString()} {timeStr}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
