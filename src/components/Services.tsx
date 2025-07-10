"use client";

import React, { useEffect } from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Image from 'next/image';

interface Service {
  id: number | null;
  name: string;
  price: number;
  duration: number;
  image: string | null;
  description: string | null;
  stripeProductId: string | null;
  stripePriceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const Services: React.FC = () => {
  const { services, setServices } = useStore();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data: Service[] = await response.json();
        setServices(data);
        toast.success('Services loaded successfully');
      } catch (error) {
        toast.error('Error fetching services');
        console.error(error);
      }
    };
    fetchServices();
  }, [setServices]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Our Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length > 0 ? (
          services.map((service) => (
            <Card key={service.stripeProductId || service.id}>
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {service.image && (
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src={service.image}
                      alt={service.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                )}
                <p className="text-gray-600 mb-2">{service.description || 'No description available'}</p>
                <p className="text-lg font-semibold">R${service.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Duration: {service.duration} minutes</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No services available</p>
        )}
      </div>
    </div>
  );
};