import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { Clock3, Mail, MapPin, MessageSquare, PhoneCall, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Contact = () => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [topic, setTopic] = useState('General inquiry');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!user) {
            return;
        }

        setName(user.name || '');
        setEmail(user.email || '');
    }, [user]);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (!name.trim() || !email.trim() || !message.trim()) {
            toast.error('Please complete the contact form before sending.');
            return;
        }

        toast.success('Your message has been prepared successfully.');
        setTopic('General inquiry');
        setMessage('');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-14 space-y-6 md:space-y-8">
            <section className="rounded-[24px] md:rounded-[36px] premium-gradient text-white p-5 md:p-10 shadow-xl">
                <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs sm:text-sm font-black">
                        <MessageSquare size={16} />
                        <span>Contact HireChain</span>
                    </div>
                    <h1 className="mt-4 md:mt-5 text-2xl md:text-5xl font-black">Let us know what you need</h1>
                    <p className="mt-4 md:mt-5 max-w-3xl text-sm md:text-lg leading-relaxed text-white/80">
                        Reach out for product feedback, demo requests, technical questions, or partnership conversations.
                        We designed this contact page to feel ready for a professional product team workflow.
                    </p>
                </div>
            </section>

            <section className="grid lg:grid-cols-[0.95fr,1.05fr] gap-4 md:gap-6">
                <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                    {[
                        {
                            icon: <Mail className="text-brand-primary" />,
                            title: 'Email support',
                            detail: 'support@hirechain.ai',
                            copy: 'Best for account help, screening questions, and product feedback.'
                        },
                        {
                            icon: <PhoneCall className="text-brand-secondary" />,
                            title: 'Phone',
                            detail: '+60 3-4567 8901',
                            copy: 'For urgent conversations during demos, onboarding, or stakeholder reviews.'
                        },
                        {
                            icon: <MapPin className="text-brand-accent" />,
                            title: 'Location',
                            detail: 'Cyberjaya, Malaysia',
                            copy: 'Available for hybrid collaboration, campus showcases, and project presentations.'
                        },
                        {
                            icon: <Clock3 className="text-emerald-600" />,
                            title: 'Response time',
                            detail: 'Within 1 business day',
                            copy: 'We aim to reply quickly so the hiring workflow keeps moving.'
                        }
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-[22px] md:rounded-[32px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-5 md:p-7 transition-colors duration-300"
                        >
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gray-50 dark:bg-dark-main flex items-center justify-center">
                                {item.icon}
                            </div>
                            <h2 className="mt-4 md:mt-5 text-lg md:text-xl font-black text-gray-900 dark:text-white transition-colors duration-300">{item.title}</h2>
                            <p className="mt-2 text-base font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">{item.detail}</p>
                            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300 transition-colors duration-300">{item.copy}</p>
                        </div>
                    ))}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-[24px] md:rounded-[36px] bg-white dark:bg-dark-surface border border-gray-100 dark:border-gray-800 shadow-sm p-5 md:p-8 transition-colors duration-300"
                >
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary/70">Send Message</p>
                    <h2 className="mt-3 text-2xl md:text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                        Start the conversation
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        Share your question and we will have the right context to respond quickly.
                    </p>

                    <div className="mt-6 md:mt-8 grid md:grid-cols-2 gap-4 md:gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Your Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="block w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-primary transition-all text-gray-900 dark:text-white"
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="block w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-primary transition-all text-gray-900 dark:text-white"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Topic</label>
                        <select
                            value={topic}
                            onChange={(event) => setTopic(event.target.value)}
                            className="block w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-primary transition-all text-gray-900 dark:text-white"
                        >
                            <option>General inquiry</option>
                            <option>Demo request</option>
                            <option>Technical support</option>
                            <option>Partnership</option>
                            <option>Feedback</option>
                        </select>
                    </div>

                    <div className="mt-5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Message</label>
                        <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            rows={7}
                            className="block w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl md:rounded-2xl focus:ring-2 focus:ring-brand-primary transition-all text-gray-900 dark:text-white resize-none"
                            placeholder="Tell us what you need help with..."
                            required
                        />
                    </div>

                    <div className="mt-6 md:mt-8 flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl md:rounded-2xl premium-gradient text-white px-5 py-3 font-bold text-sm md:text-base shadow-lg hover:opacity-95 transition-all"
                        >
                            <Send size={18} />
                            <span>Send Message</span>
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default Contact;
