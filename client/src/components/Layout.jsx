import { Link, NavLink } from "react-router-dom";

const NAV = {
  guest: [
    { to: "/login", label: "Login" },
    { to: "/register", label: "Register" },
    { to: "/gigs", label: "Browse" },
  ],
  client: [
    { to: "/gigs", label: "Browse" },
    { to: "/bookings", label: "My bookings" },
  ],
  freelancer: [
    { to: "/gigs", label: "Browse" },
    { to: "/gigs/mine", label: "My gigs" },
    { to: "/gigs/new", label: "New gig" },
    { to: "/bookings", label: "Bookings" },
    { to: "/income", label: "Income" },
  ],
  admin: [
    { to: "/gigs", label: "Browse" },
    { to: "/admin/gigs", label: "Admin gigs" },
  ],
};

export default function Layout({ user, onLogout, children }) {
  const links = user?.role ? NAV[user.role] || NAV.guest : NAV.guest;

  return (
    <div className="hh-layout">
      <header className="hh-header">
        <div className="hh-header-inner">
          <Link className="hh-logo" to="/gigs">
            <strong>HustleHub+</strong>
            <span>Freelance marketplace</span>
          </Link>
          <nav className="hh-nav" aria-label="Main">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === "/gigs"}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="hh-header-actions">
            {user ? (
              <>
                <div className="hh-userchip">
                  Signed in as <b>{user.name}</b> · {user.role}
                </div>
                <button type="button" className="hh-logout" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <main className="hh-main">{children}</main>
      <footer className="hh-footer">
        <div className="hh-footer-inner">
          <span>HustleHub+ · secure freelance marketplace</span>
          <span>Clients book. Freelancers earn.</span>
        </div>
      </footer>
    </div>
  );
}
