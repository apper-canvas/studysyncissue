import { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";
import { cn } from "@/utils/cn";

const SearchBar = ({ onSearch, placeholder = "Search...", className }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <ApperIcon name="Search" className="w-4 h-4 text-gray-500" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-10"
      />
      {searchTerm && (
        <button
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ApperIcon name="X" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;