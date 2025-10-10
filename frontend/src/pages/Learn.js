import React from "react";
import { Navbar } from "../components/Navbar";
import { Card, Button } from "react-bootstrap";
import { Youtube, Lightbulb } from "react-bootstrap-icons"; // Removed MessageSquare, Trophy
import { useLocation } from "react-router-dom";

const Learn = () => {
  const location = useLocation();

  React.useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.hash]);

  const liveCollaborations = [
    { id: 1, title: "Live Jazz Trio Session", description: "Watch a professional jazz trio collaborate in real-time.", url: "https://youtu.be/uHFJ9qhR0VM?si=CpFAxrnuOXofuhVk" },
    { id: 2, title: "Electronic Music Production Stream", description: "Producer building a track from scratch, live.", url: "https://youtu.be/Hi72cCOPUQU?si=TfHwsoh-kaSofUTy" },
  ];

  const expertTutorials = [
    { id: 1, title: "Advanced Mixing Techniques", description: "Deep dive into professional mixing strategies.", url: "https://youtu.be/6YwWKn6k0Mg?si=eOl6eRlWYFMntQkC" },
    { id: 2, title: "Music Theory for Songwriters", description: "Unlock new songwriting possibilities.", url: "https://youtube.com/playlist?list=PLViqYKpnxtKotCmlxW4tRh7HCqqKOkaA9&si=hvy4-l-WfF42H48S" },
  ];

  const musicChallenges = [
    { id: 1, title: "Compose a Lofi Beat", description: "Create a relaxing lo-fi beat track in under 3 hours.", details: "Prizes for the top 3 submissions." },
    { id: 2, title: "10-Minute Songwriting Challenge", description: "Write and record a short song in 10 minutes.", details: "Focus on capturing a single emotion or idea." },
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <div className="container py-5">
          <h1 className="h3 fw-bold mb-4">Learning Hub</h1>
          <p className="lead text-muted mb-5">Expand your musical knowledge and skills with our curated resources.</p>

          <section className="mb-5">
            <h2 className="h4 fw-bold mb-4">Featured Content</h2>
            <div className="row g-4">
              <div className="col-md-6">
                <Card className="h-100 p-4">
                  <div className="d-flex align-items-center mb-3">
                    <Youtube size={32} className="text-danger me-2" />
                    <h3 className="h5 fw-semibold mb-0">Live Collaborations</h3>
                  </div>
                  <p className="text-muted">Watch and learn from real-time creative sessions.</p>
                  <div className="d-grid gap-3">
                    {liveCollaborations.map(collab => (
                      <Card key={collab.id} className="p-3">
                        <Card.Body>
                          <Card.Title className="h6">{collab.title}</Card.Title>
                          <Card.Text className="text-muted">{collab.description}</Card.Text>
                          <Button as="a" href={collab.url} target="_blank" rel="noopener noreferrer" variant="outline-primary" className="mt-2 w-100">
                            Watch Now
                          </Button>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
              <div className="col-md-6">
                <Card className="h-100 p-4">
                  <div className="d-flex align-items-center mb-3">
                    <Lightbulb size={32} className="text-warning me-2" />
                    <h3 className="h5 fw-semibold mb-0">Expert Tutorials</h3>
                  </div>
                  <p className="text-muted">Dive deep into specific topics with tutorials from professionals.</p>
                  <div className="d-grid gap-3">
                    {expertTutorials.map(tutorial => (
                      <Card key={tutorial.id} className="p-3">
                        <Card.Body>
                          <Card.Title className="h6">{tutorial.title}</Card.Title>
                          <Card.Text className="text-muted">{tutorial.description}</Card.Text>
                          <Button as="a" href={tutorial.url} target="_blank" rel="noopener noreferrer" variant="outline-primary" className="mt-2 w-100">
                            Watch Now
                          </Button>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </section>

          <section className="mb-5" id="challenges">
            <h2 className="h4 fw-bold mb-4">Music Challenges</h2>
            <p className="lead text-muted mb-4">Test your skills and creativity with our regular music challenges.</p>
            <div className="row g-4">
              {musicChallenges.map(challenge => (
                <div className="col-md-6" key={challenge.id}>
                  <Card className="p-4 text-white bg-dark">
                    <Card.Header>
                      <Card.Title className="h5">{challenge.title}</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <Card.Text>{challenge.description}</Card.Text>
                      <p className="small text-muted">{challenge.details}</p>
                      <Button variant="outline-light" className="mt-3 w-100">
                        Participate (Coming Soon)
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Learn;