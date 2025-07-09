import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2, 'Nome tem que ter 2 caracteres'),
    email: z.string().email('Email invalido'),
    phone: z.string().min(10, 'Numero de telefone tem que ter 10 numeros'),
    password: z.string().min(6, 'Senha precisa ter 6 caracteres'),
})

export const loginSchema = z.object({
    email: z.string().email('Email invalido'),
    password: z.string().min(6, 'Senha precisa ter 6 caracteres'),
})

export const appointmentSchema = z.object({
    serviceId: z.number().int().positive(),
    date: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, 'Formato invalido (DD-MM-YYYY)'),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato invalido (HH:MM)'),
})

export const serviceSchema = z.object({
    name: z.string().min(2, 'Serviço precisa pelo menos 2 caracteres'),
    price: z.number().positive('Valor'),
    duration: z.number().int().positive('Duração precisa ser positivo')
})

export const scheduleSchema = z.object({
  dayOfWeek: z.enum(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato invalido (HH:MM)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato invalido (HH:MM)'),
  isAvailable: z.boolean(),
});

export const sliderImageSchema = z.object({
  url: z.string().url('URL Invalido'),
  altText: z.string().optional(),
});