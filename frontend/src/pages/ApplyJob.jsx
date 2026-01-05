import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobById, applyToJob } from "../api/job";
import { useAuth } from "../context/AuthContext";

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const cvRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Prefill email when logged in
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  // Submit requirements: full name, email, and CV
  const canSubmit = useMemo(() => {
    return fullName.trim() !== "" && email.trim() !== "" && !!cvFile && !submitting;
  }, [fullName, email, cvFile, submitting]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");
      setSuccess("");

      try {
        const j = await fetchJobById(jobId);

        if (!j) {
          if (!cancelled) setErr("Job not found");
          return;
        }

        if (cancelled) return;
        setJob(j);

        // If already applied, route to application details page
        if (user?.role === "applicant" && j?.has_applied) {
          navigate(`/jobs/${jobId}/application`, { replace: true });
          return;
        }
      } catch (e) {
        if (!cancelled) setErr("Failed to load job");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [jobId, user?.role, user?.id, navigate]);

  async function onApply(e) {
    e.preventDefault();

    if (!user) {
      setErr("Please login to apply");
      return;
    }

    if (user.role !== "applicant") {
      setErr("Only applicants can apply to jobs. Please login with an applicant account.");
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setErr("Full name and email are required.");
      return;
    }

    if (!cvFile) {
      setErr("Please attach a CV to apply.");
      return;
    }

    setErr("");
    setSuccess("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      await applyToJob(jobId, {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        cover_letter: coverLetter.trim() || undefined,
        cv: cvFile,
      });

      // Immediately route to the application details page
      navigate(`/jobs/${jobId}/application`, { replace: true });
    } catch (error) {
      const res = error?.response?.data;
      const newFieldErrors = {};
      let general = "";

      if (res) {
        if (typeof res.detail === "string") {
          general = res.detail;
        } else if (typeof res.detail === "object" && res.detail !== null) {
          for (const [k, v] of Object.entries(res.detail)) {
            newFieldErrors[k] = Array.isArray(v) ? v.join(" ") : String(v);
          }
        } else if (res.errors && typeof res.errors === "object") {
          for (const [k, v] of Object.entries(res.errors)) {
            newFieldErrors[k] = Array.isArray(v) ? v.join(" ") : String(v);
          }
        } else if (res.message) {
          general = String(res.message);
        }
      } else {
        general = error?.message || "Failed to submit application.";
      }

      setFieldErrors(newFieldErrors);
      setErr(general || Object.values(newFieldErrors).join(" ") || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  function clearForm() {
    setFullName("");
    setPhone("");
    setCoverLetter("");
    setCvFile(null);
    if (cvRef.current) cvRef.current.value = null;
    setFieldErrors({});
    setErr("");
    setSuccess("");
    setEmail(user?.email ?? "");
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (err && !job) return <div className="p-6 text-red-600">{err}</div>;
  if (!job) return <div className="p-6">Job not found</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{job.title}</h1>
            <p className="mt-1 text-sm text-gray-600">{job.location}</p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm">
          <p className="text-sm text-gray-700">{job.description}</p>

          <div className="mt-4 flex gap-2 text-xs text-gray-600">
            {job.salary && (
              <span className="rounded-full bg-gray-50 px-3 py-1 border">Salary: {job.salary}</span>
            )}
            {job.posted_at && (
              <span className="rounded-full bg-gray-50 px-3 py-1 border">
                Posted: {new Date(job.posted_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Apply for this job</h2>

          {success && (
            <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}
          {err && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          )}

          <form onSubmit={onApply} className="mt-4 space-y-3">
            <div>
              <label className="text-sm">Full name</label>
              <input
                className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black/10"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              {fieldErrors.full_name && (
                <div className="mt-1 text-sm text-red-600">{fieldErrors.full_name}</div>
              )}
            </div>

            <div>
              <label className="text-sm">Email</label>
              <input
                className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
              {fieldErrors.email && (
                <div className="mt-1 text-sm text-red-600">{fieldErrors.email}</div>
              )}
            </div>

            <div>
              <label className="text-sm">Phone (optional)</label>
              <input
                className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black/10"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {fieldErrors.phone && (
                <div className="mt-1 text-sm text-red-600">{fieldErrors.phone}</div>
              )}
            </div>

            <div>
              <label className="text-sm">Cover letter (optional)</label>
              <textarea
                className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black/10"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write a brief cover letter"
              />
              {fieldErrors.cover_letter && (
                <div className="mt-1 text-sm text-red-600">{fieldErrors.cover_letter}</div>
              )}
            </div>

            <div>
              <label className="text-sm">CV</label>
              <input
                ref={cvRef}
                type="file"
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                className="mt-1"
                required
              />

              {cvFile && (
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <span className="text-gray-700">{cvFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCvFile(null);
                      if (cvRef.current) cvRef.current.value = null;
                    }}
                    className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    Remove file
                  </button>
                </div>
              )}

              {fieldErrors.cv && <div className="mt-1 text-sm text-red-600">{fieldErrors.cv}</div>}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={clearForm}
                className="rounded-xl border px-4 py-3 text-sm hover:bg-gray-50"
                disabled={submitting}
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                title={!canSubmit ? "Please fill required fields: full name, email, and attach a CV" : undefined}
              >
                {submitting ? "Applying..." : "Apply"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
