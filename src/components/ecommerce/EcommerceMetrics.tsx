"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, DocumentTextIcon, TaskIcon, CalenderIcon } from "@/icons";
import { getSPKs } from "@/services/spk";
import { getWorkItems } from "@/services/workItem";
import { getDailyActivitiesByUser } from "@/services/dailyActivity";
import { useAuth } from "@/context/AuthContext";

export const EcommerceMetrics = () => {
  const { token, user } = useAuth();
  const [spkCount, setSpkCount] = useState(0);
  const [workItemCount, setWorkItemCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user?.id) return;
      
      try {
        setLoading(true);
        const [spks, workItems, dailyActivities] = await Promise.all([
          getSPKs(token),
          getWorkItems(token),
          getDailyActivitiesByUser(user.id, token)
        ]);
        
        setSpkCount(spks.length);
        setWorkItemCount(workItems.length);
        setReportCount(dailyActivities.length);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?.id]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <DocumentTextIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total SPK
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : spkCount}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            8.2%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <TaskIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Work Item
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : workItemCount}
            </h4>
          </div>

          <Badge color="success">
            <ArrowUpIcon />
            12.5%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <CalenderIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Laporan
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : reportCount}
            </h4>
          </div>

          <Badge color="success">
            <ArrowUpIcon />
            15.3%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
