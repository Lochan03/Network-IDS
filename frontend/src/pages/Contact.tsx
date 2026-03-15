import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Phone, MapPin, Send, Star, MessageSquare, ThumbsUp, Bug, Lightbulb } from 'lucide-react';

const FEEDBACK_TYPES = [
  { id: 'general',     label: 'General',     icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'bug',         label: 'Bug Report',  icon: <Bug className="h-4 w-4" /> },
  { id: 'feature',     label: 'Feature Req', icon: <Lightbulb className="h-4 w-4" /> },
  { id: 'compliment',  label: 'Compliment',  icon: <ThumbsUp className="h-4 w-4" /> },
];

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}
        className={`transition-colors ${n <= value ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-300'}`}>
        <Star className="h-6 w-6" fill={n <= value ? 'currentColor' : 'none'} />
      </button>
    ))}
  </div>
);

const Contact = () => {
  const { toast } = useToast();
  const [feedbackType, setFeedbackType] = useState('general');
  const [rating, setRating]             = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: '✅ Feedback Submitted',
      description: 'Thank you! We read every message and will get back to you soon.',
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
    setRating(0);
    setFeedbackType('general');
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="text-cyberpulse-purple text-sm font-semibold tracking-widest uppercase">Feedback</div>
        <h1 className="text-4xl font-extrabold">We'd Love to Hear From You</h1>
        <p className="text-gray-400">
          Report bugs, request features, or just tell us what you think about Cyber-Pulse.
          Every message makes the system better.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="bg-cyberpulse-darker border-cyberpulse-purple/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-cyberpulse-purple" />
                Send Feedback
              </CardTitle>
              <CardDescription>Fill out the form — we typically respond within 24 hours.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">

                {/* Feedback type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Feedback Type</label>
                  <div className="flex flex-wrap gap-2">
                    {FEEDBACK_TYPES.map(t => (
                      <button key={t.id} type="button" onClick={() => setFeedbackType(t.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          feedbackType === t.id
                            ? 'bg-cyberpulse-purple/20 border-cyberpulse-purple text-cyberpulse-purple'
                            : 'border-gray-700 text-gray-400 hover:border-gray-500'
                        }`}>
                        {t.icon}{t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Star rating */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rate Your Experience</label>
                  <StarRating value={rating} onChange={setRating} />
                  <p className="text-xs text-gray-500">
                    {rating === 0 ? 'Click to rate' : ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                  </p>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                    <Input id="name" name="name" placeholder="e.g. Ranjith Kumar"
                      value={formData.name} onChange={handleChange} required
                      className="bg-black/30 border-gray-700 focus:border-cyberpulse-purple" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                    <Input id="email" name="email" type="email" placeholder="you@example.com"
                      value={formData.email} onChange={handleChange} required
                      className="bg-black/30 border-gray-700 focus:border-cyberpulse-purple" />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Input id="subject" name="subject" placeholder="Brief description of your feedback"
                    value={formData.subject} onChange={handleChange} required
                    className="bg-black/30 border-gray-700 focus:border-cyberpulse-purple" />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea id="message" name="message" placeholder="Be as detailed as you like…"
                    rows={6} value={formData.message} onChange={handleChange} required
                    className="bg-black/30 border-gray-700 focus:border-cyberpulse-purple resize-none" />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2">
                <Button type="submit" className="w-full bg-cyberpulse-purple hover:bg-cyberpulse-purple/90 cyber-btn">
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </Button>
                <p className="text-xs text-gray-500 text-center">Your message is private and only visible to the team.</p>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <Card className="bg-cyberpulse-darker border-cyberpulse-purple/20">
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: <MapPin className="h-5 w-5 text-cyberpulse-purple" />, label: 'Location', val: 'Hyderabad, India' },
                { icon: <Phone className="h-5 w-5 text-cyberpulse-purple" />, label: 'Phone', val: '+91 9391971961' },
                { icon: <Mail className="h-5 w-5 text-cyberpulse-purple" />, label: 'Email', val: 'retvikvarmab@gmail.com' },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="bg-cyberpulse-purple/10 p-2 rounded-lg flex-shrink-0">{icon}</div>
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-medium text-gray-200">{val}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* FAQ cards */}
          <Card className="bg-cyberpulse-darker border-gray-700/30">
            <CardHeader><CardTitle className="text-base">Quick FAQ</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { q: 'Does it require root?', a: 'Live sniffing needs sudo on macOS. PCAP replay works without root.' },
                { q: 'Can I use my own PCAP?', a: 'Yes — pass --pcap <file> to packet_detection.py.' },
                { q: 'What attacks are detected?', a: 'DoS, DDoS, Brute Force, Port Scan, Web Attacks, Botnet, and more.' },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-gray-800/50 pb-3 last:border-0 last:pb-0">
                  <p className="font-medium text-gray-200 mb-0.5">{q}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{a}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
