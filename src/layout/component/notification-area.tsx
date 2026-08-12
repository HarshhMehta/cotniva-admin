"use client";
import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Notification } from "@/svg";
import { apiSlice } from "@/redux/api/apiSlice";
import {
  bindOrderAlertUnlock,
  isOrderAlertUnlocked,
  playOrderAlertSound,
  startUrgentAlertLoop,
  stopUrgentAlertLoop,
  unlockOrderAlertSound,
} from "@/utils/order-alert-sound";
import {
  AdminNotification,
  NotificationType,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/redux/notification/notificationApi";

dayjs.extend(relativeTime);

const POLL_MS = 4000;

type IPropType = {
  nRef: React.RefObject<HTMLDivElement>;
  notificationOpen: boolean;
  handleNotificationOpen: () => void;
};

const typeIcon = (type: NotificationType) => {
  const map: Record<NotificationType, { bg: string; label: string }> = {
    new_order: { bg: "bg-[#4a1f1a]", label: "O" },
    payment_success: { bg: "bg-emerald-600", label: "₹" },
    payment_failed: { bg: "bg-rose-600", label: "!" },
    cod_order: { bg: "bg-sky-600", label: "C" },
    order_cancelled: { bg: "bg-slate-500", label: "×" },
    return_request: { bg: "bg-amber-600", label: "R" },
    low_stock: { bg: "bg-orange-500", label: "S" },
  };
  return map[type] || map.new_order;
};

const NotificationArea = ({
  nRef,
  notificationOpen,
  handleNotificationOpen,
}: IPropType) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: listRes, refetch: refetchList } = useGetNotificationsQuery(
    { limit: 20 },
    {
      pollingInterval: POLL_MS,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    }
  );
  const { data: countRes, refetch: refetchCount } =
    useGetUnreadNotificationCountQuery(undefined, {
      pollingInterval: POLL_MS,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
    });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll] = useMarkAllNotificationsReadMutation();

  const items = listRes?.data || [];
  const unread = countRes?.unreadCount ?? listRes?.meta?.unreadCount ?? 0;

  const prevUnread = useRef<number | null>(null);
  const [ringing, setRinging] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const panelOpenRef = useRef(notificationOpen);

  useEffect(() => {
    panelOpenRef.current = notificationOpen;
  }, [notificationOpen]);

  useEffect(() => {
    setSoundOn(isOrderAlertUnlocked());
    const unbind = bindOrderAlertUnlock();
    return () => {
      unbind();
      stopUrgentAlertLoop();
    };
  }, []);

  // Open panel → stop looping urgent alert
  useEffect(() => {
    if (notificationOpen) {
      stopUrgentAlertLoop();
      setRinging(false);
    }
  }, [notificationOpen]);

  // New unread → loop urgent until panel opened
  useEffect(() => {
    if (prevUnread.current === null) {
      prevUnread.current = unread;
      return;
    }
    if (unread > prevUnread.current) {
      setSoundOn(true);
      setRinging(true);
      if (!panelOpenRef.current) {
        startUrgentAlertLoop();
      }
      dispatch(
        apiSlice.util.invalidateTags([
          "AllOrders",
          "DashboardRecentOrders",
          "DashboardAmount",
          "Notifications",
        ])
      );
      refetchList();
      refetchCount();
      prevUnread.current = unread;
      return;
    }
    prevUnread.current = unread;
  }, [unread, dispatch, refetchList, refetchCount]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      refetchList();
      refetchCount();
      dispatch(
        apiSlice.util.invalidateTags(["AllOrders", "DashboardRecentOrders"])
      );
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [dispatch, refetchList, refetchCount]);

  const openPanel = () => {
    unlockOrderAlertSound();
    stopUrgentAlertLoop();
    setRinging(false);
    setSoundOn(true);
    handleNotificationOpen();
  };

  const enableAndTestSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockOrderAlertSound();
    playOrderAlertSound();
    setSoundOn(true);
  };

  const openNotification = async (n: AdminNotification) => {
    unlockOrderAlertSound();
    stopUrgentAlertLoop();
    if (!n.isRead) {
      try {
        await markRead(n._id).unwrap();
      } catch {
        /* ignore */
      }
    }
    if (notificationOpen) {
      // already open — just navigate
    } else {
      handleNotificationOpen();
    }
    if (n.relatedOrderId) {
      router.push(`/orders?order=${n.relatedOrderId}`);
    }
  };

  return (
    <div ref={nRef}>
      <style>{`
        @keyframes cot-bell-ring {
          0% { transform: rotate(0); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-12deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-8deg); }
          75% { transform: rotate(4deg); }
          100% { transform: rotate(0); }
        }
        .cot-bell-ringing {
          animation: cot-bell-ring 0.7s ease-in-out infinite;
          transform-origin: top center;
        }
        .cot-bell-pulse {
          animation: pulse 1s ease-out infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.55); }
          70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
      `}</style>
      <button
        type="button"
        onClick={openPanel}
        className={`relative w-[40px] h-[40px] leading-[40px] rounded-md text-gray border border-gray hover:bg-themeLight hover:text-theme hover:border-themeLight ${
          ringing && !notificationOpen
            ? "cot-bell-pulse border-danger text-theme"
            : ""
        }`}
        aria-label="Notifications"
      >
        <span
          className={`inline-flex ${
            ringing && !notificationOpen ? "cot-bell-ringing" : ""
          }`}
        >
          <Notification />
        </span>
        {unread > 0 && (
          <span className="min-w-[20px] h-[20px] px-1 inline-flex items-center justify-center bg-danger rounded-full absolute -top-[4px] -right-[4px] border-[2px] border-white text-[10px] leading-none font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {notificationOpen && (
        <div className="absolute w-[320px] sm:w-[380px] max-h-[min(70vh,480px)] top-full -right-[60px] sm:right-0 shadow-lg rounded-xl bg-white border border-slate-200/80 overflow-hidden z-50 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
            <div>
              <h5 className="text-sm font-semibold text-slate-900 m-0">
                Notifications
              </h5>
              <p className="text-[11px] text-slate-500 m-0 mt-0.5">
                {unread > 0 ? `${unread} unread` : "You're all caught up"}
                {soundOn ? " · Urgent alert" : " · Click Enable sound once"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={enableAndTestSound}
                className="text-[11px] font-semibold text-[#4a1f1a] hover:underline"
              >
                {soundOn ? "Test" : "Enable sound"}
              </button>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAll()}
                  className="text-[11px] font-semibold text-slate-500 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {items.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                No notifications yet
              </div>
            )}
            {items.map((item) => {
              const icon = typeIcon(item.type);
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => openNotification(item)}
                  className={`w-full text-left px-4 py-3 flex gap-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${
                    !item.isRead ? "bg-[#4a1f1a]/[0.03]" : ""
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-lg ${icon.bg} text-white text-xs font-bold flex items-center justify-center shrink-0`}
                  >
                    {icon.label}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 leading-snug">
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#4a1f1a] shrink-0 mt-1.5" />
                      )}
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {item.message}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-1">
                      {dayjs(item.createdAt).fromNow()}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationArea;
