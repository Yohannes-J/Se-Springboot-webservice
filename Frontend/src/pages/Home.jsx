import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import libraryHero from "../assets/home.jpeg";
import libraryMission from "../assets/library.jpg";
import libraryVision from "../assets/library3.jpeg";
import libraryValues from "../assets/library2.jpeg";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900 bg-white scroll-smooth">

      {/* Custom Shimmer Animation Style */}
      <style>
        {`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-out forwards;
          }
        `}
      </style>

      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center h-[95vh] bg-cover bg-fixed bg-center"
        style={{ backgroundImage: `url(${libraryHero})` }}
      >
        {/* Modern Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 backdrop-blur-[2px]"></div>

        <div className="relative z-10 text-center px-6 max-w-5xl animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl">
            Woldia University <br />
            <span className="text-blue-400">Digital Library</span>
          </h1>

          <p className="text-gray-100 text-lg md:text-2xl mb-10 leading-relaxed font-light max-w-3xl mx-auto drop-shadow-md">
            A modern digital gateway to academic excellence. Search, borrow,
            read online, and download thousands of books and learning materials
            while managing your library activities effortlessly in one
            intelligent platform.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => navigate("/books")}
              className="relative group overflow-hidden px-14 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white rounded-full font-bold text-xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] hover:-translate-y-1 active:scale-95"
            >
              {/* Shimmer Effect Layer */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></span>

              <span className="relative flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 transition-transform group-hover:rotate-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Books
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Principles Section */}
      <section className="bg-white py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Our Core Principles
            </h2>
            <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                img: libraryMission,
                title: "Our Mission",
                text: "To deliver seamless access to digital and physical library resources, enabling users to borrow books, read online, download materials, and support academic success across all disciplines.",
              },
              {
                img: libraryVision,
                title: "Our Vision",
                text: "To become a leading digital library in Ethiopia by embracing technology-driven solutions that empower research, innovation, and lifelong learning.",
              },
              {
                img: libraryValues,
                title: "Our Values",
                text: "Accessibility, integrity, innovation, and excellence guide our commitment to providing a reliable, secure, and user-friendly digital library experience.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group bg-white border border-gray-100 shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500"
              >
                <div className="overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="bg-slate-50 py-28 px-6 border-y border-gray-200"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-blue-600 font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
            Knowledge Hub
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 tracking-tight">
            About Our Library
          </h2>
          <div className="text-gray-600 text-xl leading-relaxed font-light space-y-6">
            <p>
              The Woldia University Digital Library Management System transforms
              traditional library services into a modern digital experience.
              Users can easily search for books, borrow physical and digital
              materials, read books online, download resources for offline use,
              and monitor borrowing and return activities in real time.
            </p>
            <p>
              Designed for students, lecturers, and researchers, our system
              provides a{" "}
              <span className="text-blue-600 font-semibold italic">
                secure, efficient, and highly intuitive platform
              </span>{" "}
              that enhances learning, research, and knowledge sharing across the
              university community.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-white py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-blue-950 rounded-[3rem] p-12 md:p-20 text-white flex flex-col items-center text-center shadow-2xl shadow-blue-900/30">
            <h2 className="text-4xl md:text-5xl font-bold mb-10 tracking-tight">
              Get In Touch
            </h2>
            <div className="grid md:grid-cols-3 gap-12 w-full">
              <div className="space-y-3">
                <p className="text-blue-400 font-semibold tracking-widest uppercase text-xs">
                  Email Us
                </p>
                <p className="text-lg font-medium tracking-tight">
                  digitallibrary@wldu.edu.et
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-blue-400 font-semibold tracking-widest uppercase text-xs">
                  Call Us
                </p>
                <p className="text-lg font-medium">+251 924 16 49 94</p>
              </div>
              <div className="space-y-3">
                <p className="text-blue-400 font-semibold tracking-widest uppercase text-xs">
                  Visit Us
                </p>
                <p className="text-lg font-medium">
                  Woldia University, Ethiopia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 py-16 mt-auto border-t border-gray-900">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-8">
            <h2 className="text-white text-3xl font-black italic tracking-tighter">
              WOLDIA <span className="text-blue-600">DIGITAL</span>
            </h2>
          </div>
          <p className="mb-6 text-sm">
            © {new Date().getFullYear()} Digital Library Management System.
            Empowering Knowledge Through Technology.
          </p>
          <div className="flex justify-center gap-8 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}