import { api } from "./client";

export async function signup(payload) {
  // payload: { email, password, role: "hiring_manager" | "applicant" }
  const res = await api.post("/auth/signup", payload);
  console.log("API BASE URL:", process.env.REACT_APP_API_BASE_URL);
  console.log(res);
  return res.data;
}

export async function login(payload) {
  // payload: { email, password }
  console.log("API BASE URL:", process.env.REACT_APP_API_BASE_URL);
  try {
    const res = await api.post("/auth/login", payload);
  } catch (error) {
    console.log(error);
  }
  const res = await api.post("/auth/login", payload);
  console.log("API BASE URL:", process.env.REACT_APP_API_BASE_URL);
  console.log(res);
  // expected: { access_token, token_type }
  return res.data;
}

export async function me() {
  const res = await api.get("/auth/me");
  return res.data; // { id, email, role }
}
