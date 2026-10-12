
import React, { useMemo } from "react";
import "./StudyAnalytics.css";

const NOTES_KEY = "studytools-notes";
const PLANNER_KEY = "studytools-planner";
const ANALYTICS_KEY = "studytools-analytics";

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.warn("StudyAnalytics: Could not read saved data.", error);
    return [];
  }
}

function dayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function validSession(session) {
  if (!session || typeof session !== "object") {
    return false;
  }

  const date = new Date(session.completedAt);

  return (
    Number.isFinite(date.getTime()) &&
    Number.isFinite(Number(session.durationMinutes)) &&
    Number(session.durationMinutes) > 0
  );
}

export default function StudyAnalytics() {
  const notes = readArray(NOTES_KEY);
  const tasks = readArray(PLANNER_KEY);
  const sessions = readArray(ANALYTICS_KEY).filter(validSession);

  const analytics = useMemo(() => {
    const today = new Date();
    const todayKey = dayKey(today);

    const minutesForDay = (key) =>
      sessions
        .filter(
          (session) =>
            dayKey(new Date(session.completedAt)) === key
        )
        .reduce(
          (total, session) =>
            total + Number(session.durationMinutes),
          0
        );

    const todayMinutes = minutesForDay(todayKey);

    const weeklyData = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));

      return {
        key: dayKey(date),
        label: date.toLocaleDateString(undefined, {
          weekday: "short",
        }),
        minutes: minutesForDay(dayKey(date)),
      };
    });

    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);

    const weeklySessions = sessions.filter((session) => {
      const date = new Date(session.completedAt);
      return date >= weekStart && date <= new Date();
    });

    const weeklyMinutes = weeklySessions.reduce(
      (total, session) =>
        total + Number(session.durationMinutes),
      0
    );

    const totalMinutes = sessions.reduce(
      (total, session) =>
        total + Number(session.durationMinutes),
      0
    );

    return {
      todayMinutes,
      weeklyMinutes,
      totalMinutes,
      totalSessions: sessions.length,
      weeklySessions: weeklySessions.length,
      weeklyData,
      maxDailyMinutes: Math.max(
        25,
        ...weeklyData.map((day) => day.minutes)
      ),
    };
  }, [sessions]);

  const completedTasks = tasks.filter(
    (task) => task && task.completed
  ).length;

  return (
    <section className="premium-analytics">
      <div className="analytics-title">
        <div>
          <span className="analytics-eyebrow">
            PREMIUM FEATURE
          </span>
          <h2>Study Analytics</h2>
          <p>Understand your focus habits and progress.</p>
        </div>
        <span className="analytics-title-icon" aria-hidden="true">
          📈
        </span>
      </div>

      <div className="analytics-metrics">
        <article className="analytics-metric">
          <span>Today</span>
          <strong>{analytics.todayMinutes}</strong>
          <small>focus minutes</small>
        </article>

        <article className="analytics-metric">
          <span>Last 7 days</span>
          <strong>{analytics.weeklyMinutes}</strong>
          <small>focus minutes</small>
        </article>

        <article className="analytics-metric">
          <span>Sessions</span>
          <strong>{analytics.totalSessions}</strong>
          <small>completed in total</small>
        </article>

        <article className="analytics-metric">
          <span>Notes</span>
          <strong>{notes.length}</strong>
          <small>saved notes</small>
        </article>
      </div>

      <div className="analytics-chart-section">
        <div className="analytics-chart-heading">
          <div>
            <h3>Last 7 days</h3>
            <p>Minutes from completed timer sessions</p>
          </div>
          <strong>{analytics.weeklySessions} sessions</strong>
        </div>

        <div
          className="analytics-chart"
          role="img"
          aria-label="Bar chart of daily study minutes for the last seven days"
        >
          {analytics.weeklyData.map((day) => {
            const barHeight =
              day.minutes > 0
                ? Math.max(
                    6,
                    (day.minutes / analytics.maxDailyMinutes) * 100
                  )
                : 0;

            return (
              <div className="analytics-chart-day" key={day.key}>
                <span className="analytics-chart-value">
                  {day.minutes}
                </span>

                <div className="analytics-chart-track">
                  <div
                    className="analytics-chart-bar"
                    style={{ height: `${barHeight}%` }}
                  />
                </div>

                <span className="analytics-chart-label">
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="analytics-summary">
        <div>
          <span className="analytics-summary-icon">✅</span>
          <div>
            <strong>Planner progress</strong>
            <p>
              {completedTasks} of {tasks.length} tasks completed
            </p>
          </div>
        </div>

        <div>
          <span className="analytics-summary-icon">⏱️</span>
          <div>
            <strong>Total recorded focus</strong>
            <p>
              {Math.floor(analytics.totalMinutes / 60)} hours{" "}
              {analytics.totalMinutes % 60} minutes
            </p>
          </div>
        </div>
      </div>

      <p className="analytics-note">
        Focus statistics count full 25-minute timer sessions completed
        after this feature is installed. Older sessions cannot be
        reconstructed automatically.
      </p>
    </section>
  );
}
