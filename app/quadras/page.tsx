// app/quadras/page.tsx
'use client'
import { Suspense } from "react";
import QuadraPageContent from "./(component)/QuadraPageContent";
import Loading from "@/loading";
 

export default function QuadrasPage() {
  return (
    <Suspense fallback={<Loading></Loading>}>
      <QuadraPageContent />
    </Suspense>
  );
}
