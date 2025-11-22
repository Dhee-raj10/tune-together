import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Card } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import api from "../services/api";
import { toast } from "../hooks/use-toast";

// ✅ Store clean names without emojis — only for UI display
const INSTRUMENTS_LIST = [
  { name: 'Piano', icon: '🎹', display: '🎹 Piano' },
  { name: 'Guitar', icon: '🎸', display: '🎸 Guitar' },
  { name: 'Drums', icon: '🥁', display: '🥁 Drums' },
  { name: 'Bass', icon: '🎸', display: '🎸 Bass' },
  { name: 'Violin', icon: '🎻', display: '🎻 Violin' },
  { name: 'Saxophone', icon: '🎷', display: '🎷 Saxophone' },
  { name: 'Trumpet', icon: '🎺', display: '🎺 Trumpet' },
  { name: 'Flute', icon: '🎶', display: '🎶 Flute' },
  { name: 'Vocals', icon: '🎤', display: '🎤 Vocals' },
  { name: 'Synthesizer', icon: '🎹', display: '🎹 Synthesizer' },
  { name: 'Cello', icon: '🎻', display: '🎻 Cello' },
  { name: 'Clarinet', icon: '🎶', display: '🎶 Clarinet' },
  { name: 'Trombone', icon: '🎺', display: '🎺 Trombone' },
  { name: 'Harp', icon: '🎵', display: '🎵 Harp' },
  { name: 'Ukulele', icon: '🎸', display: '🎸 Ukulele' },
  { name: 'Banjo', icon: '🎸', display: '🎸 Banjo' },
];

const MUSICIAN_ROLES = [
  { value: 'drummer', label: '🥁 Drummer' },
  { value: 'guitarist', label: '🎸 Guitarist' },
  { value: 'violinist', label: '🎻 Violinist' },
  { value: 'pianist', label: '🎹 Pianist' },
  { value: 'vocalist', label: '🎤 Vocalist' },
  { value: 'producer', label: '🎧 Producer' },
  { value: 'composer', label: '🎼 Composer' },
  { value: 'saxophonist', label: '🎷 Saxophonist' },
];

const Signup = () => {
  const [step, setStep] = useState(1);

  // Step 1 — Account Info
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 2 — Roles
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [otherRole, setOtherRole] = useState("");

  // Step 3 — Instruments
  const [instruments, setInstruments] = useState([
    { instrument: "", skillLevel: "Intermediate", yearsExperience: 0, isPrimary: true },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  // ---------------- HANDLE STEP 1 ---------------- //
  const handleStep1Submit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      toast({ title: "Please fill all required fields", variant: "error" });
      return;
    }

    if (!termsAccepted) {
      toast({ title: "Please accept terms and conditions", variant: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signup(username, email, password);
      if (error) {
        toast({ title: error, variant: "error" });
      } else {
        toast({ title: "Account created! Now choose your roles", variant: "success" });
        setStep(2);
      }
    } catch {
      toast({ title: "Unexpected error", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- HANDLE STEP 2 ---------------- //
  const handleStep2Submit = async (e) => {
    e.preventDefault();

    const finalRoles = [...selectedRoles];
    if (otherRole.trim()) finalRoles.push(otherRole.trim());
    if (finalRoles.length === 0) {
      toast({ title: "Select at least one role", variant: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await api.put(`/profiles/${user._id || user.id}/roles`, { roles: finalRoles });
      toast({ title: "Roles saved!", variant: "success" });
      setStep(3);
    } catch (error) {
      toast({
        title: "Failed to save roles",
        description: error.response?.data?.msg,
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- HANDLE STEP 3 ---------------- //
  const handleStep3Submit = async (e) => {
    e.preventDefault();

    const validInstruments = instruments.filter((i) => i.instrument !== "");
    if (validInstruments.length === 0) {
      toast({ title: "Add at least one instrument", variant: "error" });
      return;
    }

    setIsLoading(true);
    try {
      for (const inst of validInstruments) {
        await api.post("/musicians/my-instruments", inst);
      }
      toast({
        title: "Profile setup complete!",
        description: `Added ${validInstruments.length} instruments`,
        variant: "success",
      });

      navigate("/explore");
    } catch (error) {
      toast({
        title: "Error saving instruments",
        description: error.response?.data?.error,
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const addInstrument = () => {
    setInstruments([
      ...instruments,
      { instrument: "", skillLevel: "Intermediate", yearsExperience: 0, isPrimary: false },
    ]);
  };

  const removeInstrument = (index) => {
    setInstruments(instruments.filter((_, i) => i !== index));
  };

  const updateInstrument = (index, field, value) => {
    const updated = [...instruments];
    updated[index][field] = value;
    setInstruments(updated);
  };

  const handleSkip = () => {
    toast({ title: "You can complete your profile later", variant: "default" });
    navigate("/explore");
  };

  // ---------------- UI RENDER ---------------- //
  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="d-flex flex-grow-1 align-items-center justify-content-center py-5">
        <div className="w-100 position-relative" style={{ maxWidth: 600, padding: "0 20px" }}>
          <Card>

            {/* HEADER + STEPS */}
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className={`badge ${step >= 1 ? "bg-primary" : "bg-secondary"}`}>1. Account</div>
                <div className="flex-grow-1 mx-2" style={{ height: 2, background: step >= 2 ? "#0d6efd" : "#dee2e6" }}></div>
                <div className={`badge ${step >= 2 ? "bg-primary" : "bg-secondary"}`}>2. Roles</div>
                <div className="flex-grow-1 mx-2" style={{ height: 2, background: step >= 3 ? "#0d6efd" : "#dee2e6" }}></div>
                <div className={`badge ${step >= 3 ? "bg-primary" : "bg-secondary"}`}>3. Instruments</div>
              </div>

              <Card.Title className="text-center mb-0">
                {step === 1 && "Create Account"}
                {step === 2 && "Select Your Roles"}
                {step === 3 && "Add Your Instruments"}
              </Card.Title>
              <Card.Text className="text-center text-muted">
                {step === 1 && "Enter your details to get started"}
                {step === 2 && "What best describes you?"}
                {step === 3 && "Add instruments you play"}
              </Card.Text>
            </Card.Header>

            {/* STEP 1: Account */}
            {step === 1 && (
              <Form onSubmit={handleStep1Submit}>
                <Card.Body>
                  <div className="d-grid gap-4">
                    <Form.Group>
                      <Form.Label>Username *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="john_doe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Password *</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-0"
                          onClick={() => setShowPassword(!showPassword)}
                          type="button"
                        >
                          {showPassword ? <EyeSlash /> : <Eye />}
                        </Button>
                      </div>
                      <Form.Text className="text-muted">At least 6 characters</Form.Text>
                    </Form.Group>

                    <Form.Group>
                      <Form.Check
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        label={
                          <>
                            I accept the <Link to="/terms">terms</Link> &{" "}
                            <Link to="/privacy">privacy policy</Link>
                          </>
                        }
                        required
                      />
                    </Form.Group>
                  </div>
                </Card.Body>

                <Card.Footer className="d-grid gap-3">
                  <Button type="submit" disabled={!termsAccepted || isLoading}>
                    {isLoading ? "Creating account..." : "Continue →"}
                  </Button>
                  <small className="text-center text-muted">
                    Already have an account? <Link to="/login">Login</Link>
                  </small>
                </Card.Footer>
              </Form>
            )}

            {/* STEP 2: Roles */}
            {step === 2 && (
              <Form onSubmit={handleStep2Submit}>
                <Card.Body>
                  <p className="text-muted mb-3">
                    Select roles to help musicians find you.
                  </p>

                  <div className="row g-2 mb-4">
                    {MUSICIAN_ROLES.map((role) => (
                      <div key={role.value} className="col-6">
                        <div
                          className={`card border ${
                            selectedRoles.includes(role.value)
                              ? "border-primary bg-primary bg-opacity-10"
                              : ""
                          }`}
                          onClick={() => handleRoleToggle(role.value)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="card-body text-center py-3">
                            <div className="form-check d-flex justify-content-center">
                              <input
                                className="form-check-input me-2"
                                type="checkbox"
                                checked={selectedRoles.includes(role.value)}
                                onChange={() => handleRoleToggle(role.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <label className="form-check-label">{role.label}</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Form.Group>
                    <Form.Label>Other (specify):</Form.Label>
                    <Form.Control
                      type="text"
                      value={otherRole}
                      onChange={(e) => setOtherRole(e.target.value)}
                      placeholder="e.g., DJ, Sound Engineer"
                    />
                  </Form.Group>
                </Card.Body>

                <Card.Footer className="d-grid gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Continue →"}
                  </Button>
                  <Button variant="outline-secondary" onClick={handleSkip} type="button">
                    Skip
                  </Button>
                </Card.Footer>
              </Form>
            )}

            {/* STEP 3: Instruments */}
            {step === 3 && (
              <Form onSubmit={handleStep3Submit}>
                <Card.Body>
                  <p className="text-muted mb-3">
                    Add the instruments you play.
                  </p>

                  {instruments.map((inst, index) => (
                    <div key={index} className="card mb-3 border">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0">Instrument {index + 1}</h6>
                          {instruments.length > 1 && (
                            <Button
                              variant="link"
                              className="text-danger p-0"
                              onClick={() => removeInstrument(index)}
                              type="button"
                            >
                              🗑
                            </Button>
                          )}
                        </div>

                        <div className="row g-2">
                          <div className="col-12">
                            <Form.Label>Instrument *</Form.Label>
                            <Form.Select
                              value={inst.instrument}
                              onChange={(e) => updateInstrument(index, "instrument", e.target.value)}
                              required
                            >
                              <option value="">Select...</option>
                              {INSTRUMENTS_LIST.map((i) => (
                                <option key={i.name} value={i.name}>
                                  {i.display}
                                </option>
                              ))}
                            </Form.Select>
                          </div>

                          <div className="col-6">
                            <Form.Label>Skill Level</Form.Label>
                            <Form.Select
                              value={inst.skillLevel}
                              onChange={(e) => updateInstrument(index, "skillLevel", e.target.value)}
                            >
                              <option>Beginner</option>
                              <option>Intermediate</option>
                              <option>Advanced</option>
                              <option>Professional</option>
                            </Form.Select>
                          </div>

                          <div className="col-6">
                            <Form.Label>Years Experience</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              max="100"
                              value={inst.yearsExperience}
                              onChange={(e) =>
                                updateInstrument(index, "yearsExperience", parseInt(e.target.value) || 0)
                              }
                            />
                          </div>

                          <div className="col-12">
                            <Form.Check
                              type="checkbox"
                              label="Primary Instrument"
                              checked={inst.isPrimary}
                              onChange={(e) => updateInstrument(index, "isPrimary", e.target.checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline-primary" className="w-100 mb-3" onClick={addInstrument} type="button">
                    ➕ Add Another Instrument
                  </Button>
                </Card.Body>

                <Card.Footer className="d-grid gap-2">
                  <Button type="submit" variant="success" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Finish 🎉"}
                  </Button>
                  <Button variant="outline-secondary" onClick={handleSkip} type="button">
                    Skip
                  </Button>
                </Card.Footer>
              </Form>
            )}

          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
