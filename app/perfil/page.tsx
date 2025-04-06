'use client';

import Image from 'next/image';
import { Pencil, Check, X, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';

export default function PerfilCliente() {
    const [editandoPerfil, setEditandoPerfil] = useState(false);
    const [editandoSenha, setEditandoSenha] = useState(false);
    const { data: session, status } = useSession();
    const [nome, setNome] = useState(session?.user?.name );
    const [email, setEmail] = useState(session?.user?.email );

    const [novoNome, setNovoNome] = useState(nome);
    const [novoEmail, setNovoEmail] = useState(email);

    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const handleEditarPerfil = () => {
        setEditandoPerfil(true);
        setNovoNome(nome);
        setNovoEmail(email);
    };

    const handleCancelarPerfil = () => {
        setEditandoPerfil(false);
        setNovoNome(nome);
        setNovoEmail(email);
    };

    const handleSalvarPerfil = () => {
        setNome(novoNome);
        setEmail(novoEmail);
        setEditandoPerfil(false);
        // Aqui você pode chamar a API para atualizar o perfil
    };

    const handleSalvarSenha = () => {
        if (novaSenha !== confirmarSenha) {
            alert("As senhas não coincidem!");
            return;
        }

        console.log("Senha atual:", senhaAtual);
        console.log("Nova senha:", novaSenha);
        // Aqui você chamaria a API para atualizar a senha

        setSenhaAtual("");
        setNovaSenha("");
        setConfirmarSenha("");
        setEditandoSenha(false);
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>

            {/* Dados do cliente */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow mb-8">
                <Image
                    src="/user-avatar.png"
                    alt="Avatar"
                    width={60}
                    height={60}
                    className="rounded-full"
                />
                <div className="flex-1">
                    {editandoPerfil ? (
                        <div className="flex flex-col gap-2">
                            <input
                                value={novoNome || ''}
                                onChange={(e) => setNovoNome(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                            />
                            <input
                                value={novoEmail || ''}
                                onChange={(e) => setNovoEmail(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                            />
                            <div className="flex gap-2 mt-1">
                                <button
                                    onClick={handleSalvarPerfil}
                                    className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                                >
                                    <Check size={16} /> Salvar
                                </button>
                                <button
                                    onClick={handleCancelarPerfil}
                                    className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm"
                                >
                                    <X size={16} /> Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <p className="text-lg font-semibold">{nome}</p>
                            <p className="text-sm text-gray-600">{email}</p>
                            <button
                                onClick={handleEditarPerfil}
                                className="mt-2 text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                            >
                                <Pencil size={16} /> Editar Perfil
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Alterar senha */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Atualizar Senha</h2>
                {editandoSenha ? (
                    <div className="flex flex-col gap-3">
                        <Input
                            type={mostrarSenha ? 'text' : 'password'}
                            placeholder="Senha atual"
                            value={senhaAtual}
                            onChange={(e) => setSenhaAtual(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <Input
                            type={mostrarSenha ? 'text' : 'password'}
                            placeholder="Nova senha"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <Input
                            type={mostrarSenha ? 'text' : 'password'}
                            placeholder="Confirmar nova senha"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <button
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            className="text-sm text-blue-500 flex items-center gap-1 w-fit"
                        >
                            {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />} {mostrarSenha ? "Ocultar senhas" : "Mostrar senhas"}
                        </button>

                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleSalvarSenha}
                                className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                            >
                                <Check size={16} /> Salvar Senha
                            </button>
                            <button
                                onClick={() => setEditandoSenha(false)}
                                className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm"
                            >
                                <X size={16} /> Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditandoSenha(true)}
                        className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                    >
                        <Pencil size={16} /> Alterar Senha
                    </button>
                )}
            </div>
        </div>
    );
}
