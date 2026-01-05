import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchApplicationsForJob, fetchJobById } from "../api/job";

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function loadApplications() {
    setErr("");
    setLoading(true);
    try {
      const [appsData, jobData] = await Promise.all([
        fetchApplicationsForJob(jobId),
        fetchJobById(jobId),
      ]);
      setApplications(Array.isArray(appsData) ? appsData : []);
      setJob(jobData);
    } catch (error) {
      setErr(
        error?.response?.data?.detail ||
          "Failed to load applications. Make sure you have permission."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/jobs")}
            className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            ← Back to Jobs
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                Applications for {job?.title || `Job #${jobId}`}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {applications.length} application{applications.length !== 1 ? "s" : ""} received
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="mb-4 p-4 text-sm text-red-800 bg-red-100 border border-red-300 rounded-lg">
            {err}
          </div>
        )}

        {/* Applications Table */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <p className="text-gray-500">No applications yet for this job.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CV
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{app.full_name}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{app.email}</div>
                        {app.phone && (
                          <div className="text-sm text-gray-500">{app.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(app.submitted_at)}
                      </td>
                      <td className="px-4 py-4">
                        {app.cv_download_url ? (
                          <a
                            href={app.cv_download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            Download CV
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">No CV</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cover Letters Section */}
        {applications.some((app) => app.cover_letter) && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Cover Letters</h2>
            <div className="space-y-4">
              {applications
                .filter((app) => app.cover_letter)
                .map((app) => (
                  <div key={app.id} className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{app.full_name}</h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {app.cover_letter}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
