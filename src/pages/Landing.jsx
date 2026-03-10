import { Link } from "react-router-dom"
import { Printer, Upload, Clock, MapPin, ArrowRight } from "lucide-react"
import logo from "../assets/logo.png"

export default function Landing() {
  return (
    <div style={{ fontFamily: "'DM Mono', monospace", background: "#fafafa", color: "#0a0a0a", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(80px, 15vw, 180px); line-height: 0.9; letter-spacing: -2px; }
        .tag { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #999; }
        .btn-primary { background: #0a0a0a; color: #fafafa; padding: 14px 32px; font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; transition: all 0.2s; }
        .btn-primary:hover { background: #4f46e5; }
        .btn-outline { border: 1px solid #ddd; color: #0a0a0a; padding: 14px 32px; font-family: 'DM Mono', monospace; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; transition: all 0.2s; }
        .btn-outline:hover { border-color: #4f46e5; color: #4f46e5; }
        .card { border: 1px solid #e8e8e8; padding: 32px; transition: border-color 0.2s; background: #fff; }
        .card:hover { border-color: #4f46e5; }
        .divider { border: none; border-top: 1px solid #e8e8e8; }
        .price-box { border: 1px solid #e8e8e8; padding: 32px; background: #fff; }
        .price-box.featured { border-color: #4f46e5; background: #f5f4ff; }
        .step-num { font-family: 'Bebas Neue', sans-serif; font-size: 64px; color: #e8e8e8; line-height: 1; }
        .nav-link { color: #999; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; transition: color 0.2s; }
        .nav-link:hover { color: #0a0a0a; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.8s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.8s 0.2s ease forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.8s 0.4s ease forwards; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.8s 0.6s ease forwards; opacity: 0; }
      `}</style>

      {/* Navbar */}
      <nav style={{ borderBottom: "1px solid #e8e8e8", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fafafa", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
  <img src={logo} alt="Printso" style={{ height: 50, width: "auto" }} />
</div>
        <div style={{ display: "flex", gap: 32 }}>
          <Link to="/login" className="nav-link">Student Login</Link>
          <Link to="/owner-login" className="nav-link">Owner Login</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "120px 40px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="fade-up">
          <p className="tag" style={{ marginBottom: 24 }}>— College Print Delivery</p>
        </div>
        <div className="fade-up-2">
          <h1 className="hero-title">
            SKIP<br />
            THE<br />
            <span style={{ color: "#4f46e5" }}>QUEUE.</span>
          </h1>
        </div>
        <div className="fade-up-3" style={{ maxWidth: 480, marginTop: 40, marginBottom: 48 }}>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "#777" }}>
            Upload your file. Pick a slot. Get your prints delivered straight to your classroom. No waiting, no rushing.
          </p>
        </div>
        <div className="fade-up-4" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link to="/signup" className="btn-primary">
            Get Started <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-outline">
            Sign In
          </Link>
        </div>
      </section>

      <hr className="divider" style={{ maxWidth: 1200, margin: "0 auto" }} />

      {/* How it works */}
      <section style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <p className="tag" style={{ marginBottom: 48 }}>— How it works</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 1, background: "#e8e8e8" }}>
          {[
            { num: "01", icon: Upload,  title: "Upload",  desc: "PDF, image or doc. We handle the rest." },
            { num: "02", icon: Printer, title: "Print",   desc: "Shop gets notified and prints your file." },
            { num: "03", icon: Clock,   title: "Slot",    desc: "Pick 11AM, 1:15PM or 3PM delivery." },
            { num: "04", icon: MapPin,  title: "Deliver", desc: "Delivered to your classroom. Pay cash." },
          ].map(item => (
            <div key={item.num} className="card">
              <div className="step-num">{item.num}</div>
              <item.icon size={20} color="#4f46e5" style={{ marginTop: 16, marginBottom: 12 }} />
              <p style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: "#999", lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" style={{ maxWidth: 1200, margin: "0 auto" }} />

      {/* Pricing */}
      <section style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <p className="tag" style={{ marginBottom: 48 }}>— Pricing</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <div className="price-box">
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#999", marginBottom: 16 }}>Black & White</p>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, lineHeight: 1, marginBottom: 8 }}>₹4 <span style={{ fontSize: 18, color: "#999" }}>/ page</span></p>
            <p style={{ fontSize: 12, color: "#999" }}>Single sided</p>
            <hr className="divider" style={{ margin: "20px 0" }} />
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, lineHeight: 1, marginBottom: 8 }}>₹6 <span style={{ fontSize: 18, color: "#999" }}>/ page</span></p>
            <p style={{ fontSize: 12, color: "#999" }}>Double sided</p>
          </div>
          <div className="price-box featured">
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#4f46e5", marginBottom: 16 }}>Color</p>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, lineHeight: 1, marginBottom: 8 }}>₹10 <span style={{ fontSize: 18, color: "#999" }}>/ page</span></p>
            <p style={{ fontSize: 12, color: "#999" }}>Single sided</p>
            <hr className="divider" style={{ margin: "20px 0" }} />
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, lineHeight: 1, marginBottom: 8 }}>₹20 <span style={{ fontSize: 18, color: "#999" }}>/ page</span></p>
            <p style={{ fontSize: 12, color: "#999" }}>Double sided</p>
          </div>
          <div className="price-box" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 8 }}>
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>Delivery Slots</p>
            {["11:00 AM – 11:10 AM", "1:15 PM – 2:00 PM", "3:00 PM – 3:10 PM"].map(slot => (
              <div key={slot} style={{ border: "1px solid #e8e8e8", padding: "10px 16px", width: "100%", fontSize: 13, color: "#0a0a0a" }}>
                {slot}
              </div>
            ))}
            <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>Cash on delivery</p>
          </div>
        </div>
      </section>

      <hr className="divider" style={{ maxWidth: 1200, margin: "0 auto" }} />

      {/* CTA */}
      <section style={{ padding: "80px 40px", maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
        <div>
          <p className="tag" style={{ marginBottom: 16 }}>— Ready?</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 1 }}>
            STOP WAITING<br />IN LINE.
          </h2>
        </div>
        <Link to="/signup" className="btn-primary" style={{ fontSize: 14 }}>
          Create Account <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e8e8e8", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
  <img src={logo} alt="Printso" style={{ height: 28, width: "auto" }} />
</div>
        <p style={{ fontSize: 11, color: "#bbb", letterSpacing: 1 }}>Print delivery for your college</p>
      </footer>

    </div>
  )
}