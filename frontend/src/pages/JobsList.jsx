import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAllJobs } from "../api/job";
import { useAuth } from "../context/AuthContext";
import HiringManagerChat from "./HiringManagerChat";

function formatSalary(salary) {
  if (!salary) return null;
  return salary; // backend salary is string
}

function formatDate(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const navigate = useNavigate();
  const { onLogout, user } = useAuth();

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await fetchAllJobs();
      const list = Array.isArray(data) ? data : data?.jobs || [];
      setJobs(list);
    } catch (error) {
      setErr(error?.response?.data?.detail || "Failed to load jobs. Are you logged in?");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    onLogout();
    navigate("/login");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const hasJobs = useMemo(() => jobs && jobs.length > 0, [jobs]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Jobs</h1>
            <p className="mt-1 text-sm text-gray-600">
              {user?.role === "hiring_manager"
                ? "These are the jobs you’ve posted as a hiring manager."
                : "Browse open roles and apply to ones that fit you."}
            </p>
          </div>

          <div className="flex gap-2">
            {user?.role === "hiring_manager" && (
              <Link className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50" to="/jobs/post">
                Post Job
              </Link>
            )}

            <Link
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              to="/applications"
            >
              Applications
            </Link>

            {user?.role === "hiring_manager" && (
              <button
                onClick={() => setChatOpen(true)}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
                type="button"
              >
                💬 Chat
              </button>
            )}

            <button
              onClick={load}
              className="rounded-xl bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
              disabled={loading}
              type="button"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              type="button"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {err}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border p-5">
                <div className="h-5 w-2/3 rounded bg-gray-100" />
                <div className="mt-3 h-4 w-1/2 rounded bg-gray-100" />
                <div className="mt-6 h-10 w-full rounded bg-gray-100" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !err && !hasJobs && (
          <div className="mt-6 rounded-2xl border p-6">
            <h2 className="text-base font-semibold">No jobs yet</h2>
            <p className="mt-1 text-sm text-gray-600">
              {user?.role === "hiring_manager"
                ? "Post your first job to start receiving applications."
                : "No jobs available right now. Check back later."}
            </p>
            {user?.role === "hiring_manager" && (
              <div className="mt-4">
                <Link className="inline-flex rounded-xl bg-black px-4 py-2 text-sm text-white" to="/jobs/post">
                  Post a job
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Jobs grid */}
        {!loading && !err && hasJobs && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {jobs.map((job) => {
              const salaryText = formatSalary(job.salary);
              const dateText = formatDate(job.posted_at || job.postedAt);

              return (
                <div key={job.id} className="rounded-2xl border p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{job.location}</p>
                    </div>

                    <span className="rounded-full border px-3 py-1 text-xs text-gray-700">
                      ID: {String(job.id).slice(0, 8)}
                    </span>
                  </div>

                  {user?.role === "applicant" && job.has_applied ? (
                    <p className="mt-3 text-sm text-gray-600 italic">You have already applied to this job.</p>
                  ) : (
                    <p className="mt-3 line-clamp-3 text-sm text-gray-700">{job.description}</p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    {salaryText && (
                      <span className="rounded-full bg-gray-50 px-3 py-1 border">Salary: {salaryText}</span>
                    )}
                    {dateText && (
                      <span className="rounded-full bg-gray-50 px-3 py-1 border">Posted: {dateText}</span>
                    )}
                  </div>

                  <div className="mt-5 flex gap-2">
                    {user?.role === "hiring_manager" ? (
                      <>
                        <Link
                          to={`/jobs/${job.id}/applications`}
                          className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                        >
                          View Applications
                        </Link>
                        <button
                          type="button"
                          className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
                          onClick={() => navigator.clipboard.writeText(String(job.id))}
                        >
                          Copy Job ID
                        </button>
                      </>
                    ) : job.has_applied ? (
                      <Link
                        className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
                        to={`/jobs/${job.id}/application`}
                      >
                        View application
                      </Link>
                    ) : (
                      <Link className="rounded-xl bg-black px-4 py-2 text-sm text-white" to={`/jobs/${job.id}`}>
                        View / Apply
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <HiringManagerChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </div>
  );
}
