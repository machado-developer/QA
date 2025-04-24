import Image from 'next/image';

export default function Contact() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-100">
      {/* Header */}
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          Entre em Contato Conosco
        </h1>
        <p className="text-lg text-gray-700">
          Estamos aqui para ajudar! Envie-nos uma mensagem ou entre em contato pelos canais abaixo.
        </p>
      </header>

      {/* Section: Formulário de Contato */}
      <section className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md mb-12">
        <h2 className="text-2xl font-semibold text-green-700 mb-6">Formulário de Suporte</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Nome
            </label>
            <input
              type="text"
              id="name"
              placeholder="Seu nome"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="seuemail@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
              Mensagem
            </label>
            <textarea
              id="message"
              rows={4}
              placeholder="Digite sua mensagem aqui..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300"
          >
            Enviar Mensagem
          </button>
        </form>
      </section>

      {/* Section: Informações de Contato */}
      <section className="w-full max-w-4xl text-center mb-12">
        <h2 className="text-2xl font-semibold text-green-700 mb-6">Outros Canais de Suporte</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <ContactCard
            title="Email"
            description="Envie-nos um email e responderemos em até 24 horas."
            icon="/icons/email.svg"
            contactInfo="suporte@agendamentoquadras.com"
          />
          <ContactCard
            title="Telefone"
            description="Ligue para nossa central de atendimento."
            icon="/icons/phone.svg"
            contactInfo="+55 11 98765-4321"
          />
          <ContactCard
            title="Redes Sociais"
            description="Entre em contato via redes sociais."
            icon="/icons/social-media.svg"
            contactInfo="@AgendamentoQuadras"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center text-gray-600 mt-8">
        <p>&copy; 2023 Agendamento de Quadras. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

// Componente de Cartão de Contato
function ContactCard({ title, description, icon, contactInfo }: { title: string; description: string; icon: string; contactInfo: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <Image src={icon} alt={title} width={50} height={50} className="mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-green-700 mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
      <p className="text-green-600 font-medium mt-2">{contactInfo}</p>
    </div>
  );
}