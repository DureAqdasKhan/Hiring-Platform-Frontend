import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postJob } from "../api/job";

export default function PostJob() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState(""); // keep as string for input; convert on submit

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit = useMemo(() => {
    return title.trim() && description.trim() && location.trim();
  }, [title, description, location]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSuccess("");

    if (!canSubmit) {
      setErr("Please fill in title, description, and location.");
      return;
    }

    // Salary rules:
    // - allow empty (null)
    // - allow numbers only
    // - backend expects int, so send number or null
    const salaryValue = salary.trim() === "" ? null : salary.trim();

    try {
      setLoading(true);
      const created = await postJob({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        salary: salaryValue,
      });

      setSuccess("Job posted successfully.");
      // optional: redirect after a short delay OR immediately
      // navigate("/jobs");
      // If you want to show created result in UI, you can use `created`
      setTimeout(() => navigate("/jobs"), 600);
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setErr(detail || "Failed to post job. Make sure you are logged in as a hiring manager.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Post a Job</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create a new job posting. Only hiring managers can post jobs.
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

        {/* Card */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          {err && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium">Job title</label>
              <input
                className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black/10"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full Stack Engineer"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium">Location</label>
              <input
                className="mt-1 w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black/10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. London (Hybrid) or Remote"
                required
              />
            </div>

            {/* Salary */}
            <div>
              <label className="text-sm font-medium">Indicative salary (optional)</label>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-xl border px-3 py-3 text-sm text-gray-600">£</span>
                <input
                  className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black/10"
                  value={salary}
                  onChange={(e) => {
                    // allow empty or digits only
                    const v = e.target.value;
                    if (v === "" || /^[0-9]+$/.test(v)) setSalary(v);
                  }}
                  inputMode="numeric"
                  placeholder="e.g. 50000"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter numbers only. Example: 50000 (not 50k).
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="mt-1 min-h-[140px] w-full resize-y rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black/10"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Role summary, responsibilities, requirements, tech stack…"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTitle("");
                  setLocation("");
                  setSalary("");
                  setDescription("");
                  setErr("");
                  setSuccess("");
                }}
                className="rounded-xl border px-4 py-3 text-sm hover:bg-gray-50"
                disabled={loading}
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                {loading ? "Posting..." : "Post job"}
              </button>
            </div>
          </form>
        </div>

        {/* Small footer hint */}
        <p className="mt-4 text-xs text-gray-500">
          If you get a 403, you’re logged in as an applicant. Login with a hiring manager account.
        </p>
      </div>
    </div>
  );
}
