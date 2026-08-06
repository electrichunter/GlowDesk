import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, vertical, customerInfo, dateTime, metadata } = body;

    if (!tenantId || !vertical || !customerInfo?.fullName || !customerInfo?.phone) {
      return NextResponse.json(
        { error: 'Eksik veya hatalı rezervasyon parametreleri.' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || '/api';

    // Send directly to FastAPI backend -> MySQL
    const res = await fetch(`${backendUrl}/appointments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenant_id: tenantId,
        customer_name: customerInfo.fullName,
        customer_phone: customerInfo.phone,
        appointment_date: dateTime.date,
        start_time: dateTime.startTime || '10:00:00',
        end_time: dateTime.endTime || '11:00:00',
        notes: customerInfo.notes || null,
        total_price: metadata?.price || 0.0,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Backend kayıt hatası' }));
      return NextResponse.json(
        { error: errorData.detail || 'Rezervasyon kaydı oluşturulamadı.' },
        { status: res.status }
      );
    }

    const appointment = await res.json();

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      message: 'Rezervasyon başarıyla oluşturuldu ve MySQL veritabanına kaydedildi.',
    });
  } catch (err: any) {
    console.error('Booking API Handler error:', err);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + (err?.message || 'Bilinmeyen hata') },
      { status: 500 }
    );
  }
}
