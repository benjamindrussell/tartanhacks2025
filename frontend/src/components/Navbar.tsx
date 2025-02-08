import logo from '../assets/logo.png';

function NotificationBell() {
  return (
    <svg 
      className="w-6 h-6 text-gray-400 hover:text-white transition-colors" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <img
              src={logo}
              alt="Workflow AI"
              className="h-8 w-auto"
            />
          </div>
          {/* Right side - Navigation */}
          <div className="flex items-center space-x-6">
            {/* Notification Bell */}
            <button className="relative">
              <NotificationBell />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs">3</span>
              </span>
            </button>

            {/* Profile Picture */}
            <button className="flex items-center">
              <img
                src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
                alt="Profile"
                className="h-8 w-8 rounded-full ring-2 ring-gray-800 hover:ring-green-500 transition-all"
              />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}