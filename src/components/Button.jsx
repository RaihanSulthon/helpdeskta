// src/components/Button.jsx
const Button = ({ text, onClick, type = "primary" }) => {
    // Style dasar yang selalu ada
    const baseStyle = "font-medium py-2 px-4 rounded transition-colors duration-200";
    
    // Style berdasarkan tipe button
    let typeStyle = "";
    if (type === "primary") {
      // Mengubah warna background menjadi biru yang lebih cerah
      typeStyle = "bg-blue-600 hover:bg-blue-700 text-white";
    } else if (type === "secondary") {
      typeStyle = "bg-gray-200 hover:bg-gray-300 text-gray-800";
    } else if (type === "danger") {
      typeStyle = "bg-red-500 hover:bg-red-600 text-white";
    }
    
    // Gabungkan style
    const className = `${baseStyle} ${typeStyle}`;
    
    return (
      <button
        type="button" 
        onClick={onClick}
        className={className}
      >
        {text}
      </button>
    );
  };
  
  export default Button;