import Image from 'next/image';
import { motion } from 'framer-motion';
import goalImage from '@/app/assets/image/quadra-banner.webp';

export default function About() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center w-full bg-white">
      {/* Header */}


      {/* Section: Sobre o Site */}
      <section className="w-full py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Texto */}
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-bold text-green-700 mb-6">Proposito do Sistema</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Criamos essa plataforma com o objetivo de facilitar o agendamento de quadras esportivas para diversos esportes,
              como futebol, basquete e tênis.
              <br /><br />
              A ideia surgiu da dificuldade que muitos enfrentam para encontrar e reservar quadras de forma prática e rápida.
              <br /><br />
              Nosso sistema resolve isso ao permitir que qualquer pessoa visualize opções disponíveis, faça reservas online
              e realize pagamentos com segurança — tudo em um só lugar.
            </p>
          </div>

          {/* Imagem */}
          <div className="w-full h-full">
            <img
              src="/icons/quadra.jpg" // ajuste para o caminho correto da sua imagem
              alt="Imagem de quadra esportiva"
              className="w-full h-auto rounded-xl shadow-lg object-cover"
            />
          </div>
        </div>
      </section>


      {/* Section: Recursos */}
      <section className="w-full  text-center pb-12 bg-green-800 pb-24 pt-24 w-full">
        <h2 className="text-3xl font-semibold text-white mb-4">Recursos Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <FeatureCard
            title="Reserva Online"
            description="Agende sua quadra a qualquer momento, de onde estiver."
            icon="/icons/quadra.jpg"
          />
          <FeatureCard
            title="Variedade de Esportes"
            description="Encontre quadras para futebol, basquete, tênis e muito mais."
            icon="/icons/quadra.jpg"
          />
          <FeatureCard
            title="Pagamento Seguro"
            description="Realize pagamentos no local com total segurança."
            icon="/icons/payment.webp"
          />
        </div>
      </section>

      {/* Section: Como Funciona */}
      <section className="w-full  mx-auto text-center py-16 px-6 bg-black">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-green-700 mb-6">
          Como Funciona
        </h2>
        <p className="text-lg sm:text-xl text-gray-100 mb-10 max-w-2xl mx-auto">
          Reserve sua quadra esportiva em minutos. Simples, rápido e totalmente online.
        </p>
        <ol className="relative border-s-2 border-green-500 space-y-10 text-left max-w-xl mx-auto">
          <li className="ms-6">
            <div className="absolute -start-1.5 top-1 w-3 h-3 bg-green-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-green-700 mb-1">1. Crie sua conta</h3>
            <p className="text-gray-100">Cadastre-se gratuitamente e acesse todas as funcionalidades.</p>
          </li>
          <li className="ms-6">
            <div className="absolute -start-1.5 top-1 w-3 h-3 bg-green-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-green-700 mb-1">2. Escolha sua quadra</h3>
            <p className="text-gray-100">Busque por esportes e encontre a quadra perfeita para você.</p>
          </li>
          <li className="ms-6">
            <div className="absolute -start-1.5 top-1 w-3 h-3 bg-green-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-green-700 mb-1">3. Selecione data e horário</h3>
            <p className="text-gray-100">Veja a disponibilidade em tempo real e escolha o melhor momento.</p>
          </li>
          <li className="ms-6">
            <div className="absolute -start-1.5 top-1 w-3 h-3 bg-green-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-green-700 mb-1">4. Confirme e pague no local</h3>
            <p className="text-gray-100">Finalize a reserva com segurança e receba seu comprovativo por PDF.</p>
          </li>
        </ol>
      </section>


      {/* Footer */}

    </div>
  );
}

// Componente de Cartão de Recurso
function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white  rounded-lg shadow-md text-center">
      <Image src={icon} alt={title} width={100} height={70} className="w-full mb-4" />
      <h3 className="text-xl font-semibold text-green-700 mb-2">{title}</h3>
      <p className="text-gray-100 p-4">{description}</p>
    </div>
  );
}