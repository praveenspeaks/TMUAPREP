import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { CheckCircle, BarChart, Clock, BookOpen, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type SectionKey = 'hero' | 'logos' | 'features' | 'pricing' | 'testimonials' | 'footer';

interface HomepageSection {
    id: string;
    key: SectionKey | string;
    name: string;
    enabled: boolean;
    position: number;
    content: Record<string, any>;
}

const iconMap: Record<string, LucideIcon> = {
    Clock,
    BarChart,
    BookOpen,
    CheckCircle,
};

const fallbackSections: HomepageSection[] = [
    {
        id: 'hero',
        key: 'hero',
        name: 'Hero',
        enabled: true,
        position: 1,
        content: {
            badge: "What's new",
            badgeSubtext: 'Just shipped v1.0',
            title: 'Master the TMUA.\nSecure Your Future.',
            description: 'The smartest way to prepare for the Test of Mathematics for University Admission. Join thousands of students getting into top UK universities.',
            ctaText: 'Start Preparing Now',
            ctaLink: '/signup',
            secondaryText: 'Log in',
            secondaryLink: '/login',
            metrics: [
                { label: 'Mock Tests', value: '120+' },
                { label: 'Questions', value: '1000+' },
                { label: 'Avg. Score Lift', value: '+24%' },
                { label: 'Students', value: '5k+' },
            ],
        },
    },
    {
        id: 'logos',
        key: 'logos',
        name: 'Logos',
        enabled: true,
        position: 2,
        content: { title: 'Trusted by future students of', logos: ['Cambridge', 'Imperial', 'Warwick', 'LSE', 'Durham'] },
    },
    {
        id: 'features',
        key: 'features',
        name: 'Features',
        enabled: true,
        position: 3,
        content: {
            eyebrow: 'Prepare Smarter',
            title: 'Everything you need to excel',
            description: "We've analyzed past papers and grading criteria to build the ultimate preparation tool.",
            items: [
                { name: 'Real Exam Simulation', description: 'Practice under timed conditions with an interface that mimics the real computer-based test.', icon: 'Clock' },
                { name: 'Detailed Analytics', description: 'Track your performance over time. Identify your weak areas and focus your revision where it counts.', icon: 'BarChart' },
                { name: '1000+ Questions', description: 'Access a massive bank of questions covering every topic, difficulty level, and question type.', icon: 'BookOpen' },
                { name: 'Expert Explanations', description: 'Understand the why behind every answer with step-by-step solutions from top tutors.', icon: 'CheckCircle' },
            ],
        },
    },
    {
        id: 'pricing',
        key: 'pricing',
        name: 'Pricing',
        enabled: true,
        position: 4,
        content: {
            title: 'Simple, transparent pricing',
            description: 'Choose the plan that fits your study schedule. No hidden fees.',
            planName: 'Lifetime membership',
            planDescription: 'Get access to all features including unlimited practice tests, analytics, and priority support.',
            price: '$349',
            currency: 'USD',
            ctaText: 'Get access',
            ctaLink: '/signup',
            features: ['Unlimited practice tests', '1000+ question bank', 'Performance analytics', 'Priority support'],
        },
    },
    {
        id: 'testimonials',
        key: 'testimonials',
        name: 'Testimonials',
        enabled: true,
        position: 5,
        content: {
            eyebrow: 'Testimonials',
            title: 'Startups and students love us',
            items: [
                { quote: 'The practice questions were harder than the real exam, which made the actual test feel like a breeze.', name: 'John Doe', role: 'Cambridge Applicant', initials: 'JD' },
                { quote: 'The analytics helped me focus only on weak topics. I improved rapidly in just a few weeks.', name: 'Alice Stone', role: 'Imperial Applicant', initials: 'AS' },
            ],
        },
    },
    {
        id: 'footer',
        key: 'footer',
        name: 'Footer',
        enabled: true,
        position: 6,
        content: {
            brandName: 'TMUA Prep',
            description: 'Making elite university admissions accessible to everyone through smarter preparation.',
            linkGroups: [
                { title: 'Solutions', items: [{ label: 'Practice Tests', href: '#' }, { label: 'Analytics', href: '#' }, { label: 'Resources', href: '#' }] },
                { title: 'Support', items: [{ label: 'Pricing', href: '#' }, { label: 'Documentation', href: '#' }, { label: 'Guides', href: '#' }] },
            ],
            copyright: '© 2026 TMUA Prep Platform, Inc. All rights reserved.',
        },
    },
];

const Home: React.FC = () => {
    const [sections, setSections] = useState<HomepageSection[]>(fallbackSections);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/site/homepage-config`);
                if (!res.ok) return;
                const data = await res.json();
                if (Array.isArray(data.sections) && data.sections.length > 0) {
                    setSections(data.sections);
                }
            } catch {
                // keep fallback configuration
            }
        };

        loadConfig();
    }, []);

    const orderedSections = useMemo(
        () => [...sections].filter((section) => section.enabled !== false).sort((a, b) => a.position - b.position),
        [sections]
    );

    const renderSection = (section: HomepageSection) => {
        const content = section.content || {};

        if (section.key === 'hero') {
            return (
                <header key={section.id} className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_42%)]" />
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 md:py-16 lg:py-20 relative">
                        <nav className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center font-bold">T</div>
                                <span className="font-semibold">TMUA Prep</span>
                            </div>
                            <Link to={content.secondaryLink || '/login'} className="text-sm text-indigo-100 hover:text-white font-medium">
                                {content.secondaryText || 'Log in'}
                            </Link>
                        </nav>

                        <div className="mt-14 grid lg:grid-cols-2 gap-10 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
                                    {content.badge || "What's new"}
                                    <span className="text-indigo-200">{content.badgeSubtext || ''}</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </div>

                                <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight whitespace-pre-line">
                                    {content.title || 'Master the TMUA.\nSecure Your Future.'}
                                </h1>

                                <p className="mt-6 text-indigo-100 max-w-xl text-lg">{content.description}</p>

                                <div className="mt-8 flex flex-wrap gap-4">
                                    <Link to={content.ctaLink || '/signup'}>
                                        <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 rounded-full px-8">
                                            {content.ctaText || 'Start Preparing Now'}
                                        </Button>
                                    </Link>
                                    <Link to={content.secondaryLink || '/login'} className="inline-flex items-center text-sm font-semibold text-white/90 hover:text-white">
                                        {content.secondaryText || 'Log in'} <ArrowRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-5 md:p-6 shadow-2xl">
                                <div className="grid grid-cols-2 gap-4">
                                    {(content.metrics || []).map((metric: any, idx: number) => (
                                        <div key={idx} className="rounded-xl bg-white/90 text-slate-900 p-4">
                                            <p className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
                                            <p className="text-3xl font-bold mt-2">{metric.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            );
        }

        if (section.key === 'logos') {
            return (
                <section key={section.id} className="bg-white py-20 sm:py-24 border-b border-gray-100">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <h2 className="text-center text-lg font-semibold leading-8 text-gray-900 mb-10 font-serif">{content.title}</h2>
                        <div className="mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                            {(content.logos || []).map((logo: string) => (
                                <div key={logo} className="col-span-2 max-h-12 w-full lg:col-span-1 text-center font-serif text-2xl text-gray-400 font-bold opacity-60 hover:opacity-100 transition">
                                    {logo}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );
        }

        if (section.key === 'features') {
            return (
                <section key={section.id} className="bg-slate-50 py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl lg:text-center">
                            <h2 className="text-base font-semibold leading-7 text-indigo-600">{content.eyebrow}</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">{content.title}</p>
                            <p className="mt-6 text-lg leading-8 text-gray-600">{content.description}</p>
                        </div>
                        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                                {(content.items || []).map((feature: any) => {
                                    const Icon = iconMap[feature.icon] || CheckCircle;
                                    return (
                                        <div key={feature.name} className="relative pl-16">
                                            <dt className="text-base font-semibold leading-7 text-gray-900">
                                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                                    <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                                                </div>
                                                {feature.name}
                                            </dt>
                                            <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                                        </div>
                                    );
                                })}
                            </dl>
                        </div>
                    </div>
                </section>
            );
        }

        if (section.key === 'pricing') {
            return (
                <section key={section.id} className="bg-white py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl sm:text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">{content.title}</h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">{content.description}</p>
                        </div>
                        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
                            <div className="p-8 sm:p-10 lg:flex-auto">
                                <h3 className="text-2xl font-bold tracking-tight text-gray-900">{content.planName}</h3>
                                <p className="mt-6 text-base leading-7 text-gray-600">{content.planDescription}</p>
                                <div className="mt-10 flex items-center gap-x-4">
                                    <h4 className="flex-none text-sm font-semibold leading-6 text-indigo-600">What's included</h4>
                                    <div className="h-px flex-auto bg-gray-100" />
                                </div>
                                <ul role="list" className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
                                    {(content.features || []).map((feature: string) => (
                                        <li key={feature} className="flex gap-x-3">
                                            <CheckCircle className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
                                <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                                    <div className="mx-auto max-w-xs px-8">
                                        <p className="text-base font-semibold text-gray-600">One-time payment</p>
                                        <p className="mt-6 flex items-baseline justify-center gap-x-2">
                                            <span className="text-5xl font-bold tracking-tight text-gray-900">{content.price}</span>
                                            <span className="text-sm font-semibold leading-6 text-gray-600">{content.currency}</span>
                                        </p>
                                        <Link to={content.ctaLink || '/signup'} className="mt-10 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                                            {content.ctaText || 'Get access'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            );
        }

        if (section.key === 'testimonials') {
            return (
                <section key={section.id} className="bg-slate-900 py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-xl text-center">
                            <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-400">{content.eyebrow}</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl font-serif">{content.title}</p>
                        </div>
                        <div className="mx-auto mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {(content.items || []).map((item: any, idx: number) => (
                                <figure key={idx} className="rounded-2xl bg-gray-800 p-8 text-sm leading-6">
                                    <blockquote className="text-gray-100">
                                        <p>“{item.quote}”</p>
                                    </blockquote>
                                    <figcaption className="mt-6 flex items-center gap-x-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">{item.initials || 'U'}</div>
                                        <div>
                                            <div className="font-semibold text-white">{item.name}</div>
                                            <div className="text-gray-400">{item.role}</div>
                                        </div>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>
            );
        }

        if (section.key === 'footer') {
            return (
                <footer key={section.id} className="bg-white" aria-labelledby="footer-heading">
                    <h2 id="footer-heading" className="sr-only">Footer</h2>
                    <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                            <div className="space-y-8">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">T</div>
                                    <span className="text-xl font-bold text-gray-900">{content.brandName}</span>
                                </div>
                                <p className="text-sm leading-6 text-gray-600">{content.description}</p>
                            </div>
                            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                                {(content.linkGroups || []).map((group: any) => (
                                    <div key={group.title}>
                                        <h3 className="text-sm font-semibold leading-6 text-gray-900">{group.title}</h3>
                                        <ul role="list" className="mt-6 space-y-4">
                                            {(group.items || []).map((item: any) => (
                                                <li key={item.label}><a href={item.href || '#'} className="text-sm leading-6 text-gray-600 hover:text-gray-900">{item.label}</a></li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
                            <p className="text-xs leading-5 text-gray-500">{content.copyright}</p>
                        </div>
                    </div>
                </footer>
            );
        }

        return null;
    };

    return <div className="font-sans text-slate-800 bg-white">{orderedSections.map(renderSection)}</div>;
};

export default Home;
