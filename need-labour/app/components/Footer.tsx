import { HardHat, Phone, MapPin, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{
            background: 'var(--secondary-900)',
            color: 'rgba(255,255,255,0.7)',
            padding: '3rem 1.5rem 1.5rem',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '2rem',
            }}>
                {/* Brand */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-md)',
                            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <HardHat size={18} color="white" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'white' }}>
                            Need<span style={{ color: 'var(--primary-400)' }}>Labour</span>
                        </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
                        Connecting construction professionals with skilled daily-wage workers in Jammu.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Quick Links</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.8125rem', transition: 'color 0.2s' }}>Home</Link>
                        <Link href="/register/worker" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.8125rem' }}>Register as Worker</Link>
                        <Link href="/register/customer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.8125rem' }}>Hire Workers</Link>
                        <Link href="/login" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.8125rem' }}>Login</Link>
                    </div>
                </div>

                {/* Contact */}
                <div>
                    <h4 style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Contact</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Phone size={14} style={{ color: 'var(--primary-400)' }} />
                            <span>+91-XXXXX-XXXXX</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={14} style={{ color: 'var(--primary-400)' }} />
                            <span>contact@needlabour.in</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={14} style={{ color: 'var(--primary-400)' }} />
                            <span>Jammu, J&K, India</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                maxWidth: '1200px',
                margin: '2rem auto 0',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.4)',
            }}>
                © {new Date().getFullYear()} NeedLabour. All rights reserved. Built for Jammu's workforce.
            </div>
        </footer>
    );
}
