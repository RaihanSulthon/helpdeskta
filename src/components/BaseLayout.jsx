import React from "react";
import bgdashboard from "../assets/bgdashboard.jpg"

const BaseLayout = ({children}) => {
    return (
        <div className="min-h-screen relative">
            {/* Layer 1 (Background Merah) */}
            <div className="fixed inset-0 z-0" style={{ backgroundColor: '#ECF0F5' }}></div>
            {/* layer 2 (Background Gambar Gedung) */}
            <div className="fixed inset-0 z-10">
                <div 
                className="w-full h-1/3 bg-cover bg-center bg-no-repeat opacity-100"
                style={{
                    backgroundImage: `url(${bgdashboard})`,
                    backgroundPosition: 'top center',
                }}
                ></div>
            </div>

            {/* Layer 3 (Konten Utama) */}
            <div className="relative z-20">
                {children}
            </div>
        </div>
    )
}

export default BaseLayout;