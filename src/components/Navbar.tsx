import React, { useState, useRef, useEffect } from 'react';
<<<<<<< HEAD
import { ShoppingCart, Menu, X, Search, ChevronDown, User } from 'lucide-react';
=======
import { ShoppingCart, Menu, X, Search, ChevronDown, User, Truck, Timer, MessageCircleHeart } from 'lucide-react';
>>>>>>> 29f35ef (Chatbot v0.1)
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useQuery } from 'urql';
import { gql } from 'urql';
import { useClickOutside } from '../hooks/useClickOutside';
import logo from '../assets/logo.jpg';

const SEARCH_SUGGESTIONS_QUERY = gql`
  query SearchSuggestions($query: String!) {
    products(first: 5, query: $query) {
      edges {
        node {
          id
          title
          productType
          images(first: 1) {
            edges {
              node {
                originalSrc
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
            }
          }
        }
      }
    }
  }
`;

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

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const SHOPIFY_ACCOUNT_URL = 'https://yvdedm-5e.myshopify.com/account';

const formatPrice = (price: number): string => {
  return price.toFixed(2).replace('.', ',');
};

const Navbar: React.FC<NavbarProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        setDebouncedQuery(searchTerm);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search suggestions query
  const [{ data: suggestionsData }] = useQuery({
    query: SEARCH_SUGGESTIONS_QUERY,
    variables: { query: debouncedQuery },
    pause: debouncedQuery.length < 2,
  });

  // Close suggestions on click outside
  useClickOutside(searchContainerRef, () => {
    setShowSuggestions(false);
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setIsSearchExpanded(false);
      setShowSuggestions(false);
      setSearchTerm('');
      setIsMenuOpen(false);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    const id = productId.split('/').pop();
    navigate(`/product/${id}`);
    setSearchTerm('');
    setShowSuggestions(false);
    setIsSearchExpanded(false);
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
      setShowSuggestions(false);
    }
  };

  const handleDropdownClick = (categoryName: string) => {
    setOpenDropdown(openDropdown === categoryName ? null : categoryName);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
<<<<<<< HEAD
=======
      {/* Benefits Bar */}
      <div className="bg-[#63D7B2] text-white">
        <div className="container mx-auto px-4">
          <div className="hidden md:flex justify-center items-center gap-12 py-2">
            <div className="flex items-center gap-2">
              <Truck size={18} />
              <span className="text-sm">Gratis verzending vanaf €59</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer size={18} />
              <span className="text-sm">Voor 17:00 besteld, dezelfde dag verzonden</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircleHeart size={18} />
              <span className="text-sm">Vragen? Wij helpen graag!</span>
            </div>
          </div>
        </div>
      </div>

>>>>>>> 29f35ef (Chatbot v0.1)
      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-24 relative">
          {/* Left section with menu button and logo */}
          <div className={`flex items-center transition-all duration-300 ease-in-out ${
            isSearchExpanded ? 'w-0 opacity-0 overflow-hidden md:w-auto md:opacity-100' : 'w-auto opacity-100'
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
          <div 
            ref={searchContainerRef}
            className={`md:flex-1 md:mx-8 transition-all duration-300 ease-in-out transform ${
              isSearchExpanded 
                ? 'absolute left-4 right-[104px] md:static md:right-auto opacity-100 translate-x-0' 
                : 'hidden md:block opacity-0 -translate-x-4 md:translate-x-0 md:opacity-100'
            }`}
          >
            <div className="w-full relative">
              <form onSubmit={handleSearch} className="w-full flex items-center relative">
                <input
                  id="searchInput"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder="Zoek producten..."
                  className="w-full border rounded-full px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                />
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="absolute right-3 p-2 transition-all duration-200 hover:scale-110"
                  aria-label="Close search"
                >
                  <X size={20} className="text-gray-500 hover:text-gray-800" />
                </button>
              </form>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchTerm.length >= 2 && suggestionsData?.products?.edges?.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 max-h-96 overflow-y-auto z-50">
                  {suggestionsData.products.edges.map(({ node: product }: any) => (
                    <button
                      key={product.id}
                      onClick={() => handleSuggestionClick(product.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {product.images.edges[0] ? (
                          <img
                            src={product.images.edges[0].node.originalSrc}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          €{formatPrice(parseFloat(product.priceRange.minVariantPrice.amount))}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right section with search toggle, account, and cart */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSearch}
              className={`md:hidden p-2 transition-all duration-300 ease-in-out transform ${
                isSearchExpanded ? 'opacity-0 scale-95 invisible' : 'opacity-100 scale-100 visible'
              }`}
              aria-label="Toggle search"
            >
              <Search size={24} className="text-gray-600" />
            </button>

            <a
              href={SHOPIFY_ACCOUNT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="My Account"
            >
              <User size={24} />
            </a>

            <Link 
              to="/cart"
              className="relative p-2 text-gray-600"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={24} className={location.pathname === '/cart' ? 'text-blue-500' : ''} />
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