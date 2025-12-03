import { Home, BarChart2, BookOpen, LineChart, Brain } from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  <li>
  <a href="/global">Global Analysis</a>
</li>

  const links = [
    { name: "Home", path: "/home", icon: <Home size={20} /> },
    { name: "Overview", path: "/overview", icon: <BarChart2 size={20} /> },
    { name: "Global Analysis", path: "/globalanalysis", icon: <LineChart size={20} /> },
    { name: "Study Habits", path: "/studyhabits", icon: <BookOpen size={20} /> },
    { name: "Performance", path: "/performance", icon: <Brain size={20} /> },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white p-5 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">AI Stats</h1>

      <nav className="flex flex-col gap-4">
        {links.map((link) => (
          <Link key={link.path} to={link.path} className="flex items-center gap-3 hover:text-blue-400">
            {link.icon}
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
