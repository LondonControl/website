import React from 'react';

interface Props {}

const Footer: React.FC<Props> = () => {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-site px-6 py-12 md:flex md:items-center md:justify-between laptop:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <a
            key="Forum"
            href="https://forum.londoncontrol.com"
            target="_blank"
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="sr-only">Forum</span>
            Forum
          </a>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-500">
            Made By Gerenuk LTD
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
