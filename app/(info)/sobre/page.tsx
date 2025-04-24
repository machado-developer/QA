import Image from 'next/image';
import { motion } from 'framer-motion';
import goalImage from '@/app/assets/image/quadra-banner.webp';

export default function About() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center w-full bg-gray-100">
      {/* Header */}
     

      {/* Section: Sobre o Site */}
      <section className="w-full max-w-4xl text-center mb-12">
        <h2 className="text-3xl font-semibold text-green-700 mb-4">Nossa historia</h2>
        <p className="text-gray-700 px-4">
          Nosso site foi criado para facilitar o agendamento de quadras esportivas para todos os
          tipos de esportes, desde futebol até tênis. Com nossa plataforma, você pode encontrar,
          reservar e gerenciar suas quadras favoritas de forma rápida e eficiente.
        </p>
      </section>

      {/* Section: Recursos */}
      <section className="w-full max-w-4xl text-center mb-12">
        <h2 className="text-3xl font-semibold text-green-700 mb-4">Recursos Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <FeatureCard
            title="Reserva Online"
            description="Agende sua quadra a qualquer momento, de onde estiver."
            icon="/icons/calendar.svg"
          />
          <FeatureCard
            title="Variedade de Esportes"
            description="Encontre quadras para futebol, basquete, tênis e muito mais."
            icon="/icons/sports.svg"
          />
          <FeatureCard
            title="Pagamento Seguro"
            description="Realize pagamentos online com total segurança."
            icon="/icons/payment.svg"
          />
        </div>
      </section>

      {/* Section: Como Funciona */}
      <section className="w-full max-w-4xl text-center mb-12">
        <h2 className="text-3xl font-semibold text-green-700 mb-4">Como Funciona?</h2>
        <ol className="list-decimal list-inside text-gray-700 px-4 space-y-2">
          <li>Crie sua conta gratuitamente.</li>
          <li>Escolha o esporte e a quadra desejada.</li>
          <li>Selecione a data e horário disponíveis.</li>
          <li>Faça o pagamento online e confirme sua reserva.</li>
        </ol>
      </section>

      {/* Footer */}
     
    </div>
  );
}

// Componente de Cartão de Recurso
function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <Image src={icon} alt={title} width={50} height={50} className="mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-green-700 mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}