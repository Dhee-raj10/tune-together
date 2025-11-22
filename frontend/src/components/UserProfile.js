import { useEffect, useState } from "react";
import { MusicianRoleSelector } from "./MusicianRoleSelector";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { toast } from "../hooks/use-toast";

export const UserProfile = ({ userId }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);

  // Instrument management
  const [myInstruments, setMyInstruments] = useState([]);
  const [showAddInstrument, setShowAddInstrument] = useState(false);
  const [newInstrument, setNewInstrument] = useState({
    instrument: "",
    skillLevel: "Intermediate",
    yearsExperience: 0,
    isPrimary: false,
  });

  const profileId = userId || user?.id;
  const isOwnProfile = !userId || (user && userId === user.id);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setError("User not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get(`/profiles/${profileId}`);
        setProfile(res.data);

        if (isOwnProfile) {
          fetchMyInstruments();
        }

        if (isOwnProfile && (!res.data.roles || res.data.roles.length === 0)) {
          setIsRoleSelectorOpen(true);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Profile not found");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, isOwnProfile]);

  const fetchMyInstruments = async () => {
    try {
      const res = await api.get("/musicians/my-instruments");
      setMyInstruments(res.data.instruments || []);
    } catch (error) {
      console.error("Error fetching instruments:", error);
    }
  };

  const handleAddInstrument = async (e) => {
    e.preventDefault();

    if (!newInstrument.instrument) {
      toast({ title: "Please select an instrument", variant: "error" });
      return;
    }

    try {
      await api.post("/musicians/my-instruments", newInstrument);
      toast({ title: "Instrument added successfully!", variant: "success" });

      fetchMyInstruments();
      setShowAddInstrument(false);
      setNewInstrument({
        instrument: "",
        skillLevel: "Intermediate",
        yearsExperience: 0,
        isPrimary: false,
      });
    } catch (error) {
      console.error("Error adding instrument:", error);
      toast({
        title: "Failed to add instrument",
        description: error.response?.data?.error,
        variant: "error",
      });
    }
  };

  const handleDeleteInstrument = async (instrumentId) => {
    if (!window.confirm("Delete this instrument?")) return;

    try {
      await api.delete(`/musicians/my-instruments/${instrumentId}`);
      toast({ title: "Instrument removed", variant: "success" });
      fetchMyInstruments();
    } catch (error) {
      console.error("Error deleting instrument:", error);
      toast({ title: "Failed to delete instrument", variant: "error" });
    }
  };

  if (isLoading) return <div>Loading profile...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>No profile data found.</div>;

  const needsRoles = isOwnProfile && (!profile.roles || profile.roles.length === 0);

  return (
    <div className="container py-4">
      {/* Profile Header */}
      <div className="text-center mb-4">
        <img
          src={profile.avatar_url || "https://via.placeholder.com/128"}
          alt="User Avatar"
          className="rounded-circle mb-3"
          style={{ width: 128, height: 128, objectFit: "cover" }}
        />

        {profile.username && <h3>{profile.username}</h3>}
        {profile.email && <p className="text-muted">{profile.email}</p>}

        {/* Roles */}
        {profile.roles && profile.roles.length > 0 && (
          <div className="mb-2">
            {profile.roles.map((role) => (
              <span key={role} className="badge bg-secondary me-1">
                {role}
              </span>
            ))}
          </div>
        )}

        {needsRoles ? (
          <button className="btn btn-primary mt-2" onClick={() => setIsRoleSelectorOpen(true)}>
            Set Your Musician Roles
          </button>
        ) : (
          isOwnProfile && (
            <button className="btn btn-sm btn-outline-secondary mt-2" onClick={() => setIsRoleSelectorOpen(true)}>
              Edit Roles
            </button>
          )
        )}
      </div>

      {/* Instruments Section */}
      {isOwnProfile && (
        <div className="card p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>My Instruments</h5>
            <button className="btn btn-sm btn-primary" onClick={() => setShowAddInstrument(!showAddInstrument)}>
              Add Instrument
            </button>
          </div>

          {showAddInstrument && (
            <form className="mb-3" onSubmit={handleAddInstrument}>
              <label className="form-label">Instrument *</label>
              <select
                className="form-select"
                value={newInstrument.instrument}
                onChange={(e) => setNewInstrument({ ...newInstrument, instrument: e.target.value })}
                required
              >
                <option value="">Select instrument...</option>
                <option>🎹 Piano</option>
                <option>🎸 Guitar</option>
                <option>🥁 Drums</option>
                <option>🎸 Bass</option>
                <option>🎻 Violin</option>
                <option>🎷 Saxophone</option>
                <option>🎺 Trumpet</option>
                <option>🎶 Flute</option>
                <option>🎤 Vocals</option>
                <option>🎹 Synthesizer</option>
                <option>🎻 Cello</option>
                <option>🎶 Clarinet</option>
              </select>

              <label className="form-label mt-2">Skill Level</label>
              <select
                className="form-select"
                value={newInstrument.skillLevel}
                onChange={(e) => setNewInstrument({ ...newInstrument, skillLevel: e.target.value })}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Professional</option>
              </select>

              <label className="form-label mt-2">Years Experience</label>
              <input
                type="number"
                className="form-control"
                min="0"
                value={newInstrument.yearsExperience}
                onChange={(e) => setNewInstrument({ ...newInstrument, yearsExperience: +e.target.value })}
              />

              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={newInstrument.isPrimary}
                  onChange={(e) => setNewInstrument({ ...newInstrument, isPrimary: e.target.checked })}
                />
                <label className="form-check-label">This is my primary instrument</label>
              </div>

              <div className="mt-3 d-flex gap-2">
                <button className="btn btn-success btn-sm" type="submit">
                  Add Instrument
                </button>
                <button className="btn btn-secondary btn-sm" type="button" onClick={() => setShowAddInstrument(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {myInstruments.length === 0 ? (
            <div className="alert alert-info">
              No instruments added yet — Add instruments so others can find you!
            </div>
          ) : (
            myInstruments.map((inst) => (
              <div key={inst._id} className="d-flex justify-content-between border-bottom py-2">
                <div>
                  <strong>{inst.instrument}</strong> {inst.isPrimary && <span className="badge bg-primary ms-1">Primary</span>}
                  <br />
                  <small>
                    {inst.skillLevel} • {inst.yearsExperience} years
                  </small>
                </div>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteInstrument(inst._id)}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Role Selector Modal */}
      {profile && isOwnProfile && (
        <MusicianRoleSelector
          isOpen={isRoleSelectorOpen}
          onClose={() => setIsRoleSelectorOpen(false)}
          userId={profile._id || profile.id}
        />
      )}
    </div>
  );
};
