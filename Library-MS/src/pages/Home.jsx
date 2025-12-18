// src/pages/Home.jsx
import libraryHero from "../assets/home.webp";
import libraryMission from "../assets/library.jpg";
import libraryVision from "../assets/library3.jpeg";
import libraryValues from "../assets/library2.jpeg"; // reuse or another image

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center bg-cover bg-center h-[500px]"
        style={{ backgroundImage: `url(${libraryHero})` }}
      >
        <div className="absolute inset-0 bg-opacity-50"></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Welcome to Woldia University Digital Library
          </h1>
          <p className="text-white text-lg md:text-2xl max-w-2xl font-bold mx-auto drop-shadow-md">
            Explore books, manage borrowings and returns, and track availability with ease.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values Section */}
      <section className="container mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">
          Our Core Principles
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Mission */}
          <div className="bg-white shadow-lg rounded-xl p-6 hover:scale-105 transition transform duration-300">
            <img
              src={libraryMission}
              alt="Mission"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
            <p className="text-gray-700">
              To provide students and faculty with easy access to digital resources, supporting research and learning across all disciplines.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white shadow-lg rounded-xl p-6 hover:scale-105 transition transform duration-300">
            <img
              src={libraryVision}
              alt="Vision"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
            <p className="text-gray-700">
              To become a leading digital library in Ethiopia, empowering knowledge discovery and innovation for all students and researchers.
            </p>
          </div>

          {/* Values */}
          <div className="bg-white shadow-lg rounded-xl p-6 hover:scale-105 transition transform duration-300">
            <img
              src={libraryValues}
              alt="Values"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Our Values</h3>
            <p className="text-gray-700">
              Accessibility, Integrity, Excellence, and Innovation guide our library services and support student success.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-gray-50 py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">About Our Library</h2>
          <p className="text-gray-700 text-lg">
            Our Library Management System allows users to explore books easily, manage borrowings and returns, and track availability in real-time. Whether you’re a student, teacher, or book lover, we provide a seamless digital experience to access knowledge.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-white py-16 px-6">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Contact Us</h2>
        <div className="max-w-3xl mx-auto text-center space-y-3 text-gray-700">
          <p>Email: Digitallibrary@gmail.com</p>
          <p>Phone: +251 924-16-49-94</p>
          <p>Address: Digital Library, Woldia University, Ethiopia</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-6 mt-auto">
        <div className="container mx-auto text-center">
          &copy; {new Date().getFullYear()} Library Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
