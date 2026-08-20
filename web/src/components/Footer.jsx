import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-[oklch(0.52_0.022_118_/_0.12)] bg-[oklch(0.925_0.032_96_/_0.6)] px-10">
      <div className="mx-auto max-w-none">

        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 pt-16 pb-16">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-[34px] h-[34px] rounded-full bg-primary flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>

              <span className="font-serif text-[22px] font-bold tracking-tight">
                <span className="text-foreground">Ethio</span>
                <span className="text-primary">Stays</span>
              </span>
            </Link>

            <p className="text-[14px] text-[oklch(0.52_0.022_118)] leading-relaxed mb-5 max-w-[390px]">
              Stays across Ethiopia, hosted by people who live
              <br className="hidden lg:block" />
              there. Book with clear prices in ETB.
            </p>

            <div className="flex gap-2">
            {/* Instagram */}
            <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-lg border border-[oklch(0.52_0.022_118_/_0.12)] bg-white/70 flex items-center justify-center text-[oklch(0.52_0.022_118)] hover:text-[#E4405F] transition-colors"
            >
                <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                >
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
            </a>

            {/* Facebook */}
            <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-lg border border-[oklch(0.52_0.022_118_/_0.12)] bg-white/70 flex items-center justify-center text-[oklch(0.52_0.022_118)] hover:text-[#1877F2] transition-colors"
            >
                <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            </a>

            {/* X */}
            <a
                href="https://www.x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="w-10 h-10 rounded-lg border border-[oklch(0.52_0.022_118_/_0.12)] bg-white/70 flex items-center justify-center text-[oklch(0.52_0.022_118)] hover:text-black transition-colors"
            >
                <span className="text-[15px] font-semibold">𝕏</span>
            </a>

            {/* YouTube */}
            <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-lg border border-[oklch(0.52_0.022_118_/_0.12)] bg-white/70 flex items-center justify-center text-[oklch(0.52_0.022_118)] hover:text-[#FF0000] transition-colors"
            >
                <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                >
                <path d="M23.498 6.186a2.99 2.99 0 0 0-2.105-2.116C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.393.57A2.99 2.99 0 0 0 .502 6.186C0 8.08 0 12 0 12s0 3.92.502 5.814a2.99 2.99 0 0 0 2.105 2.116c1.888.57 9.393.57 9.393.57s7.505 0 9.393-.57a2.99 2.99 0 0 0 2.105-2.116C24 15.92 24 12 24 12s0-3.92-.502-5.814zM9.6 15.5v-7l6.3 3.5-6.3 3.5z" />
                </svg>
            </a>
            </div>
                    </div>

          {/* Company */}
          <div>
            <h4 className="text-foreground font-semibold text-[15px] mb-4">
              Company
            </h4>

            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/about"
                  className="text-[14px] text-[oklch(0.52_0.022_118)] hover:text-primary transition-colors"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  to="/host"
                  className="text-[14px] text-[oklch(0.52_0.022_118)] hover:text-primary transition-colors"
                >
                  Become a Host
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-foreground font-semibold text-[15px] mb-4">
              Support
            </h4>

            <ul className="space-y-2.5">
              {['Help Center'].map(
                (item) => (
                  <li key={item}>
                    <Link
                      to="/help"
                      className="text-[14px] text-[oklch(0.52_0.022_118)] hover:text-primary transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-foreground font-semibold text-[15px] mb-4">
              Legal
            </h4>

            <ul className="space-y-2.5">
              {['Terms'].map((item) => (
                <li key={item}>
                  <Link
                    to="/terms"
                    className="text-[14px] text-[oklch(0.52_0.022_118)] hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[oklch(0.52_0.022_118_/_0.12)] py-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[13px] text-[oklch(0.52_0.022_118)]">
            © 2026 EthioStays. All rights reserved.
          </p>

          <p className="text-[13px] text-[oklch(0.52_0.022_118)]">
            Addis Ababa, Ethiopia.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;