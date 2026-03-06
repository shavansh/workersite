'use client';

import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import {
  HardHat,
  Users,
  ClipboardList,
  Phone,
  Shield,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Wrench,
  Zap,
  CheckCircle,
} from 'lucide-react';

const SKILLS_SHOWCASE = [
  { name: 'Masons', icon: HardHat, color: '#f97316' },
  { name: 'Carpenters', icon: Wrench, color: '#3b82f6' },
  { name: 'Electricians', icon: Zap, color: '#eab308' },
  { name: 'Plumbers', icon: Wrench, color: '#22c55e' },
  { name: 'Painters', icon: HardHat, color: '#a855f7' },
  { name: 'Tile Workers', icon: HardHat, color: '#ec4899' },
];

const STEPS = [
  {
    step: '01',
    title: 'Submit Your Request',
    description: 'Tell us what workers you need — type, quantity, and location. No need to worry about wages.',
    icon: ClipboardList,
    color: 'var(--primary-500)',
  },
  {
    step: '02',
    title: 'We Handle the Details',
    description: 'Our team contacts you to finalize wages, duration, and assembles the perfect team from verified workers.',
    icon: Phone,
    color: 'var(--secondary-500)',
  },
  {
    step: '03',
    title: 'Work Gets Done',
    description: 'Skilled workers arrive on schedule. You pay the agreed amount — transparent pricing with no surprises.',
    icon: CheckCircle,
    color: 'var(--success)',
  },
];

const TRUST_POINTS = [
  { icon: Shield, text: 'Verified Workers', desc: 'Every worker is ID-verified before joining' },
  { icon: Clock, text: 'Quick Turnaround', desc: 'Teams assembled within 24 hours' },
  { icon: MapPin, text: 'Local to Jammu', desc: 'Workers from across J&K region' },
  { icon: Star, text: 'Fair Pricing', desc: 'Transparent rates with no hidden costs' },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ============ HERO ============ */}
      <section className="hero-section">
        <div className="hero-grid-pattern" />
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          position: 'relative',
          zIndex: 2,
          width: '100%',
        }}>
          <div style={{
            maxWidth: '680px',
            paddingTop: '5rem',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(249,115,22,0.15)',
              border: '1px solid rgba(249,115,22,0.25)',
              borderRadius: 'var(--radius-full)',
              padding: '0.375rem 1rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--primary-300)',
              marginBottom: '1.5rem',
            }}>
              <MapPin size={14} />
              Serving Jammu & Kashmir
            </div>

            <h1 style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              color: 'white',
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em',
            }}>
              Hire Skilled{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--primary-400), var(--primary-300))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Construction Workers
              </span>{' '}
              in Jammu
            </h1>

            <p style={{
              fontSize: '1.125rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              marginBottom: '2rem',
              maxWidth: '520px',
            }}>
              From masons to electricians — find verified daily-wage workers for your
              construction projects. We handle matching, pricing, and coordination.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/request-job" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
                Hire Workers Now
                <ArrowRight size={18} />
              </Link>
              <Link href="/register/worker" className="btn btn-lg" style={{
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                <HardHat size={18} />
                Register as Worker
              </Link>
            </div>

            {/* Quick stats */}
            <div style={{
              display: 'flex',
              gap: '2rem',
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}>
              {[
                { value: '500+', label: 'Workers' },
                { value: '100+', label: 'Jobs Done' },
                { value: 'Jammu', label: 'Region' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SKILLS SHOWCASE ============ */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--background)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{
            textAlign: 'center',
            fontSize: '0.8125rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--gray-400)',
            marginBottom: '1.5rem',
          }}>
            Skilled Workers Available
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            {SKILLS_SHOWCASE.map((skill) => (
              <div key={skill.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--gray-700)',
                transition: 'all 0.2s ease',
                cursor: 'default',
              }}>
                <skill.icon size={18} color={skill.color} />
                {skill.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" style={{
        padding: '5rem 1.5rem',
        background: 'var(--gray-50)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--primary-500)',
              marginBottom: '0.5rem',
            }}>
              Simple Process
            </p>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--foreground)',
              letterSpacing: '-0.02em',
            }}>
              How It Works
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {STEPS.map((step) => (
              <div key={step.step} className="card" style={{
                padding: '2rem 1.5rem',
                textAlign: 'center',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: 'var(--radius-xl)',
                  background: `${step.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <step.icon size={24} color={step.color} />
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: step.color,
                  marginBottom: '0.5rem',
                  letterSpacing: '0.08em',
                }}>
                  STEP {step.step}
                </div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  color: 'var(--foreground)',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--gray-500)',
                  lineHeight: 1.6,
                }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TRUST SECTION ============ */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'var(--background)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--primary-500)',
              marginBottom: '0.5rem',
            }}>
              Why Choose Us
            </p>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--foreground)',
              letterSpacing: '-0.02em',
            }}>
              Built for Jammu&apos;s Workforce
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}>
            {TRUST_POINTS.map((t) => (
              <div key={t.text} style={{
                display: 'flex',
                gap: '1rem',
                padding: '1.25rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                transition: 'all 0.25s ease',
              }}>
                <div style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--primary-50)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <t.icon size={20} color="var(--primary-500)" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--foreground)', marginBottom: '0.125rem' }}>
                    {t.text}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                    {t.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(135deg, var(--secondary-900) 0%, var(--secondary-800) 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            color: 'white',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}>
            Ready to Build Your Team?
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '2rem',
            lineHeight: 1.7,
          }}>
            Whether you need 1 helper or a full 20-person crew, we&apos;ll connect you with the right workers within 24 hours.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/request-job" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              <ClipboardList size={18} />
              Submit a Job Request
            </Link>
            <Link href="/register/worker" className="btn btn-lg" style={{
              textDecoration: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <Users size={18} />
              Join as Worker
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
