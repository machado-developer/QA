// app/404.tsx
import { Suspense } from "react";
 
export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <h1> NAO ENCONTRADO</h1>
    </Suspense>
  );
}
