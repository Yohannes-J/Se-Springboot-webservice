import Sidebar from "./Sidebar";

export default function SidebarLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-25 p-2 bg-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  );
}
