import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Search, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.jpg';

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const categories = [
  {
    name: 'Voeding',
    items: [
      { name: 'Droogvoer', path: '/categorie/hondenvoeding?type=DROOGVOER' },
      { name: 'Natvoer', path: '/categorie/hondenvoeding?type=NATVOER' },
      { name: 'Diepvriesvoer', path: '/categorie/hondenvoeding?type=DIEPVRIESVOER' },
      { name: 'Alle voeding', path: '/categorie/hondenvoeding' },
    ],
  },
  {
    name: 'Speelgoed',
    items: [
      { name: 'Alle speelgoed', path: '/categorie/hondenspeelgoed' },
    ],
  },
  {
    name: 'Snacks',
    items: [
      { name: 'Alle snacks', path: '/categorie/hondensnacks' },
    ],
  },
  {
    name: 'Training',
    items: [
      { name: 'Alle training', path: '/categorie/hondentraining' },
    ],
  },
];

const Navbar: React.FC<NavbarProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setIsSearchExpanded(false);
      setSearchTerm('');
      setIsMenuOpen(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => {
        const searchInput = document.getElementById('searchInput');
        searchInput?.focus();
      }, 100);
    } else {
      setSearchTerm('');
    }
  };

  const handleDropdownClick = (categoryName: string) => {
    setOpenDropdown(openDropdown === categoryName ? null : categoryName);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-24">
          {/* Left section with menu button and logo */}
          <div className={`flex items-center transition-all duration-300 ease-in-out transform ${
            isSearchExpanded ? 'md:flex md:opacity-100 opacity-0 -translate-x-full md:translate-x-0' : 'opacity-100 translate-x-0'
          }`}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Happy Huisdier Logo" className="h-16 w-auto" />
            </Link>
          </div>

          {/* Search section */}
          <div className={`md:flex-1 md:mx-8 transition-all duration-300 ease-in-out ${
            isSearchExpanded 
              ? 'absolute left-0 right-0 px-4 flex items-center h-full bg-white opacity-100 transform translate-x-0' 
              : 'hidden md:flex opacity-0 md:opacity-100 transform translate-x-full md:translate-x-0'
          }`}>
            <form onSubmit={handleSearch} className="w-full flex items-center relative">
              <input
                id="searchInput"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Zoek producten..."
                className="w-full border rounded-full px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
              />
              {isSearchExpanded ? (
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="absolute right-3 p-2 transition-all duration-200 hover:scale-110"
                >
                  <X size={20} className="text-gray-500 hover:text-gray-800" />
                </button>
              ) : (
                <button type="submit" className="absolute right-3 p-2">
                  <Search size={20} className="text-gray-500 hover:text-gray-800" />
                </button>
              )}
            </form>
          </div>

          {/* Right section with search toggle and cart */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSearch}
              className="md:hidden p-2 transition-transform duration-200 hover:scale-110"
              aria-label="Toggle search"
            >
              <Search size={24} className="text-gray-600" />
            </button>

            <Link 
              to="/cart"
              className={`relative p-2 transition-all duration-300 ease-in-out transform ${
                location.pathname === '/cart' ? 'text-blue-500' : ''
              } ${
                isSearchExpanded ? 'md:flex md:opacity-100 opacity-0 translate-x-full md:translate-x-0' : 'opacity-100 translate-x-0'
              }`}
            >
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-t border-gray-100">
        <div className="container mx-auto px-4">
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {categories.map((category) => (
              <div
                key={category.name}
                className="relative group"
                onMouseEnter={() => handleDropdownClick(category.name)}
                onMouseLeave={() => handleDropdownClick('')}
              >
                <button
                  className={`py-3 flex items-center space-x-1 text-sm font-medium ${
                    openDropdown === category.name
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <span>{category.name}</span>
                  <ChevronDown size={16} className={`transform transition-transform ${
                    openDropdown === category.name ? 'rotate-180' : ''
                  }`} />
                </button>

                {openDropdown === category.name && (
                  <div className="absolute left-0 mt-0 w-48 bg-white rounded-b-lg shadow-lg py-2 z-50">
                    {category.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Menu */}
          <div 
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-2 space-y-1">
              {categories.map((category) => (
                <div key={category.name} className="border-b border-gray-100 last:border-b-0">
                  <button
                    onClick={() => handleDropdownClick(category.name)}
                    className="w-full px-4 py-2 flex items-center justify-between text-gray-700"
                  >
                    <span className="font-medium">{category.name}</span>
                    <ChevronDown
                      size={16}
                      className={`transform transition-transform duration-300 ${
                        openDropdown === category.name ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      openDropdown === category.name ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="bg-gray-50 py-2">
                      {category.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="block px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                          onClick={() => {
                            setOpenDropdown(null);
                            setIsMenuOpen(false);
                          }}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;