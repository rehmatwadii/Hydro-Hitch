import { Fragment, useState } from 'react';
import { Dialog, Popover, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const classNames = (...classes) => classes.filter(Boolean).join(' ');

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-800 via-purple-800 to-indigo-800 shadow-lg backdrop-blur-md">
      <nav className="max-w-7xl mx-auto flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 text-white font-bold text-2xl tracking-wider hover:scale-110 transition-transform duration-300">
            Hydro-Hitch
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <Popover.Group className="hidden lg:flex lg:gap-x-12">
          <Link to="/venderListing" className="text-lg font-semibold leading-6 text-white transition-colors duration-200 hover:bg-white hover:text-black px-4 py-2 rounded-md bg-opacity-20">
            Get Hydrated Now
          </Link>
          <Link to="#" className="text-lg font-semibold leading-6 text-white transition-colors duration-200 hover:bg-white hover:text-black px-4 py-2 rounded-md bg-opacity-20">
            Why Choose Us
          </Link>
          <Link to="#" className="text-lg font-semibold leading-6 text-white transition-colors duration-200 hover:bg-white hover:text-black px-4 py-2 rounded-md bg-opacity-20">
            Company
          </Link>
        </Popover.Group>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-x-4">
          <Link to="/loginUser" className="text-lg font-semibold leading-6 text-white transition-colors duration-200 border border-white rounded-lg px-4 py-2 hover:bg-white hover:text-black">
            Log in
          </Link>
          <Link to="/registerUser" className="text-lg font-semibold leading-6 text-white transition-colors duration-200 border border-white rounded-lg px-4 py-2 bg-blue-700 hover:bg-blue-800">
            Register <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="lg:hidden" onClose={setMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 z-10 bg-black bg-opacity-50" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 right-0 z-20 w-full overflow-y-auto bg-gradient-to-b from-blue-900 to-indigo-900 bg-opacity-90 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <Link to="/" className="-m-1.5 p-1.5 text-white font-bold text-2xl tracking-wider hover:scale-105 transition-transform duration-300">
                  Hydro-Hitch
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    <Link to="/venderListing" className="block rounded-lg px-3 py-2 text-lg font-semibold leading-7 text-white hover:bg-blue-700 transition-colors duration-200">
                      Get Hydrated Now
                    </Link>
                    <Link to="#" className="block rounded-lg px-3 py-2 text-lg font-semibold leading-7 text-white hover:bg-blue-700 transition-colors duration-200">
                      Why Choose Us
                    </Link>
                    <Link to="#" className="block rounded-lg px-3 py-2 text-lg font-semibold leading-7 text-white hover:bg-blue-700 transition-colors duration-200">
                      Company
                    </Link>
                  </div>
                  <div className="py-6">
                    <Link to="/loginUser" className="block rounded-lg px-3 py-2.5 text-lg font-semibold leading-7 text-white hover:bg-blue-700 transition-colors duration-200 border border-white">
                      Log in
                    </Link>
                    <Link to="/registerUser" className="block rounded-lg px-3 py-2.5 text-lg font-semibold leading-7 text-white hover:bg-blue-700 transition-colors duration-200 border border-white bg-blue-700 hover:bg-blue-800">
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
    </header>
  );
}
