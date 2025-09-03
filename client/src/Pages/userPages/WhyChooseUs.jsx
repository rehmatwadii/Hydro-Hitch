import React from 'react';
import { CheckCircle, Droplet, Clock, Shield, Users, TrendingUp, MapPin, Award } from 'lucide-react';
import Navbar from '../../Components/Navbar';
import CountUp from 'react-countup';

export default function WhyChooseUs() {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-blue-600 py-24">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center" />
                    </div>
                    <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                                Why Choose Hydro-Hitch?
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-blue-100">
                                Your trusted partner in water delivery solutions. We connect you with verified water suppliers
                                to ensure clean, reliable, and efficient water delivery services.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Key Features Section */}
                <div className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Delivering Excellence in Every Drop
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Experience unparalleled service with our network of trusted water suppliers
                            </p>
                        </div>
                        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
                            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
                                {features.map((feature) => (
                                    <div key={feature.name} className="relative pl-16">
                                        <dt className="text-base font-semibold leading-7 text-gray-900">
                                            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                                <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                            </div>
                                            {feature.name}
                                        </dt>
                                        <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-white py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl lg:max-w-none">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                    Trusted by Thousands
                                </h2>
                                <p className="mt-4 text-lg leading-8 text-gray-600">
                                    Our numbers speak for themselves
                                </p>
                            </div>
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mt-20">
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 animate-bounce">
                                        <svg
                                            className="w-10 h-10 text-blue-600"
                                            stroke="currentColor"
                                            viewBox="0 0 52 52"
                                        >
                                            <polygon
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                fill="none"
                                                points="29 13 14 29 25 29 23 39 38 23 27 23"
                                            />
                                        </svg>
                                    </div>
                                    <h6 className="text-5xl font-bold text-gray-900">
                                        <CountUp start={0} end={819} duration={3} />
                                    </h6>
                                    <p className="mt-2 text-xl leading-6 font-medium text-gray-500">Orders Completed</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 animate-bounce">
                                        <svg
                                            className="w-10 h-10 text-blue-600"
                                            stroke="currentColor"
                                            viewBox="0 0 52 52"
                                        >
                                            <polygon
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                fill="none"
                                                points="29 13 14 29 25 29 23 39 38 23 27 23"
                                            />
                                        </svg>
                                    </div>
                                    <h6 className="text-5xl font-bold text-gray-900">
                                        <CountUp start={0} end={1300} duration={3} />
                                    </h6>
                                    <p className="mt-2 text-xl leading-6 font-medium text-gray-500">Registered Users</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 animate-bounce">
                                        <svg
                                            className="w-10 h-10 text-blue-600"
                                            stroke="currentColor"
                                            viewBox="0 0 52 52"
                                        >
                                            <polygon
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                fill="none"
                                                points="29 13 14 29 25 29 23 39 38 23 27 23"
                                            />
                                        </svg>
                                    </div>
                                    <h6 className="text-5xl font-bold text-gray-900">
                                        <CountUp start={0} end={91} duration={3} />
                                    </h6>
                                    <p className="mt-2 text-xl leading-6 font-medium text-gray-500">Registered Vendors</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 animate-bounce">
                                        <svg
                                            className="w-10 h-10 text-blue-600"
                                            stroke="currentColor"
                                            viewBox="0 0 52 52"
                                        >
                                            <polygon
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                fill="none"
                                                points="29 13 14 29 25 29 23 39 38 23 27 23"
                                            />
                                        </svg>
                                    </div>
                                    <h6 className="text-5xl font-bold text-gray-900">
                                        <CountUp start={0} end={149} duration={3} />
                                    </h6>
                                    <p className="mt-2 text-xl leading-6 font-medium text-gray-500">Products</p>
                                </div>
                            </div>
                            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
                            </dl>
                        </div>
                    </div>
                </div>

                {/* Process Section */}
                <div className="py-24 bg-gradient-to-b from-blue-50 to-white">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                How It Works
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Get water delivered in three simple steps
                            </p>
                        </div>
                        <div className="mx-auto mt-16 max-w-7xl">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                {steps.map((step, index) => (
                                    <div
                                        key={step.name}
                                        className="relative p-6 bg-white rounded-xl shadow-sm border border-gray-200"
                                    >
                                        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
                                            <span className="text-lg font-semibold text-white">{index + 1}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">{step.name}</h3>
                                        <p className="mt-2 text-gray-600">{step.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
            </div></>
    );
}

const features = [
    {
        name: 'Verified Suppliers',
        description: 'All our water suppliers undergo strict verification and quality checks to ensure you receive the best service.',
        icon: Shield
    },
    {
        name: 'Quick Delivery',
        description: 'Get water delivered to your doorstep within hours. Our efficient network ensures minimal waiting time.',
        icon: Clock
    },
    {
        name: 'Quality Assured',
        description: 'We maintain strict quality standards for water safety and cleanliness across our supplier network.',
        icon: CheckCircle
    },
    {
        name: 'Wide Coverage',
        description: 'Our extensive network of suppliers ensures we can deliver water anywhere in your city.',
        icon: MapPin
    },
    {
        name: 'Competitive Pricing',
        description: 'Compare prices from multiple suppliers to get the best deals on water delivery.',
        icon: TrendingUp
    },
    {
        name: '24/7 Support',
        description: 'Our customer support team is available round the clock to assist you with any queries.',
        icon: Users
    }
];

const stats = [
    { name: 'Active Users', value: '10,000+' },
    { name: 'Verified Suppliers', value: '500+' },
    { name: 'Cities Covered', value: '25+' },
    { name: 'Daily Deliveries', value: '1,000+' }
];

const steps = [
    {
        name: 'Choose Your Supplier',
        description: 'Browse through our verified water suppliers and select based on ratings, pricing, and delivery time.'
    },
    {
        name: 'Place Your Order',
        description: 'Specify your requirements and schedule the delivery at your preferred time.'
    },
    {
        name: 'Receive & Enjoy',
        description: 'Get your water delivered right to your doorstep and enjoy hassle-free service.'
    }
];