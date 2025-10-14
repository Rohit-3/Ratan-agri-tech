import React, { useState } from 'react';

interface HeaderProps {
    logo: string;
}

const Header: React.FC<HeaderProps> = ({ logo }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Home', href: '#/' },
        { name: 'Products', href: '#/products' },
        { name: 'About Us', href: '#/about' },
        { name: 'Contact', href: '#/contact' },
    ];
    
    const handleNavClick = () => {
        setIsMenuOpen(false);
    }

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <a href="#/" className="flex items-center space-x-3">
                    <img src={logo} alt="Ratan Agri Tech Logo" className="h-12 w-12 rounded-full object-cover" />
                    <span className="text-2xl font-bold text-gray-800">Ratan <span className="text-green-600">Agri Tech</span></span>
                </a>

                {/* Desktop Nav */}
                <nav className="hidden md:flex space-x-8">
                    {navLinks.map((link) => (
                        <a key={link.href} href={link.href} className="text-gray-600 hover:text-green-600 transition duration-300 font-medium">{link.name}</a>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-800 focus:outline-none">
                        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white py-4">
                    <nav className="flex flex-col items-center space-y-4">
                        {navLinks.map((link) => (
                            <a key={link.href} href={link.href} onClick={handleNavClick} className="text-gray-600 hover:text-green-600 transition duration-300 font-medium">{link.name}</a>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}

export default Header;
