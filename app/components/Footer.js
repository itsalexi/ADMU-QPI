'use client';
import React from 'react';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="text-1xl text-center text-primary">
      <p>
        Made with ❤️ by Alexi!
        <br />
        <a href="https://alexi.life">Click here for his other projects</a>
      </p>
      <div style={{ marginTop: '0.5rem', display: 'inline-block' }}>
        <a
          href="https://ko-fi.com/C0C617AN4U"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#72a4f2',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            gap: '8px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <Image
            src="https://storage.ko-fi.com/cdn/logomarkLogo.png"
            alt="Ko-fi Logo"
            width={24}
            height={24}
          />
          Buy me a Juzi Juiz
        </a>
      </div>
    </footer>
  );
};

export default Footer;
