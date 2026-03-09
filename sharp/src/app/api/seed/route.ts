import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DEMO_VENUES = [
  { name: 'Auditorium', location: 'Main Building, Block A', capacity: 500, facilities: ['Projector', 'AC', 'Stage', 'Sound System'], isActive: true },
  { name: 'Lab 4', location: 'CS Department, 2nd Floor', capacity: 60, facilities: ['Computers', 'Projector', 'Whiteboard'], isActive: true },
  { name: 'Grand Arena', location: 'Sports Complex', capacity: 2000, facilities: ['Stage', 'Sound System', 'Lighting', 'Seating'], isActive: true },
  { name: 'Room 10', location: 'Admin Block, Ground Floor', capacity: 40, facilities: ['Whiteboard', 'AC', 'Projector'], isActive: true },
  { name: 'Open Ground', location: 'Central Campus', capacity: 5000, facilities: ['Open Air', 'Stage Setup Available'], isActive: true },
  { name: 'Conference Hall', location: 'Library Building, 3rd Floor', capacity: 100, facilities: ['Projector', 'AC', 'Video Conferencing'], isActive: true },
];

export async function POST() {
  try {
    // Check if already seeded
    const existing = await getDocs(query(collection(db, 'venues'), limit(1)));
    if (!existing.empty) {
      return NextResponse.json({
        success: true,
        message: 'Database already seeded',
      });
    }

    // Seed venues
    const promises = DEMO_VENUES.map((venue) =>
      addDoc(collection(db, 'venues'), venue)
    );
    await Promise.all(promises);

    return NextResponse.json({
      success: true,
      message: `Seeded ${DEMO_VENUES.length} venues`,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Seed failed',
      error: String(error),
    }, { status: 500 });
  }
}
