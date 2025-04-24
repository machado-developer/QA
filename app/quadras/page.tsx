// app/quadras/page.tsx
'use client'
import { Suspense } from "react";
import QuadraPageContent from "./(component)/QuadraPageContent";
 

export default function QuadrasPage() {
  return (
    <Suspense fallback={<div>Carregando quadras...</div>}>
      <QuadraPageContent />
    </Suspense>
  );
}
