'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Phone, Mail, Clock, Shield, Users, HardHat, Star, MessageCircle } from 'lucide-react';

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
                {/* Hero */}
                <section style={{
                    padding: '7rem 1.5rem 4rem',
                    background: 'linear-gradient(135deg, var(--secondary-900) 0%, var(--secondary-800) 100%)',
                    color: 'white',
                    textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            borderRadius: 'var(--radius-xl)',
                            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                        }}>
                            <HardHat size={28} color="white" />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>
                            About <span style={{ color: 'var(--primary-400)' }}>NeedLabour</span>
                        </h1>
                        <p style={{ fontSize: '1.0625rem', opacity: 0.8, lineHeight: 1.7 }}>
                            Jammu&apos;s first managed labour hiring platform. We connect contractors and homeowners
                            with skilled, verified construction workers — making hiring fast, reliable, and hassle-free.
                        </p>
                    </div>
                </section>

                {/* Our Story */}
                <section style={{ padding: '4rem 1.5rem' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--secondary-900)' }}>
                            Our Story
                        </h2>
                        <div style={{ fontSize: '0.9375rem', color: 'var(--gray-600)', lineHeight: 1.9 }}>
                            <p style={{ marginBottom: '1rem' }}>
                                Daily-wage construction workers in India often lack dedicated online hiring services.
                                In Jammu, finding reliable masons, carpenters, electricians, or helpers has always been
                                a word-of-mouth affair — time-consuming and unpredictable.
                            </p>
                            <p style={{ marginBottom: '1rem' }}>
                                <strong>NeedLabour</strong> was built to solve this. Founded by <strong>Vansh Sharma</strong>,
                                a Jammu native, the platform acts as a managed bridge between contractors (customers)
                                who need workers and skilled labourers looking for consistent work opportunities.
                            </p>
                            <p>
                                Unlike generic job boards, NeedLabour is <strong>actively managed</strong> — every job request
                                is personally reviewed, workers are hand-picked based on skill and availability, and pricing
                                is transparent. We handle the coordination so you can focus on your project.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section style={{ padding: '3rem 1.5rem 4rem', background: 'white' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--secondary-900)', textAlign: 'center' }}>
                            How It Works
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                            {[
                                { step: '1', icon: Users, title: 'Submit Request', desc: 'Tell us what workers you need, how many, and where.' },
                                { step: '2', icon: Phone, title: 'We Call You', desc: 'Our team calls to confirm details and discuss pricing.' },
                                { step: '3', icon: Star, title: 'Team Assembled', desc: 'We pick the best available workers from our verified pool.' },
                                { step: '4', icon: Shield, title: 'Work Done', desc: 'Workers arrive on site. We manage payments and quality.' },
                            ].map(item => (
                                <div key={item.step} style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '3.5rem',
                                        height: '3.5rem',
                                        borderRadius: '50%',
                                        background: 'var(--primary-50)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem',
                                        position: 'relative',
                                    }}>
                                        <item.icon size={22} color="var(--primary-600)" />
                                        <span style={{
                                            position: 'absolute',
                                            top: '-4px',
                                            right: '-4px',
                                            width: '1.25rem',
                                            height: '1.25rem',
                                            borderRadius: '50%',
                                            background: 'var(--primary-500)',
                                            color: 'white',
                                            fontSize: '0.6875rem',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>{item.step}</span>
                                    </div>
                                    <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section style={{ padding: '4rem 1.5rem' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--secondary-900)', textAlign: 'center' }}>
                            Why Choose NeedLabour?
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                            {[
                                { icon: Shield, title: 'Verified Workers', desc: 'Every worker goes through our verification process before being assigned to any job.' },
                                { icon: Clock, title: 'Quick Response', desc: 'Submit your request and get a callback within hours, not days.' },
                                { icon: Star, title: 'Transparent Pricing', desc: 'No hidden charges. You see the full cost breakdown before confirming.' },
                                { icon: Users, title: 'Managed Service', desc: 'We handle team assembly, coordination, and payment — you just focus on your project.' },
                            ].map(item => (
                                <div key={item.title} className="card" style={{ padding: '1.5rem' }}>
                                    <item.icon size={24} color="var(--primary-500)" style={{ marginBottom: '0.75rem' }} />
                                    <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.375rem' }}>{item.title}</h3>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section style={{ padding: '3rem 1.5rem 4rem', background: 'white' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--secondary-900)' }}>
                            Get In Touch
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '2rem' }}>
                            Have questions? Want to discuss a large project? Reach out to us directly.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                            <a
                                href="https://wa.me/917006271770?text=Hi%20Vansh,%20I%20want%20to%20know%20more%20about%20NeedLabour"
                                target="_blank"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem 1.5rem',
                                    borderRadius: 'var(--radius-lg)',
                                    background: '#25D366',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.9375rem',
                                    width: 'fit-content',
                                    transition: 'transform 0.2s ease',
                                }}
                            >
                                <MessageCircle size={20} />
                                Chat on WhatsApp
                            </a>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                    <Phone size={16} color="var(--primary-500)" />
                                    +91-7006271770
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                    <Mail size={16} color="var(--primary-500)" />
                                    vanshsharma68575@gmail.com
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                    <MapPin size={16} color="var(--primary-500)" />
                                    Jammu, J&K, India
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
