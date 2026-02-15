const fs = require('fs/promises');
const path = require('path');

const configDir = path.resolve(__dirname, '../data');
const configPath = path.join(configDir, 'homepageConfig.json');

const defaultHomepageConfig = {
    sections: [
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
                    { label: 'Students', value: '5k+' }
                ]
            }
        },
        {
            id: 'logos',
            key: 'logos',
            name: 'University Logos',
            enabled: true,
            position: 2,
            content: {
                title: 'Trusted by future students of',
                logos: ['Cambridge', 'Imperial', 'Warwick', 'LSE', 'Durham']
            }
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
                    {
                        name: 'Real Exam Simulation',
                        description: 'Practice under timed conditions with an interface that mimics the real computer-based test.',
                        icon: 'Clock'
                    },
                    {
                        name: 'Detailed Analytics',
                        description: 'Track your performance over time. Identify your weak areas and focus your revision where it counts.',
                        icon: 'BarChart'
                    },
                    {
                        name: '1000+ Questions',
                        description: 'Access a massive bank of questions covering every topic, difficulty level, and question type.',
                        icon: 'BookOpen'
                    },
                    {
                        name: 'Expert Explanations',
                        description: 'Understand the why behind every answer with step-by-step solutions from top tutors.',
                        icon: 'CheckCircle'
                    }
                ]
            }
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
                features: ['Unlimited practice tests', '1000+ question bank', 'Performance analytics', 'Priority support']
            }
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
                    {
                        quote: 'The practice questions were harder than the real exam, which made the actual test feel like a breeze.',
                        name: 'John Doe',
                        role: 'Cambridge Applicant',
                        initials: 'JD'
                    },
                    {
                        quote: 'The analytics helped me focus only on weak topics. I improved rapidly in just a few weeks.',
                        name: 'Alice Stone',
                        role: 'Imperial Applicant',
                        initials: 'AS'
                    }
                ]
            }
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
                    {
                        title: 'Solutions',
                        items: [
                            { label: 'Practice Tests', href: '#' },
                            { label: 'Analytics', href: '#' },
                            { label: 'Resources', href: '#' }
                        ]
                    },
                    {
                        title: 'Support',
                        items: [
                            { label: 'Pricing', href: '#' },
                            { label: 'Documentation', href: '#' },
                            { label: 'Guides', href: '#' }
                        ]
                    }
                ],
                copyright: '© 2026 TMUA Prep Platform, Inc. All rights reserved.'
            }
        }
    ]
};

const normalizeConfig = (input) => {
    const sections = Array.isArray(input?.sections) ? input.sections : defaultHomepageConfig.sections;
    const normalizedSections = sections
        .map((section, index) => ({
            id: String(section.id || `section-${index + 1}`),
            key: String(section.key || section.id || `section-${index + 1}`),
            name: String(section.name || section.key || 'Section'),
            enabled: section.enabled !== false,
            position: Number(section.position ?? index + 1),
            content: typeof section.content === 'object' && section.content ? section.content : {},
        }))
        .sort((a, b) => a.position - b.position);

    const heroSection = normalizedSections.find((section) => section.key === 'hero');
    const footerSection = normalizedSections.find((section) => section.key === 'footer');
    const movableSections = normalizedSections.filter((section) => section.key !== 'hero' && section.key !== 'footer');

    const finalSections = [];
    if (heroSection) finalSections.push(heroSection);
    finalSections.push(...movableSections);
    if (footerSection) finalSections.push(footerSection);

    return {
        sections: finalSections.map((section, index) => ({ ...section, position: index + 1 })),
    };
};

const ensureConfig = async () => {
    try {
        await fs.access(configPath);
    } catch {
        await fs.mkdir(configDir, { recursive: true });
        await fs.writeFile(configPath, JSON.stringify(defaultHomepageConfig, null, 2), 'utf-8');
    }
};

const readConfig = async () => {
    await ensureConfig();
    try {
        const raw = await fs.readFile(configPath, 'utf-8');
        return normalizeConfig(JSON.parse(raw));
    } catch {
        return normalizeConfig(defaultHomepageConfig);
    }
};

const writeConfig = async (config) => {
    const normalized = normalizeConfig(config);
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(normalized, null, 2), 'utf-8');
    return normalized;
};

const getHomepageConfig = async (_req, res) => {
    try {
        const config = await readConfig();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error loading homepage config', error: error.message });
    }
};

const updateHomepageConfig = async (req, res) => {
    try {
        if (!req.body || !Array.isArray(req.body.sections)) {
            return res.status(400).json({ message: 'Invalid payload. Expected { sections: [] }' });
        }

        const config = await writeConfig(req.body);
        res.json({ message: 'Homepage config saved', config });
    } catch (error) {
        res.status(500).json({ message: 'Error saving homepage config', error: error.message });
    }
};

module.exports = { getHomepageConfig, updateHomepageConfig, defaultHomepageConfig };
