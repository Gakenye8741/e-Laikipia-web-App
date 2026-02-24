import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../App/store";
import { clearCredentials } from "../features/Auth/AuthSlice";

import { 
  Home, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  Phone, 
  Info, 
  Code 
} from "lucide-react";

import Typed from "typed.js";
import "./animate.css";
import { ThemeToggle } from "./ThemeToggle";
import { MdDashboard } from "react-icons/md";

export const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const typedRef = useRef<HTMLSpanElement>(null);

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const Name = useSelector((state: RootState) => state.auth.user?.user?.name);

  const isActive = (path: string) =>
    location.pathname === path ? "text-primary font-bold" : "";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [menuOpen]);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: [
        "Laikipia E-Vote",
        "Secure Election",
        "Trusted Governance"
      ],
      typeSpeed: 100,
      backSpeed: 30,
      cursorChar: "|",
      loop: true,
    });

    return () => typed.destroy();
  }, []);

  const handleLogout = () => {
    dispatch(clearCredentials());
    setMenuOpen(false);
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-base-300 ${
          scrolled ? "backdrop-blur bg-base-100/70 shadow-md" : "bg-base-100"
        }`}
      >
        <div className="navbar px-4">

          {/* LEFT: LOGO + MOBILE MENU */}
          <div className="navbar-start">
            <div className="dropdown">
              <button
                className="btn btn-ghost lg:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>

              {/* Mobile Menu */}
              <ul className={`menu menu-sm dropdown-content bg-base-100 rounded-box shadow mt-3 w-52 p-2 z-10 font-semibold ${menuOpen ? "block" : "hidden"}`}>
                <li>
                  <Link className={isActive("/")} to="/" onClick={() => setMenuOpen(false)}>
                    <Home className="h-4 w-4 mr-2" /> Home
                  </Link>
                </li>
                <li>
                  <Link className={isActive("/about")} to="/about" onClick={() => setMenuOpen(false)}>
                    <Info className="h-4 w-4 mr-2" /> About
                  </Link>
                </li>
                <li>
                  <Link className={isActive("/contact")} to="/contact" onClick={() => setMenuOpen(false)}>
                    <Phone className="h-4 w-4 mr-2" /> Contact
                  </Link>
                </li>
                <li>
                  <Link className={isActive("/developer")} to="/developer" onClick={() => setMenuOpen(false)}>
                    <Code className="h-4 w-4 mr-2" /> Developer
                  </Link>
                </li>
                {!isAuthenticated && (
                  <li>
                    <Link to="/login" className={isActive("/login")} onClick={() => setMenuOpen(false)}>
                      <LogIn className="h-4 w-4 mr-2" /> Admin Login
                    </Link>
                  </li>
                )}
                {isAuthenticated && (
                  <li>
                    <button onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* LOGO + AUTOTYPE TITLE */}
            <Link to="/" className="btn btn-ghost text-xl font-bold flex items-center gap-1 ml-2">
              <span 
                ref={typedRef} 
                className="tracking-wide text-primary text-sm sm:text-base md:text-xl lg:text-2xl" 
              />
            </Link>
          </div>

          {/* CENTER (DESKTOP MENU) */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 text-lg font-semibold gap-2">
              <li><Link className={isActive("/")} to="/"><Home className="h-4 w-4 mr-1" /> Home</Link></li>
              <li><Link className={isActive("/about")} to="/about"><Info className="h-4 w-4 mr-1" /> About</Link></li>
              <li><Link className={isActive("/contact")} to="/contact"><Phone className="h-4 w-4 mr-1" /> Contact</Link></li>
              <li><Link className={isActive("/developer")} to="/developer"><Code className="h-4 w-4 mr-1" /> Developer</Link></li>
            </ul>
          </div>

          {/* RIGHT: THEME + LOGIN / LOGOUT */}
          <div className="navbar-end flex items-center gap-3">
            <ThemeToggle />

            {!isAuthenticated && (
              <Link to="/login" className="btn btn-primary btn-sm flex items-center gap-2">
                <LogIn className="h-4 w-4" /> Admin Login
              </Link>
            )}

            {isAuthenticated && (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-outline btn-primary flex items-center gap-2">
                  {Name}
                  <ChevronDown className="h-4 w-4" />
                </label>
                <ul tabIndex={0} className="menu dropdown-content bg-base-100 shadow rounded-box w-52 mt-2">
                  <li>
                    <button  className="flex items-center gap-2">
                       <MdDashboard className="h-5 w-5" /> <Link to="/admindashboard/AllElections">Admin Dashboard
                      </Link>
                     
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2">
                      <LogOut className="h-5 w-5" /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-base-100/70 backdrop-blur border-t shadow-md z-50">
        <ul className="flex justify-around items-center py-2 font-semibold text-sm sm:text-base">
          <li><Link to="/" className={isActive("/")}><Home className="h-4 w-4 mr-1" />Home</Link></li>
          <li><Link to="/about" className={isActive("/about")}><Info className="h-4 w-4 mr-1" />About</Link></li>
          <li><Link to="/contact" className={isActive("/contact")}><Phone className="h-4 w-4 mr-1" />Contact</Link></li>
          <li><Link to="/developer" className={isActive("/developer")}><Code className="h-4 w-4 mr-1" />Developer</Link></li>
        </ul>
      </div>
    </>
  );
};
