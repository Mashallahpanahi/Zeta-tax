import { FaSearch } from "react-icons/fa";
import BirthdayNotifications from "../../common/BirthdayNotifications";

const Header = () => {
  return (
    <header className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-white px-3 py-4 sm:px-5 sm:py-5 lg:rounded-t-3xl lg:px-8 lg:py-6">
      {/* LEFT: Search Bar */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <div className="relative w-full max-w-64">
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400"></div>
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
