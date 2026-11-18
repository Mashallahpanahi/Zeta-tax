import { useEffect, useRef, useState, type ChangeEvent } from "react"; import {
    FaRegBell,
    FaBirthdayCake,
    FaTimes,
    FaSyncAlt,
} from "react-icons/fa";

import { useEmployeeBirthdays } from "../../api/employeeApi";

interface BirthdayEmployee {
    registration_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    birthday_day: number;
}

interface BirthdayCache {
    employees: BirthdayEmployee[];
}

// ---------- Storage Helpers ----------

const getCacheKey = (month: number, year: number) =>
    `birthday-notifications-v3-${year}-${month}`;

const getSeenKey = (month: number, year: number) =>
    `birthday-notifications-seen-v3-${year}-${month}`;

const readCache = (
    month: number,
    year: number,
): BirthdayCache | null => {
    try {
        const saved = localStorage.getItem(getCacheKey(month, year));
        if (!saved) return null;
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed.employees)) return null;
        return parsed as BirthdayCache;
    } catch {
        return null;
    }
};

const readSeenIds = (month: number, year: number): string[] => {
    try {
        const saved = localStorage.getItem(getSeenKey(month, year));
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const getMonthName = (month: number) =>
    new Intl.DateTimeFormat("en-US", {
        month: "long",
    }).format(new Date(2026, month - 1, 1));

// ---------- Component ----------

const BirthdayNotifications = () => {
    const today = new Date();

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const [cachedData, setCachedData] = useState<BirthdayCache | null>(
        () => readCache(currentMonth, currentYear),
    );
    const [seenIds, setSeenIds] = useState<string[]>(
        () => readSeenIds(currentMonth, currentYear),
    );
    const [isOpen, setIsOpen] = useState(false);
    const [shouldFetch, setShouldFetch] = useState(
        () => readCache(currentMonth, currentYear) === null,
    );

    // Tracks the actual calendar month, independently of the month picker
    const currentCalendarKey = useRef(
        `${currentYear}-${currentMonth}`,
    );
    const notificationRef = useRef<HTMLDivElement>(null);

    const cacheKey = getCacheKey(selectedMonth, selectedYear);

    // API request for the selected month and year
    const {
        data,
        loading,
        error,
        refetch,
    } = useEmployeeBirthdays(
        selectedMonth,
        selectedYear,
        shouldFetch,
    );

    // Close the popup when the user clicks outside it.
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // ---------- Save API Response ----------
    useEffect(() => {
        if (
            loading ||
            !data ||
            data.month !== selectedMonth ||
            data.year !== selectedYear ||
            !Array.isArray(data.employees)
        ) {
            return;
        }

        const employees: BirthdayEmployee[] = data.employees.map(
            (employee) => ({
                registration_id: employee.registration_id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                date_of_birth: employee.date_of_birth,
                birthday_day:
                    employee.birthday_day ??
                    Number(employee.date_of_birth.split("-")[2]),
            }),
        );

        const updatedCache: BirthdayCache = {
            employees,
        };

        setCachedData(updatedCache);
        try {
            localStorage.setItem(
                cacheKey,
                JSON.stringify(updatedCache),
            );
        } catch (storageError) {
            console.error("Unable to save birthday data:", storageError);
        }

        setShouldFetch(false);
    }, [data, loading, selectedMonth, selectedYear, cacheKey]);

    // ---------- Automatic Monthly Check ----------

    useEffect(() => {
        const checkForNewMonth = () => {
            const now = new Date();
            const newMonth = now.getMonth() + 1;
            const newYear = now.getFullYear();
            const newCalendarKey = `${newYear}-${newMonth}`;

            // Do nothing if the calendar month has not changed
            if (currentCalendarKey.current === newCalendarKey) {
                return;
            }
            currentCalendarKey.current = newCalendarKey;

            // Automatically switch to the new current month
            setSelectedMonth(newMonth);
            setSelectedYear(newYear);

            // Use cached data if this month was already checked
            const monthlyCache = readCache(newMonth, newYear);

            setCachedData(monthlyCache);
            setSeenIds(readSeenIds(newMonth, newYear));

            // Fetch only if the new month has not been checked
            setShouldFetch(monthlyCache === null);
        };

        // Check periodically for a calendar month change
        const interval = window.setInterval(checkForNewMonth, 60000);

        return () => window.clearInterval(interval);
    }, []);

    // ---------- Derived Data ----------

    const employees = cachedData?.employees ?? [];
    const hasUnreadNotifications = employees.some(
        (employee) => !seenIds.includes(employee.registration_id),
    );
    const monthName = getMonthName(selectedMonth);

    // ---------- Month Picker ----------

    const handleMonthChange = (
        event: ChangeEvent<HTMLSelectElement>,
    ) => {
        const newMonth = Number(event.target.value);
        const monthlyCache = readCache(newMonth, selectedYear);
        setSelectedMonth(newMonth);
        setCachedData(monthlyCache);
        setSeenIds(readSeenIds(newMonth, selectedYear));

        // Fetch only if this selected month has not been checked
        setShouldFetch(monthlyCache === null);
    };

    // ---------- Mark Notifications as Read ----------

    const handleBellClick = () => {
        setIsOpen((previous) => !previous);
        if (employees.length === 0) return;
        const updatedSeenIds = Array.from(
            new Set([
                ...seenIds,
                ...employees.map((employee) => employee.registration_id),
            ]),
        );

        setSeenIds(updatedSeenIds);

        try {
            localStorage.setItem(
                getSeenKey(selectedMonth, selectedYear),
                JSON.stringify(updatedSeenIds),
            );
        } catch (storageError) {
            console.error("Unable to save notification status:", storageError);
        }
    };

    // ---------- Manual Refresh ----------

    const handleRefresh = () => {
        setShouldFetch(true);
        refetch();
    };

    // ---------- UI ----------

    return (
        <div ref={notificationRef} className="relative">

            {/* Notification Bell */}
            <button
                type="button"
                onClick={handleBellClick}
                aria-label="Employee birthday notifications"
                aria-expanded={isOpen}
                className="relative flex items-center justify-center rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-firstRate"
            >
                <FaRegBell
                    className={`text-xl ${hasUnreadNotifications
                        ? "animate-bounce motion-reduce:animate-none"
                        : ""
                        }`}
                />

                {hasUnreadNotifications && (
                    <>
                        <span className="absolute right-1 top-1 h-2.5 w-2.5 animate-ping rounded-full bg-red-500 opacity-75" />

                        <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                    </>
                )}
            </button>

            {/* Birthday Popup */}
            {isOpen && (
                <div
                    className="absolute right-0 top-full z-50 mt-3 w-[340px] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl sm:w-[380px]"
                    role="dialog"
                    aria-label="Employee birthday notifications"
                >

                    {/* Popup Header */}
                    <div className="flex items-center justify-between bg-blue-firstRate px-4 py-4 text-white">

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <FaBirthdayCake className="text-lg" />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Employee Birthdays
                                </h3>

                                <p className="text-xs text-white/80">
                                    {monthName} {selectedYear}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close notifications"
                            className="rounded-full p-2 transition-colors hover:bg-white/20"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Month Selector */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">

                        <span className="text-xs font-medium text-gray-500">
                            Select month
                        </span>

                        <select
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 outline-none transition-colors focus:border-blue-firstRate"
                            aria-label="Select birthday month"
                        >
                            {Array.from({ length: 12 }, (_, index) => {
                                const month = index + 1;

                                return (
                                    <option key={month} value={month}>
                                        {getMonthName(month)}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Birthday Content */}
                    <div className="max-h-80 overflow-y-auto p-4">

                        {/* Loading */}
                        {loading && (
                            <div className="py-8 text-center">
                                <FaSyncAlt className="mx-auto animate-spin text-xl text-blue-firstRate" />

                                <p className="mt-3 text-sm text-gray-500">
                                    Checking employee birthdays...
                                </p>
                            </div>
                        )}

                        {/* Error */}
                        {!loading && error && !cachedData && (
                            <div className="py-6 text-center">
                                <p className="text-sm text-red-500">
                                    Unable to load employee birthdays.
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Please try refreshing.
                                </p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && employees.length === 0 && cachedData !== null && (
                            <div className="py-8 text-center">
                                <FaBirthdayCake className="mx-auto mb-3 text-3xl text-gray-300" />

                                <p className="font-medium text-gray-700">
                                    No birthdays this month
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    There are no employee birthdays in {monthName}.
                                </p>
                            </div>
                        )}

                        {/* Employee List */}
                        {employees.length > 0 && (
                            <>
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-700">
                                        Upcoming birthdays
                                    </p>

                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-firstRate">
                                        {employees.length}{" "}
                                        {employees.length === 1 ? "Employee" : "Employees"}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {employees.map((employee) => (
                                        <div
                                            key={employee.registration_id}
                                            className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                                                <FaBirthdayCake />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-800">
                                                    {employee.first_name} {employee.last_name}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {monthName} {employee.birthday_day}
                                                </p>
                                            </div>

                                            <span className="text-lg">🎂</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3">

                        <p className="text-xs text-gray-400">
                            Birthday reminders
                        </p>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-blue-firstRate transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FaSyncAlt
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
};

export default BirthdayNotifications;

