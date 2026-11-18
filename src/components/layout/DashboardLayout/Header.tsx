
import { FaSearch } from "react-icons/fa";
import BirthdayNotifications from "../../common/BirthdayNotifications";

const Header = () => {
  return (
    <header className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-white px-3 py-4 sm:px-5 sm:py-5 lg:rounded-t-3xl lg:px-8 lg:py-6">

      {/* LEFT: Search Bar */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <span className="shrink-0 text-sm font-medium text-gray-500">
          Short:
        </span>

        <div className="relative w-full max-w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-4 pr-10 text-sm text-gray-700 transition-colors focus:border-blue-firstRate focus:outline-none"
          />

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
            <FaSearch className="text-xs" />
          </div>
        </div>
      </div>

      {/* RIGHT: Birthday Notifications */}
      <div className="flex shrink-0 items-center">
        <BirthdayNotifications />
      </div>

    </header>
  );
};

export default Header;
