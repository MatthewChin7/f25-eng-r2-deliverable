"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import Image from "next/image";

type Species = Database["public"]["Tables"]["species"]["Row"];

interface SpeciesDetailDialogProps {
  species: Species;
  children: React.ReactNode;
}

export default function SpeciesDetailDialog({ species, children }: SpeciesDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{species.scientific_name}</DialogTitle>
          <DialogDescription>
            {species.common_name && `Commonly known as ${species.common_name}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {species.image && (
            <div className="relative h-64 w-full">
              <Image 
                src={species.image} 
                alt={species.scientific_name} 
                fill 
                style={{ objectFit: "cover" }} 
                className="rounded-lg"
              />
            </div>
          )}
          
          <div className="grid gap-4">
            <div>
              <h3 className="text-lg font-semibold">Scientific Name</h3>
              <p className="text-gray-700">{species.scientific_name}</p>
            </div>
            
            {species.common_name && (
              <div>
                <h3 className="text-lg font-semibold">Common Name</h3>
                <p className="text-gray-700">{species.common_name}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold">Kingdom</h3>
              <p className="text-gray-700">{species.kingdom}</p>
            </div>
            
            {species.total_population && (
              <div>
                <h3 className="text-lg font-semibold">Total Population</h3>
                <p className="text-gray-700">{species.total_population.toLocaleString()}</p>
              </div>
            )}
            
            {species.description && (
              <div>
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="text-gray-700">{species.description}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


