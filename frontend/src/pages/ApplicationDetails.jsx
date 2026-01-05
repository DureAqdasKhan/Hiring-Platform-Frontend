import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchJobById, fetchMyApplication } from "../api/job";
import { useAuth } from "../context/AuthContext";

export default function ApplicationDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [jobErr, setJobErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [myApplication, setMyApplication] = useState(null);
  const [appLoading, setAppLoading] = useState(false);
  const [appErr, setAppErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setJobErr("");
      setAppErr("");

      try {
        const j = await fetchJobById(jobId);
        if (!cancelled) setJob(j);

        setAppLoading(true);
        const app = await fetchMyApplication(jobId);
        if (!cancelled) setMyApplication(app);
      } catch (e) {
        if (!cancelled) {
          // prefer a helpful message
          setAppErr("Could not load your application for this job.");
        }
      } finally {
        if (!cancelled) {
          setAppLoading(false);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (!user) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border p-6">
          <p className="text-sm text-gray-700">Please login to view your application.</p>
          <div className="mt-4">
            <Link className="rounded-xl bg-black px-4 py-2 text-sm text-white" to="/login">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== "applicant") {
    return (
      <div className="p-6">
        <div className="rounded-2xl border p-6">
          <p className="text-sm text-gray-700">Only applicants can view applications.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {job?.title ? `Application: ${job.title}` : "Your application"}
            </h1>
            {job?.location && <p className="mt-1 text-sm text-gray-600">{job.location}</p>}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/jobs`)}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        {jobErr && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {jobErr}
          </div>
        )}

        {job && (
          <div className="mb-4 rounded-2xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Job description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              {job.description || "No description provided."}
            </p>
          </div>
        )}

        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Your application</h2>

          {appLoading ? (
            <p className="mt-2 text-sm text-gray-600">Loading your application…</p>
          ) : appErr ? (
            <p className="mt-2 text-sm text-red-600">{appErr}</p>
          ) : myApplication ? (
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div>
                <strong>Full name:</strong> {myApplication.full_name}
              </div>
              <div>
                <strong>Email:</strong> {myApplication.email}
              </div>
              {myApplication.phone && (
                <div>
                  <strong>Phone:</strong> {myApplication.phone}
                </div>
              )}
              {myApplication.cover_letter && (
                <div>
                  <strong>Cover letter:</strong>
                  <p className="mt-1 whitespace-pre-wrap">{myApplication.cover_letter}</p>
                </div>
              )}
              <div>
                <strong>Status:</strong> {myApplication.status}
              </div>
              {myApplication.submitted_at && (
                <div>
                  <strong>Submitted:</strong>{" "}
                  {new Date(myApplication.submitted_at).toLocaleString()}
                </div>
              )}

              {myApplication.cv_download_url ? (
                <div className="mt-3">
                  <a
                    className="inline-flex items-center rounded-xl bg-black px-4 py-2 text-sm text-white"
                    href={myApplication.cv_download_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download CV
                  </a>
                </div>
              ) : (
                <div className="mt-3 text-xs text-gray-500">No CV was uploaded.</div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              No application found for this job.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
