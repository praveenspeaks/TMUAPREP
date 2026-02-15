// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
const prisma = require('../utils/prismaClient');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const getPlans = async (req, res) => {
    try {
        const plans = await prisma.membershipPlan.findMany();
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching plans', error: error.message });
    }
};

const createCheckoutSession = async (req, res) => {
    const { planId } = req.body;
    const user = req.user;

    try {
        const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: plan.name,
                        },
                        unit_amount: Math.round(plan.price * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/dashboard?canceled=true`,
            metadata: {
                userId: user.id,
                planId: plan.id,
            },
        });

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ message: 'Error creating checkout session', error: error.message });
    }
};

// Webhook handling is tricky locally without stripe CLI, so implementing a direct confirmation endpoint for demo simplicity if needed, 
// but sticking to webhook structure or a verify endpoint is better.
// For now, let's add a verify endpoint that takes session_id.
const verifyPayment = async (req, res) => {
    const { session_id } = req.body;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
            const userId = parseInt(session.metadata.userId);
            const planId = parseInt(session.metadata.planId);

            const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + plan.durationMonths);

            // Unique Member ID: MEM-TIMESTAMP-USERID
            const uniqueMemberId = `MEM-${Date.now()}-${userId}`;

            const membership = await prisma.userMembership.upsert({
                where: { userId },
                update: {
                    planId,
                    startDate,
                    endDate,
                    status: 'ACTIVE',
                    uniqueMemberId,
                },
                create: {
                    userId,
                    planId,
                    startDate,
                    endDate,
                    status: 'ACTIVE',
                    uniqueMemberId,
                },
            });

            // Record Payment
            await prisma.payment.create({
                data: {
                    userId,
                    amount: session.amount_total / 100,
                    currency: session.currency,
                    status: session.payment_status,
                    stripePaymentIntentId: session.payment_intent,
                }
            });

            res.json({ success: true, membership });
        } else {
            res.status(400).json({ success: false, message: 'Payment not successful' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
};

module.exports = { getPlans, createCheckoutSession, verifyPayment };
