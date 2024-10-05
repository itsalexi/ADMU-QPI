import Link from 'next/link';
import React from 'react';

const Header = () => {
    return (
        <header>
            <Link href="/">
                <p className="text-3xl text-center text-white header-title">
                    ATENEO QPI CALCULATOR
                </p>
            </Link>
        </header>
    );
};

export default Header;
