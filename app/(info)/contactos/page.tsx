'use client'

import {  Linkedin } from 'lucide-react';
import { FaFacebook, FaInstagram, FaMailBulk, FaPhone, FaShareAlt, FaTwitter } from 'react-icons/fa'
import { IconType } from 'react-icons/lib'

const socialIcons = [
  { name: "Facebook", link: "", icon: <FaFacebook className={`"text-white" : "text-gray-700"} hover:text-blue-600 text-lg`} /> },
  { name: "Twitter", link: "", icon: <FaTwitter className={`"text-white" : "text-gray-700"} hover:text-blue-400 text-lg`} /> },
  { name: "Instagram", link: "", icon: <FaInstagram className={`"text-white" : "text-gray-700"} hover:text-pink-500 text-lg`} /> },
  { name: "Linkedin", link: "", icon: <Linkedin className={`"text-white" : "text-gray-700"} hover:text-blue-700 text-lg`} /> },
];
export default function Contact() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-white">
      {/* Header */}
      <header className="w-full max-w-4xl text-center mb-12">
        <h1 className="text-5xl font-extrabold text-green-700 mb-4 tracking-tight">
          Fale Conosco
        </h1>
        <p className="text-lg text-gray-600">
          Precisa de ajuda? Estamos disponíveis para tirar suas dúvidas e oferecer suporte rápido.
        </p>
      </header>



      {/* Canais de Contato */}
      <section className="w-full  bg-green-900 w-full p-4 pt-24 pb-24 text-center">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <ContactCard
            title="Email"
            description="Respondemos em até 24h úteis."
            Icon={FaMailBulk}
            contactInfo="suporte@agendamentoquadras.com"
          />
          <ContactCard
            title="Telefone"
            description="Atendimento de segunda a sexta, 8h às 18h."
            Icon={FaPhone}
            contactInfo="+244 922 000 000"
          />
          <ContactCard
            title="Redes Sociais"
            description="Estamos ativos nas redes sociais"
            Icon={FaShareAlt}
            contactInfo={""}
            isSocial={true}
          />
        </div>
      </section>
    </div>
  )
}

function ContactCard({
  title,
  description,
  Icon,
  contactInfo,
  isSocial = false
}: {
  title: string
  description: string
  Icon: IconType
  contactInfo: string
  isSocial?: boolean

}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 text-center">
      <div className="flex justify-center mb-4">
        <Icon width={48} height={48} />
      </div>
      <h3 className="text-xl font-semibold text-green-700">{title}</h3>
      <p className="text-gray-600 mt-2">{description}</p>
      <p className="text-green-600 font-medium mt-3">{contactInfo}</p>
      <div className='md:flex space-x-3 w-full items-center justify-center '>
        {isSocial && socialIcons?.map((icon) => (
          <a key={icon.name} href={icon.link} className="text-gray-700 hover:text-green-500 transition">
            {icon.icon}
          </a>
        ))}
      </div>
    </div>
  )
}



