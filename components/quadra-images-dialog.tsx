"use client";

import { useEffect, Suspense } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Loading from "@/loading";
import UploadInput from "./ui/upload-input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface CourtImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courtId: string | undefined;
  onSave: (files: File[]) => void;
  initialImages: File[]
}

export const schemaUpload = z.object({
  courtImages: z.array(z.instanceof(File)).nonempty("Envie pelo menos uma imagem"),
});

type FormUploadType = z.infer<typeof schemaUpload>;

export default function CourtImagesDialog({
  open,
  onOpenChange,
  initialImages,
  courtId,
  onSave,
}: CourtImagesDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    control,
  } = useForm<FormUploadType>({
    resolver: zodResolver(schemaUpload),
    defaultValues: {
      courtImages: initialImages || [],
    },
  });

  useEffect(() => {
    if (open) reset(); // limpa ao abrir
  }, [open, reset]);

  const onSubmit = (data: FormUploadType) => {
    onSave(data.courtImages);
    onOpenChange(false);
  };

  return (
    <Suspense fallback={<Loading />}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imagens da Quadra</DialogTitle>
          </DialogHeader>

          {errors.courtImages && (
            <Alert variant="destructive">
              <AlertDescription>{errors.courtImages.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <UploadInput name="courtImages" control={control} />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white mt-6"
            >
              Salvar Imagens
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Suspense>
  );
}
