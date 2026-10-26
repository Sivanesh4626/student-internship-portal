
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

const API =
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api")
    .replace(/\/$/, "");

const internships = [
  { id: "web", title: "Web Development Intern" },
  { id: "java", title: "Java Developer Intern" },
  { id: "data", title: "Data Science Intern" },
  { id: "ml", title: "Machine Learning Intern" },
  { id: "cloud", title: "Cloud Computing Intern" },
];

function Header() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">InternConnect</Link>
      <nav><Link to="/">Internships</Link></nav>
    </header>
  );
}

function InternshipList() {
  const [items, setItems] = useState(internships);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/internships`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load internships");
        return res.json();
      })
      .then(setItems)
      .catch(() => setError("Unable to contact the backend."));
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <p>YOUR CAREER STARTS HERE</p>
        <h1>Find Your Dream Internship</h1>
        <p>Explore opportunities and gain practical experience.</p>
      </section>

      <h2>Available Internships</h2>
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {items.map((item) => (
          <article className="card" key={item.id}>
            <h3>{item.title}</h3>
            <p>Explore this internship opportunity.</p>
            <Link to={`/internship/${item.id}`}>View Details →</Link>
          </article>
        ))}
      </div>
    </main>
  );
}

function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/internships/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Internship not found");
        return res.json();
      })
      .then(setItem)
      .catch((err) => setError(err.message));
  }, [id]);

  if (!item) {
    return <main className="container">{error || "Loading..."}</main>;
  }

  return (
    <main className="container">
      <article className="card">
        <h1>{item.title}</h1>
        <p>{item.description}</p>
        <p>Company: {item.company}</p>
        <p>Duration: {item.duration}</p>
        <p>Mode: {item.mode}</p>
        <button onClick={() => navigate(`/apply/${item.id}`)}>
          Apply Now
        </button>
      </article>
    </main>
  );
}

function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    studentName: "",
    email: "",
    rollNumber: "",
    internship:
      internships.find((item) => item.id === id)?.title || "",
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    if (
      !form.studentName.trim() ||
      !form.email.trim() ||
      !form.rollNumber.trim() ||
      !form.internship
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (form.studentName.trim().length < 2) {
      setMessage("Name must contain at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          studentName: form.studentName.trim(),
          email: form.email.trim(),
          rollNumber: form.rollNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed");
      }

      setSuccess(true);
      setMessage(data.message || "Application submitted successfully!");

      setForm({
        studentName: "",
        email: "",
        rollNumber: "",
        internship: form.internship,
      });
    } catch (error) {
      setMessage(error.message === "Failed to fetch"
        ? "Cannot connect to the backend. Check your server."
        : error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container form-container">
      <Link to="/">← Back to internships</Link>
      <section className="card">
        <h1>Internship Application</h1>

        {message && (
          <p className={success ? "success" : "error"} role="status">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="studentName">Student Name</label>
          <input
            id="studentName"
            name="studentName"
            value={form.studentName}
            onChange={handleChange}
            minLength={2}
            maxLength={100}
            required
          />

          <label htmlFor="email">Email ID</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="rollNumber">Roll Number</label>
          <input
            id="rollNumber"
            name="rollNumber"
            value={form.rollNumber}
            onChange={handleChange}
            maxLength={30}
            required
          />

          <label htmlFor="internship">Select Internship</label>
          <select
            id="internship"
            name="internship"
            value={form.internship}
            onChange={handleChange}
            required
          >
            <option value="">Choose an internship</option>
            {internships.map((item) => (
              <option key={item.id} value={item.title}>
                {item.title}
              </option>
            ))}
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        {success && (
          <button onClick={() => navigate("/")}>
            Back to Internships
          </button>
        )}
      </section>
    </main>
  );
}

function NotFound() {
  return (
    <main className="container">
      <h1>Page not found</h1>
      <Link to="/">Return Home</Link>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<InternshipList />} />
        <Route path="/internship/:id" element={<InternshipDetails />} />
        <Route path="/apply" element={<ApplicationForm />} />
        <Route path="/apply/:id" element={<ApplicationForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
