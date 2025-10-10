import { Link } from "react-router-dom";

export function ModeCard({ title, description, icon, features, linkTo, buttonText }) {
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-center mb-3">
          <div className="bg-light p-2 rounded-circle me-3" style={{ fontSize: '1.5rem' }}>
            {icon}
          </div>
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        <p className="card-text text-muted flex-grow-1">{description}</p>
        <ul className="list-unstyled">
          {features.map((feature, i) => (
            <li key={i} className="mb-2">
              <i className="bi bi-check-circle-fill me-2 text-success"></i>
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <Link to={linkTo} className="btn btn-primary w-100">
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
