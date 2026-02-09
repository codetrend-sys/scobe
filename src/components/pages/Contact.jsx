import { useState } from 'react';
import { Mail, User, MessageSquare, HelpCircle } from 'lucide-react';

export default function ContactPremium() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
  e.preventDefault();

  if (!form.name || !form.email || !form.subject || !form.message) {
    setStatus('Veuillez remplir tous les champs.');
    return;
  }

  setLoading(true);
  setStatus('');

  // Formsubmit attend du form-urlencoded (pas du JSON)
  const formData = new URLSearchParams();
  formData.append('name', form.name);
  formData.append('email', form.email);
  formData.append('subject', form.subject);
  formData.append('message', form.message);

  // Options Formsubmit
  formData.append('_subject', `Nouveau message : ${form.subject}`);
  formData.append('_template', 'table'); // email plus lisible
  formData.append('_captcha', 'false'); // optionnel

  try {
    const res = await fetch(
      'https://formsubmit.co/scobelibrairietanger@gmail.com',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: formData.toString(),
      }
    );

    if (!res.ok) {
      throw new Error('Erreur Formsubmit');
    }

    setStatus('success');
    setForm({ name: '', email: '', subject: '', message: '' });
  } catch (err) {
    console.error(err);
    setStatus('error');
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-12">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden">

        {/* LEFT INFO */}
        <div className="p-12 bg-gradient-to-br from-blue-600 to-green-600 text-white flex flex-col justify-center space-y-6">
          <h2 className="text-4xl font-bold">Besoin d’aide ?</h2>
          <p className="text-blue-100 text-lg">
            Notre équipe administrative est à votre écoute.
          </p>

          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5" />
              Réponse sous 24h
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              Contact administratif
            </li>
            <li className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              Assistance professionnelle
            </li>
          </ul>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-10 bg-white/80 backdrop-blur-lg flex flex-col justify-center space-y-6"
        >
          <h3 className="text-3xl font-semibold text-gray-800">
            Envoyer un message
          </h3>

          <div className="relative">
            <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              name="name"
              placeholder="Nom complet"
              className="w-full pl-11 pr-4 py-3 border rounded-xl"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              placeholder="Adresse email"
              className="w-full pl-11 pr-4 py-3 border rounded-xl"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <HelpCircle className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <select
              name="subject"
              className="w-full pl-11 pr-4 py-3 border rounded-xl"
              value={form.subject}
              onChange={handleChange}
            >
              <option value="" >Choisir un sujet</option>
              <option value="Demande d’avis" >Demande d’avis</option>
              <option value="Question produit">Question produit</option>
              <option value="Commande">Question commande</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div className="relative">
            <MessageSquare className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <textarea
              name="message"
              rows="5"
              placeholder="Votre message"
              className="w-full pl-11 pr-4 py-3 border rounded-xl"
              value={form.message}
              onChange={handleChange}
            />
          </div>

          {status === 'success' && (
            <p className="text-green-600 text-sm">
              Message envoyé avec succès.
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-600 text-sm">
              Erreur lors de l’envoi. Réessayez.
            </p>
          )}
          {status && !['success', 'error'].includes(status) && (
            <p className="text-red-600 text-sm">{status}</p>
          )}

          <button
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white ${
              loading
                ? 'bg-blue-400'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Envoi en cours…' : 'Envoyer le message'}
          </button>
        </form>
      </div>
    </section>
  );
}
