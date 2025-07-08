"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaFileExcel, FaFilePdf, FaFilePowerpoint, FaFileWord, FaImage, FaRegFileArchive, } from "react-icons/fa"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    FileText,
    MoreVertical,
    Trash,
    Eye,
    Download,
    UploadCloud,
    Loader2,
    FileImage,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Arquivo = {
    id: string;
    nome: string;
    path: string;
    url: string | null;
    tipo: string | null;
    tamanhoMB: number | null;
    createdAt: string;
    updatedAt: string;
    courtId: string;
    tarefaId: string | null;
};

const FileManagerPage = () => {
    const [arquivos, setArquivos] = useState<Arquivo[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const params = useParams();
    const courtId = params?.id as string;

    useEffect(() => {
        fetchArquivos();
    }, []);

    const fetchArquivos = async () => {
        try {
            const res = await fetch(`/api/admin/courts/${courtId}/images`);
            if (!res.ok) throw new Error("Erro ao buscar arquivos");
            const data = await res.json();
            setArquivos(data || []);
        } catch (err) {
            console.error("Erro ao carregar arquivos", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Deseja realmente excluir este arquivo?")) {
            try {
                await fetch(`/api/uploads/${id}`, { method: "DELETE" });
                fetchArquivos();
            } catch (err) {
                console.error("Erro ao excluir arquivo", err);
            }
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    const getFileURL = (arquivo: Arquivo) =>
        arquivo.url || `/${arquivo.path.replace(/\\/g, "/")}`;

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            await uploadArquivos({ documentos: Array.from(files) });
            fetchArquivos(); // Atualiza a lista
        }
    };

    async function uploadArquivos(data: { documentos: File[] }) {
        const formData = new FormData();

        data.documentos.forEach((file: File) => {
            formData.append("courtImages", file);
        });

        formData.append("courtId", courtId);

        return new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/uploads");

            setUploading(true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percent);
                }
            };

            xhr.onload = () => {
                setUploadProgress(null);
                setUploading(false);
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error("Erro no upload: " + xhr.statusText));
                }
            };

            xhr.onerror = () => {
                setUploadProgress(null);
                setUploading(false);
                reject(new Error("Erro de conexão"));
            };

            xhr.send(formData);
        });
    }

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Gerenciador de Arquivos({arquivos.length})</h1>
                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        hidden
                        onChange={handleFileChange}
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 text-white"
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-4 h-4 mr-2" />
                                Carregar Arquivo
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {uploadProgress !== null && (
                <div className="w-full bg-gray-200 rounded h-4 overflow-hidden mb-4">
                    <div
                        className="bg-blue-500 h-full transition-all text-xs text-white text-center"
                        style={{ width: `${uploadProgress}%` }}
                    >
                        {uploadProgress}%
                    </div>
                </div>
            )}

            {loading ? (
                <p>Carregando arquivos...</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {arquivos.map((arquivo) => (
                        <Card
                            key={arquivo.id}
                            className="p-4 relative hover:bg-gray-100 cursor-pointer"
                        >
                            <div className="flex flex-col items-center justify-center text-center space-y-2">
                                <div className="w-full flex justify-center">
                                    <Image
                                        alt="Imagem"
                                        src={arquivo?.url ?? "#"}
                                        width={200}
                                        height={150}
                                        className="rounded-md object-contain"
                                    />
                                </div>

                                <span className="text-xs text-gray-400">
                                    {formatDate(arquivo.createdAt)}
                                </span>
                            </div>

                            <div className="absolute top-2 bg-green-300 right-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem  asChild>
                                             <a href={arquivo?.url ?? "#"} target="_blank" rel="noopener noreferrer">
                                               
                                            <Eye className="w-4 h-4 mr-2" /> Visualizar
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a href={arquivo?.url ?? "#"} target="_blank"  download={true} rel="noopener noreferrer">
                                                <Download className="w-4 h-4 mr-2" /> Baixar
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(arquivo.id)}>
                                            <Trash className="w-4 h-4 mr-2 text-red-500" /> Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </Card>

                    ))}

                    {arquivos.length === 0 && (
                        <div className="col-span-full text-center text-gray-500">
                            Nenhum arquivo encontrado.
                        </div>)
                    }
                </div>
            )}
        </div>
    );
};

export default FileManagerPage;
