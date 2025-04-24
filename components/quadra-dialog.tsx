"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface CourtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isEditing?: boolean;
  court?: CourtForm;
}

const courtSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  description: z.string().optional(),
  pricePerHour: z.coerce.number().positive("Price must be positive"),
  featuredImage: z.string().url("Invalid image URL"),
  categoryId: z.string().optional(),
});

type CourtForm = z.infer<typeof courtSchema>;

interface Availability {
  date: string;
  startTime: string;
  endTime: string;
}

export default function CourtDialog({
  open,
  onOpenChange,
  onSuccess,
  isEditing = false,
  court,
}: CourtDialogProps) {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CourtForm>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      description: "",
      pricePerHour: 0,
      featuredImage: "",
      categoryId: "",
    },
  });

  const featuredImage = watch("featuredImage");

  const addAvailability = () => {
    if (!newDate || !newStartTime || !newEndTime) return;

    const startDateTime = new Date(`${newDate}T${newStartTime}`);
    const endDateTime = new Date(`${newDate}T${newEndTime}`);

    // Check if the times are valid
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setError("Invalid date or time format.");
      return;
    }
    setAvailability((prev) => [
      ...prev,
      {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
      },
    ]);
    setNewDate("");
    setNewStartTime("");
    setNewEndTime("");
  };


  const selectCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryId = e.target.value;
    setCategoryId(selectedCategoryId);
    setValue("categoryId", selectedCategoryId);
  }
  const removeAvailability = (index: number) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    reset({})
    setError("")
  }, [open])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      return data.categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  const onSubmit = async (data: CourtForm) => {
    try {
      const payload = {
        ...data,
        availabilities: availability,
      };

      const response = await fetch(
        isEditing ? `/api/admin/courts/${data.id}` : "/api/admin/courts",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Error saving court");

      reset();
      setAvailability([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  useEffect(() => {
    if (open && isEditing && court) {
      reset({
        id: court.id,
        name: court.name,
        address: court.address,
        city: court.city,
        description: court.description,
        pricePerHour: court.pricePerHour,
        featuredImage: court.featuredImage,
        categoryId: court.categoryId ?? "",
      });

      if ((court as any).availability) {
        setAvailability((court as any).availability);
      }
    } else if (open && !isEditing) {
      reset();
      setAvailability([]);
    }
  }, [open, isEditing, court, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setValue("featuredImage", data.url);
    } catch (err) {
      console.error(err);
      setError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    };

    fetchData();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Court" : "Register New Court"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto max-h-[80vh]">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label>Name</label>
            <Input {...register("name")} />
            {errors.name && <p className="text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <label>Address</label>
            <Input {...register("address")} />
            {errors.address && <p className="text-destructive">{errors.address.message}</p>}
          </div>

          <div>
            <label>City</label>
            <Input {...register("city")} />
            {errors.city && <p className="text-destructive">{errors.city.message}</p>}
          </div>

          <div>
            <label>Description</label>
            <Textarea {...register("description")} />
          </div>
          <div className="space-y-2">
            <Select onValueChange={(value) => setValue("categoryId", value)} defaultValue={categoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
          </div>
          <div>
            <label>Price per hour (KZ)</label>
            <Input type="number" step="0.01" {...register("pricePerHour")} />
            {errors.pricePerHour && <p className="text-destructive">{errors.pricePerHour.message}</p>}
          </div>

          <div>
            <label>Featured Image</label>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
            {uploading && <p className="text-muted-foreground text-sm">Uploading image...</p>}
            {featuredImage && (
              <img src={featuredImage} alt="Featured" className="h-32 rounded mt-2" />
            )}
            {errors.featuredImage && (
              <p className="text-destructive">{errors.featuredImage.message}</p>
            )}
          </div>

          {/* Availability */}
            {!isEditing && (
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">Availability</h3>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <Input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
              />
              <Input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={addAvailability}>
                + Add
              </Button>
              </div>

              {availability.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm">
                {availability.map((slot, index) => (
                <li key={index} className="flex justify-between">
                  <span>
                  {format(new Date(slot.date), "dd/MM/yyyy")} – {slot.startTime}–{slot.endTime}
                  </span>
                  <button
                  type="button"
                  onClick={() => removeAvailability(index)}
                  className="text-red-500 text-xs"
                  >
                  Remove
                  </button>
                </li>
                ))}
              </ul>
              )}
            </div>
            )}

          <Button
            type="submit"
            disabled={isSubmitting || uploading}
            className="w-full bg-green-600 text-white"
          >
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Registering..."
              : isEditing
                ? "Update Court"
                : "Register Court"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
