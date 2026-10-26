
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

const API = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");

const sampleInternships = [
  {
    id: "web",
    title: "Web Development Intern",
    company: "Tech Solutions",
    duration: "3 months",
    mode: "Remote",
    description: "Build responsive websites using React and JavaScript.",
  },
  {
    id: "java",
    title: "Java Developer Intern",
    company: "CodeWorks",
    duration: "3 months",
    mode: "Hybrid",
    description: "Develop Java applications and REST APIs.",
  },
  {
    id: "data",
    title: "Data Science Intern",
    company: "Data Insights",
    duration: "4 months",
    mode: "Remote",
    description: "Analyze datasets and create useful visualizations.",
  },
  {
    id: "ml",
    title: "Machine Learning Intern",
    company: "AI Labs",
    duration: "4 months",
    mode: "On-site",
    description: "Build and evaluate machine learning models.",
  },
  {
    id: "cloud",
    title: "Cloud Computing Intern",
    company: "Cloud Systems",
    duration: "3 months",
    mode: "Hybrid",
    description: "Learn cloud infrastructure and deployment.",
  },
];

function Header() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">
        InternConnect
      </Link>
      <nav>
        <Link to="/">Internships</Link>
      </nav>
    </header>
  );
}

function InternshipList() {
  const [internships, setInternships] = useState(sampleInternships);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API}/internships`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setInternships(data);
        setMessage("");
      })
      .catch((error) => {
        console.error(error);
        setMessage(
          "Showing sample internships. The backend API is unavailable."
        );
      });
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <p>YOUR CAREER STARTS HERE</p>
        <h1>Find Your Dream Internship</h1>
        <p>Explore opportunities and gain practical experience.</p>
      </section>

      <h2>Available Internships</h2>

      {message && <p className="notice">{message}</p>}

      <div className="grid">
        {internships.map((item) => (
          <article className="card" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p>{item.company}</p>
            <p>{item.duration} · {item.mode}</p>
            <Link to={`/internship/${item.id}`}>
              View Details →
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

function InternshipDetails() {
  const { id } = useParams();
  const [internship, setInternship] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch(`${API}/internships/${id}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Internship not found");
        }
        return response.json();
      })
      .then((data) => {
        if (active) setInternship(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <main className="container">
        <p className="error">{error}</p>
        <Link to="/">Back to internships</Link>
      </main>
    );
  }

  if (!internship) {
    return <main className="container">Loading internship...</main>;
  }

  return (
    <main className="container">
      <Link to="/">← Back to internships</Link>

      <article className="card">
        <h1>{internship.title}</h1>
        <p>{internship.description}</p>
        <p>Company: {internship.company}</p>
        <p>Duration: {internship.duration}</p>
        <p>Mode: {internship.mode}</p>
        <Link className="button" to={`/apply/${internship.id}`}>
          Apply Now
        </Link>
      </article>
    </main>
  );
}

function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const selected = sampleInternships.find((item) => item.id === id);

  const [form, setForm] = useState({
    studentName: "",
    email: "",
    rollNumber: "",
    internship: selected?.title || "",
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
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
      setMessage("Please complete all fields.");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          studentName: form.studentName.trim(),
          email: form.email.trim(),
          rollNumber: form.rollNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Application submission failed.");
      }

      setSuccess(true);
      setMessage(data.message || "Application submitted successfully!");

      setForm({
        studentName: "",
        email: "",
        rollNumber: "",
        internship: "",
      });
    } catch (error) {
      console.error(error);
      setMessage(
        error.message === "Failed to fetch"
          ? "Unable to reach the backend. Check the ByteXL API proxy URL."
          : error.message
      );
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

          <label htmlFor="internship">Selected Internship</label>
          <select
            id="internship"
            name="internship"
            value={form.internship}
            onChange={handleChange}
            required
          >
            <option value="">Select an internship</option>
            {sampleInternships.map((item) => (
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
          <button type="button" onClick={() => navigate("/")}>
            Return to internships
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
