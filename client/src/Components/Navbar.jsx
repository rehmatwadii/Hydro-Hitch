import { Fragment, useEffect, useState } from "react";
import { Dialog, Popover, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, UserCircleIcon, ShoppingBagIcon, ClipboardDocumentListIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
const classNames = (...classes) => classes.filter(Boolean).join(" ");

export default function Navbar({ }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutPopupOpen, setLogoutPopupOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem('loginData') && JSON.parse(localStorage.getItem('loginData'))?.data;
  const userData = isAuthenticated ? JSON.parse(localStorage.getItem('loginData'))?.data : null;


  const handleClosePopup = () => {
    setLogoutPopupOpen(false);
  };

  const handleLogout = async () => {
    localStorage.clear()
    const response = await fetch("http://localhost:8000/api/user/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.status === 200) {
      setMsg("You have successfully logged out");
      setLogoutPopupOpen(true);
      setTimeout(() => {
        navigate("/loginUser");
      }, 1000);
    } else {
      setMsg("Logout failed");
      setLogoutPopupOpen(true);
    }
  };

  return (
    <header className="bg-[#fff] shadow-lg backdrop-blur-md ">
      <nav
        className="max-w-7xl mx-auto flex items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          {isAuthenticated ? (<div

            className="-m-1.5 p-1.5 text-[#1877F2] font-bold text-2xl tracking-wider hover:scale-110 transition-transform duration-300"
          >
            Hydro-Hitch
          </div>) : (
            <Link
              to="/"
              className="-m-1.5 p-1.5 text-[#1877F2] font-bold text-2xl tracking-wider hover:scale-110 transition-transform duration-300"
            >
              Hydro-Hitch
            </Link>)}
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
          {isAuthenticated ? (
            <Link
              to="/venderListing"
              className="text-lg font-semibold leading-6 text-[#1877F2] transition-colors duration-200 hover:bg-white hover:text-black px-4 py-2 rounded-md bg-opacity-20"
            >
              Get Hydrated Now
            </Link>
          ) : null}

          <Link
            to="/whyChooseUs"
            className="text-lg font-semibold leading-6 text-[#1877F2] transition-colors duration-200 hover:bg-white hover:text-black px-4 py-2 rounded-md bg-opacity-20"
          >
            Why Choose Us
          </Link>
          {/* <Link
            to="#"
            className="text-lg font-semibold leading-6 text-[#1877F2] transition-colors duration-200 hover:bg-white hover:text-black px-4 py-2 rounded-md bg-opacity-20"
          >
            Company
          </Link> */}
        </Popover.Group>

        {isAuthenticated
          ? (
            <Popover className="relative">
              <Popover.Button className="flex items-center gap-2 text-[#1877F2] hover:text-gray-200 focus:outline-none">
                <UserCircleIcon className="h-8 w-8" />
                <span className="text-sm font-medium">{userData?.name || 'Profile'}</span>
              </Popover.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute right-0 z-10 mt-3 w-screen max-w-xs transform px-2">
                  <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="relative grid gap-1 bg-white p-2">
                      <div className="p-2 border-b">
                        <p className="text-sm font-medium text-gray-900">{userData?.name}</p>
                        <p className="text-xs text-gray-500">{userData?.email}</p>
                      </div>



                      <Link
                        to="/orders"
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md"
                      >
                        <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-sm text-gray-700">My Orders</span>
                      </Link>


                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-md w-full"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>
          ) : (
            <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-x-4">
              <Link
                to="/loginUser"
                className="text-lg font-semibold leading-6 text-[#1877F2] transition-colors duration-200 border border-white rounded-lg px-4 py-2 hover:bg-white hover:text-black"
              >
                Log in
              </Link>
              <Link
                to="/registerUser"
                className="text-lg font-semibold leading-6 text-white transition-colors duration-200 border border-white rounded-lg px-4 py-2 bg-[#1877F2] hover:bg-blue-800"
              >
                Register <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          )}
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
                <Link
                  to="/"
                  className="-m-1.5 p-1.5 text-[#1877F2] font-bold text-2xl tracking-wider hover:scale-105 transition-transform duration-300"
                >
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
                    <Link
                      to="/venderListing"
                      className="block rounded-lg px-3 py-2 text-lg font-semibold leading-7 text-[#1877F2] hover:bg-blue-700 transition-colors duration-200"
                    >
                      Get Hydrated Now
                    </Link>
                    <Link
                      to="#"
                      className="block rounded-lg px-3 py-2 text-lg font-semibold leading-7 text-[#1877F2] hover:bg-blue-700 transition-colors duration-200"
                    >
                      Why Choose Us
                    </Link>
                    <Link
                      to="#"
                      className="block rounded-lg px-3 py-2 text-lg font-semibold leading-7 text-[#1877F2] hover:bg-blue-700 transition-colors duration-200"
                    >
                      Company
                    </Link>
                  </div>
                  <div className="py-6">
                    <Link
                      to="/loginUser"
                      className="block rounded-lg px-3 py-2.5 text-lg font-semibold leading-7 text-[#1877F2] hover:bg-blue-700 transition-colors duration-200 border border-white"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/registerUser"
                      className="block rounded-lg px-3 py-2.5 text-lg font-semibold leading-7 text-[#1877F2] hover:bg-blue-700 transition-colors duration-200 border border-white bg-blue-700 hover:bg-blue-800"
                    >
                      Register
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full rounded-lg px-3 py-2.5 text-lg font-semibold leading-7 text-[#1877F2] hover:bg-blue-700 transition-colors duration-200 border border-white bg-red-700 hover:bg-red-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={logoutPopupOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed z-10 inset-0 overflow-y-auto"
          onClose={handleClosePopup}
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg
                      className="h-6 w-6 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12H9m0 0H3m6 0l3 3m0-6l-3 3"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900"
                    >
                      {msg}
                    </Dialog.Title>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-700 text-base font-medium text-[#1877F2] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                    onClick={handleClosePopup}
                  >
                    Close
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </header>
  );
}
