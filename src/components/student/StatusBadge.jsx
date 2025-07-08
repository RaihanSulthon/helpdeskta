// StatusBadge.jsx - Komponen untuk badge status pesan baru
import React from "react";

const StatusBadge = ({ hasNewMessages, status, className = "" }) => {
  if (!hasNewMessages) return null;

  // GANTI fungsi getStatusConfig dengan:
  const getStatusConfig = (status) => {
    switch (status) {
      case "Tiket Baru":
        return {
          bgColor: "bg-blue-500",
          textColor: "text-white",
          text: "baru", // TETAP "baru"
          pulseColor: "animate-pulse",
        };
      case "Sedang Diproses":
        return {
          bgColor: "bg-orange-500",
          textColor: "text-white",
          text: "baru", // GANTI dari "update" ke "baru"
          pulseColor: "animate-pulse",
        };
      case "Selesai":
        return {
          bgColor: "bg-green-500",
          textColor: "text-white",
          text: "baru", // GANTI dari "selesai" ke "baru"
          pulseColor: "animate-pulse",
        };
      default:
        return {
          bgColor: "bg-gray-500",
          textColor: "text-white",
          text: "baru",
          pulseColor: "animate-pulse",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${config.pulseColor} ${className}`}
    >
      {config.text}
    </span>
  );
};

// 🔧 IMPROVED: FilterButton dengan badge logic yang lebih robust
const FilterButton = ({
  label,
  count,
  active,
  onClick,
  statusType,
  hasNew = false,
}) => {
  // Fungsi untuk mendapatkan warna garis bawah berdasarkan status
  const getActiveBorderColor = (status) => {
    switch (status) {
      case "Semua":
        return "border-blue-600";
      case "Tiket Baru":
        return "border-blue-600"; // 🔧 CHANGED: Konsisten dengan badge biru
      case "Sedang Diproses":
        return "border-orange-600";
      case "Selesai":
        return "border-green-600";
      default:
        return "border-blue-600";
    }
  };

  const getHoverBorderColor = (status) => {
    switch (status) {
      case "Semua":
        return "hover:border-blue-300";
      case "Tiket Baru":
        return "hover:border-blue-300"; // 🔧 CHANGED: Konsisten
      case "Sedang Diproses":
        return "hover:border-orange-300";
      case "Selesai":
        return "hover:border-green-300";
      default:
        return "hover:border-blue-300";
    }
  };

  const getIconColor = (status, isActive) => {
    if (isActive) {
      switch (status) {
        case "Semua":
          return "text-blue-700";
        case "Tiket Baru":
          return "text-blue-700"; // 🔧 CHANGED: Konsisten dengan warna biru
        case "Sedang Diproses":
          return "text-orange-700";
        case "Selesai":
          return "text-green-700";
        default:
          return "text-blue-700";
      }
    } else {
      return "text-gray-500";
    }
  };

  const getStatusColor = (status, isActive) => {
    const baseColors = {
      Semua: isActive ? "text-blue-600" : "text-blue-600",
      "Tiket Baru": isActive ? "text-blue-600" : "text-blue-500", // 🔧 CHANGED
      "Sedang Diproses": isActive ? "text-orange-600" : "text-orange-500",
      Selesai: isActive ? "text-green-600" : "text-green-500",
    };
    return baseColors[status] || "text-blue-600";
  };

  // Status icons (keeping existing)
  const getStatusIcon = (status) => {
    switch (status) {
      case "Semua":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.22266 0.754883H17.7773C18.1864 0.754883 18.5183 0.892314 18.8135 1.1875C19.1087 1.4827 19.2456 1.81392 19.2451 2.22168V17.7773C19.2451 18.1868 19.1081 18.5193 18.8135 18.8145C18.5196 19.1088 18.1881 19.2456 17.7783 19.2451H2.22266C1.81318 19.2451 1.48172 19.1077 1.1875 18.8135C0.893414 18.5194 0.755487 18.1879 0.754883 17.7773V2.22266C0.754883 1.81362 0.891727 1.48181 1.18652 1.1875C1.4451 0.929365 1.73183 0.79235 2.07324 0.761719L2.22266 0.754883ZM1.4668 12.9775H6.16699C6.23726 12.9776 6.28445 12.9934 6.32715 13.0195C6.39907 13.0636 6.4598 13.1207 6.51172 13.1982V13.1973C6.88645 13.7867 7.37279 14.2674 7.9668 14.6309C8.58679 15.0102 9.26999 15.199 10 15.1982C10.73 15.1982 11.4132 15.0092 12.0332 14.6299C12.6275 14.2662 13.1143 13.7857 13.4893 13.1963C13.5412 13.1184 13.6017 13.0612 13.6729 13.0176C13.7147 12.992 13.7617 12.9773 13.8311 12.9775H18.5332V1.4668H1.4668V12.9775Z"
              strokeWidth="1.51"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "Tiket Baru":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.0244 7.16016H19.0254C19.1649 7.30222 19.25 7.49508 19.25 7.70898C19.25 7.91831 19.1674 8.10592 19.0332 8.24707L19.0283 8.25293L8.26953 19.0254C8.12747 19.1649 7.93457 19.2499 7.7207 19.25C7.56005 19.25 7.41135 19.202 7.28711 19.1191L7.17188 19.0254L6.13672 17.9902C6.40416 17.5264 6.55009 16.9974 6.5459 16.4531C6.5446 16.2875 6.52579 16.124 6.49805 15.9629L7.41016 16.875L7.41602 16.8818L7.42285 16.8877C7.70619 17.1581 8.08293 17.3089 8.47461 17.3086C8.8664 17.3083 9.24343 17.1568 9.52637 16.8857L9.53223 16.8799L9.53711 16.874L16.8701 9.54102L16.8691 9.54004C17.0088 9.40227 17.1209 9.23933 17.1973 9.05859C17.2748 8.87499 17.3152 8.67786 17.3154 8.47852C17.3155 8.329 17.2928 8.18048 17.249 8.03809L17.1982 7.89746L17.1338 7.7627C17.0626 7.63183 16.9712 7.51171 16.8643 7.40723L16.0361 6.5791C16.1728 6.59635 16.3108 6.60797 16.4492 6.60645C16.8529 6.60193 17.2517 6.51704 17.6221 6.35645C17.7564 6.29819 17.8839 6.22604 18.0078 6.14941L19.0244 7.16016ZM14.2031 8.47461L8.47363 14.2051L5.7832 11.5137L11.5117 5.78418L14.2031 8.47461ZM12.2783 0.75C12.4389 0.75 12.5877 0.798004 12.7119 0.880859L12.8271 0.974609L13.8359 1.9834C13.7602 2.10632 13.6905 2.23314 13.6328 2.36621C13.4721 2.73682 13.3863 3.13609 13.3818 3.54004C13.3803 3.67754 13.3912 3.81436 13.4082 3.9502L12.5752 3.11719L12.5684 3.11133L12.5625 3.10547L12.4521 3.00879C12.1849 2.79877 11.8534 2.6834 11.5107 2.68359C11.119 2.6839 10.7419 2.83547 10.459 3.10645L3.11426 10.4512C2.97471 10.5889 2.86343 10.7529 2.78711 10.9336C2.70952 11.1173 2.67008 11.3152 2.66992 11.5146C2.66982 11.7138 2.70897 11.9111 2.78613 12.0947C2.86225 12.2757 2.97376 12.4401 3.11328 12.5781V12.5791L4.02441 13.4902C3.86361 13.4627 3.70038 13.4446 3.53516 13.4434C2.99155 13.4393 2.46335 13.5846 2 13.8516L0.974609 12.8174C0.835126 12.6753 0.750058 12.4824 0.75 12.2686C0.75 12.0546 0.834102 11.8609 0.973633 11.7188L6.35156 6.34766L11.7295 0.973633L11.7305 0.974609C11.8725 0.83519 12.0645 0.750089 12.2783 0.75Z"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "Sedang Diproses":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 0.75C15.0996 0.75 19.25 4.90037 19.25 10C19.25 15.0996 15.0996 19.25 10 19.25C4.90037 19.25 0.75 15.0996 0.75 10C0.75 4.90037 4.90037 0.75 10 0.75ZM8.13379 11.5723L8.5 11.791L13.4023 14.7158L14.0459 15.0996L14.4307 14.4561L15.2197 13.1348L15.6035 12.4912L14.96 12.1064L11.1729 9.84766V4.2207H8.13379V11.5723Z"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "Selesai":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 0.75C12.6581 0.75 15.053 1.88432 16.7432 3.69238C13.6407 6.0346 11.448 8.70968 10.2109 10.4375C9.55016 9.6939 8.67362 8.83111 7.65723 8.13965L7.375 7.95508L6.72559 7.54492L6.0918 7.14355L5.69141 7.77734L4.86914 9.07812L4.4668 9.71289L5.10254 10.1133L5.75293 10.5225V10.5234C6.64925 11.0906 7.46809 11.9096 8.07617 12.6133C8.66489 13.2946 9.02617 13.8326 9.03711 13.8486L9.05078 13.8701L9.06641 13.8896L9.32617 14.2344L9.55078 14.5332H11.2246L11.4395 14.1523L11.6592 13.7637C11.6592 13.7637 12.3233 12.6082 13.5947 11.0205C14.7407 9.58947 16.3698 7.82006 18.4395 6.22949C18.9586 7.38242 19.25 8.65681 19.25 10C19.25 15.0996 15.0996 19.25 10 19.25C4.90037 19.25 0.75 15.0996 0.75 10C0.750009 4.90035 4.90037 0.75 10 0.75Z"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      className={`relative flex items-center gap-7 px-6 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
        active
          ? getActiveBorderColor(statusType)
          : `border-transparent ${getHoverBorderColor(statusType)}`
      }`}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={`${getIconColor(statusType, active)} flex-shrink-0 mt-1`}>
        {getStatusIcon(statusType)}
      </div>

      {/* Content */}
      <div className="flex-1 text-left">
        {/* Nama Status */}
        <div className="flex items-center justify-between">
          <span
            className={`font-semibold ${
              active
                ? getStatusColor(statusType, true)
                    .replace("text-", "text-")
                    .replace("-600", "-700")
                : "text-gray-700"
            }`}
          >
            {label}
          </span>
        </div>

        {/* Count + Badge */}
        <div className="flex items-center gap-2 mt-1">
          {/* Angka Count */}
          <div
            className={`text-2xl font-bold ${
              active ? getStatusColor(statusType, true) : "text-gray-900"
            }`}
          >
            {count.toLocaleString()}
          </div>

          {/* 🔧 IMPROVED: Badge dengan animasi yang lebih menarik perhatian */}
          {hasNew && (
            <div className="relative">
              <StatusBadge
                hasNewMessages={true}
                status={statusType}
                className="flex-shrink-0 relative z-10"
              />
              {/* Ring animasi untuk menarik perhatian lebih */}
              <div className="absolute inset-0 bg-current opacity-20 rounded-full animate-ping"></div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

// Helper functions untuk border dan background (unchanged)
const getStatusBorderColor = (category) => {
  switch (category) {
    case "Tiket Baru":
      return "border-l-blue-500 ml-5"; // 🔧 CHANGED: Konsisten dengan warna biru
    case "Sedang Diproses":
      return "border-l-orange-500 ml-5";
    case "Selesai":
      return "border-l-green-500 ml-5";
    default:
      return "border-l-gray-300 ml-5";
  }
};

const getStatusBgColor = (category) => {
  switch (category) {
    case "Tiket Baru":
      return "bg-blue-50"; // 🔧 CHANGED: Konsisten dengan warna biru
    case "Sedang Diproses":
      return "bg-orange-50";
    case "Selesai":
      return "bg-green-50";
    default:
      return "bg-gray-50";
  }
};

export { StatusBadge, FilterButton, getStatusBorderColor, getStatusBgColor };
export default StatusBadge;
