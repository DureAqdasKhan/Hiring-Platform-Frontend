import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllApplications } from "../api/job";
import { useAuth } from "../context/AuthContext";

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function AllApplications() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const isHiringManager = user?.role === "hiring_manager";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const data = await fetchAllApplications();
        console.log(data);
        if (!cancelled) setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!cancelled) setErr(error?.response?.data?.detail || "Failed to load applications.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasData = useMemo(() => applications && applications.length > 0, [applications]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Applications</h1>
            <p className="mt-1 text-sm text-gray-600">
              {isHiringManager
                ? "All applications across your posted jobs."
                : "Your submitted job applications."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        {err && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {loading && <div className="p-4 text-sm text-gray-600">Loading applications…</div>}

        {!loading && !hasData && !err && (
          <div className="rounded-2xl border p-6 text-sm text-gray-700">
            No applications found.
          </div>
        )}

        {!loading && hasData && (
          <div className="overflow-x-auto rounded-2xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{app.full_name || "Unknown"}</div>
                      <div className="text-xs text-gray-600">{app.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{app.job_title || app.job?.title || "Job"}</div>
                      {app.job && app.job.location && (
                        <div className="text-xs text-gray-600">{app.job.location}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize">{app.status || "pending"}</td>
                    <td className="px-4 py-3 text-gray-700">{formatDate(app.submitted_at)}</td>
                    <td className="px-4 py-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          // Match ApplicationDetails styling; prefer cv_download_url but allow common fallbacks
                          const cvUrl =
                            app.cv_download_url ||
                            app.cv_url ||
                            app.resume_download_url ||
                            app.resume_url ||
                            app.cv;

                          return cvUrl ? (
                            <a
                              className="inline-flex items-center rounded-xl bg-black px-4 py-2 text-xs font-medium text-white hover:opacity-90"
                              href={cvUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Download CV
                            </a>
                          ) : null;
                        })()}

                        {(() => {
                          // Cover letter is optional; show button when present
                          const coverLetterUrl = app.cover_letter_url;
                          const coverLetterText = app.cover_letter_text || app.cover_letter;

                          if (coverLetterUrl) {
                            return (
                              <a
                                className="inline-flex items-center rounded-xl border px-4 py-2 text-xs font-medium hover:bg-gray-50"
                                href={coverLetterUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Download Cover Letter
                              </a>
                            );
                          }

                          if (coverLetterText) {
                            return (
                              <a
                                className="inline-flex items-center rounded-xl border px-4 py-2 text-xs font-medium hover:bg-gray-50"
                                href={`data:text/plain;charset=utf-8,${encodeURIComponent(coverLetterText)}`}
                                download={`cover-letter-${app.id}.txt`}
                              >
                                Download Cover Letter
                              </a>
                            );
                          }

                          return null;
                        })()}

                        {!((app.cv_download_url || app.cv_url || app.resume_download_url || app.resume_url || app.cv) || (app.cover_letter_url || app.cover_letter_text || app.cover_letter)) && (
                          <span className="text-xs text-gray-500">–</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
