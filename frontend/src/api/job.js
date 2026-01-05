import { api } from "./client";
export async function postJob(payload) {
  // payload: { title, description, location, salary }
  const res = await api.post("/job/post_job", payload);
  return res.data;
}

export async function fetchAllJobs() {
  const res = await api.get("/job/all");
  return res.data; // should be an array
}

export async function fetchJobById(jobId) {
  // Try dedicated endpoint then fallback to list
  try {
    const res = await api.get(`/job/${jobId}`);
    return res.data;
  } catch (e) {
    const list = await fetchAllJobs();
    return Array.isArray(list) ? list.find((j) => String(j.id) === String(jobId)) : null;
  }
}

export async function applyToJob(jobId, data) {
  // data: { full_name, email, phone, cover_letter, cv: File | null }
  const form = new FormData();
  form.append("full_name", data.full_name);
  form.append("email", data.email);
  if (data.phone) form.append("phone", data.phone);
  if (data.cover_letter) form.append("cover_letter", data.cover_letter);
  if (data.cv) form.append("cv", data.cv);

  // Let axios set the appropriate multipart boundary header automatically
  const res = await api.post(`applications/apply/${jobId}`, form);

  return res.data;
}

export async function fetchMyApplication(jobId) {
  // fetch the current applicant's application (expects /my/{job_id})
  const res = await api.get(`applications/my/${jobId}`);
  return res.data;
}

export async function fetchAllApplications() {
  // returns applications tailored to the current user's role
  const res = await api.get("/applications/all");
  return res.data;
}

export async function fetchApplicationsForJob(jobId) {
  // Get all applications for a specific job (hiring manager only)
  const res = await api.get(`applications/job/${jobId}`);
  return res.data;
}

export async function chatWithAgent(command) {
  // POST /my_jobs with { command: "user message" }
  const res = await api.post("/job/my_jobs", { command });
  return res.data;
}
