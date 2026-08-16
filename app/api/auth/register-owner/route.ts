import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password, propertyName, address, city, totalRooms } = body;

    if (!name || !email || !phone || !password || !propertyName) {
      return NextResponse.json(
        { error: 'Lengkapi seluruh data pendaftaran Owner & Kosan' },
        { status: 400 }
      );
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Gunakan email lain atau silakan Login.' },
        { status: 400 }
      );
    }

    // 1. Create Isolated New Property Workspace
    const property = await prisma.property.create({
      data: {
        name: propertyName,
        address: address || 'Alamat Belum Diatur',
        city: city || 'Kota Belum Diatur',
        totalRooms: parseInt(totalRooms) || 10,
        photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200'],
      },
    });

    // 2. Create Owner Account linked to new Property
    const newOwner = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: password, // In production, hash with bcrypt
        role: Role.OWNER,
        propertyId: property.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi Owner Kos Baru Berhasil!',
      data: {
        id: newOwner.id,
        name: newOwner.name,
        email: newOwner.email,
        role: newOwner.role,
        property,
      },
    });
  } catch (error: any) {
    console.error('Owner Registration Error:', error);
    return NextResponse.json(
      { error: 'Gagal merestrukturisasi workspace Owner baru' },
      { status: 500 }
    );
  }
}
