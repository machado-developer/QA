"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loading from "@/loading";

export default function VerifyCode() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const validateCode = useCallback(async () => {
    try {
      const response = await fetch("/api/recovery/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: code.join(""), email }),
      });

      const data = await response.json();

      if (response.status === 200) {
        router.push(`/auth/reset-password?email=${email}&token=${code.join("")}`);
      } else if (response.status === 400) {
        setError(data.message || "Código inválido, tente novamente.");
      } else {
        setError("Ocorreu um erro inesperado. Tente novamente mais tarde.");
      }
    } catch (error) {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    }
  }, [code, email, router]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const email = queryParams.get("email");
    if (email) {
      setEmail(email);
    }
  }, []);

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      validateCode();
    }
  }, [code, validateCode]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <Suspense fallback={<Loading></Loading>}>
      <Card className="w-full max-w-md border-0">
        <CardHeader className="text-center text-lg font-bold">Digite o código de verificação</CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-2">
            {code.map((digit, index) => (
              <Input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="w-12 h-12 text-center text-xl border rounded-md focus:ring-2 focus:ring-green-600"
              />
            ))}
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          <p className="text-sm text-gray-500 text-center mt-4">Expira em {timeLeft}s</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={validateCode} className="w-full bg-green-800 hover:bg-green-700">Confirmar</Button>
        </CardFooter>
      </Card>
    </Suspense>
  );
}