// Header.jsx
import React, { useState } from "react";
import Icon from "./Icon";
import Button from "./Button";
import TextField from "./TextField";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="flex items-center justify-between w-full px-4 py-2 bg-white shadow-sm">
      {/* Left section */}
      <div className="flex items-center">
        <Button className="mr-2">
          <Icon name="menu" size={24} />
        </Button>
        <div className="hidden md:block">
          <img src="/logo.svg" alt="Logo" className="h-8" />
        </div>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 mx-4 max-w-2xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon name="search" size={20} />
          </div>
          <TextField
            type="text"
            placeholder="Telusuri Email"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Button>
              <Icon name="settings" size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-2">
        <Button>{/* <Icon name="help" size={20} /> */}</Button>
        <Button>{/* <Icon name="settings" size={20} /> */}</Button>
        <Button>{/* <Icon name="apps" size={20} /> */}</Button>
        <Button>{/* <Icon name="customize" size={20} /> */}</Button>
      </div>
    </header>
  );
};

export default Header;
