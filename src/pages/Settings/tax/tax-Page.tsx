// import { useState, useEffect } from "react";
// import { getTaxes } from "../../../api/taxApi";
// import TaxFormModal from "../../../components/tax/TaxFormModal";

// export default function TaxPage() {
//   const { data: taxes, message, loading, error, refetch } = getTaxes();

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [visibleMessage, setVisibleMessage] = useState<string | null>(null);

//   useEffect(() => {
//     if (!message) return;
//     setVisibleMessage(message);
//     const timer = setTimeout(() => setVisibleMessage(null), 5000);
//     return () => clearTimeout(timer);
//   }, [message]);

//   const taxData = taxes && taxes.length > 0 ? taxes[0] : null;

//   if (loading) return <p className="p-6">Loading tax configuration...</p>;

//   if (error && !taxData) {
//     return (
//       <div className="p-6 space-y-4">
//         <p className="text-red-500">Error: {error}</p>
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="rounded-lg bg-blue-firstRate px-4 py-2 text-white transition hover:opacity-90"
//         >
//           Create Configuration
//         </button>
//         <TaxFormModal
//           isOpen={isModalOpen}
//           existingData={null}
//           onClose={() => setIsModalOpen(false)}
//           onSuccess={refetch}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full min-w-[600px] max-w-4xl space-y-6 p-4 sm:p-6">
//       {/* ---------- TOP BAR ---------- */}
//       <div className="flex flex-wrap items-center justify-between gap-4">
//         <div>
//           <div className="flex flex-wrap items-baseline gap-3">
//             <h1 className="text-xl font-bold text-black">
//               Tax Table Configuration
//             </h1>
//             {visibleMessage && (
//               <p className="text-sm text-green-600">{visibleMessage}</p>
//             )}
//           </div>
//           <p className="mt-1 text-sm text-gray-500">
//             Manage the global tax rates applied to calculations.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => setIsModalOpen(true)}
//           className="rounded-lg bg-blue-firstRate px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-firstRate/90"
//         >
//           {taxData ? "Edit Configuration" : "+ Create Configuration"}
//         </button>
//       </div>

//       {/* ---------- DATA CARD ---------- */}
//       {taxData ? (
//         /* ✅ Added max-w-4xl to keep the card from stretching across the whole page */
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 max-w-4xl space-y-6">
//           {/* General */}
//           <div>
//             <h3 className="text-xs font-bold text-blue-firstRate mb-3 uppercase tracking-wider">
//               General Rates
//             </h3>
//             <div className="grid grid-cols-2 gap-3">
//               <DataBlock label="Quarterly Tax" value={taxData.quarterly} />
//               <DataBlock label="Yearly Tax" value={taxData.yearly} />
//             </div>
//           </div>

//           {/* Salary */}
//           <div>
//             <h3 className="text-xs font-bold text-blue-firstRate mb-3 uppercase tracking-wider">
//               Salary Ranges
//             </h3>
//             <div className="grid grid-cols-3 gap-3">
//               <DataBlock
//                 label="Under 10k"
//                 value={taxData.salary_range_under_10k}
//               />
//               <DataBlock
//                 label="10k - 100k"
//                 value={taxData.salary_range_above_10k}
//               />
//               <DataBlock
//                 label="Above 100k"
//                 value={taxData.salary_range_above_100k}
//               />
//             </div>
//           </div>

//           {/* Rent */}
//           <div>
//             <h3 className="text-xs font-bold text-blue-firstRate mb-3 uppercase tracking-wider">
//               Rent Ranges
//             </h3>
//             <div className="grid grid-cols-3 gap-3">
//               <DataBlock label="Under 10k" value={taxData.rent_under_10k} />
//               <DataBlock label="10k - 100k" value={taxData.rent_above_10k} />
//               <DataBlock label="Above 100k" value={taxData.rent_above_100k} />
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-6 text-xs text-gray-400">
//             <p>Created: {new Date(taxData.created_at).toLocaleString()}</p>
//             <p>Last Updated: {new Date(taxData.updated_at).toLocaleString()}</p>
//           </div>
//         </div>
//       ) : (
//         <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center bg-gray-50 max-w-4xl">
//           <p className="text-gray-500 mb-4">
//             No tax configuration found in the system.
//           </p>
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="text-blue-firstRate font-semibold hover:underline"
//           >
//             Click here to create one
//           </button>
//         </div>
//       )}

//       {/* ---------- MODAL ---------- */}
//       <TaxFormModal
//         isOpen={isModalOpen}
//         existingData={taxData}
//         onClose={() => setIsModalOpen(false)}
//         onSuccess={refetch}
//       />
//     </div>
//   );
// }

// // ✅ Updated Reusable component to be smaller and tighter
// function DataBlock({
//   label,
//   value,
// }: {
//   label: string;
//   value: string | number;
// }) {
//   return (
//     <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col justify-center">
//       <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
//       <p className="text-xl font-bold text-blue-firstRate">{Number(value)}%</p>
//     </div>
//   );
// }




import { useState, useEffect } from "react";
import { getTaxes } from "../../../api/taxApi";
import TaxFormModal from "../../../components/tax/TaxFormModal";
import ResponsivePage from "../../../components/common/ResponsivePage";
import Loader from "../../../components/common/Loader";

export default function TaxPage() {
  const { data: taxes, message, loading, error, refetch } = getTaxes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleMessage, setVisibleMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;

    setVisibleMessage(message);

    const timer = setTimeout(() => setVisibleMessage(null), 5000);

    return () => clearTimeout(timer);
  }, [message]);

  const taxData = taxes && taxes.length > 0 ? taxes[0] : null;

  if (loading) {
    return <Loader message="Loading tax configuration..." fullPage />;
  }

  if (error && !taxData) {
    return (
      <ResponsivePage>
        <div className="space-y-4">
          <p role="alert" className="text-red-500">
            Error: {error}
          </p>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full rounded-lg bg-blue-firstRate px-4 py-2 text-white transition hover:opacity-90 min-[520px]:w-auto"
          >
            Create Configuration
          </button>

          <TaxFormModal
            isOpen={isModalOpen}
            existingData={null}
            onClose={() => setIsModalOpen(false)}
            onSuccess={refetch}
          />
        </div>
      </ResponsivePage>
    );
  }

  return (
    <ResponsivePage>
      {/* Header */}
      <div className="flex flex-col gap-4 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-black 2xl:text-2xl">
              Tax Table Configuration
            </h1>

            {visibleMessage && (
              <p className="text-sm text-green-600">
                {visibleMessage}
              </p>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500 2xl:text-base">
            Manage the global tax rates applied to calculations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full shrink-0 rounded-lg bg-blue-firstRate px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-blue-firstRate/90 min-[640px]:w-auto"
        >
          {taxData ? "Edit Configuration" : "+ Create Configuration"}
        </button>
      </div>

      {/* Tax Configuration Card */}
      {taxData ? (
        <div className="w-full min-w-0 max-w-[1600px] space-y-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm min-[520px]:p-6 min-[1024px]:p-8">
          {/* General Rates */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-firstRate">
              General Rates
            </h3>

            <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2">
              <DataBlock
                label="Quarterly Tax"
                value={taxData.quarterly}
              />

              <DataBlock
                label="Yearly Tax"
                value={taxData.yearly}
              />
            </div>
          </div>

          {/* Salary Ranges */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-firstRate">
              Salary Ranges
            </h3>

            <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 min-[1024px]:grid-cols-3">
              <DataBlock
                label="Under 10k"
                value={taxData.salary_range_under_10k}
              />

              <DataBlock
                label="10k - 100k"
                value={taxData.salary_range_above_10k}
              />

              <DataBlock
                label="Above 100k"
                value={taxData.salary_range_above_100k}
              />
            </div>
          </div>

          {/* Rent Ranges */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-firstRate">
              Rent Ranges
            </h3>

            <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 min-[1024px]:grid-cols-3">
              <DataBlock
                label="Under 10k"
                value={taxData.rent_under_10k}
              />

              <DataBlock
                label="10k - 100k"
                value={taxData.rent_above_10k}
              />

              <DataBlock
                label="Above 100k"
                value={taxData.rent_above_100k}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 text-xs text-gray-400 min-[640px]:flex-row min-[640px]:flex-wrap min-[640px]:gap-6 2xl:text-sm">
            <p className="break-words">
              Created: {new Date(taxData.created_at).toLocaleString()}
            </p>

            <p className="break-words">
              Last Updated: {new Date(taxData.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[1600px] rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center min-[520px]:p-10">
          <p className="mb-4 text-gray-500">
            No tax configuration found in the system.
          </p>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="font-semibold text-blue-firstRate hover:underline"
          >
            Click here to create one
          </button>
        </div>
      )}

      {/* Tax Configuration Modal */}
      <TaxFormModal
        isOpen={isModalOpen}
        existingData={taxData}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </ResponsivePage>
  );
}

// Reusable Tax Data Block
function DataBlock({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-center rounded-lg border border-gray-100 bg-gray-50 p-3 min-[520px]:p-4">
      <p className="mb-1 text-xs font-medium text-gray-500">
        {label}
      </p>

      <p className="break-words text-xl font-bold text-blue-firstRate 2xl:text-2xl">
        {Number(value)}%
      </p>
    </div>
  );
}
